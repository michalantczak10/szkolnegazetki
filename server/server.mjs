import express from 'express';
// Resend SDK removed from dependencies; emails will be skipped unless configured elsewhere
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// MongoDB driver removed from dependencies; DB integration disabled in this build
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import responseTime from 'response-time';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/galaretkarnia';
let ordersCollection;
let mongoClient = null;
// DB disabled in this build — keep ordersCollection null so DB-backed endpoints return 503
ordersCollection = null;

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Middleware
// Security & performance middleware (before routes)
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(responseTime());

// Rate limiter for API
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// CORS and caching - allow caching for static assets, disable cache for API
app.use((req, res, next) => {
  const origin = '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Max-Age', '3600');

  // Only disable caching for API responses
  if (req.path.startsWith('/api') || req.path.startsWith('/server')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Limit request body size to avoid huge payloads
app.use(express.json({ limit: '64kb' }));

// Serve static files from `public` directory inside the server folder
const publicDir = join(__dirname, 'public');
app.use(express.static(publicDir, { maxAge: '7d', immutable: true, dotfiles: 'ignore', index: false }));
// Serve images and favicons from project root via dedicated routes (keeps other files private)
app.use('/img', express.static(join(projectRoot, 'img'), { maxAge: '7d', immutable: true, dotfiles: 'ignore' }));
app.use('/favicon', express.static(join(projectRoot, 'favicon'), { maxAge: '7d', immutable: true, dotfiles: 'ignore' }));

// Email configuration - Resend API (optional)
let resend = null;
if (process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY ustawiony, ale Resend SDK nie jest zainstalowany — wysyłka e-maili jest wyłączona w tej wersji.');
}

// Validation helper
const isPhoneValid = (phone) => /^[0-9+()\-\s]{7,20}$/.test(phone);
const isParcelLockerCodeValid = (code) => /^[A-Z]{3}\d{2}[A-Z0-9]?$/.test(String(code || '').toUpperCase());

const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');

const getPhoneSuffix = (phone) => normalizePhone(phone).slice(-4);

const formatOrderRef = (orderId) => orderId.slice(-8).toUpperCase();

const createTransferTitle = (orderRef) => `Opłata za zamówienie nr: ${orderRef}`;

const PAYMENT_CONFIG = {
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || '60 1140 2004 0000 3102 4831 8846',
  accountHolder: process.env.BANK_ACCOUNT_HOLDER || 'Galaretkarnia',
  blikPhone: process.env.BLIK_PHONE || '+48 794 535 366'
};

const FREE_DELIVERY_THRESHOLD = Number(process.env.FREE_DELIVERY_THRESHOLD || 50);

// Konfiguracja paczek InPost - rozmiary, pojemności, ceny
const PARCEL_SIZES = [
  {
    name: 'A',
    label: 'Paczkomat A (mały)',
    maxItems: 3,
    cost: Number(process.env.PARCEL_A_COST || 13)
  },
  {
    name: 'B',
    label: 'Paczkomat B (średni)',
    maxItems: 8,
    cost: Number(process.env.PARCEL_B_COST || 15)
  },
  {
    name: 'C',
    label: 'Paczkomat C (duży)',
    maxItems: 15,  // Maksymalna pojemność jednej paczki
    cost: Number(process.env.PARCEL_C_COST || 17)
  }
];

// Funkcja obliczająca ile paczek jest potrzebnych i całkowity koszt
const calculateDeliveryCost = (itemsCount) => {
  // Tworzymy paczki optymalizując liczbę pojemników
  let parcels = [];
  let remainingItems = itemsCount;

  // Najpierw próbujemy paczkami A
  while (remainingItems > 0 && remainingItems <= PARCEL_SIZES[0].maxItems) {
    parcels.push(PARCEL_SIZES[0]);
    remainingItems = 0;
    break;
  }

  // Jeśli więcej niż A, próbujemy B
  if (remainingItems > PARCEL_SIZES[0].maxItems && remainingItems <= PARCEL_SIZES[1].maxItems) {
    parcels.push(PARCEL_SIZES[1]);
    remainingItems = 0;
  }

  // Jeśli więcej niż B, używamy C (może być wiele)
  if (remainingItems > PARCEL_SIZES[1].maxItems) {
    const maxC = PARCEL_SIZES[2].maxItems;
    const parcelCount = Math.ceil(remainingItems / maxC);
    for (let i = 0; i < parcelCount; i++) {
      parcels.push(PARCEL_SIZES[2]);
    }
  }

  // Jeśli puste (nie powinno się zdarzyć), fallback
  if (parcels.length === 0) {
    parcels.push(PARCEL_SIZES[1]);
  }

  const totalCost = parcels.reduce((sum, p) => sum + p.cost, 0);
  const parcelLabel = parcels.length === 1 
    ? parcels[0].label 
    : `${parcels.length} paczki (${parcels.map(p => p.name).join('+')})`;

  return {
    cost: totalCost,
    parcelSize: parcels.map(p => p.name).join('+'),
    parcelLabel: parcelLabel,
    numberOfParcels: parcels.length
  };
};

const PAYMENT_METHODS = ['bank_transfer', 'blik', 'stripe_online'];

const getPaymentTarget = (method) => {
  if (method === 'blik') {
    return `Telefon BLIK: ${PAYMENT_CONFIG.blikPhone}`;
  }

  return `${PAYMENT_CONFIG.accountHolder}, konto: ${PAYMENT_CONFIG.accountNumber}`;
};

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));

app.get('/api/payment-config', (req, res) => {
  res.json({
    success: true,
    payment: {
      accountNumber: PAYMENT_CONFIG.accountNumber,
      accountHolder: PAYMENT_CONFIG.accountHolder,
      blikPhone: PAYMENT_CONFIG.blikPhone
    },
    cart: {
      freeDeliveryThreshold: Number.isFinite(FREE_DELIVERY_THRESHOLD) && FREE_DELIVERY_THRESHOLD > 0
        ? FREE_DELIVERY_THRESHOLD
        : 50,
      parcelSizes: PARCEL_SIZES
    }
  });
});

// POST /api/orders - Accept order, save to DB and send email to owner
app.post('/api/orders', async (req, res) => {
  if (!ordersCollection) {
    return res.status(503).json({ error: 'Usługa chwilowo niedostępna. Baza danych nieosiągalna.' });
  }
  try {
    const { phone, parcelLockerCode, notes, items, productsTotal, deliveryCost, total, paymentMethod, createOptionalAccount, optionalAccountEmail } = req.body;

    // Validation
    if (!phone || !isPhoneValid(phone)) {
      return res.status(400).json({ error: 'Podaj poprawny numer telefonu.' });
    }

    if (!isParcelLockerCodeValid(parcelLockerCode)) {
      return res.status(400).json({ error: 'Podaj poprawny kod paczkomatu.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Koszyk jest pusty.' });
    }

    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ error: 'Nieprawidłowa kwota.' });
    }

    const selectedPaymentMethod = paymentMethod || 'bank_transfer';

    if (!PAYMENT_METHODS.includes(selectedPaymentMethod)) {
      return res.status(400).json({ error: 'Nieobsługiwana metoda płatności.' });
    }

    if (createOptionalAccount && optionalAccountEmail && !isEmailValid(optionalAccountEmail)) {
      return res.status(400).json({ error: 'Podaj poprawny e-mail do konta lub zostaw pole puste.' });
    }

    const normalizedParcelLockerCode = parcelLockerCode.toUpperCase();
    const phoneSuffix = getPhoneSuffix(phone);

    // Oblicz całkowitą ilość słoików
    const totalItemsCount = items.reduce((sum, item) => sum + (item.qty || 0), 0);

    // Oblicz koszt dostawy na podstawie ilości
    const deliveryInfo = calculateDeliveryCost(totalItemsCount);
    const calculatedDeliveryCost = productsTotal >= FREE_DELIVERY_THRESHOLD ? 0 : deliveryInfo.cost;

    // Create order object
    const order = {
      phone,
      phoneSuffix,
      parcelLockerCode: normalizedParcelLockerCode,
      notes: notes || '',
      items,
      totalItemsCount,
      productsTotal: productsTotal || 0,
      deliveryCost: calculatedDeliveryCost,
      parcelSize: deliveryInfo.parcelSize,
      parcelLabel: deliveryInfo.parcelLabel,
      total: (productsTotal || 0) + calculatedDeliveryCost,
      paymentMethod: selectedPaymentMethod,
      paymentStatus: 'oczekiwanie-na-wplate',
      status: 'oczekuje-na-platnosc', // Status: oczekuje-na-platnosc, oplacone, w-realizacji, gotowe, anulowane
      optionalAccount: {
        requested: Boolean(createOptionalAccount),
        email: createOptionalAccount ? (optionalAccountEmail || '') : ''
      },
      environment: process.env.NODE_ENV || 'development', // 'development' lub 'production'
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to MongoDB
    const result = await ordersCollection.insertOne(order);
    const orderId = result.insertedId.toString();
    const orderRef = formatOrderRef(orderId);
    const transferTitle = createTransferTitle(orderRef);
    const paymentTarget = getPaymentTarget(selectedPaymentMethod);

    // IMMEDIATELY send success response to client (don't wait for email)
    res.json({
      success: true,
      orderId: orderId,
      orderRef,
      transferTitle,
      paymentMethod: selectedPaymentMethod,
      paymentTarget,
      message: 'Zamówienie zapisane. Realizacja po zaksięgowaniu wpłaty.',
      status: 'oczekuje-na-platnosc',
      paymentStatus: 'oczekiwanie-na-wplate'
    });

    // Send email in background (fire-and-forget, non-blocking)
    const itemsText = items
      .map(item => `- ${item.name}: ${item.qty} słoik(ów) × ${item.price} zł = ${item.qty * item.price} zł`)
      .join('\n');

    const isDev = process.env.NODE_ENV === 'development';
    const mailOptions = {
      to: process.env.ORDER_EMAIL || 'kontakt@galaretkarnia.pl',
      from: process.env.RESEND_FROM_EMAIL || 'noreply@galaretkarnia.onresend.com',
      subject: `${isDev ? '[TEST]' : '📦'} Nowe zamówienie - ${orderRef}`,
      html: `
        <h2>${isDev ? '[TEST] 🧪' : '📦'} Nowe zamówienie</h2>
        <p style="background: #e3f2fd; padding: 10px; border-radius: 5px;">
          <strong>ID Zamówienia:</strong> ${orderId}<br>
          <strong>Numer dla klienta:</strong> ${orderRef}<br>
          <strong>Tytuł przelewu:</strong> ${transferTitle}
        </p>
        <hr>
        <h3>Pozycje:</h3>
        <pre>${itemsText}</pre>
        <p><strong>📊 Łączna ilość słoików:</strong> ${totalItemsCount} szt.</p>
        <hr>
        <h3>Podsumowanie kosztów:</h3>
        <p><strong>🛒 Produkty (galaretki):</strong> ${productsTotal || order.total} zł</p>
        <p><strong>📦 Dostawa (${deliveryInfo.numberOfParcels > 1 ? `${deliveryInfo.numberOfParcels} paczki` : '1 paczka'}):</strong> ${calculatedDeliveryCost === 0 ? '<strong>GRATIS!</strong>' : `${calculatedDeliveryCost} zł`}</p>
        <p style="border-top: 2px solid #333; padding-top: 8px; margin-top: 8px;"><strong>📌 RAZEM DO ZAPŁATY:</strong> <span style="font-size: 20px; color: #d32f2f;">${order.total} zł</span></p>
        <hr>
        <p><strong>💳 Płatność:</strong> ${selectedPaymentMethod === 'blik' ? 'BLIK na telefon' : 'przelew tradycyjny'} (oczekiwanie na zaksięgowanie)</p>
        <p><strong>🏦 Dane płatności:</strong> ${paymentTarget}</p>
        <hr>
        <h3>Dane klienta:</h3>
        <p><strong>📞 Telefon:</strong> ${phone}</p>
        <p><strong>📞 Końcówka telefonu:</strong> ${phoneSuffix}</p>
        <p><strong>📦 Paczkomat:</strong> ${normalizedParcelLockerCode}</p>
        <p><strong>👤 Konto klienta (opcjonalne):</strong> ${createOptionalAccount ? `TAK${optionalAccountEmail ? ` (${optionalAccountEmail})` : ''}` : 'NIE'}</p>
        <p><strong>💬 Uwagi:</strong> ${notes || 'Brak'}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          ⏰ Zamówienie przyjęte: ${new Date().toLocaleString('pl-PL')}<br>
          Status: <strong>OCZEKUJE NA WPŁATĘ</strong>
        </p>
      `
    };

    // Fire-and-forget email via Resend (won't block response)
    if (resend) {
      resend.emails.send(mailOptions)
        .then((result) => {
          if (result?.error) {
            console.error('⚠️ Email sending failed (but order saved to DB):', result.error);
          } else {
            console.log(`✅ Order email sent for ID: ${orderId}`);
          }
        })
        .catch(err => {
          console.error('⚠️ Email sending failed (but order saved to DB):', err?.message || err);
        });
    } else {
      console.warn('⚠️ Pominięto wysyłkę maila — Resend nie jest skonfigurowany');
    }

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
  if (!ordersCollection) {
    return res.status(503).json({ error: 'Usługa chwilowo niedostępna. Baza danych nieosiągalna.' });
  }
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
  if (!ordersCollection) {
    return res.status(503).json({ error: 'Usługa chwilowo niedostępna. Baza danych nieosiągalna.' });
  }
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
  if (!ordersCollection) {
    return res.status(503).json({ error: 'Usługa chwilowo niedostępna. Baza danych nieosiągalna.' });
  }
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['oczekuje-na-platnosc', 'oplacone', 'w-realizacji', 'gotowe', 'anulowane'];
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
  // Serve SPA from public directory
  res.sendFile(join(publicDir, 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Galaretkarnia API running on port ${PORT}`);
  console.log(`📧 Orders will be sent to: ${process.env.ORDER_EMAIL || 'kontakt@galaretkarnia.pl'}`);
});

// Graceful shutdown - close Mongo client and HTTP server
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  try {
    if (mongoClient) {
      await mongoClient.close();
      console.log('✅ MongoClient closed');
    }
  } catch (err) {
    console.error('Error closing MongoClient:', err?.message || err);
  }

  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });

  // Force exit if not closed in time
  setTimeout(() => {
    console.error('Forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
