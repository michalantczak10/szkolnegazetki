import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/galaretkarnia';
let ordersCollection;

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
    await client.connect();
    const db = client.db('galaretkarnia');
    ordersCollection = db.collection('orders');
    
    // Create index for faster queries
    await ordersCollection.createIndex({ createdAt: -1 });
    
    console.log('✅ Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Connect on startup
await connectToDatabase();

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Middleware
// CORS - explicit handling for all origins (MUST be before routes and json middleware)
app.use((req, res, next) => {
  const origin = '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Max-Age', '3600');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json());

// Serve static files from project root
app.use(express.static(projectRoot));

// Email configuration - Outlook/Hotmail
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Outlook/Microsoft account password or App Password
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

// Test email connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// Validation helper
const isPhoneValid = (phone) => /^[0-9+()\-\s]{7,20}$/.test(phone);

// POST /api/orders - Accept order, save to DB and send email to owner
app.post('/api/orders', async (req, res) => {
  try {
    const { name, phone, address, notes, items, total } = req.body;

    // Validation
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ error: 'Podaj poprawne imię i nazwisko.' });
    }

    if (!phone || !isPhoneValid(phone)) {
      return res.status(400).json({ error: 'Podaj poprawny numer telefonu.' });
    }

    if (!address || address.trim().length < 6) {
      return res.status(400).json({ error: 'Podaj pełny adres dostawy.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Koszyk jest pusty.' });
    }

    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ error: 'Nieprawidłowa kwota.' });
    }

    // Create order object
    const order = {
      name,
      phone,
      address,
      notes: notes || '',
      items,
      total,
      status: 'nowe', // Status: nowe, w-realizacji, gotowe, anulowane
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to MongoDB
    const result = await ordersCollection.insertOne(order);
    const orderId = result.insertedId.toString();

    // Format items for email
    const itemsText = items
      .map(item => `- ${item.name}: ${item.qty} słoik(ów) × ${item.price} zł = ${item.qty * item.price} zł`)
      .join('\n');

    // Email to shop owner (WITH ORDER ID FOR TRACKING)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ORDER_EMAIL || 'zamowienia@galaretkarnia.pl',
      subject: `📦 Nowe zamówienie - ${orderId.slice(-6).toUpperCase()}`,
      html: `
        <h2>📦 Nowe zamówienie</h2>
        <p style="background: #e3f2fd; padding: 10px; border-radius: 5px;">
          <strong>ID Zamówienia:</strong> ${orderId}
        </p>
        <hr>
        <h3>Pozycje:</h3>
        <pre>${itemsText}</pre>
        <hr>
        <p><strong>📌 Do zapłaty:</strong> ${total} zł</p>
        <hr>
        <h3>Dane klienta:</h3>
        <p><strong>👤 Imię i nazwisko:</strong> ${name}</p>
        <p><strong>📞 Telefon:</strong> ${phone}</p>
        <p><strong>📍 Adres dostawy:</strong> ${address}</p>
        <p><strong>💬 Uwagi:</strong> ${notes || 'Brak'}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          ⏰ Zamówienie przyjęte: ${new Date().toLocaleString('pl-PL')}<br>
          Status: <strong>NOWE</strong> (oczekuje na potwierdzenie)
        </p>
      `
    };

    // Send email to owner
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Order email sent for ID: ${orderId}`);
    } catch (emailError) {
      console.error('⚠️  Email sending failed (but order saved to DB):', emailError.message);
      // Continue - order is saved in DB even if email fails
    }

    // Success response - ONLY RETURN ORDER ID, NO EMAIL REQUIRED
    res.json({
      success: true,
      orderId: orderId,
      message: 'Zamówienie przyjęte! Skontaktujemy się w ciągu 30 minut.',
      status: 'nowe'
    });

  } catch (error) {
    console.error('Order processing error:', error);
    res.status(500).json({
      error: 'Błąd przy przetwarzaniu zamówienia. Spróbuj ponownie.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/orders - Get all orders (admin view)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Błąd przy pobieraniu zamówień' });
  }
});

// GET /api/orders/id/:orderId - Get specific order by ID
app.get('/api/orders/id/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
    
    if (!order) {
      return res.status(404).json({ error: 'Zamówienie nie znalezione' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Błąd przy pobieraniu zamówienia' });
  }
});

// PUT /api/orders/id/:orderId - Update order status
app.put('/api/orders/id/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['nowe', 'w-realizacji', 'gotowe', 'anulowane'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Nieprawidłowy status' });
    }
    
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Zamówienie nie znalezione' });
    }
    
    res.json({ success: true, message: `Status zmieniony na: ${status}` });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Błąd przy aktualizacji zamówienia' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Galaretkarnia API is running' });
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(join(projectRoot, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Galaretkarnia API running on port ${PORT}`);
  console.log(`📧 Orders will be sent to: ${process.env.ORDER_EMAIL || 'zamowienia@galaretkarnia.pl'}`);
});
