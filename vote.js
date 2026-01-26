import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://bzgrvzaswfcqoyzindnr.supabase.co";
const supabaseKey = "sb_publishable__PvJTawE7Ql_6ZMLmqSgFw_f2rtCVHe";
const supabase = createClient(supabaseUrl, supabaseKey);

// ===== Получаем уникальный ID пользователя =====
function getUserId() {
  const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  if (tgId) return 'tg_' + tgId;

  let localId = localStorage.getItem('local_uid');
  if (!localId) {
    localId = 'web_' + crypto.randomUUID();
    localStorage.setItem('local_uid', localId);
  }
  return localId;
}

const tgId = getUserId();

let nominations = [];
let votedIds = [];
let currentNom = 0;

// ===== Boot screen =====
setTimeout(async () => {
  document.getElementById('bootScreen').style.display = 'none';
  document.getElementById('voting').style.display = 'block';

  await loadData();
  detectProgress();
  loadCurrentNom();
}, 2200);

// ===== Грузим всё сразу =====
async function loadData() {
  const { data: noms, error: nomErr } = await supabase
    .from('nominations')
    .select('*')
    .eq('active', true)
    .order('id', { ascending: true });

  if (nomErr) {
    console.error('Ошибка nominations', nomErr);
    return;
  }

  const { data: voted, error: voteErr } = await supabase
    .from('mentions')
    .select('nomination_id')
    .eq('tg_id', tgId);

  if (voteErr) {
    console.error('Ошибка mentions', voteErr);
    return;
  }

  nominations = noms;
  votedIds = voted.map(v => v.nomination_id);
}

// ===== Определяем, где человек остановился =====
function detectProgress() {
  currentNom = 0;

  while (
    currentNom < nominations.length &&
    votedIds.includes(nominations[currentNom].id)
  ) {
    currentNom++;
  }
}

// ===== Отображаем текущую =====
function loadCurrentNom() {
  if (!nominations.length) {
    document.getElementById('nominationContainer').innerHTML =
      '<p>Номинации скоро появятся...</p>';
    return;
  }

  if (currentNom >= nominations.length) {
    document.getElementById('nominationContainer').innerHTML = `
      <div class="nom-main-title">THANK YOU</div>
      <div class="nom-title">
        7.02 YAUZA PLACE // сбор с 18:30 до 19:00
      </div>
    `;
    document.getElementById('progressFill').style.width = '100%';
    return;
  }

  const nom = nominations[currentNom];

  document.getElementById('nominationContainer').innerHTML = `
    <div class="nom-main-title">${nom.title}</div>
    <div class="nom-title">${nom.description}</div>

    <input id="nickname" value="@" placeholder="@nickname">
    <button id="sendBtn">Отправить</button>
  `;

  document.getElementById('sendBtn').onclick = () => submitNom(nom.id);
  updateProgress();
}

// ===== Прогресс =====
function updateProgress() {
  const percent = (currentNom / nominations.length) * 100;
  document.getElementById('progressFill').style.width = percent + '%';
}

// ===== Отправка =====
async function submitNom(nomId) {
  const nickname = document.getElementById('nickname').value.trim();

  if (!nickname.startsWith('@')) {
    alert('Введите ник в формате @username');
    return;
  }

  const { error } = await supabase.from('mentions').insert({
    nomination_id: nomId,
    nickname,
    tg_id: tgId
  });

  if (error) {
    if (error.code === '23505') {
      alert('Ты уже голосовал 👀');
    } else {
      console.error(error);
      alert('Ошибка отправки 😢');
    }
    return;
  }

  votedIds.push(nomId);
  currentNom++;

  detectProgress();
  loadCurrentNom();
}


