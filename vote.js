const STORAGE_KEY = 'connectedDB';
const COMPLETED_KEY = 'connectedCompleted';

function getUserId() {
  if (window.Telegram && Telegram.WebApp) {
    return Telegram.WebApp.initDataUnsafe?.user?.id?.toString();
  }
  return 'local_' + navigator.userAgent;
}

function loadDB() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { nominations: [] };
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

const userId = getUserId();
let currentIndex = 0;

function renderNomination() {
  const db = loadDB();
  const completed = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
  const active = db.nominations.filter(n => n.active);

  if (completed.includes(userId)) {
    document.getElementById('nominationContainer').innerHTML =
      '<h2>Ты уже участвовал ✨</h2>';
    document.getElementById('progress').innerText = '';
    return;
  }

  if (currentIndex >= active.length) {
    completed.push(userId);
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
    document.getElementById('nominationContainer').innerHTML =
      '<h2>Спасибо за участие 💾</h2>';
    document.getElementById('progress').innerText = '';
    return;
  }

  const nom = active[currentIndex];

  document.getElementById('nominationContainer').innerHTML = `
    <p>${nom.description || ''}</p>
    <input id="nickname" placeholder="@nickname">
    <button onclick="submitNick(${nom.id})">Отправить</button>
  `;

  document.getElementById('progress').innerText =
    `Номинация ${currentIndex + 1} из ${active.length}`;
}

function submitNick(nomId) {
  const input = document.getElementById('nickname');
  const value = input.value.trim().toLowerCase();

  if (!/^@[a-z0-9_]{3,}$/.test(value)) {
    alert('Введите корректный @nickname');
    return;
  }

  const db = loadDB();
  const nom = db.nominations.find(n => n.id === nomId);

  if (!nom.mentions) nom.mentions = [];
  nom.mentions.push(value);

  saveDB(db);
  currentIndex++;
  renderNomination();
}

renderNomination();
