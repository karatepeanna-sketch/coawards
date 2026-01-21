const STORAGE_KEY = 'connectedDB';
let currentIndex = 0;

function loadDB() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"nominations":[]}');
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function renderNomination() {
  const db = loadDB();
  const active = db.nominations.filter(n => n.active);

  if (currentIndex >= active.length) {
    document.getElementById('nominationContainer').innerHTML =
      '<h2>Спасибо! 💾</h2>';
    document.getElementById('progress').innerText = '';
    return;
  }

  const nom = active[currentIndex];

  document.getElementById('nominationContainer').innerHTML = `
    <p>${nom.description}</p>
    <input id="nickname" placeholder="@nickname">
    <button onclick="submitNick(${nom.id})">Отправить</button>
  `;

  document.getElementById('progress').innerText =
    `Номинация ${currentIndex + 1} из ${active.length}`;
}

function submitNick(id) {
  const input = document.getElementById('nickname');
  const value = input.value.trim();

  if (!value.startsWith('@')) {
    alert('Ник должен начинаться с @');
    return;
  }

  const db = loadDB();
  const nom = db.nominations.find(n => n.id === id);
  nom.mentions.push(value.toLowerCase());

  saveDB(db);
  currentIndex++;
  renderNomination();
}

renderNomination();
