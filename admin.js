const STORAGE_KEY = 'connectedDB';

function loadDB() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"nominations":[]}');
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function renderAdmin() {
  const db = loadDB();
  const wrap = document.getElementById('adminNoms');
  wrap.innerHTML = '';

  // добавление номинации
  const add = document.createElement('div');
  add.className = 'admin';
  add.innerHTML = `
    <textarea id="newDesc" placeholder="Описание номинации"></textarea>
    <button id="addNom">Добавить номинацию</button>
  `;
  wrap.appendChild(add);

  document.getElementById('addNom').onclick = () => {
    const desc = document.getElementById('newDesc').value.trim();
    if (!desc) return alert('Введите описание');

    db.nominations.push({
      id: Date.now(),
      description: desc,
      active: true,
      mentions: []
    });

    saveDB(db);
    renderAdmin();
  };

  // существующие номинации
  db.nominations.forEach(nom => {
    const div = document.createElement('div');
    div.className = 'admin';

    const stats = {};
    nom.mentions.forEach(m => stats[m] = (stats[m] || 0) + 1);

    div.innerHTML = `
      <textarea onchange="updateDesc(${nom.id}, this.value)">${nom.description}</textarea>
      <button onclick="toggleNom(${nom.id})">${nom.active ? 'Выключить' : 'Включить'}</button>
      <h4>Упоминания:</h4>
      ${Object.keys(stats).length === 0 ? '<p>Нет данных</p>' :
        Object.entries(stats).map(
          ([name, count]) => `<div>${name} — ${count}</div>`
        ).join('')
      }
    `;

    wrap.appendChild(div);
  });
}

function updateDesc(id, value) {
  const db = loadDB();
  const nom = db.nominations.find(n => n.id === id);
  nom.description = value;
  saveDB(db);
}

function toggleNom(id) {
  const db = loadDB();
  const nom = db.nominations.find(n => n.id === id);
  nom.active = !nom.active;
  saveDB(db);
  renderAdmin();
}

renderAdmin();
