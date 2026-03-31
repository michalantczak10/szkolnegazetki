
import dotenv from 'dotenv';
dotenv.config();
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import fs from 'fs';
import { MongoClient } from 'mongodb';
import { Resend } from 'resend';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
  return `Zamówienie ${orderRef} Galaretkarnia`;
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
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(__dirname, '.env') });

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
    const db = mongoClient.db();
    ordersCollection = db.collection('orders');
    console.log('✅ Połączono z MongoDB i ustawiono ordersCollection');
  } catch (err) {
    console.error('❌ Błąd połączenia z MongoDB:', err?.message || err);
    ordersCollection = undefined;
  }
}

connectToMongo();

const app = express();
app.use(express.json());

app.use(express.static(path.join(projectRoot, 'client')));

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
    console.log('--- Nowe zamówienie ---');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const { phone, parcelLockerCode, notes, items, productsTotal, deliveryCost, total, paymentMethod, createOptionalAccount, optionalAccountEmail } = req.body;

    
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

    const normalizedNotes = normalizeOrderNotes(notes);
    if (normalizedNotes && !isOrderNotesValid(normalizedNotes)) {
      return res.status(400).json({ error: 'Uwagi do zamówienia mogą mieć maksymalnie 300 znaków i nie mogą zawierać znaków < ani >.' });
    }

    const normalizedParcelLockerCode = parcelLockerCode.toUpperCase();
    const phoneSuffix = getPhoneSuffix(phone);

    
    const totalItemsCount = items.reduce((sum, item) => sum + (item.qty || 0), 0);

    
    const deliveryInfo = calculateDeliveryCost(totalItemsCount);
    const calculatedDeliveryCost = productsTotal >= FREE_DELIVERY_THRESHOLD ? 0 : deliveryInfo.cost;

    
    const order = {
      phone,
      phoneSuffix,
      parcelLockerCode: normalizedParcelLockerCode,
      notes: normalizedNotes,
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

    
    const result = await ordersCollection.insertOne(order);
    const orderId = result.insertedId.toString();
    const orderRef = formatOrderRef(orderId);
    const transferTitle = createTransferTitle(orderRef);
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

    
    const itemsText = items
      .map(item => `- ${item.name}: ${item.qty} słoik(ów) × ${item.price} zł = ${item.qty * item.price} zł`)
      .join('\n');

    const isDev = process.env.NODE_ENV === 'development';
    const mailOptions = {
      to: process.env.ORDER_EMAIL || 'kontakt@galaretkarnia.pl',
      from: process.env.RESEND_FROM_EMAIL || 'noreply@galaretkarnia.onresend.com',
      subject: `${isDev ? '[TEST]' : '📦'} Nowe zamówienie - ${orderRef}`,
      html: `
        <div style="background:#fffbe9;padding:0;margin:0;font-family:'Segoe UI',Arial,sans-serif;max-width:520px;border-radius:12px;border:1.5px solid #e0cfc0;box-shadow:0 2px 12px #0001;overflow:hidden;">
          <div style="background:#b30000;padding:18px 0;text-align:center;">
            <img src='https://galaretkarnia.pl/img/branding/logo-galaretkarnia-z-napisem-bialy.png' alt='Galaretkarnia' style="max-width:260px;height:54px;object-fit:contain;"/>
          </div>
          <div style="padding:28px 28px 18px 28px;">
            <h2 style="color:#009900;margin-top:0;margin-bottom:10px;font-size:1.35em;">${isDev ? '[TEST] 🧪 ' : ''}Nowe zamówienie</h2>
            <div style="background:#e3f2fd;padding:10px 14px;border-radius:7px;margin-bottom:18px;">
              <b style="color:#b30000;">ID Zamówienia:</b> ${orderId}<br>
              <b>Numer dla klienta:</b> <span style="color:#009900;">${orderRef}</span><br>
              <b>Tytuł przelewu:</b> <span style="color:#b30000;">${transferTitle}</span>
            </div>
            <h3 style="color:#b30000;margin-bottom:6px;">Pozycje zamówienia:</h3>
            <pre style="background:#fff;border-radius:6px;padding:10px 12px;font-size:1.08em;color:#222;border:1px solid #eee;">${itemsText}</pre>
            <div style="margin:10px 0 8px 0;"><b>📊 Łączna ilość słoików:</b> ${totalItemsCount} szt.</div>
            <hr style="border:none;border-top:1.5px solid #eee;margin:18px 0;"/>
            <h3 style="color:#b30000;margin-bottom:6px;">Podsumowanie kosztów:</h3>
            <div style="margin-bottom:4px;"><b>🛒 Produkty:</b> ${productsTotal || order.total} zł</div>
            <div style="margin-bottom:4px;"><b>📦 Dostawa (${deliveryInfo.numberOfParcels > 1 ? `${deliveryInfo.numberOfParcels} paczki` : '1 paczka'}):</b> ${calculatedDeliveryCost === 0 ? '<span style=\'color:#009900;font-weight:bold\'>GRATIS!</span>' : `${calculatedDeliveryCost} zł`}</div>
            <div style="border-top:2px solid #b30000;padding-top:8px;margin-top:8px;font-size:1.15em;"><b>📌 RAZEM DO ZAPŁATY:</b> <span style="color:#b30000;font-size:1.18em;">${order.total} zł</span></div>
            <hr style="border:none;border-top:1.5px solid #eee;margin:18px 0;"/>
            <div style="margin-bottom:8px;"><b>💳 Płatność:</b> ${selectedPaymentMethod === 'blik' ? 'BLIK na telefon' : 'przelew tradycyjny'} (oczekiwanie na zaksięgowanie)</div>
            <div style="margin-bottom:8px;"><b>🏦 Dane płatności:</b> <span style="color:#222;">${paymentTarget}</span></div>
            <hr style="border:none;border-top:1.5px solid #eee;margin:18px 0;"/>
            <h3 style="color:#b30000;margin-bottom:6px;">Dane klienta:</h3>
            <div style="margin-bottom:4px;"><b>📞 Telefon:</b> ${phone}</div>
            <div style="margin-bottom:4px;"><b>📦 Paczkomat:</b> ${normalizedParcelLockerCode}</div>
            <div style="margin-bottom:4px;"><b>👤 Konto klienta (opcjonalne):</b> ${createOptionalAccount ? `TAK${optionalAccountEmail ? ` (${optionalAccountEmail})` : ''}` : 'NIE'}</div>
            <div style="margin-bottom:4px;"><b>💬 Uwagi:</b> ${safeNotes}</div>
            <div style="color:#666;font-size:12px;margin-top:18px;">
              ⏰ Zamówienie przyjęte: ${new Date().toLocaleString('pl-PL')}<br>
              Status: <b style="color:#b30000;">OCZEKUJE NA WPŁATĘ</b>
            </div>
          </div>
        </div>
      `
    };

    
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Galaretkarnia API is running' });
});

// SPA fallback — przeniesione na sam koniec pliku
const clientDir = path.join(projectRoot, 'client');
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
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
