const STORAGE_KEY = 'connectedDB';

function loadDB() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { nominations: [] };
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function addNom() {
  const input = document.getElementById('newDesc');
  const text = input.value.trim();
  if (!text) return;

  const db = loadDB();
  db.nominations.push({
    id: Date.now(),
    description: text,
    active: true,
    mentions: []
  });

  saveDB(db);
  input.value = '';
  renderAdmin();
}

function renderAdmin() {
  const db = loadDB();
  const wrap = document.getElementById('adminNoms');
  wrap.innerHTML = '';

  db.nominations.forEach(n => {
    const counts = {};
    (n.mentions || []).forEach(m => counts[m] = (counts[m] || 0) + 1);

    const list = Object.entries(counts)
      .sort((a,b)=>b[1]-a[1])
      .map(([name,c])=>`${name} — ${c}`)
      .join('<br>') || 'Нет упоминаний';

    wrap.innerHTML += `
      <div class="admin">
        <p>${n.description}</p>
        <button onclick="toggle(${n.id})">${n.active ? 'Выключить' : 'Включить'}</button>
        <div>${list}</div>
      </div>
    `;
  });
}

function toggle(id) {
  const db = loadDB();
  const n = db.nominations.find(x => x.id === id);
  n.active = !n.active;
  saveDB(db);
  renderAdmin();
}

renderAdmin();
