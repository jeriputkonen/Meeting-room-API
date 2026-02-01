Haluan toteuttaa yksinkertainen kokoushuoneiden varausrajapinta (API).
Palvelun tulee tarjota käyttäjille seuraavat toiminnot:
● Varauksen luonti: Varaa huone tietylle aikavälille.
● Varauksen peruutus: Poista varaus.
● Varausten katselu: Listaa kaikki tietyn huoneen varaukset.
Toimintalogiikka (business rules):
● Varaukset eivät saa mennä päällekkäin (kaksi henkilöä ei voi varata samaa huonetta
samaan aikaan).
● Varaukset eivät voi sijoittua menneisyyteen.
● Aloitusajan täytyy olla ennen lopetusaikaa.
Tekniset reunaehdot:
● Käytä pääkielenä javascripitä
● Voit käyttää muistinvaraista tietokantaa (in-memory database), jotta ympäristön
pystytys pysyy yksinkertaisena.
Copilot said:
Copilot
Vastausta ei voitu luoda. Lähetä uusi kehote tai aloita uusi keskustelu.



Anna palautetta
You said:
Haluan toteuttaa yksinkertainen kokoushuoneiden varausrajapinta (API).
Palvelun tulee tarjota käyttäjille seuraavat toiminnot:
● Varauksen luonti: Varaa huone tietylle aikavälille.
● Varauksen peruutus: Poista varaus.
● Varausten katselu: Listaa kaikki tietyn huoneen varaukset.
Toimintalogiikka (business rules):
● Varaukset eivät saa mennä päällekkäin (kaksi henkilöä ei voi varata samaa huonetta
samaan aikaan).
● Varaukset eivät voi sijoittua menneisyyteen.
● Aloitusajan täytyy olla ennen lopetusaikaa.
Tekniset reunaehdot:
● Käytä pääkielenä javascripitä
● Voit käyttää muistinvaraista tietokantaa (in-memory database), jotta ympäristön
pystytys pysyy yksinkertaisena. - Tee ulkoasu "nordic cool" värityksen mukaan. - Tee kymmenen eri huonetta joiden nimet mukailevat suomen luontoa esim koivu, tunturi ym-Lisää mahdollisuus varata huone myös klikkaamalla erillisestä huonekartasta jossa huoneet näkyvät
Copilot said:
Copilot

Päätelty 20 s

Crafting a reservation API

Building the frontend

Crafting the backend

Serving and simplifying
Hieno idea! Tehdään yksinkertainen, muistinvarainen kokoushuoneiden varaus-API ja kevyt käyttöliittymä, jossa on nordic cool -väritys ja erillinen klikkailtava huonekartta. Alla saat valmiin toteutuksen Node.js + Express -palvelimella sekä staattisella HTML/JS/CSS-frontendilla. Kaikki on JavaScriptia, eikä tarvita oikeaa tietokantaa.

Rakenteen pääkohdat

Backend: Node.js + Express, muistinvarainen varausdata. Reitit:
POST /api/reservations – varauksen luonti
DELETE /api/reservations/:id – varauksen peruutus
GET /api/rooms – huonelista
GET /api/rooms/:roomId/reservations – huoneen varaukset
Business rules
Ei päällekkäisiä varauksia samassa huoneessa (ajanleikkauksen tarkistus)
Ei varauksia menneisyyteen
Aloitusajan tulee olla ennen lopetusaikaa
Frontend: yksisivuinen appi nordic cool -värityksellä, huonekartta (grid) klikkailtavilla huoneilla, varauslomake ja varauslista valitulle huoneelle.
Huoneet (10 kpl)

Koivu, Kuusi, Mänty, Tunturi, Järvi, Meri, Laakso, Kallio, Revontuli, Suo
Asennus ja ajaminen

Luo projektille kansio ja siirry sinne.
Alusta projekti ja asenna riippuvuudet:



Shell
npm init -y
npm install express cors uuid
Luo tiedostot alla olevalla rakenteella:
project/
├─ server.js
└─ public/
   ├─ index.html
   ├─ styles.css
   └─ app.js
Käynnistä palvelin:



Shell
node server.js
Avaa selain: http://localhost:3000
Backend: server.js




JavaScript
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

Näytä vähemmän
Frontend: public/index.html




HTML
<!doctype html>
<html lang="fi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kokoushuoneiden varaukset</title>
  styles.css
</head>
<body>
  <header class="topbar">
    <h1>Kokoushuoneet</h1>
    <div class="subtitle">Nordic cool -varausnäkymä</div>
  </header>

  <main class="container">
    <section class="panel">
      <h2>Huonekartta</h2>
      <div id="room-map" class="room-map" aria-label="Huonekartta"></div>
      <div id="selected-room" class="selected-room"></div>
    </section>

    <section class="panel">
      <h2>Varaus</h2>
      <form id="reservation-form" class="form">
        <div class="form-row">
          <label for="roomId">Huone</label>
          <select id="roomId" required></select>
        </div>

        <div class="form-row">
          <label for="title">Otsikko (valinnainen)</label>
          <input id="title" type="text" placeholder="Tiimin sprintti" />
        </div>

        <div class="form-row two-col">
          <div>
            <label for="start">Alkaa</label>
            <input id="start" type="datetime-local" required />
          </div>
          <div>
            <label for="end">Päättyy</label>
            <input id="end" type="datetime-local" required />
          </div>
        </div>

        <button type="submit" class="btn primary">Varaa</button>
        <div id="form-msg" class="form-msg" role="status" aria-live="polite"></div>
      </form>

      <h3>Varaukset valitulle huoneelle</h3>
      <ul id="reservations-list" class="reservations"></ul>
    </section>
  </main>

  <footer class="footer">
    <span>Demo – muistinvarainen API</span>
  </footer>

  app.js</script>
</body>
</html>

Näytä vähemmän
Frontend: public/styles.css (nordic cool -väritys)




CSS
:root{
  /* Nord palette */
  --nord0: #2E3440; /* deep slate */
  --nord1: #3B4252;
  --nord2: #434C5E;
  --nord3: #4C566A;
  --nord4: #D8DEE9; /* light */
  --nord5: #E5E9F0;
  --nord6: #ECEFF4;
  --nord7: #8FBCBB; /* greenish accent */
  --nord8: #88C0D0; /* icy blue */
  --nord9: #81A1C1; /* blue */
  --nord10:#5E81AC; /* dark blue */

  --bg: var(--nord0);
  --panel: var(--nord1);
  --panel-2: var(--nord2);
  --text: var(--nord6);
  --muted: var(--nord4);
  --accent: var(--nord8);
  --accent-2: var(--nord10);
  --ok: #86d190;
  --err: #ff9191;
  --warn: #ffd37a;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: linear-gradient(180deg, var(--bg), #222834);
  color: var(--text);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Noto Sans", "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji";
}

.topbar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  padding: 18px;
  background: linear-gradient(180deg, var(--panel), var(--panel-2));
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.topbar h1 { margin: 0; font-weight: 600; letter-spacing: 0.3px; }
.topbar .subtitle { color: var(--muted); font-size: 0.95rem; }

.container {
  max-width: 1100px;
  margin: 24px auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  padding: 0 16px;
}
@media (max-width: 900px) {
  .container { grid-template-columns: 1fr; }
}

.panel {
  background: rgba(76, 86, 106, 0.35);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  backdrop-filter: blur(2px);
}
.panel h2, .panel h3 { margin: 8px 0 12px; font-weight: 600; }

.room-map {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 8px;
}
.room-tile {
  background: linear-gradient(180deg, var(--panel), var(--panel-2));
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--text);
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
  text-align: center;
  user-select: none;
}
.room-tile:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.35);
  border-color: rgba(255,255,255,0.18);
}
.room-tile.active {
  outline: 2px solid var(--accent);
  box-shadow: 0 0 0 4px rgba(136,192,208,0.18);
}

.selected-room {
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.95rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}
.form-row { display: flex; flex-direction: column; gap: 6px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 600px) {
  .two-col { grid-template-columns: 1fr; }
}
label { color: var(--muted); font-size: 0.95rem; }
input, select {
  background: rgba(255,255,255,0.04);
  color: var(--text);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
}
input:focus, select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(136,192,208,0.16);
}

.btn {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  color: white;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: transform 100ms ease, box-shadow 120ms ease;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.35);
}
.btn.secondary {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: var(--text);
}

.form-msg { min-height: 20px; font-size: 0.95rem; }
.form-msg.ok { color: var(--ok); }
.form-msg.err { color: var(--err); }
.form-msg.warn { color: var(--warn); }

.reservations {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.res-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
}
.res-item .meta { color: var(--muted); font-size: 0.92rem; }
.res-item .title { font-weight: 600; }
.res-item button {
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.16);
  background: transparent;
  color: var(--text);
  cursor: pointer;
}
.res-item button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.footer {
  margin: 24px 0 32px;
  text-align: center;
  color: var(--muted);
  font-size: 0.92rem;
}

Näytä vähemmän
Frontend: public/app.js




JavaScript
const API = {
  rooms: () => fetch('/api/rooms').then(r => r.json()),
  roomReservations: (roomId) => fetch(`/api/rooms/${roomId}/reservations`).then(r => r.json()),
  createReservation: (payload) => fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(async r => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = data?.error || 'Virhe varauksessa.';
      const err = new Error(msg);
      err.data = data;
      err.status = r.status;
      throw err;
    }
    return data;
  }),
  deleteReservation: (id) => fetch(`/api/reservations/${id}`, { method: 'DELETE' })
    .then(async r => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = data?.error || 'Virhe poistaessa varausta.';
        const err = new Error(msg);
        err.data = data;
        err.status = r.status;
        throw err;
      }
      return data;
    }),
};

// DOM refs
const roomMapEl = document.getElementById('room-map');
const roomSelectEl = document.getElementById('roomId');
const selectedRoomEl = document.getElementById('selected-room');
const resListEl = document.getElementById('reservations-list');
const formEl = document.getElementById('reservation-form');
const msgEl = document.getElementById('form-msg');

let ROOMS = [];
let ACTIVE_ROOM = null;

function formatLocal(iso) {
  const d = new Date(iso);
  // e.g., 30.01.2026 14:30
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

function valueToISO(dtLocalValue) {
  // input type="datetime-local" returns local time; convert to ISO
  const d = new Date(dtLocalValue);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function setMessage(text, type = '') {
  msgEl.textContent = text || '';
  msgEl.className = `form-msg ${type}`;
}

function renderRoomSelect() {
  roomSelectEl.innerHTML = '';
  ROOMS.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.name;
    roomSelectEl.appendChild(opt);
  });
  if (ACTIVE_ROOM) {
    roomSelectEl.value = ACTIVE_ROOM.id;
  }
}

function renderRoomMap() {
  roomMapEl.innerHTML = '';
  ROOMS.forEach(r => {
    const tile = document.createElement('div');
    tile.className = 'room-tile';
    tile.textContent = r.name;
    tile.dataset.roomId = r.id;
    if (ACTIVE_ROOM?.id === r.id) tile.classList.add('active');
    tile.addEventListener('click', () => {
      setActiveRoom(r.id);
    });
    roomMapEl.appendChild(tile);
  });
}

function highlightActiveTile() {
  Array.from(roomMapEl.querySelectorAll('.room-tile')).forEach(el => {
    if (el.dataset.roomId === ACTIVE_ROOM?.id) el.classList.add('active');
    else el.classList.remove('active');
  });
}

async function loadReservations(roomId) {
  if (!roomId) return;
  const list = await API.roomReservations(roomId);
  renderReservationList(list);
}

function renderReservationList(list) {
  resListEl.innerHTML = '';
  if (!list || list.length === 0) {
    const li = document.createElement('li');
    li.className = 'res-item';
    li.innerHTML = '<div class="meta">Ei varauksia.</div>';
    resListEl.appendChild(li);
    return;
  }

  list.forEach(item => {
    const li = document.createElement('li');
    li.className = 'res-item';

    const left = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = item.title || '(Ei otsikkoa)';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${formatLocal(item.startISO)} — ${formatLocal(item.endISO)}`;

    left.appendChild(title);
    left.appendChild(meta);

    const del = document.createElement('button');
    del.textContent = 'Peruuta';
    del.addEventListener('click', async () => {
      try {
        await API.deleteReservation(item.id);
        await loadReservations(ACTIVE_ROOM.id);
        setMessage('Varaus peruttu.', 'ok');
      } catch (e) {
        setMessage(e.message || 'Virhe perutessa.', 'err');
      }
    });

    li.appendChild(left);
    li.appendChild(del);
    resListEl.appendChild(li);
  });
}

async function setActiveRoom(roomId) {
  ACTIVE_ROOM = ROOMS.find(r => r.id === roomId) || null;
  renderRoomSelect();
  highlightActiveTile();
  selectedRoomEl.textContent = ACTIVE_ROOM ? `Valittu huone: ${ACTIVE_ROOM.name}` : '';
  if (ACTIVE_ROOM) {
    await loadReservations(ACTIVE_ROOM.id);
  }
}

function setDefaultDateTimes() {
  const startEl = document.getElementById('start');
  const endEl = document.getElementById('end');

  const now = new Date();
  now.setMinutes(now.getMinutes() + 10); // pyöristys hiukan tulevaisuuteen
  now.setSeconds(0, 0);

  const in45 = new Date(now.getTime() + 45 * 60 * 1000);

  const toLocalInput = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  startEl.value = toLocalInput(now);
  endEl.value = toLocalInput(in45);
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMessage('');

  const roomId = roomSelectEl.value;
  const title = document.getElementById('title').value;
  const startLocal = document.getElementById('start').value;
  const endLocal = document.getElementById('end').value;

  const startISO = valueToISO(startLocal);
  const endISO = valueToISO(endLocal);
  if (!startISO || !endISO) {
    setMessage('Tarkista päivämäärät.', 'err');
    return;
  }

  try {
    const created = await API.createReservation({ roomId, title, startISO, endISO });
    setMessage('Varaus luotu.', 'ok');
    if (ACTIVE_ROOM && ACTIVE_ROOM.id === roomId) {
      await loadReservations(roomId);
    } else {
      await setActiveRoom(roomId);
    }
  } catch (err) {
    const status = err.status;
    // Näytä tarkempi viesti mahdollisen konfliktin kohdalla
    if (status === 409 && err?.data?.conflictWith) {
      const c = err.data.conflictWith;
      setMessage(
        `Päällekkäinen varaus: ${formatLocal(c.startISO)} — ${formatLocal(c.endISO)}`,
        'err'
      );
    } else {
      setMessage(err.message || 'Virhe varauksessa.', 'err');
    }
  }
});

async function init() {
  ROOMS = await API.rooms();

  renderRoomSelect();
  renderRoomMap();
  setDefaultDateTimes();

  // Valitse ensimmäinen huone oletuksena
  if (ROOMS.length > 0) {
    await setActiveRoom(ROOMS[0].id);
  }
}
init();

Näytä vähemmän
API:n datamuodot

Varaus (response)



JSON
{
  "id": "uuid",
  "roomId": "koivu",
  "title": "Sprintin suunnittelu",
  "startISO": "2026-01-30T12:00:00.000Z",
  "endISO": "2026-01-30T12:45:00.000Z",
  "createdAtISO": "2026-01-30T11:10:00.000Z"
}
Varauksen luonti (request body)



JSON
{
  "roomId": "koivu",
  "title": "Sprintin suunnittelu",
  "startISO": "2026-01-30T12:00:00.000Z",
  "endISO": "2026-01-30T12:45:00.000Z"
}
Pikaiset testit komentoriviltä




Shell
# Huoneet
curl http://localhost:3000/api/rooms

# Huoneen varaukset
curl http://localhost:3000/api/rooms/koivu/reservations

# Varauksen luonti
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"roomId":"koivu","title":"Palaveri","startISO":"2026-02-01T10:00:00.000Z","endISO":"2026-02-01T11:00:00.000Z"}'

# Varauksen peruutus
curl -X DELETE http://localhost:3000/api/reservations/<VARAUS_ID>

Näytä vähemmän
Laajennusideoita myöhemmin

Käyttäjätunnistus (esim. JWT) ja roolit
Toistuvat varaukset, liukuvat slotit ja minimiväli
Yliajot oikeuksilla (admin)
Kestomuisti (SQLite/PostgreSQL) ja migraatiot
ICal/Outlook-integraatiot sekä iCalendar-exportti
Päivänäkymä ja vedä-pudota -kalenteri (esim. FullCalendar)
Haluatko, että kehitän tähän myös valinnaisen Dockerfile-tuen tai lisään yksikkötestit (Jest) varauslogiikalle? Voimme myös muokata huonekarttaa tilaasi vastaavaksi, jos kerrot haluamasi layoutin.








image.png
You said:
Laitan kuvan miltä näyttää. CSS ei ilmeisesti toimi eikä myöskään tule huoneita varattavaksi
Copilot said:
Copilot
Kiitos kuvasta — siitä näkee heti kaksi selkeää ongelmaa:

✅ 1) CSS EI LATAUDU
Syynä on melkein varmasti puuttuva <link>-tagi tai väärä polku.

Kuvassasi näkyy "styles.css" tekstinä, mikä tarkoittaa että HTML:ään on jäänyt pelkkä teksti eikä linkkiä.

Korjaa HTML:n <head>-osio näin:




HTML
styles.css
app.js</script>
Poista siis se pelkkä ”styles.css” -rivi.

Oikea index.html alku:



HTML
<!doctype html>
<html lang="fi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kokoushuoneiden varaukset</title>

  styles.css
  app.js</script>
</head>
Kun tämä on kunnossa → nordic cool -tyyli latautuu heti.

✅ 2) HUONEITA EI NÄY
Syyt voivat olla:

A) API ei käynnissä
Tarkista terminaalista:

Server running at http://localhost:3000
Jos ei näy → aja:

node server.js
B) Virheellinen kansiorakenne
Varmista että rakenne on juuri näin:

project/
├─ server.js
└─ public/
   ├─ index.html
   ├─ styles.css
   └─ app.js
Kun server.js sisältää:




JavaScript
app.use(express.static(path.join(__dirname, 'public')));
→ Silloin kaikki public-kansion tiedostot palvellaan oikein.

C) Frontend ei tavoita /api/rooms -endpointia
Avaa selaimessa:

http://localhost:3000/api/rooms
Sinun pitäisi nähdä JSON:




JSON
[
  { "id": "koivu", "name": "Koivu" },
  { "id": "kuusi", "name": "Kuusi" },
  ...
]
Jos tämä EI toimi → backendissä virhe → voin auttaa korjaamaan.

D) JavaScript ei lataudu
Jos app.js näkyy ruudulla tekstinä (kuten sinun kuvassasi):

➡️ SEOscript-tagi puuttuu (sama ongelma kuin CSS:ssä).

Korjaa:




HTML
app.js</script>
✔ Nopein tapa testata toimivuus
Käynnistä palvelin:
node server.js
Avaa selaimessa:
http://localhost:3000
http://localhost:3000/api/rooms
http://localhost:3000/app.js (tarkista että JS näkyy, EI HTML-tekstiä)
http://localhost:3000/styles.css (tarkista että CSS näkyy eikä tule 404)
🔧 Jos haluat, voin:
✔ korjata tiedostosi kokonaan
✔ tuottaa täydellisen toimivan projektipaketin
✔ lisätä myös responsiivisen huonekartan, hover-animaation ja varauskalenterin

📸 Voit myös lähettää kuvan projektikansiostasi, niin tarkistan rakenteen.








You said:
Onhan tämä oikea osoite josta pitäisi ohjelmaa käyttää? http://localhost:3000/index.html
Copilot said:
Copilot
Lyhyt vastaus: Kyllä, osoite on oikea – mutta sen EI tarvitse olla /index.html
Voit (ja kannattaa) käyttää sitä myös näin:

👉 http://localhost:3000/

Expressin express.static() palvelee public/-kansion juuresta, joten:

http://localhost:3000/ → lataa automaattisesti public/index.html
http://localhost:3000/index.html → toimii myös, mutta ei ole pakollinen
✅ Tarkistuslista — jotta kaikki toimii
1) Palvelin käynnissä?
Terminaalissa täytyy näkyä:

Server running at http://localhost:3000
Jos ei → aja:

node server.js
2) Kansiorakenne täsmälleen näin?
project/
├─ server.js
└─ public/
   ├─ index.html
   ├─ styles.css
   └─ app.js
Jos index.html EI ole public-kansiossa → Express ei löydä sitä.

3) Aukeaako CSS?
Kokeile selaimessa:

➡️ http://localhost:3000/styles.css

✔ jos näkyy CSS-koodi → ok
❌ jos tulee 404 → styles.css ei ole public-kansiossa tai nimi väärä

4) Aukeaako app.js?
➡️ http://localhost:3000/app.js

✔ jos näkyy JS-koodi → ok
❌ jos tulee 404 → tiedosto väärässä paikassa

5) Latautuuko huoneet API:sta?
Avaa selaimessa:

➡️ http://localhost:3000/api/rooms

✔ pitäisi näkyä JSON-lista, esim.:




JSON
[
  {"id":"koivu","name":"Koivu"},
  {"id":"kuusi","name":"Kuusi"},
  ...
]
❌ jos ei → server.js ei käynnissä tai tiedostossa virhe

🎯 Jos haluat, voin tarkistaa koko projektisi
Jos lähetät:

📸 kuvan projektikansiostasi
tai
📄 server.js + index.html sisällöt

…niin löydän virheen 100% varmasti.

Haluatko, että tarkistan ne?








Tänään

html
index

js
server
You said:
kaikki tiedostot näyttävät mielestäni selaimessa siltä mitä pitää. Tässä index.html tiedosto sekä server.js. Tarkistatko mikä mättää ja miksi huoneiden alasvetolista on tyhjä sekä miksi css tyylit eivät toimi.
Copilot said:
Copilot

Päätelty 1 s

Diagnosing and correcting server setup

Revisiting index.html core elements
Kiitos tiedostoista – nyt näkyy heti syyt siihen, miksi tyyli ei lataudu eikä alasvetolistaan tule huoneita.

Mitä tapahtuu nyt

index.html:ssä CSS ei ole linkitettynä, ja JavaScriptille puuttuu avaus-

server.js toimii muuten hyvin, mutta PORT-rivillä näkyy merkkirikon jälki. Sen kuuluu olla node-tyylinen “|| 3000”. Vaikka palvelin ilmeisesti jo käynnistyykin, korjataan se, jotta tiedosto on virheetön.
sharepoint

Korjaukset

index.html – korvaa nykyinen tiedosto tällä – Huomaa: lisäsin oikean <link rel="stylesheet" ...> -tagin sekä oikean ... -tagin ennen -tägiä.




HTML
<!doctype html>
<html lang="fi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kokoushuoneiden varaukset</title>

  <!-- Lataa CSS oikein -->
  /styles.css
</head>
<body>
  <header class="topbar">
    <h1>Kokoushuoneet</h1>
    <div class="subtitle">Nordic cool -varausnäkymä</div>
  </header>

  <main class="container">
    <section class="panel">
      <h2>Huonekartta</h2>
      <div id="room-map" class="room-map" aria-label="Huonekartta"></div>
      <div id="selected-room" class="selected-room"></div>
    </section>

    <section class="panel">
      <h2>Varaus</h2>
      <form id="reservation-form" class="form">
        <div class="form-row">
          <label for="roomId">Huone</label>
          <select id="roomId" required></select>
        </div>

        <div class="form-row">
          <label for="title">Otsikko (valinnainen)</label>
          <input id="title" type="text" placeholder="Tiimin sprintti" />
        </div>

        <div class="form-row two-col">
          <div>
            <label for="start">Alkaa</label>
            <input id="start" type="datetime-local" required />
          </div>
          <div>
            <label for="end">Päättyy</label>
            <input id="end" type="datetime-local" required />
          </div>
        </div>

        <button type="submit" class="btn primary">Varaa</button>
        <div id="form-msg" class="form-msg" role="status" aria-live="polite"></div>
      </form>

      <h3>Varaukset valitulle huoneelle</h3>
      <ul id="reservations-list" class="reservations"></ul>
    </section>
  </main>

  <footer class="footer">
    <span>Demo – muistinvarainen API</span>
  </footer>

  <!-- Lataa frontend-skripti oikein -->
  /app.js</script>
</body>
</html>

Näytä lisää rivejä
server.js – varmista että PORT-rivi on tämä – Jos tiedostossasi näkyi oudosti rivittynyt versio, vaihda alla olevaan. Muut osat voivat olla sellaisenaan.




JavaScript
const PORT = process.env.PORT || 3000;
Pikatsekki korjausten jälkeen

Käynnistä palvelin:
node server.js
Terminaalissa: Server running at http://localhost:3000

Avaa selain:
http://localhost:3000/
– Nyt tyylit näkyvät (Nord-värit).
– Huonekartassa näkyy 10 huonetta.
– Alasvetolistassa samat huoneet.

Varmista tiedostojen latautuminen suoraan: – http://localhost:3000/styles.css → CSS-koodi näkyy
– http://localhost:3000/app.js → JS-koodi näkyy
– http://localhost:3000/api/rooms → JSON-lista huoneista

Miksi nämä korjaukset ratkaisevat ongelman • Ilman /styles.css selain ei lataa tyylejä, vaan tulostaa pelkän tekstin “styles.css” sivulle. Siksi näkymä oli täysin tyylitön.
• Ilman /app.js app.js ei suoritu, joten se ei hae huoneita /api/rooms-rajapinnasta eikä renderöi alasvetolistaa tai huonekarttaa.
• PORT-rivin oikea syntaksi estää tulevat käynnistysongelmat (esim. Heroku/Render-ympäristöissä).
Favicon type
index
sharepoint

Lisäapua vianhakuun selaimessa

Avaa DevTools → Network-välilehti → lataa sivu uudelleen (Ctrl/Cmd+R).
– 200 OK /styles.css ja /app.js → hyvä.
– 404 tms. → tiedoston nimi/polku pielessä.

Console-välilehti
– Jos näet virheitä tyyliin “Uncaught ReferenceError” tai “Failed to fetch /api/rooms”, kopioi ne tänne, niin korjaan.

Haluatko, että lähetän vielä valmiin, korjatun projektipaketin zip-muodossa (public/ + server.js) tai lisään huonekarttaan tilavärejä (vapaa/varattu) ja pikavarausklikin?

Lähteet
htmljs


Takaisin varausohjelman pariin. Jos valitsen alasvetovalikosta tuon kokoushuoneen niin huonekartassa huone ei vaihdu. Toisinpäin se toimii eli jos vaihdan kartasta huonetta niin alasvetovalikon valinta päivittyy. Saatko toimimaan myös toisinpäin? Ja toinene muutos saisiko tuon varausajan vaihtamisen toimimaan sujuvammin. Jos siihen saa helposti tehtyä muutoksen että ajassa näkyy vain 06-22 ja muutenkin esimerkiksi minuuttien valitseminen kätevämpää niin olisi hyvä. Saatko nämä tehtyä? Tässä viimeisin index.html tiedosto tein siihen muutoksia itse. 
Copilot said:
Copilot

Päätelty 4 s

Modifying application files

Otsikon lisääminen
Hyvä havainto – korjataan nämä molemmat:

Dropdown → huonekartta päivittyy
Aikavalinnan UX: vain 06–22, ja minuutit esim. 5 min stepillä
Katso alta muutokset (voit kopioida sellaisenaan omaan public/app.js-tiedostoosi). Luin samalla viimeisimmän index.html-versiosi ja se näyttää hyvältä (linkitys styles.css ja app.js on oikein).
Favicon type
index

1) Dropdownin vaihto päivittää kartan
Lisätään change-kuuntelija huoneen alasvetovalikkoon, joka kutsuu samaa logiikkaa kuin kartan klikkaus (setActiveRoom).

Lisää nämä rivit init()-funktion jälkeen tai sen sisällä (kun elementit ovat olemassa):




JavaScript
// --- UUSI: reagoi dropdownin muutokseen ---
roomSelectEl.addEventListener('change', async (e) => {
  const roomId = e.target.value;
  await setActiveRoom(roomId);    // tämä päivittää kartan, listan ja valitun huoneen tekstin
});
Taustalla setActiveRoom jo tekee kaiken tarvittavan: se asettaa aktiivisen huoneen, renderöi valinnan, korostaa kartalla oikean laatikon ja hakee varaukset. Aiemmin meillä oli vain kartta → dropdown -synkka, nyt lisäsimme myös dropdown → kartta -synkan.

2) Aikavalinnan sujuvoitus (vain 06–22, 5 min step, automaattinen “clamp”)
Mitä tehdään
Asetetaan molemmille datetime-local -kentille 5 min step.
Annetaan pehmeä alaraja/kattoraja: 06:00 – 22:00 (päiväkohtaisesti).
Korjataan (“clampataan”) arvo, jos käyttäjä valitsee jotain tämän ulkopuolelta.
Pyöristetään minuutit 5 minuutin välein.
Varmistetaan lisäksi, että loppu > alku. Jos käyttäjä rullaa aloitusta myöhemmäksi, siirretään loppua tarvittaessa vähintään +15 min päähän.
Huom: datetime-local ei tue pelkkää kellonaikarajaa ilman päivää. Siksi tehdään rajaus ohjelmallisesti aina kun arvo muuttuu tai lomake lähetetään.

Lisää nämä apufunktiot app.js:iin (esim. muiden funktioiden viereen)



JavaScript
// Pyöristys lähimpään step-minuuttiin (oletus 5 min)
function roundToStep(date, stepMinutes = 5) {
  const ms = stepMinutes * 60 * 1000;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

// Leikkaa ajan klo 06:00–22:00 välille (päiväkohtaisesti).
function clampToBusinessHours(date, minHour = 6, maxHour = 22) {
  const d = new Date(date);
  const clamped = new Date(d);

  const startOfDay = new Date(d);
  startOfDay.setHours(minHour, 0, 0, 0);

  const endOfDay = new Date(d);
  endOfDay.setHours(maxHour, 0, 0, 0);

  if (clamped < startOfDay) return startOfDay;
  if (clamped > endOfDay) return endOfDay;
  return clamped;
}

// Apuri: syötteen (datetime-local) arvo -> Date, huomioi tyhjät
function inputValueToDate(value) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// Päivittää inputin arvon takaisin (YYYY-MM-DDTHH:mm)
function setInputDateValue(inputEl, date) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  inputEl.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

Näytä vähemmän
Lisää nämä rivit init()-funktion alkuun (tai heti sen jälkeen), jotta step on 5 min:



JavaScript
// --- UUSI: 5 min step ---
const startEl = document.getElementById('start');
const endEl = document.getElementById('end');
startEl.setAttribute('step', '300'); // 300 s = 5 min
endEl.setAttribute('step', '300');
Päivitä setDefaultDateTimes() varmistamaan 06–22 ja 5 min grid
Korvaa koko funktio tällä:




JavaScript
function setDefaultDateTimes() {
  const startEl = document.getElementById('start');
  const endEl = document.getElementById('end');

  const now = new Date();
  // Oletus: seuraava 5 min "gridi", vähintään 06:00 ja enintään 22:00
  let start = new Date(now.getTime() + 10 * 60 * 1000); // vähän tulevaisuuteen
  start.setSeconds(0, 0);
  start = roundToStep(start, 5);
  start = clampToBusinessHours(start, 6, 22);

  let end = new Date(start.getTime() + 45 * 60 * 1000);
  end = roundToStep(end, 5);
  end = clampToBusinessHours(end, 6, 22);

  // Jos loppu "clampautui" samalle tai aiemmalle ajalle, siirretään +15 min
  if (end <= start) {
    end = new Date(start.getTime() + 15 * 60 * 1000);
    end = clampToBusinessHours(end, 6, 22);
  }

  setInputDateValue(startEl, start);
  setInputDateValue(endEl, end);
}

Näytä vähemmän
Lisää syötteen muutosten “live” korjaus (clamp + round)
Lisää nämä kuuntelijat init()-funktion loppuun:




JavaScript
// --- UUSI: korjaa ja pyöristää aikoja lennossa ---
startEl.addEventListener('change', () => {
  let start = inputValueToDate(startEl.value);
  if (!start) return;
  start = roundToStep(start, 5);
  start = clampToBusinessHours(start, 6, 22);
  setInputDateValue(startEl, start);

  // Varmista että loppu on aina startin jälkeen vähintään +15 min
  let end = inputValueToDate(endEl.value);
  if (!end || end <= start) {
    end = new Date(start.getTime() + 15 * 60 * 1000);
  }
  end = roundToStep(end, 5);
  end = clampToBusinessHours(end, 6, 22);
  if (end <= start) {
    // Jos start on jo illalla lähellä 22:00 -> nosta starttia taaksepäin 15 min, tai näytä viesti
    end = new Date(start.getTime() + 15 * 60 * 1000);
    end = clampToBusinessHours(end, 6, 22);
  }
  setInputDateValue(endEl, end);
});

endEl.addEventListener('change', () => {
  let end = inputValueToDate(endEl.value);
  if (!end) return;
  end = roundToStep(end, 5);
  end = clampToBusinessHours(end, 6, 22);
  setInputDateValue(endEl, end);

  let start = inputValueToDate(startEl.value);
  if (!start) return;
  // Jos loppu meni ennen alkua -> nosta sitä vähintään +15 min
  if (end <= start) {
    start = new Date(end.getTime() - 15 * 60 * 1000);
    start = clampToBusinessHours(start, 6, 22);
    setInputDateValue(startEl, start);
  }
});


Näytä vähemmän
Pieni varmistus myös submitissä
Nykyinen formEl.addEventListener('submit', ...) voi jäädä sellaiseksi kuin se on, mutta jos haluat varman katteen myös API-kutsun juuri ennen, voit lisätä clamp/roundin siinä kohtaa uudelleen (ei pakollinen, koska teemme sen jo change‑kuuntelijoissa).

Bonus: näkyvä ohjeistus käyttäjälle (valinnainen)
Voit lisätä index.html:ään pienen vinkin:




HTML
<p class="hint">Varausaika: 06:00–22:00, 5 min välein.</p>
Ja styles.css:




CSS
.hint { color: var(--muted); font-size: 0.9rem; margin: 6px 0 0; }
Yhteenveto muutoksista
Dropdown → kartta: lisätty change-kuuntelija → kutsuu setActiveRoom(roomId).
Aikavalinta:
5 min step (step=300)
pehmeä rajaus 06:00–22:00 päiväkohtaisesti
automaattinen pyöristys 5 min välein
varmistus että loppu on aina startin jälkeen, vähintään +15 min
Nämä eivät riko aiempaa logiikkaa eivätkä vaadi backend‑muutoksia. index.html-tiedostosi on linkitysten osalta kunnossa.
Favicon type
index

Haluatko että pakkaan sinulle päivitetyn, täydellisen app.js‑tiedoston yhtenä blokkina, vai teetkö mieluummin yllä olevat lisäykset omaan versioosi? Jos lähetät minulle nykyisen app.js:si, upotan muutokset suoraan siihen ja palautan koko tiedoston valmiina.

Lähteet
html







You said:
laita kaikista muokatuista tiedostoista suoraan korjatut tiedosto tähän. Katson ne itse läpi. 
Copilot said:
Copilot

Päätelty 1 s

Integrating dropdown sync
Tässä suoraan korjatut tiedostot. Olen tehnyt pyytämäsi muutokset:

Dropdownin vaihto päivittää huonekartan valinnan (ja varauslistan).
Aikavalinnan UX: 5 min step, pehmeä rajaus 06:00–22:00, automaattiset korjaukset ja pyöristyksen 5 min välein, sekä varmistus että loppu on aina vähintään +15 min alusta.
Pidin muun rakenteen ennallaan. Kopioi sisällöt suoraan omien tiedostojesi tilalle.
index.html




HTML
<!doctype html>
<html lang="fi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kokoushuoneiden varaukset</title>

  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <header class="topbar">
    <h1>Kokoushuoneet</h1>
    <div class="subtitle">Nordic cool -varausnäkymä</div>
  </header>

  <main class="container">
    <section class="panel">
      <h2>Huonekartta</h2>
      <div id="room-map" class="room-map" aria-label="Huonekartta"></div>
      <div id="selected-room" class="selected-room"></div>
    </section>

    <section class="panel">
      <h2>Varaus</h2>
      <form id="reservation-form" class="form">
        <div class="form-row">
          <label for="roomId">Huone</label>
          <select id="roomId" required></select>
        </div>

        <div class="form-row">
          <label for="title">Otsikko (valinnainen)</label>
          <input id="title" type="text" placeholder="Tiimin sprintti" />
        </div>

        <div class="form-row two-col">
          <div>
            <label for="start">Alkaa</label>
            <input id="start" type="datetime-local" required />
            <p class="hint">Varausaika: 06:00–22:00, 5 min välein.</p>
          </div>
          <div>
            <label for="end">Päättyy</label>
            <input id="end" type="datetime-local" required />
          </div>
        </div>

        <button type="submit" class="btn primary">Varaa</button>
        <div id="form-msg" class="form-msg" role="status" aria-live="polite"></div>
      </form>

      <h3>Varaukset valitulle huoneelle</h3>
      <ul id="reservations-list" class="reservations"></ul>
    </section>
  </main>

  <footer class="footer">
    <span>Demo – muistinvarainen API</span>
  </footer>

  <script src="/app.js"></script>
</body>
</html>

Näytä vähemmän
styles.css




CSS
:root{
  /* Nord palette */
  --nord0: #2E3440;
  --nord1: #3B4252;
  --nord2: #434C5E;
  --nord3: #4C566A;
  --nord4: #D8DEE9;
  --nord5: #E5E9F0;
  --nord6: #ECEFF4;
  --nord7: #8FBCBB;
  --nord8: #88C0D0;
  --nord9: #81A1C1;
  --nord10:#5E81AC;

  --bg: var(--nord0);
  --panel: var(--nord1);
  --panel-2: var(--nord2);
  --text: var(--nord6);
  --muted: var(--nord4);
  --accent: var(--nord8);
  --accent-2: var(--nord10);
  --ok: #86d190;
  --err: #ff9191;
  --warn: #ffd37a;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: linear-gradient(180deg, var(--bg), #222834);
  color: var(--text);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Noto Sans", "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji";
}

.topbar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  padding: 18px;
  background: linear-gradient(180deg, var(--panel), var(--panel-2));
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.topbar h1 { margin: 0; font-weight: 600; letter-spacing: 0.3px; }
.topbar .subtitle { color: var(--muted); font-size: 0.95rem; }

.container {
  max-width: 1100px;
  margin: 24px auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  padding: 0 16px;
}
@media (max-width: 900px) {
  .container { grid-template-columns: 1fr; }
}

.panel {
  background: rgba(76, 86, 106, 0.35);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  backdrop-filter: blur(2px);
}
.panel h2, .panel h3 { margin: 8px 0 12px; font-weight: 600; }

.room-map {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 8px;
}
.room-tile {
  background: linear-gradient(180deg, var(--panel), var(--panel-2));
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--text);
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
  text-align: center;
  user-select: none;
}
.room-tile:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.35);
  border-color: rgba(255,255,255,0.18);
}
.room-tile.active {
  outline: 2px solid var(--accent);
  box-shadow: 0 0 0 4px rgba(136,192,208,0.18);
}

.selected-room {
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.95rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}
.form-row { display: flex; flex-direction: column; gap: 6px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 600px) {
  .two-col { grid-template-columns: 1fr; }
}
label { color: var(--muted); font-size: 0.95rem; }
input, select {
  background: rgba(255,255,255,0.04);
  color: var(--text);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
}
input:focus, select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(136,192,208,0.16);
}

.btn {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  color: white;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: transform 100ms ease, box-shadow 120ms ease;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.35);
}
.btn.secondary {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: var(--text);
}

.form-msg { min-height: 20px; font-size: 0.95rem; }
.form-msg.ok { color: var(--ok); }
.form-msg.err { color: var(--err); }
.form-msg.warn { color: var(--warn); }

.reservations {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.res-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
}
.res-item .meta { color: var(--muted); font-size: 0.92rem; }
.res-item .title { font-weight: 600; }
.res-item button {
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.16);
  background: transparent;
  color: var(--text);
  cursor: pointer;
}
.res-item button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.footer {
  margin: 24px 0 32px;
  text-align: center;
  color: var(--muted);
  font-size: 0.92rem;
}

.hint { color: var(--muted); font-size: 0.9rem; margin: 6px 0 0; }
``

Näytä vähemmän
app.js




JavaScript
const API = {
  rooms: () => fetch('/api/rooms').then(r => r.json()),
  roomReservations: (roomId) => fetch(`/api/rooms/${roomId}/reservations`).then(r => r.json()),
  createReservation: (payload) => fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(async r => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = data?.error || 'Virhe varauksessa.';
      const err = new Error(msg);
      err.data = data;
      err.status = r.status;
      throw err;
    }
    return data;
  }),
  deleteReservation: (id) => fetch(`/api/reservations/${id}`, { method: 'DELETE' })
    .then(async r => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = data?.error || 'Virhe poistaessa varausta.';
        const err = new Error(msg);
        err.data = data;
        err.status = r.status;
        throw err;
      }
      return data;
    }),
};

// DOM refs
const roomMapEl = document.getElementById('room-map');
const roomSelectEl = document.getElementById('roomId');
const selectedRoomEl = document.getElementById('selected-room');
const resListEl = document.getElementById('reservations-list');
const formEl = document.getElementById('reservation-form');
const msgEl = document.getElementById('form-msg');

let ROOMS = [];
let ACTIVE_ROOM = null;

// ---------- Aika-apurit ----------
function roundToStep(date, stepMinutes = 5) {
  const ms = stepMinutes * 60 * 1000;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

function clampToBusinessHours(date, minHour = 6, maxHour = 22) {
  const d = new Date(date);
  const clamped = new Date(d);

  const startOfDay = new Date(d);
  startOfDay.setHours(minHour, 0, 0, 0);

  const endOfDay = new Date(d);
  endOfDay.setHours(maxHour, 0, 0, 0);

  if (clamped < startOfDay) return startOfDay;
  if (clamped > endOfDay) return endOfDay;
  return clamped;
}

function inputValueToDate(value) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function setInputDateValue(inputEl, date) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  inputEl.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

// ---------- Muut apurit ----------
function formatLocal(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

function valueToISO(dtLocalValue) {
  const d = new Date(dtLocalValue);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function setMessage(text, type = '') {
  msgEl.textContent = text || '';
  msgEl.className = `form-msg ${type}`;
}

function renderRoomSelect() {
  roomSelectEl.innerHTML = '';
  ROOMS.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.name;
    roomSelectEl.appendChild(opt);
  });
  if (ACTIVE_ROOM) {
    roomSelectEl.value = ACTIVE_ROOM.id;
  }
}

function renderRoomMap() {
  roomMapEl.innerHTML = '';
  ROOMS.forEach(r => {
    const tile = document.createElement('div');
    tile.className = 'room-tile';
    tile.textContent = r.name;
    tile.dataset.roomId = r.id;
    if (ACTIVE_ROOM?.id === r.id) tile.classList.add('active');
    tile.addEventListener('click', () => {
      setActiveRoom(r.id);
    });
    roomMapEl.appendChild(tile);
  });
}

function highlightActiveTile() {
  Array.from(roomMapEl.querySelectorAll('.room-tile')).forEach(el => {
    if (el.dataset.roomId === ACTIVE_ROOM?.id) el.classList.add('active');
    else el.classList.remove('active');
  });
}

async function loadReservations(roomId) {
  if (!roomId) return;
  const list = await API.roomReservations(roomId);
  renderReservationList(list);
}

function renderReservationList(list) {
  resListEl.innerHTML = '';
  if (!list || list.length === 0) {
    const li = document.createElement('li');
    li.className = 'res-item';
    li.innerHTML = '<div class="meta">Ei varauksia.</div>';
    resListEl.appendChild(li);
    return;
  }

  list.forEach(item => {
    const li = document.createElement('li');
    li.className = 'res-item';

    const left = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = item.title || '(Ei otsikkoa)';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${formatLocal(item.startISO)} — ${formatLocal(item.endISO)}`;

    left.appendChild(title);
    left.appendChild(meta);

    const del = document.createElement('button');
    del.textContent = 'Peruuta';
    del.addEventListener('click', async () => {
      try {
        await API.deleteReservation(item.id);
        await loadReservations(ACTIVE_ROOM.id);
        setMessage('Varaus peruttu.', 'ok');
      } catch (e) {
        setMessage(e.message || 'Virhe perutessa.', 'err');
      }
    });

    li.appendChild(left);
    li.appendChild(del);
    resListEl.appendChild(li);
  });
}

async function setActiveRoom(roomId) {
  ACTIVE_ROOM = ROOMS.find(r => r.id === roomId) || null;
  renderRoomSelect();
  highlightActiveTile();
  selectedRoomEl.textContent = ACTIVE_ROOM ? `Valittu huone: ${ACTIVE_ROOM.name}` : '';
  if (ACTIVE_ROOM) {
    await loadReservations(ACTIVE_ROOM.id);
  }
}

function setDefaultDateTimes() {
  const startEl = document.getElementById('start');
  const endEl = document.getElementById('end');

  const now = new Date();
  let start = new Date(now.getTime() + 10 * 60 * 1000);
  start.setSeconds(0, 0);
  start = roundToStep(start, 5);
  start = clampToBusinessHours(start, 6, 22);

  let end = new Date(start.getTime() + 45 * 60 * 1000);
  end = roundToStep(end, 5);
  end = clampToBusinessHours(end, 6, 22);

  if (end <= start) {
    end = new Date(start.getTime() + 15 * 60 * 1000);
    end = clampToBusinessHours(end, 6, 22);
  }

  setInputDateValue(startEl, start);
  setInputDateValue(endEl, end);
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMessage('');

  const roomId = roomSelectEl.value;
  const title = document.getElementById('title').value;
  const startLocal = document.getElementById('start').value;
  const endLocal = document.getElementById('end').value;

  // Turvakerros: clamp + round ennen submit
  let startDate = inputValueToDate(startLocal);
  let endDate = inputValueToDate(endLocal);
  if (!startDate || !endDate) {
    setMessage('Tarkista päivämäärät.', 'err');
    return;
  }
  startDate = roundToStep(clampToBusinessHours(startDate, 6, 22), 5);
  endDate = roundToStep(clampToBusinessHours(endDate, 6, 22), 5);
  if (endDate <= startDate) {
    endDate = new Date(startDate.getTime() + 15 * 60 * 1000);
    endDate = clampToBusinessHours(endDate, 6, 22);
  }
  setInputDateValue(document.getElementById('start'), startDate);
  setInputDateValue(document.getElementById('end'), endDate);

  const startISO = valueToISO(document.getElementById('start').value);
  const endISO = valueToISO(document.getElementById('end').value);

  try {
    const created = await API.createReservation({ roomId, title, startISO, endISO });
    setMessage('Varaus luotu.', 'ok');
    if (ACTIVE_ROOM && ACTIVE_ROOM.id === roomId) {
      await loadReservations(roomId);
    } else {
      await setActiveRoom(roomId);
    }
  } catch (err) {
    const status = err.status;
    if (status === 409 && err?.data?.conflictWith) {
      const c = err.data.conflictWith;
      setMessage(
        `Päällekkäinen varaus: ${formatLocal(c.startISO)} — ${formatLocal(c.endISO)}`,
        'err'
      );
    } else {
      setMessage(err.message || 'Virhe varauksessa.', 'err');
    }
  }
});

async function init() {
  // Aseta 5 min step
  const startEl = document.getElementById('start');
  const endEl = document.getElementById('end');
  startEl.setAttribute('step', '300');
  endEl.setAttribute('step', '300');

  ROOMS = await API.rooms();
  renderRoomSelect();
  renderRoomMap();
  setDefaultDateTimes();

  // Valitse ensimmäinen huone oletuksena
  if (ROOMS.length > 0) {
    await setActiveRoom(ROOMS[0].id);
  }

  // Dropdown -> kartta (uusi)
  roomSelectEl.addEventListener('change', async (e) => {
    const roomId = e.target.value;
    await setActiveRoom(roomId);
  });

  // Live-korjaukset aikakentissä (uusi)
  startEl.addEventListener('change', () => {
    let start = inputValueToDate(startEl.value);
    if (!start) return;
    start = roundToStep(start, 5);
    start = clampToBusinessHours(start, 6, 22);
    setInputDateValue(startEl, start);

    let end = inputValueToDate(endEl.value);
    if (!end || end <= start) {
      end = new Date(start.getTime() + 15 * 60 * 1000);
    }
    end = roundToStep(end, 5);
    end = clampToBusinessHours(end, 6, 22);
    if (end <= start) {
      end = new Date(start.getTime() + 15 * 60 * 1000);
      end = clampToBusinessHours(end, 6, 22);
    }
    setInputDateValue(endEl, end);
  });

  endEl.addEventListener('change', () => {
    let end = inputValueToDate(endEl.value);
    if (!end) return;
    end = roundToStep(end, 5);
    end = clampToBusinessHours(end, 6, 22);
    setInputDateValue(endEl, end);

    let start = inputValueToDate(startEl.value);
    if (!start) return;
    if (end <= start) {
      start = new Date(end.getTime() - 15 * 60 * 1000);
      start = clampToBusinessHours(start, 6, 22);
      setInputDateValue(startEl, start);
    }
  });
}

init();

Näytä vähemmän
server.js




JavaScript
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

  const room = rooms.find(r => r.id === roomId);
  if (!room) return res.status(400).json({ error: 'Virheellinen huone.' });

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

app.get('/api/health', (req, res) => {
  res.json({ ok: true, rooms: rooms.length, reservations: reservations.length });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

Näytä vähemmän
Vinkki testaukseen

Käynnistä: node server.js
Avaa: http://localhost:3000
Vaihda huonetta dropdownista: huonekartta korostaa saman huoneen ja varauslista päivittyy.
Aikakentät: valinnat pyöristyvät 5 min välein ja pysyvät välillä 06:00–22:00. Loppuaika pysyy aina vähintään +15 min aloituksesta.
Haluatko että lisään vielä varauslistaan näkyviin, jos slotit osuvat ulos 06–22 rajoista (visuaalinen varoitus), vai riittääkö tämä pehmeä rajaus?

saisinko vielä seuraavat muutokset: Oletusajaksi kuluva päivä ja sen hetkinen aika. Lisäksi virheilmoituksen mikäli yritetään tehdä varausta menneisyyteen. Eli varauksen alkuaika pitää olla vähintää sama kuin nykyhetki. Lisäksi saisinko alakulmaan noiden huonekartan huonevarauksen alapuolelle vielä kuvan jossa näyvät nuo kymmenen toimistohuonetta. Visualisoinnin saat keksiä itse, mutta lisää vaikka 5 vähän isompaa ja 5 vähän pienempää huonetta. Lisäksi kaksi vessaa pohjakarttaan. Kuvassa esimerkki. 
Copilot said:
Copilot

Päätelty 17 s

Ensuring accuracy

Balancing time constraints

Implementing updates

Updating key files
Mahtavaa – tein pyytämäsi muutokset.

Mitä korjasin/ lisäsin

Alasvetovalikon vaihto päivittää huonekartan valinnan ja varauslistan (kaksisuuntainen synkka).
Oletusajaksi asetetaan kuluvan päivän tämänhetkinen aika, pyöristettynä 5 min välein. Jos aika on ulkona 06–22 välillä, oletus asetetaan lähimpään sallittuun hetkeen (aikaväli edelleen 06–22).
Varausyritys menneisyyteen estetään jo selaimessa selkeällä virheilmoituksella.
Aikavalinnan UX: 5 min step, pehmeä rajaus 06–22, automaattiset korjaukset, loppu vähintään +15 min aloituksesta.
Uusi pohjakartta-visualisointi sivun alaosaan: 10 huonetta (5 isompaa, 5 pienempää) + 2 WC:tä, Nord-väreillä. Tämä on staattinen, nopeasti hahmotettava kuva (SVG), ei vaikuta varaustoimintoihin.
Alla päivitetyt tiedostot. Vaihda nämä sellaisenaan nykyisten tilalle.

index.html



HTML
<!doctype html>
<html lang="fi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kokoushuoneiden varaukset</title>

  <!-- Tyylit -->
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <header class="topbar">
    <h1>Kokoushuoneet</h1>
    <div class="subtitle">Nordic cool -varausnäkymä</div>
  </header>

  <main class="container">
    <!-- Huonekartta ja valinta -->
    <section class="panel">
      <h2>Huonekartta</h2>
      <div id="room-map" class="room-map" aria-label="Huonekartta"></div>
      <div id="selected-room" class="selected-room"></div>
    </section>

    <!-- Varauslomake ja varauslista -->
    <section class="panel">
      <h2>Varaus</h2>
      <form id="reservation-form" class="form">
        <div class="form-row">
          <label for="roomId">Huone</label>
          <select id="roomId" required></select>
        </div>

        <div class="form-row">
          <label for="title">Otsikko (valinnainen)</label>
          <input id="title" type="text" placeholder="Tiimin sprintti" />
        </div>

        <div class="form-row two-col">
          <div>
            <label for="start">Alkaa</label>
            <input id="start" type="datetime-local" required />
            <p class="hint">Varausaika: 06:00–22:00, 5 min välein.</p>
          </div>
          <div>
            <label for="end">Päättyy</label>
            <input id="end" type="datetime-local" required />
          </div>
        </div>

        <button type="submit" class="btn primary">Varaa</button>
        <div id="form-msg" class="form-msg" role="status" aria-live="polite"></div>
      </form>

      <h3>Varaukset valitulle huoneelle</h3>
      <ul id="reservations-list" class="reservations"></ul>
    </section>

    <!-- Pohjakartta-visualisointi -->
    <section class="panel panel-floorplan">
      <h2>Pohjakartta (visualisointi)</h2>
      <div class="floorplan-wrap">
        <!-- Yksinkertainen staattinen pohjakuva (SVG), 5 isoa + 5 pientä huonetta ja 2 WC:tä -->
        <svg class="floorplan-svg" viewBox="0 0 900 420" role="img" aria-label="Toimiston pohjakartta">
          <!-- tausta -->
          <rect x="0" y="0" width="900" height="420" fill="#2E3440" rx="16"/>

          <!-- isot huoneet (5 kpl) -->
          <g class="fp-room big">
            <rect x="20"  y="20"  width="260" height="120" rx="12"/>
            <text x="150" y="85">Tunturi</text>
          </g>
          <g class="fp-room big">
            <rect x="300" y="20"  width="260" height="120" rx="12"/>
            <text x="430" y="85">Järvi</text>
          </g>
          <g class="fp-room big">
            <rect x="580" y="20"  width="300" height="120" rx="12"/>
            <text x="730" y="85">Meri</text>
          </g>
          <g class="fp-room big">
            <rect x="20"  y="160" width="420" height="110" rx="12"/>
            <text x="230" y="225">Laakso</text>
          </g>
          <g class="fp-room big">
            <rect x="460" y="160" width="420" height="110" rx="12"/>
            <text x="670" y="225">Revontuli</text>
          </g>

          <!-- pienet huoneet (5 kpl) -->
          <g class="fp-room small">
            <rect x="20"  y="290" width="120" height="90" rx="10"/>
            <text x="80" y="340">Koivu</text>
          </g>
          <g class="fp-room small">
            <rect x="160" y="290" width="120" height="90" rx="10"/>
            <text x="220" y="340">Kuusi</text>
          </g>
          <g class="fp-room small">
            <rect x="300" y="290" width="120" height="90" rx="10"/>
            <text x="360" y="340">Mänty</text>
          </g>
          <g class="fp-room small">
            <rect x="440" y="290" width="120" height="90" rx="10"/>
            <text x="500" y="340">Kallio</text>
          </g>
          <g class="fp-room small">
            <rect x="580" y="290" width="120" height="90" rx="10"/>
            <text x="640" y="340">Suo</text>
          </g>

          <!-- WC:t (2 kpl) -->
          <g class="fp-wc">
            <rect x="720" y="290" width="70" height="90" rx="8"/>
            <text x="755" y="340">WC</text>
          </g>
          <g class="fp-wc">
            <rect x="810" y="290" width="70" height="90" rx="8"/>
            <text x="845" y="340">WC</text>
          </g>

          <!-- käytävä/aukio -->
          <rect x="20" y="140" width="860" height="10" fill="rgba(216,222,233,0.15)"/>
          <rect x="20" y="280" width="860" height="10" fill="rgba(216,222,233,0.15)"/>
        </svg>
      </div>
      <div class="floorplan-legend">
        <span class="lg lg-big"></span> Iso huone
        <span class="lg lg-small"></span> Pieni huone
        <span class="lg lg-wc"></span> WC
      </div>
    </section>
  </main>

  <footer class="footer">
    <span>Demo – muistinvarainen API</span>
  </footer>

  <!-- Frontend-skripti -->
  <script src="/app.js"></script>
</body>
</html>

Näytä vähemmän
styles.css



CSS
:root{
  /* Nord palette */
  --nord0: #2E3440; /* deep slate */
  --nord1: #3B4252;
  --nord2: #434C5E;
  --nord3: #4C566A;
  --nord4: #D8DEE9; /* light */
  --nord5: #E5E9F0;
  --nord6: #ECEFF4;
  --nord7: #8FBCBB; /* greenish accent */
  --nord8: #88C0D0; /* icy blue */
  --nord9: #81A1C1; /* blue */
  --nord10:#5E81AC; /* dark blue */

  --bg: var(--nord0);
  --panel: var(--nord1);
  --panel-2: var(--nord2);
  --text: var(--nord6);
  --muted: var(--nord4);
  --accent: var(--nord8);
  --accent-2: var(--nord10);
  --ok: #86d190;
  --err: #ff9191;
  --warn: #ffd37a;

  --room-big: rgba(136,192,208,0.35);   /* var(--nord8) */
  --room-small: rgba(129,161,193,0.35); /* var(--nord9) */
  --wc: rgba(143,188,187,0.50);         /* var(--nord7) */
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: linear-gradient(180deg, var(--bg), #222834);
  color: var(--text);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Noto Sans", "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji";
}

.topbar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  padding: 18px;
  background: linear-gradient(180deg, var(--panel), var(--panel-2));
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.topbar h1 { margin: 0; font-weight: 600; letter-spacing: 0.3px; }
.topbar .subtitle { color: var(--muted); font-size: 0.95rem; }

.container {
  max-width: 1100px;
  margin: 24px auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  padding: 0 16px;
}
@media (max-width: 900px) {
  .container { grid-template-columns: 1fr; }
}

.panel {
  background: rgba(76, 86, 106, 0.35);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  backdrop-filter: blur(2px);
}
.panel h2, .panel h3 { margin: 8px 0 12px; font-weight: 600; }

.room-map {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 8px;
}
.room-tile {
  background: linear-gradient(180deg, var(--panel), var(--panel-2));
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--text);
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
  text-align: center;
  user-select: none;
}
.room-tile:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.35);
  border-color: rgba(255,255,255,0.18);
}
.room-tile.active {
  outline: 2px solid var(--accent);
  box-shadow: 0 0 0 4px rgba(136,192,208,0.18);
}

.selected-room {
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.95rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}
.form-row { display: flex; flex-direction: column; gap: 6px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 600px) {
  .two-col { grid-template-columns: 1fr; }
}
label { color: var(--muted); font-size: 0.95rem; }
input, select {
  background: rgba(255,255,255,0.04);
  color: var(--text);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
}
input:focus, select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(136,192,208,0.16);
}

.btn {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  color: white;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: transform 100ms ease, box-shadow 120ms ease;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.35);
}
.btn.secondary {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: var(--text);
}

.form-msg { min-height: 20px; font-size: 0.95rem; }
.form-msg.ok { color: var(--ok); }
.form-msg.err { color: var(--err); }
.form-msg.warn { color: var(--warn); }

.reservations {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.res-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
}
.res-item .meta { color: var(--muted); font-size: 0.92rem; }
.res-item .title { font-weight: 600; }
.res-item button {
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.16);
  background: transparent;
  color: var(--text);
  cursor: pointer;
}
.res-item button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.footer {
  margin: 24px 0 32px;
  text-align: center;
  color: var(--muted);
  font-size: 0.92rem;
}

.hint { color: var(--muted); font-size: 0.9rem; margin: 6px 0 0; }

/* Pohjakartta */
.panel-floorplan .floorplan-wrap {
  margin-top: 6px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.floorplan-svg {
  width: 100%;
  height: auto;
  display: block;
}
.fp-room.big rect { fill: var(--room-big); stroke: rgba(255,255,255,0.18); stroke-width: 2; }
.fp-room.small rect { fill: var(--room-small); stroke: rgba(255,255,255,0.18); stroke-width: 2; }
.fp-wc rect { fill: var(--wc); stroke: rgba(255,255,255,0.18); stroke-width: 2; }

.floorplan-svg text {
  fill: var(--nord6);
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  font-size: 16px;
}

.floorplan-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.95rem;
}
.floorplan-legend .lg {
  width: 18px; height: 12px; border-radius: 4px; display: inline-block; margin-right: 6px;
  border: 1px solid rgba(255,255,255,0.15);
}
.lg-big { background: var(--room-big); }
.lg-small { background: var(--room-small); }
.lg-wc { background: var(--wc); }

Näytä vähemmän
app.js



JavaScript
const API = {
  rooms: () => fetch('/api/rooms').then(r => r.json()),
  roomReservations: (roomId) => fetch(`/api/rooms/${roomId}/reservations`).then(r => r.json()),
  createReservation: (payload) => fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(async r => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = data?.error || 'Virhe varauksessa.';
      const err = new Error(msg);
      err.data = data;
      err.status = r.status;
      throw err;
    }
    return data;
  }),
  deleteReservation: (id) => fetch(`/api/reservations/${id}`, { method: 'DELETE' })
    .then(async r => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = data?.error || 'Virhe poistaessa varausta.';
        const err = new Error(msg);
        err.data = data;
        err.status = r.status;
        throw err;
      }
      return data;
    }),
};

// DOM
const roomMapEl = document.getElementById('room-map');
const roomSelectEl = document.getElementById('roomId');
const selectedRoomEl = document.getElementById('selected-room');
const resListEl = document.getElementById('reservations-list');
const formEl = document.getElementById('reservation-form');
const msgEl = document.getElementById('form-msg');

let ROOMS = [];
let ACTIVE_ROOM = null;

// ---------- Aika-apurit ----------
function roundToStep(date, stepMinutes = 5) {
  const ms = stepMinutes * 60 * 1000;
  return new Date(Math.round(date.getTime() / ms) * ms);
}
function floorToStep(date, stepMinutes = 5) {
  const ms = stepMinutes * 60 * 1000;
  return new Date(Math.floor(date.getTime() / ms) * ms);
}
function clampToBusinessHours(date, minHour = 6, maxHour = 22) {
  const d = new Date(date);
  const clamped = new Date(d);

  const startOfDay = new Date(d);
  startOfDay.setHours(minHour, 0, 0, 0);

  const endOfDay = new Date(d);
  endOfDay.setHours(maxHour, 0, 0, 0);

  if (clamped < startOfDay) return startOfDay;
  if (clamped > endOfDay) return endOfDay;
  return clamped;
}
function inputValueToDate(value) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
function setInputDateValue(inputEl, date) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  inputEl.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

// ---------- Muut apurit ----------
function formatLocal(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}
function valueToISO(dtLocalValue) {
  const d = new Date(dtLocalValue);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}
function setMessage(text, type = '') {
  msgEl.textContent = text || '';
  msgEl.className = `form-msg ${type}`;
}

// ---------- UI renderöinti ----------
function renderRoomSelect() {
  roomSelectEl.innerHTML = '';
  ROOMS.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.name;
    roomSelectEl.appendChild(opt);
  });
  if (ACTIVE_ROOM) {
    roomSelectEl.value = ACTIVE_ROOM.id;
  }
}
function renderRoomMap() {
  roomMapEl.innerHTML = '';
  ROOMS.forEach(r => {
    const tile = document.createElement('div');
    tile.className = 'room-tile';
    tile.textContent = r.name;
    tile.dataset.roomId = r.id;
    if (ACTIVE_ROOM?.id === r.id) tile.classList.add('active');
    tile.addEventListener('click', () => {
      setActiveRoom(r.id);
    });
    roomMapEl.appendChild(tile);
  });
}
function highlightActiveTile() {
  Array.from(roomMapEl.querySelectorAll('.room-tile')).forEach(el => {
    if (el.dataset.roomId === ACTIVE_ROOM?.id) el.classList.add('active');
    else el.classList.remove('active');
  });
}
async function loadReservations(roomId) {
  if (!roomId) return;
  const list = await API.roomReservations(roomId);
  renderReservationList(list);
}
function renderReservationList(list) {
  resListEl.innerHTML = '';
  if (!list || list.length === 0) {
    const li = document.createElement('li');
    li.className = 'res-item';
    li.innerHTML = '<div class="meta">Ei varauksia.</div>';
    resListEl.appendChild(li);
    return;
  }

  list.forEach(item => {
    const li = document.createElement('li');
    li.className = 'res-item';

    const left = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = item.title || '(Ei otsikkoa)';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${formatLocal(item.startISO)} — ${formatLocal(item.endISO)}`;

    left.appendChild(title);
    left.appendChild(meta);

    const del = document.createElement('button');
    del.textContent = 'Peruuta';
    del.addEventListener('click', async () => {
      try {
        await API.deleteReservation(item.id);
        await loadReservations(ACTIVE_ROOM.id);
        setMessage('Varaus peruttu.', 'ok');
      } catch (e) {
        setMessage(e.message || 'Virhe perutessa.', 'err');
      }
    });

    li.appendChild(left);
    li.appendChild(del);
    resListEl.appendChild(li);
  });
}

// ---------- Huoneen valinta ----------
async function setActiveRoom(roomId) {
  ACTIVE_ROOM = ROOMS.find(r => r.id === roomId) || null;
  renderRoomSelect();
  highlightActiveTile();
  selectedRoomEl.textContent = ACTIVE_ROOM ? `Valittu huone: ${ACTIVE_ROOM.name}` : '';
  if (ACTIVE_ROOM) {
    await loadReservations(ACTIVE_ROOM.id);
  }
}

// ---------- Oletusajat ----------
function setDefaultDateTimes() {
  const startEl = document.getElementById('start');
  const endEl = document.getElementById('end');

  // Oletus: kuluvan päivän tämänhetkinen aika, pyöristetty 5 min välein
  const now = new Date();
  let start = roundToStep(now, 5);
  // Rajaa 06–22 väliin
  start = clampToBusinessHours(start, 6, 22);

  // Loppu +45 min
  let end = new Date(start.getTime() + 45 * 60 * 1000);
  end = clampToBusinessHours(end, 6, 22);

  // Jos end clampautui ennen starttia (esim. start myöhään illalla), nostetaan min +15 min
  if (end <= start) {
    end = new Date(start.getTime() + 15 * 60 * 1000);
    end = clampToBusinessHours(end, 6, 22);
  }

  setInputDateValue(startEl, start);
  setInputDateValue(endEl, end);
}

// ---------- Lomakkeen lähetys ----------
formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMessage('');

  const roomId = roomSelectEl.value;
  const title = document.getElementById('title').value;
  const startLocal = document.getElementById('start').value;
  const endLocal = document.getElementById('end').value;

  let startDate = inputValueToDate(startLocal);
  let endDate = inputValueToDate(endLocal);
  if (!startDate || !endDate) {
    setMessage('Tarkista päivämäärät.', 'err');
    return;
  }

  // Estä menneisyys (alku vähintään nyt). Pyöristetään alas 1 minuutin tarkkuuteen vertailua varten
  const now = new Date();
  const nowMin = floorToStep(now, 1); // 1 min tarkkuus vertailuun
  if (startDate < nowMin) {
    setMessage('Alkuaika ei voi olla menneisyydessä. Valitse vähintään nykyhetki.', 'err');
    return;
  }

  // Pehmeä rajaus 06–22 ja 5 min gridi
  startDate = roundToStep(clampToBusinessHours(startDate, 6, 22), 5);
  endDate = roundToStep(clampToBusinessHours(endDate, 6, 22), 5);
  if (endDate <= startDate) {
    endDate = new Date(startDate.getTime() + 15 * 60 * 1000);
    endDate = clampToBusinessHours(endDate, 6, 22);
  }

  // Päivitä input-arvot takaisin
  setInputDateValue(document.getElementById('start'), startDate);
  setInputDateValue(document.getElementById('end'), endDate);

  const startISO = valueToISO(document.getElementById('start').value);
  const endISO = valueToISO(document.getElementById('end').value);

  try {
    const created = await API.createReservation({ roomId, title, startISO, endISO });
    setMessage('Varaus luotu.', 'ok');
    if (ACTIVE_ROOM && ACTIVE_ROOM.id === roomId) {
      await loadReservations(roomId);
    } else {
      await setActiveRoom(roomId);
    }
  } catch (err) {
    const status = err.status;
    if (status === 409 && err?.data?.conflictWith) {
      const c = err.data.conflictWith;
      setMessage(
        `Päällekkäinen varaus: ${formatLocal(c.startISO)} — ${formatLocal(c.endISO)}`,
        'err'
      );
    } else {
      setMessage(err.message || 'Virhe varauksessa.', 'err');
    }
  }
});

// ---------- Init ----------
async function init() {
  // Step 5 min
  const startEl = document.getElementById('start');
  const endEl = document.getElementById('end');
  startEl.setAttribute('step', '300');
  endEl.setAttribute('step', '300');

  ROOMS = await API.rooms();
  renderRoomSelect();
  renderRoomMap();
  setDefaultDateTimes();

  if (ROOMS.length > 0) {
    await setActiveRoom(ROOMS[0].id);
  }

  // Dropdown -> kartta synkka
  roomSelectEl.addEventListener('change', async (e) => {
    const roomId = e.target.value;
    await setActiveRoom(roomId);
  });

  // Live-korjaukset aikakentissä (pyöristys, rajaus 06–22, ja loppu > alku)
  startEl.addEventListener('change', () => {
    let start = inputValueToDate(startEl.value);
    if (!start) return;

    // Estä menneisyys lennossa
    const now = new Date();
    if (start < now) start = now;

    start = roundToStep(start, 5);
    start = clampToBusinessHours(start, 6, 22);
    setInputDateValue(startEl, start);

    let end = inputValueToDate(endEl.value);
    if (!end || end <= start) {
      end = new Date(start.getTime() + 15 * 60 * 1000);
    }
    end = roundToStep(end, 5);
    end = clampToBusinessHours(end, 6, 22);
    if (end <= start) {
      end = new Date(start.getTime() + 15 * 60 * 1000);
      end = clampToBusinessHours(end, 6, 22);
    }
    setInputDateValue(endEl, end);
  });

  endEl.addEventListener('change', () => {
    let end = inputValueToDate(endEl.value);
    if (!end) return;
    end = roundToStep(end, 5);
    end = clampToBusinessHours(end, 6, 22);
    setInputDateValue(endEl, end);

    let start = inputValueToDate(startEl.value);
    if (!start) return;
    if (end <= start) {
      start = new Date(end.getTime() - 15 * 60 * 1000);
      start = clampToBusinessHours(start, 6, 22);
      setInputDateValue(startEl, start);
    }
  });
}
init();

Näytä vähemmän
Huomioita

server.js ei vaadi muutoksia; siellä on jo backend-tason estot menneisyyden varauksille. Nyt saat saman virheen näkyviin myös selaimessa ennen API-kutsua.
Pohjakartta on staattinen visualisointi. Jos haluat siitä interaktiivisen (esimerkiksi klikkaus valitsisi huoneen), se onnistuu lisäämällä svg:ssä kullekin huoneelle data-room-id ja kuuntelijat, ja kutsumalla setActiveRoom(roomId).
Haluatko seuraavaksi, että pohjakartan huoneet ovat klikattavia ja synkronoituja alasvetovalikkoon/karttaruudukkoon, tai että niissä näkyisi varattu/vapaa -tila värillä?








image.png
You said:
Saako pohjakartan vielä tähän huonevalinnan alapuolelle suoraan (ks.kuva) säästäisi tilaa: 
Copilot said:
Copilot

Päätelty 2 s

Updating HTML and CSS
Totta kai. Siirsin pohjakartan huonevalinnan alle samaan paneeliin (vasen palsta), kuten kuvassasi. Alla päivitetyt tiedostot kokonaisina. Muutokset:

Pohjakartan erillinen paneeli poistettu.
Sama SVG‑pohjakuva upotettu huonekartan alle elementtiin .inline-floorplan.
Lisätty kevyet tyylit, jotta kokonaisuus asettuu napakasti huonekartan alle ja mahtuu paneeliin.
app.js:ää ei tarvinnut muuttaa tähän siirtoon.
Kopioi nämä suoraan nykyisten tilalle.

index.html




HTML
<!doctype html>
<html lang="fi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kokoushuoneiden varaukset</title>

  <!-- Tyylit -->
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <header class="topbar">
    <h1>Kokoushuoneet</h1>
    <div class="subtitle">Nordic cool -varausnäkymä</div>
  </header>

  <main class="container">
    <!-- Vasen paneeli: huonekartta + pohjakartta heti sen alla -->
    <section class="panel">
      <h2>Huonekartta</h2>
      <div id="room-map" class="room-map" aria-label="Huonekartta"></div>
      <div id="selected-room" class="selected-room"></div>

      <!-- Pohjakartta siirretty tähän huonevalinnan alle -->
      <div class="inline-floorplan">
        <svg class="floorplan-svg" viewBox="0 0 900 420" role="img" aria-label="Toimiston pohjakartta">
          <!-- tausta -->
          <rect x="0" y="0" width="900" height="420" fill="#2E3440" rx="16"/>

          <!-- isot huoneet (5 kpl) -->
          <g class="fp-room big">
            <rect x="20"  y="20"  width="260" height="120" rx="1285">Tunturi</text>
          </g>
          <g class="fp-room big">
            <rect x="300" y="20"  width="260" height="120" rx="12"/>
            <text x="430" y="85">Järvi</text>
          </g>
          <g class="fp-room big">
            <rect x="580" y="20"  width="300" height="120" rx="12"/>
            <text x="730" y="85">Meri</text>
          </g>
          <g class="fp-room big">
            <rect x="20"  y="160" width="420" height="110" rx="12"/>
            <text x="230" y="225">Laakso</text>
          </g>
          <g class="fp-room big">
            <rect x="460" y="160" width="420" height="110" rx="12"/>
            <text x="670" y="225">Revontuli</text>
          </g>

          <!-- pienet huoneet (5 kpl) -->
          <g class="fp-room small">
            <rect x="20"  y="290" width="120" height="90" rx="10"/>
            <text x="80" y="340">Koivu</text>
          </g>
          <g class="fp-room small">
            <rect x="160" y="290" width="120" height="90" rx="10"/>
            <text x="220" y="340">Kuusi</text>
          </g>
          <g class="fp-room small">
            <rect x="300" y="290" width="120" height="90" rx="10"/>
            <text x="360" y="340">Mänty</text>
          </g>
          <g class="fp-room small">
            <rect x="440" y="290" width="120" height="90" rx="10"/>
            <text x="500" y="340">Kallio</text>
          </g>
          <g class="fp-room small">
            <rect x="580" y="290" width="120" height="90" rx="10"/>
            <text x="640" y="340">Suo</text>
          </g>

          <!-- WC:t (2 kpl) -->
          <g class="fp-wc">
            <rect x="720" y="290" width="70" height="90" rx="8"/>
            <text x="755" y="340">WC</text>
          </g>
          <g class="fp-wc">
            <rect x="810" y="290" width="70" height="90" rx="8"/>
            <text x="845" y="340">WC</text>
          </g>

          <!-- käytävä/aukio -->
          <rect x="20" y="140" width="860" height="10" fill="rgba(216,222,233,0.15)"/>
          <rect x="20" y="280" width="860" height="10" fill="rgba(216,222,233,0.15)"/>
        </svg>

        <div class="floorplan-legend inline">
          <span class="lg lg-big"></span> Iso huone
          <span class="lg lg-small"></span> Pieni huone
          <span class="lg lg-wc"></span> WC
        </div>
      </div>
    </section>

    <!-- Oikea paneeli: varauslomake + listaus -->
    <section class="panel">
      <h2>Varaus</h2>
      <form id="reservation-form" class="form">
        <div class="form-row">
          <label for="roomId">Huone</label>
          <select id="roomId" required></select>
        </div>

        <div class="form-row">
          <label for="title">Otsikko (valinnainen)</label>
          <input id="title" type="text" placeholder="Tiimin sprintti" />
        </div>

        <div class="form-row two-col">
          <div>
            <label for="start">Alkaa</label>
            <input id="start" type="datetime-local" required />
            <p class="hint">Varausaika: 06:00–22:00, 5 min välein.</p>
          </div>
          <div>
            <label for="end">Päättyy</label>
            <input id="end" type="datetime-local" required />
          </div>
        </div>

        <button type="submit" class="btn primary">Varaa</button>
        <div id="form-msg" class="form-msg" role="status" aria-live="polite"></div>
      </form>

      <h3>Varaukset valitulle huoneelle</h3>
      <ul id="reservations-list" class="reservations"></ul>
    </section>
  </main>

  <footer class="footer">
    <span>Demo – muistinvarainen API</span>
  </footer>

  <!-- Frontend-skripti -->
  /app.js</script>
</body>
</html>

Näytä vähemmän
styles.css




CSS
:root{
  /* Nord palette */
  --nord0: #2E3440; /* deep slate */
  --nord1: #3B4252;
  --nord2: #434C5E;
  --nord3: #4C566A;
  --nord4: #D8DEE9; /* light */
  --nord5: #E5E9F0;
  --nord6: #ECEFF4;
  --nord7: #8FBCBB; /* greenish accent */
  --nord8: #88C0D0; /* icy blue */
  --nord9: #81A1C1; /* blue */
  --nord10:#5E81AC; /* dark blue */

  --bg: var(--nord0);
  --panel: var(--nord1);
  --panel-2: var(--nord2);
  --text: var(--nord6);
  --muted: var(--nord4);
  --accent: var(--nord8);
  --accent-2: var(--nord10);
  --ok: #86d190;
  --err: #ff9191;
  --warn: #ffd37a;

  --room-big: rgba(136,192,208,0.35);
  --room-small: rgba(129,161,193,0.35);
  --wc: rgba(143,188,187,0.50);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: linear-gradient(180deg, var(--bg), #222834);
  color: var(--text);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Noto Sans", "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji";
}

.topbar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  padding: 18px;
  background: linear-gradient(180deg, var(--panel), var(--panel-2));
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.topbar h1 { margin: 0; font-weight: 600; letter-spacing: 0.3px; }
.topbar .subtitle { color: var(--muted); font-size: 0.95rem; }

.container {
  max-width: 1100px;
  margin: 24px auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  padding: 0 16px;
}
@media (max-width: 900px) {
  .container { grid-template-columns: 1fr; }
}

.panel {
  background: rgba(76, 86, 106, 0.35);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  backdrop-filter: blur(2px);
}
.panel h2, .panel h3 { margin: 8px 0 12px; font-weight: 600; }

/* Huonekartan ruudukko */
.room-map {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 8px;
}
.room-tile {
  background: linear-gradient(180deg, var(--panel), var(--panel-2));
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--text);
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
  text-align: center;
  user-select: none;
}
.room-tile:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.35);
  border-color: rgba(255,255,255,0.18);
}
.room-tile.active {
  outline: 2px solid var(--accent);
  box-shadow: 0 0 0 4px rgba(136,192,208,0.18);
}

.selected-room {
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.95rem;
}

/* Inline-pohjakartta huonekartan alla */
.inline-floorplan {
  margin-top: 12px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  /* tee alueesta kompakti mutta luettava */
  max-height: 280px;          /* voit säätää */
}
.inline-floorplan .floorplan-svg {
  width: 100%;
  height: auto;
  display: block;
}
.floorplan-svg text {
  fill: var(--nord6);
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  font-size: 16px;
}
.fp-room.big rect { fill: var(--room-big); stroke: rgba(255,255,255,0.18); stroke-width: 2; }
.fp-room.small rect { fill: var(--room-small); stroke: rgba(255,255,255,0.18); stroke-width: 2; }
.fp-wc rect { fill: var(--wc); stroke: rgba(255,255,255,0.18); stroke-width: 2; }

.floorplan-legend.inline {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 10px;
  color: var(--muted);
  font-size: 0.95rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(0,0,0,0.06);
}
.floorplan-legend .lg {
  width: 18px; height: 12px; border-radius: 4px; display: inline-block; margin-right: 6px;
  border: 1px solid rgba(255,255,255,0.15);
}
.lg-big { background: var(--room-big); }
.lg-small { background: var(--room-small); }
.lg-wc { background: var(--wc); }

/* Lomake ja lista */
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}
.form-row { display: flex; flex-direction: column; gap: 6px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 600px) {
  .two-col { grid-template-columns: 1fr; }
}
label { color: var(--muted); font-size: 0.95rem; }
input, select {
  background: rgba(255,255,255,0.04);
  color: var(--text);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
}
input:focus, select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(136,192,208,0.16);
}

.btn {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  color: white;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: transform 100ms ease, box-shadow 120ms ease;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.35);
}
.btn.secondary {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: var(--text);
}

.form-msg { min-height: 20px; font-size: 0.95rem; }
.form-msg.ok { color: var(--ok); }
.form-msg.err { color: var(--err); }
.form-msg.warn { color: var(--warn); }

.reservations {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.res-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
}
.res-item .meta { color: var(--muted); font-size: 0.92rem; }
.res-item .title { font-weight: 600; }
.res-item button {
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.16);
  background: transparent;
  color: var(--text);
  cursor: pointer;
}
.res-item button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.footer {
  margin: 24px 0 32px;
  text-align: center;
  color: var(--muted);
  font-size: 0.92rem;
}

.hint { color: var(--muted); font-size: 0.9rem; margin: 6px 0 0; }

Näytä vähemmän
app.js
(ei muutoksia suhteessa edelliseen versioon, jossa oli 5 min step, 06–22 rajaus, menneisyyden esto ja dropdown↔kartta‑synkka; jos haluat, voin postata sen uudelleen tähän kokonaisena.)

Haluatko, että teen pohjakartasta myös klikattavan, jotta huoneen voi valita SVG:stä ja se korostuu sekä ruudukossa että dropdownissa? Se vie vain muutaman rivin lisää (data‑attribuutit ja event‑kuuntelijat).