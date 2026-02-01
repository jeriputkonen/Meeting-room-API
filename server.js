
// server.js
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// In-memory "database"
const rooms = [
  { id: 'koivu', name: 'Koivu' },
  { id: 'kuusi', name: 'Kuusi' },
  { id: 'manty', name: 'Mänty' },
  { id: 'tunturi', name: 'Tunturi' },
  { id: 'jarvi', name: 'Järvi' },
  { id: 'meri', name: 'Meri' },
  { id: 'laakso', name: 'Laakso' },
  { id: 'kallio', name: 'Kallio' },
  { id: 'revontuli', name: 'Revontuli' },
  { id: 'suo', name: 'Suo' },
];

// Each reservation: { id, roomId, title, startISO, endISO, createdAtISO }
let reservations = [];

// Helpers
function parseISO(d) {
  const date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
}
function isOverlap(aStart, aEnd, bStart, bEnd) {
  // Overlap if intervals intersect: (aStart < bEnd) && (aEnd > bStart)
  return aStart < bEnd && aEnd > bStart;
}

// Routes
app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

app.get('/api/rooms/:roomId/reservations', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ error: 'Huonetta ei löytynyt.' });

  const list = reservations
    .filter(r => r.roomId === roomId)
    .sort((a, b) => new Date(a.startISO) - new Date(b.startISO));
  res.json(list);
});

app.post('/api/reservations', (req, res) => {
  const { roomId, startISO, endISO, title } = req.body || {};

  // Validate room
  const room = rooms.find(r => r.id === roomId);
  if (!room) return res.status(400).json({ error: 'Virheellinen huone.' });

  // Validate times
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  if (!start || !end) {
    return res.status(400).json({ error: 'Virheellinen päivämäärä tai kellonaika (ISO-8601).' });
  }
  if (start >= end) {
    return res.status(400).json({ error: 'Aloitusajan tulee olla ennen lopetusaikaa.' });
  }
  const now = new Date();
  if (start < now) {
    return res.status(400).json({ error: 'Varaus ei voi sijoittua menneisyyteen.' });
  }

  // Check overlap for the same room
  const roomReservations = reservations.filter(r => r.roomId === roomId);
  for (const r of roomReservations) {
    const rStart = new Date(r.startISO);
    const rEnd = new Date(r.endISO);
    if (isOverlap(start, end, rStart, rEnd)) {
      return res.status(409).json({
        error: 'Päällekkäinen varaus kyseiselle huoneelle.',
        conflictWith: r,
      });
    }
  }

  const newReservation = {
    id: uuidv4(),
    roomId,
    title: (title || '').toString().trim(),
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    createdAtISO: now.toISOString(),
  };
  reservations.push(newReservation);
  return res.status(201).json(newReservation);
});

app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const idx = reservations.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Varausta ei löytynyt.' });

  const removed = reservations[idx];
  reservations.splice(idx, 1);
  res.json({ ok: true, removed });
});

// Optional: health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, rooms: rooms.length, reservations: reservations.length });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
