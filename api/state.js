// Vercel serverless function — single shared app-state blob (cross-device sync).
// Stores one JSON document in the private Vercel Blob store `bond-data`.
// No auth (single account) per the user's choice; the blob is private so it is
// only reachable through this function with the server-side token.
import { put, list } from '@vercel/blob';

const PATH = 'state.json';
const token = process.env.BLOB_READ_WRITE_TOKEN;

async function readState() {
  const { blobs } = await list({ prefix: PATH, token });
  const blob = blobs.find((b) => b.pathname === PATH) || blobs[0];
  if (!blob) return {};
  const url = blob.downloadUrl || blob.url;
  const headers = blob.downloadUrl ? {} : { Authorization: `Bearer ${token}` };
  const r = await fetch(url, { headers, cache: 'no-store' });
  if (!r.ok) return {};
  return await r.json().catch(() => ({}));
}

export default async function handler(req, res) {
  if (!token) { res.status(500).json({ error: 'Stockage non configuré.' }); return; }
  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json(await readState());
      return;
    }
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
      if (!body || typeof body !== 'object') { res.status(400).json({ error: 'Corps invalide.' }); return; }
      await put(PATH, JSON.stringify(body), {
        access: 'private',
        token,
        allowOverwrite: true,
        addRandomSuffix: false,
        contentType: 'application/json',
      });
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('state handler error', e);
    res.status(500).json({ error: 'Erreur de stockage.' });
  }
}
