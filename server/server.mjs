import express from 'express';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

app.use(express.json());
app.use(express.static(path.join(projectRoot, 'client')));

// Endpoint API do pobierania paczkomatów
// ...existing code...
// Endpoint API do pobierania paczkomatów
app.get('/api/parcelLockers', (req, res) => {
  const lockersPath = path.join(projectRoot, 'client', 'parcelLockers.json');
  fs.readFile(lockersPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Nie udało się pobrać listy paczkomatów.' });
      return;
    }
    try {
      const lockers = JSON.parse(data);
      res.json(lockers);
    } catch (parseErr) {
      res.status(500).json({ error: 'Błąd parsowania pliku paczkomatów.' });
    }
  });
});

// Endpoint API do pobierania paczkomatów (po inicjalizacji app)
app.get('/api/parcelLockers', (req, res) => {
  const lockersPath = path.join(projectRoot, 'client', 'parcelLockers.json');
  fs.readFile(lockersPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Nie udało się pobrać listy paczkomatów.' });
      return;
    }
    try {
      const lockers = JSON.parse(data);
      res.json(lockers);
    } catch (parseErr) {
      res.status(500).json({ error: 'Błąd parsowania pliku paczkomatów.' });
    }
  });
});

// ...pozostaw tylko jedną deklarację app i PORT po importach...

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

// ...existing code...
// SPA fallback — przeniesione na sam koniec pliku
app.get('*', (req, res) => {
  res.sendFile(join(clientDir, 'index.html'));
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
