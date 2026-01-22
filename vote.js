import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://bzgrvzaswfcqoyzindnr.supabase.co";
const supabaseKey = "sb_publishable__PvJTawE7Ql_6ZMLmqSgFw_f2rtCVHe";
const client = createClient(supabaseUrl, supabaseKey);

let nominations = [];
let currentNom = 0;

const splash = document.getElementById('splash');
const welcome = document.getElementById('welcome');
const main = document.getElementById('main');
const card = document.getElementById('card');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// ===== Экраны =====

function show(screen) {
  [splash, welcome, main].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// ===== Загрузка =====

setTimeout(() => {
  show(welcome);
}, 1200);

document.getElementById('startBtn').onclick = () => {
  show(main);
  loadNominations();
};

// ===== Номинации =====

async function loadNominations() {
  const { data, error } = await client
    .from('nominations')
    .select('*')
    .eq('active', true)
    .order('id');

  if (error || !data.length) {
    card.innerHTML = `<h2>Скоро здесь появятся номинации 💫</h2>`;
    return;
  }

  nominations = data;
  loadCard();
}

function loadCard() {
  const nom = nominations[currentNom];

  progressText.innerText = `Номинация ${currentNom + 1} из ${nominations.length}`;
  progressFill.style.width = ((currentNom + 1) / nominations.length * 100) + '%';

  card.innerHTML = `
    <h2>${nom.description}</h2>
    <input id="nickname" placeholder="@username">
    <button id="sendBtn">Отправить</button>
  `;

  document.getElementById('sendBtn').onclick = () =>
    submitNomination(nom.id);
}

// ===== Отправка =====

async function submitNomination(nominationId) {
  const nickname = document.getElementById('nickname').value.trim();

  if (!nickname || !nickname.startsWith('@')) {
    alert('Введите ник в формате @username');
    return;
  }

  const tgId =
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id ||
    'web_' + navigator.userAgent;

  const { error } = await client.from('mentions').insert({
    nomination_id: nominationId,
    nickname,
    tg_id: tgId
  });

  if (error) {
    if (error.code === '23505') {
      alert('Ты уже отправлял вариант 👀');
    } else {
      alert('Ошибка отправки 😢');
      console.error(error);
    }
    return;
  }

  currentNom++;

  if (currentNom >= nominations.length) {
    card.innerHTML = `<h1>Спасибо 💚</h1><p>Голос учтён</p>`;
    progressText.innerText = '';
    progressFill.style.width = '100%';
  } else {
    loadCard();
  }
}

