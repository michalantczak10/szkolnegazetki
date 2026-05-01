import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { Resend } from 'resend';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;
const ORDERS_COLLECTION = process.env.ORDERS_COLLECTION || 'orders';
const ORDER_EMAIL = process.env.ORDER_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@szkolnegazetki.onresend.com';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/** @type {import('mongodb').MongoClient | null} */
let cachedClient = globalThis.__mongoClient || null;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function isEmailValid(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPhoneValid(phone) {
  if (typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 9 && cleaned.length <= 15;
}

function formatOrderRef(orderId) {
  return `SZG-${orderId.slice(-6).toUpperCase()}`;
}

function getPaymentTarget(paymentMethod) {
  if (paymentMethod === 'blik') {
    return 'BLIK na telefon: 794 535 366';
  }
  return '60 1140 2004 0000 3102 4831 8846 (Szkolne gazetki)';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  globalThis.__mongoClient = client;
  return client;
}

async function sendOrderNotification(order) {
  if (!resend || !ORDER_EMAIL) {
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.name)}</strong> — ${item.qty} szt. × ${item.price} zł = ${item.qty * item.price} zł</li>`,
    )
    .join('');

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#111827;padding:20px;">
      <h2 style="color:#1d4ed8;">Nowe zamówienie</h2>
      <p>Numer zamówienia: <strong>${escapeHtml(order.orderRef)}</strong></p>
      <p>Klient: <strong>${escapeHtml(order.customerName)}</strong></p>
      <p>E-mail: <strong>${escapeHtml(order.customerEmail)}</strong></p>
      <p>Telefon: <strong>${escapeHtml(order.customerPhone || 'brak')}</strong></p>
      <p>Metoda płatności: <strong>${escapeHtml(order.paymentMethod)}</strong></p>
      <p>Kwota do zapłaty: <strong>${order.total} zł</strong></p>
      <p>Tytuł przelewu: <strong>${escapeHtml(order.transferTitle)}</strong></p>
      <h3>Produkty</h3>
      <ul>${itemsHtml}</ul>
      <p>Uwagi: <strong>${escapeHtml(order.notes || 'brak')}</strong></p>
    </div>
  `;

  await resend.emails.send({
    to: ORDER_EMAIL,
    from: RESEND_FROM_EMAIL,
    subject: `Nowe zamówienie ${order.orderRef}`,
    html,
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'MONGODB_URI is not configured' });
  }

  const {
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod,
    notes,
    items,
  } = req.body || {};

  const normalizedEmail = normalizeEmail(customerEmail);
  const trimmedName = typeof customerName === 'string' ? customerName.trim() : '';
  const trimmedNotes = typeof notes === 'string' ? notes.trim() : '';
  const selectedPaymentMethod = paymentMethod === 'blik' ? 'blik' : 'bank_transfer';

  if (!trimmedName) {
    return res.status(400).json({ error: 'Podaj swoje imię lub nazwę organizacji.' });
  }

  if (!isEmailValid(normalizedEmail)) {
    return res.status(400).json({ error: 'Podaj poprawny adres e-mail.' });
  }

  if (customerPhone && !isPhoneValid(customerPhone)) {
    return res.status(400).json({ error: 'Podaj poprawny numer telefonu.' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Koszyk jest pusty.' });
  }

  const normalizedItems = [];
  for (const item of items) {
    if (
      !item ||
      typeof item.name !== 'string' ||
      item.name.trim().length === 0 ||
      typeof item.price !== 'number' ||
      !Number.isFinite(item.price) ||
      item.price <= 0 ||
      typeof item.qty !== 'number' ||
      !Number.isInteger(item.qty) ||
      item.qty <= 0
    ) {
      return res.status(400).json({ error: 'Nieprawidłowe pozycje w koszyku.' });
    }

    normalizedItems.push({
      name: item.name.trim(),
      price: item.price,
      qty: item.qty,
    });
  }

  const productsTotal = normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = productsTotal;

  const order = {
    customerName: trimmedName,
    customerEmail: normalizedEmail,
    customerPhone: typeof customerPhone === 'string' ? customerPhone.replace(/\D/g, '') : '',
    paymentMethod: selectedPaymentMethod,
    notes: trimmedNotes,
    items: normalizedItems,
    productsTotal,
    total,
    status: 'pending_payment',
    paymentStatus: 'pending',
    transferTitle: `Zamówienie ${formatOrderRef('XXXXXX')}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    const client = await getMongoClient();
    const db = MONGODB_DB_NAME ? client.db(MONGODB_DB_NAME) : client.db();
    const collection = db.collection(ORDERS_COLLECTION);
    const result = await collection.insertOne(order);
    const orderId = result.insertedId.toString();
    const orderRef = formatOrderRef(orderId);
    const transferTitle = `Zamówienie ${orderRef}`;
    const paymentTarget = getPaymentTarget(selectedPaymentMethod);

    await collection.updateOne(
      { _id: result.insertedId },
      { $set: { orderRef, transferTitle, paymentTarget, updatedAt: new Date() } },
    );

    const orderRecord = {
      ...order,
      orderId,
      orderRef,
      transferTitle,
      paymentTarget,
    };

    try {
      await sendOrderNotification(orderRecord);
    } catch (error) {
      console.error('Order notification failed:', error?.message || error);
    }

    return res.status(201).json({
      success: true,
      orderId,
      orderRef,
      transferTitle,
      paymentTarget,
      total,
      message:
        'Dziękujemy! Twoje zamówienie zostało zapisane. Link do zakupionego produktu wyślemy ręcznie po zaksięgowaniu płatności.',
      status: 'pending_payment',
    });
  } catch (error) {
    console.error('Order save failed:', error?.message || error);
    return res.status(500).json({ error: 'Błąd zapisu zamówienia. Spróbuj ponownie.' });
  }
}
