
import dotenv from 'dotenv';
dotenv.config();
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { Resend } from 'resend';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const isTestEnvironment = process.env.NODE_ENV === 'test';
const mongoDbName = isTestEnvironment ? process.env.MONGODB_DB_NAME_TEST : process.env.MONGODB_DB_NAME;
const ordersCollectionName = isTestEnvironment
  ? (process.env.ORDERS_COLLECTION_TEST || 'orders_test')
  : (process.env.ORDERS_COLLECTION || 'orders');
const testOrderTtlDays = Number(process.env.TEST_ORDER_TTL_DAYS || '14');

// --- KLUCZOWE STAŁE I FUNKCJE ---
// Próg darmowej dostawy (taki sam jak w frontendzie)
const FREE_DELIVERY_THRESHOLD = 100;
// Generuje czytelny numer zamówienia na podstawie ID (np. GALA-XXXXXX)
function formatOrderRef(orderId) {
  if (!orderId || typeof orderId !== 'string') return '';
  // Weź ostatnie 6 znaków ID i dodaj prefix
  return 'GALA-' + orderId.slice(-6).toUpperCase();
}
// Generuje tytuł przelewu na podstawie numeru zamówienia
function createTransferTitle(orderRef) {
  return `Zamówienie ${orderRef}`;
}
// Zwraca dane do przelewu w zależności od metody płatności
function getPaymentTarget(paymentMethod) {
  if (paymentMethod === 'blik') {
    return 'BLIK na telefon: 794 535 366';
  }
  // Domyślnie przelew tradycyjny
  return '60 1140 2004 0000 3102 4831 8846 (Galaretkarnia)';
}
// Oblicza koszt dostawy i rozmiar paczki na podstawie liczby sztuk
function calculateDeliveryCost(totalItemsCount) {
  // Przykładowa logika: 1-8 szt. = S, 9-16 = M, 17+ = L
  let parcelSize = 'S';
  let parcelLabel = 'mała paczka';
  let cost = 15;
  let numberOfParcels = 1;
  if (totalItemsCount > 8 && totalItemsCount <= 16) {
    parcelSize = 'M';
    parcelLabel = 'średnia paczka';
    cost = 18;
  } else if (totalItemsCount > 16) {
    parcelSize = 'L';
    parcelLabel = 'duża paczka';
    cost = 22;
    numberOfParcels = Math.ceil(totalItemsCount / 16);
  }
  return { cost, parcelSize, parcelLabel, numberOfParcels };
}
// Dozwolone metody płatności
const PAYMENT_METHODS = [
  'przelew',
  'blik',
  'bank_transfer',
  'cash',
  'gotowka'
];
const ORDER_NOTES_MAX_LENGTH = 300;
const MAX_ITEM_QTY = 50;
const PRODUCT_CATALOG = [
  { id: 'drobiowa', name: 'Galaretka drobiowa', price: 18 },
  { id: 'wieprzowa', name: 'Galaretka wieprzowa', price: 19 },
];
const PRODUCT_PRICE_BY_NAME = new Map(PRODUCT_CATALOG.map((product) => [product.name, product.price]));

function normalizeOrderNotes(notes) {
  if (typeof notes !== 'string') return '';
  return notes.replace(/\r\n/g, '\n').trim();
}

function isOrderNotesValid(notes) {
  if (typeof notes !== 'string') return false;
  if (notes.length > ORDER_NOTES_MAX_LENGTH) return false;
  if (/[<>]/.test(notes)) return false;
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(notes)) return false;
  return true;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
// Walidacja adresu e-mail
function isEmailValid(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
// Walidacja kodu paczkomatu (minimum 6 znaków, tylko duże litery i cyfry)
function isParcelLockerCodeValid(code) {
  if (typeof code !== 'string') return false;
  return /^[A-Z0-9]{6,}$/.test(code.trim());
}
// Walidacja polskiego numeru telefonu (9 cyfr, opcjonalnie z +48 lub 48 na początku)
function isPhoneValid(phone) {
  if (typeof phone !== 'string') return false;
  // Usuwa spacje, myślniki, nawiasy
  const cleaned = phone.replace(/\D/g, '');
  // Akceptuje 9 cyfr lub 11 cyfr zaczynających się od 48
  if (cleaned.length === 9) return true;
  if (cleaned.length === 11 && cleaned.startsWith('48')) return true;
  return false;
}

// Zwraca ostatnie 3 cyfry numeru telefonu (do identyfikacji zamówienia)
function getPhoneSuffix(phone) {
  if (typeof phone !== 'string') return '';
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.slice(-3);
}

function normalizeOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Koszyk jest pusty.' };
  }

  const normalized = [];
  for (const rawItem of items) {
    const name = typeof rawItem?.name === 'string' ? rawItem.name.trim() : '';
    const qty = Number(rawItem?.qty);
    const serverPrice = PRODUCT_PRICE_BY_NAME.get(name);

    if (!name || !Number.isInteger(qty) || qty <= 0 || qty > MAX_ITEM_QTY || typeof serverPrice !== 'number') {
      return { ok: false, error: 'Koszyk zawiera nieprawidłowe pozycje.' };
    }

    normalized.push({ name, price: serverPrice, qty });
  }

  return { ok: true, items: normalized };
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const frontendBaseUrl = (process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || 'https://galaretkarnia.pl').replace(/\/$/, '');
const emailLogoUrl = `${frontendBaseUrl}/branding-logo-email.png`;

let mongoClient;
let ordersCollection;

async function connectToMongo() {
  try {
    let uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Brak connection stringa MONGODB_URI w .env');
    // Usuń appName z connection stringa jeśli jest
    uri = uri.replace(/([&?])appName=[^&]+(&|$)/, (m, p1, p2) => (p2 === '&' ? p1 : ''));
    mongoClient = new MongoClient(uri); // usunięto useUnifiedTopology
    await mongoClient.connect();
    const db = mongoDbName ? mongoClient.db(mongoDbName) : mongoClient.db();
    ordersCollection = db.collection(ordersCollectionName);

    if (isTestEnvironment && Number.isFinite(testOrderTtlDays) && testOrderTtlDays > 0) {
      const expireAfterSeconds = Math.round(testOrderTtlDays * 24 * 60 * 60);
      await ordersCollection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds, name: 'ttl_test_orders_createdAt' },
      );
      console.log(`[ORDER] 🧹 TTL for test orders enabled: ${testOrderTtlDays} day(s)`);
    }

    console.log(
      `[ORDER] ✅ Połączono z MongoDB (db=${db.databaseName}, collection=${ordersCollectionName}, mode=${isTestEnvironment ? 'test' : 'default'})`,
    );
  } catch (err) {
    console.error('❌ Błąd połączenia z MongoDB:', err?.message || err);
    ordersCollection = undefined;
  }
}

connectToMongo();

const app = express();
app.use(express.json());

function getOrderNotificationEmail() {
  if (isTestEnvironment && process.env.ORDER_EMAIL_TEST) {
    return process.env.ORDER_EMAIL_TEST;
  }
  return process.env.ORDER_EMAIL || 'kontakt@galaretkarnia.pl';
}

// CORS middleware - allow requests from galaretkarnia.pl and localhost
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://galaretkarnia.pl',
    'https://www.galaretkarnia.pl',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Serve built client from dist directory
app.use(express.static(path.join(projectRoot, 'client', 'dist')));

// Payment config endpoint
app.get('/api/payment-config', (req, res) => {
  res.json({
    payment: {
      accountNumber: '60 1140 2004 0000 3102 4831 8846',
      accountHolder: 'Galaretkarnia',
      blikPhone: '794 535 366'
    },
    cart: {
      freeDeliveryThreshold: 100,
      parcelSizes: ['S', 'M', 'L']
    }
  });
});
const PORT = process.env.PORT || 3000;

// POST /api/orders - Accept order, save to DB and send email to owner
app.post('/api/orders', async (req, res) => {
  if (!ordersCollection) {
    return res.status(503).json({ error: 'Usługa chwilowo niedostępna. Baza danych nieosiągalna.' });
  }
  try {
    console.log('[ORDER] --- Nowe zamówienie ---');
    const { phone: _logPhone, ...loggableBody } = req.body;
    console.log('[ORDER] Request body (phone omitted):', JSON.stringify(loggableBody, null, 2));
    const { phone, parcelLockerCode, notes, items, paymentMethod, createOptionalAccount, optionalAccountEmail } = req.body;

    
    if (!phone || !isPhoneValid(phone)) {
      return res.status(400).json({ error: 'Podaj poprawny numer telefonu.' });
    }

    if (!isParcelLockerCodeValid(parcelLockerCode)) {
      return res.status(400).json({ error: 'Podaj poprawny kod paczkomatu.' });
    }

    const normalizedItemsResult = normalizeOrderItems(items);
    if (!normalizedItemsResult.ok) {
      return res.status(400).json({ error: normalizedItemsResult.error });
    }
    const normalizedItems = normalizedItemsResult.items;

    const selectedPaymentMethod = paymentMethod || 'bank_transfer';

    if (!PAYMENT_METHODS.includes(selectedPaymentMethod)) {
      return res.status(400).json({ error: 'Nieobsługiwana metoda płatności.' });
    }

    if (createOptionalAccount && optionalAccountEmail && !isEmailValid(optionalAccountEmail)) {
      return res.status(400).json({ error: 'Podaj poprawny e-mail do konta lub zostaw pole puste.' });
    }

    const normalizedNotes = normalizeOrderNotes(notes);
    if (normalizedNotes && !isOrderNotesValid(normalizedNotes)) {
      return res.status(400).json({ error: 'Uwagi do zamówienia mogą mieć maksymalnie 300 znaków i nie mogą zawierać znaków < ani >.' });
    }

    const normalizedParcelLockerCode = parcelLockerCode.toUpperCase();
    const phoneSuffix = getPhoneSuffix(phone);

    
    const totalItemsCount = normalizedItems.reduce((sum, item) => sum + item.qty, 0);

    const calculatedProductsTotal = normalizedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const deliveryInfo = calculateDeliveryCost(totalItemsCount);
    const calculatedDeliveryCost = calculatedProductsTotal >= FREE_DELIVERY_THRESHOLD ? 0 : deliveryInfo.cost;

    
    const order = {
      phone,
      phoneSuffix,
      parcelLockerCode: normalizedParcelLockerCode,
      notes: normalizedNotes,
      items: normalizedItems,
      totalItemsCount,
      productsTotal: calculatedProductsTotal,
      deliveryCost: calculatedDeliveryCost,
      parcelSize: deliveryInfo.parcelSize,
      parcelLabel: deliveryInfo.parcelLabel,
      total: calculatedProductsTotal + calculatedDeliveryCost,
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

    
    const result = await ordersCollection.insertOne(order);
    const orderId = result.insertedId.toString();
    const orderRef = formatOrderRef(orderId);
    const transferTitle = createTransferTitle(orderRef);
    const displayOrderRef = orderRef.replace(/^GALA-/, '');
    const displayTransferTitle = transferTitle.replace('GALA-', '').replace(/\s+Galaretkarnia\s*$/i, '');
    const paymentTarget = getPaymentTarget(selectedPaymentMethod);
    const safeNotes = normalizedNotes ? escapeHtml(normalizedNotes).replace(/\n/g, '<br>') : 'Brak';

    
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

    
    const itemsText = normalizedItems
      .map(item => `${item.name}: ${item.qty} słoik(ów) × ${item.price} zł = ${item.qty * item.price} zł`)
      .join('\n');

    const isDev = process.env.NODE_ENV === 'development';
    const mailOptions = {
      to: getOrderNotificationEmail(),
      from: process.env.RESEND_FROM_EMAIL || 'noreply@galaretkarnia.onresend.com',
      subject: `${isTestEnvironment || isDev ? '[TEST]' : '📦'} Nowe zamówienie - ${displayOrderRef}`,
      html: `
        <div style="margin:0;padding:24px;background:#f6f7fb;font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
            <div style="background:#ffffff;padding:16px 22px;text-align:center;border-bottom:2px solid #b30000;">
              <img src='${emailLogoUrl}' alt='Galaretkarnia' style="max-width:360px;height:76px;object-fit:contain;display:block;margin:0 auto;"/>
            </div>
            <div style="padding:22px;">
              <h2 style="margin:0 0 12px 0;color:#b30000;font-size:24px;line-height:1.2;">${isDev ? '[TEST] ' : ''}Nowe zamówienie</h2>

              <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;margin-bottom:16px;line-height:1.5;">
                <div><strong>Numer dla klienta:</strong> <span style="color:#b30000;font-weight:700;">${displayOrderRef}</span></div>
                <div><strong>Tytuł przelewu:</strong> ${displayTransferTitle}</div>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:14px;">
                <h3 style="margin:0 0 8px 0;color:#b30000;font-size:17px;">Pozycje zamówienia</h3>
                <pre style="margin:0;white-space:pre-wrap;word-break:break-word;background:transparent;border:none;border-radius:0;padding:0;font-size:14px;line-height:1.45;color:#111827;font-family:inherit;">${itemsText}</pre>
                <div style="margin-top:10px;"><strong>Łączna ilość słoików:</strong> ${totalItemsCount} szt.</div>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:14px;line-height:1.6;">
                <h3 style="margin:0 0 8px 0;color:#b30000;font-size:17px;">Podsumowanie kosztów</h3>
                <div><strong>Produkty:</strong> ${order.productsTotal} zł</div>
                <div><strong>Dostawa (${deliveryInfo.numberOfParcels > 1 ? `${deliveryInfo.numberOfParcels} paczki` : '1 paczka'}):</strong> ${calculatedDeliveryCost === 0 ? '<span style="color:#167a36;font-weight:700;">GRATIS</span>' : `${calculatedDeliveryCost} zł`}</div>
                <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;font-size:17px;"><strong>Razem do zapłaty:</strong> <span style="color:#b30000;font-weight:800;">${order.total} zł</span></div>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:14px;line-height:1.6;">
                <h3 style="margin:0 0 8px 0;color:#b30000;font-size:17px;">Płatność</h3>
                <div><strong>Metoda:</strong> ${selectedPaymentMethod === 'blik' ? 'BLIK na telefon' : 'przelew tradycyjny'}</div>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;line-height:1.6;">
                <h3 style="margin:0 0 8px 0;color:#b30000;font-size:17px;">Dane klienta</h3>
                <div><strong>Telefon:</strong> ${phone}</div>
                <div><strong>Paczkomat:</strong> ${normalizedParcelLockerCode}</div>
                <div><strong>Uwagi:</strong> ${safeNotes}</div>
              </div>

              <div style="margin-top:16px;font-size:12px;color:#6b7280;line-height:1.5;">
                Zamówienie przyjęte: ${new Date().toLocaleString('pl-PL')}
              </div>
            </div>
          </div>
        </div>
      `
    };

    
    if (resend) {
      resend.emails.send(mailOptions)
        .then((result) => {
          if (result?.error) {
            console.error('[EMAIL] ⚠️ Email rejected by Resend (order saved to DB):', {
              orderId,
              orderRef,
              to: mailOptions.to,
              from: mailOptions.from,
              error: result.error,
            });
            return;
          }

          const messageId = result?.data?.id || result?.id || null;
          console.log('[EMAIL] ✅ Email accepted by Resend:', {
            orderId,
            orderRef,
            messageId,
            to: mailOptions.to,
            from: mailOptions.from,
          });
        })
        .catch((err) => {
          console.error('[EMAIL] ⚠️ Email send request failed (order saved to DB):', {
            orderId,
            orderRef,
            to: mailOptions.to,
            from: mailOptions.from,
            name: err?.name,
            message: err?.message || String(err),
            statusCode: err?.statusCode,
          });
        });
    } else {
      console.warn('[EMAIL] ⚠️ Pominięto wysyłkę maila — Resend nie jest skonfigurowany');
    }

  } catch (error) {
    console.error('Order processing error:', error);
    if (error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
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

// Health check for monitoring systems
app.get('/api/health', (req, res) => {
  const dbConnected = Boolean(ordersCollection);
  const payload = {
    status: dbConnected ? 'ok' : 'degraded',
    service: 'galaretkarnia-api',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database: {
      connected: dbConnected,
      collection: ordersCollectionName,
    },
  };

  if (!dbConnected) {
    return res.status(503).json(payload);
  }

  return res.status(200).json(payload);
});

// SPA fallback — przeniesione na sam koniec pliku
app.get('*', (req, res) => {
  res.sendFile(path.join(projectRoot, 'client', 'dist', 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Galaretkarnia API running on port ${PORT}`);
  console.log(`[ORDER] 📚 Active orders collection: ${ordersCollectionName}`);
  console.log(`[EMAIL] 📧 Orders will be sent to: ${getOrderNotificationEmail()}`);
});

// Graceful shutdown - close Mongo client and HTTP server
const shutdown = async () => {
  console.log('Shutting down gracefully...');
   try {
     if (typeof mongoClient !== 'undefined' && mongoClient) {
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
