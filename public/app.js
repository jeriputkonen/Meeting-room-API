
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
