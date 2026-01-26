import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://bzgrvzaswfcqoyzindnr.supabase.co";
const supabaseKey = "sb_publishable__PvJTawE7Ql_6ZMLmqSgFw_f2rtCVHe";
const supabase = createClient(supabaseUrl, supabaseKey);

let nominations = [];
let currentNom = 0;
let votedIds = [];

const tgId =
  window.Telegram?.WebApp?.initDataUnsafe?.user?.id ||
  'web_' + navigator.userAgent;

// Boot screen
setTimeout(async () => {
  document.getElementById('bootScreen').style.display = 'none';
  document.getElementById('voting').style.display = 'block';

  await loadNominations();
  await loadVoted();
  skipVoted();
  loadCurrentNom();
}, 2200);

// ===== Загрузка номинаций =====
async function loadNominations() {
  const { data, error } = await supabase
    .from('nominations')
    .select('*')
    .eq('active', true)
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  nominations = data;
}

// ===== Получаем уже проголосованные =====
async function loadVoted() {
  const { data, error } = await supabase
    .from('mentions')
    .select('nomination_id')
    .eq('tg_id', tgId);

  if (error) {
    console.error(error);
    return;
  }

  votedIds = data.map(v => Number(v.nomination_id));
}

// ===== Пропуск уже проголосованных =====
function skipVoted() {
  while (
    currentNom < nominations.length &&
    votedIds.includes(Number(nominations[currentNom].id))
  ) {
    currentNom++;
  }
}

// ===== Загрузка текущей =====
function loadCurrentNom() {
  if (currentNom >= nominations.length) {
    document.getElementById('nominationContainer').innerHTML = `
      <div class="nom-main-title">THANK YOU</div>
      <div class="nom-title">
        7.02 YAUZA PLACE // сбор с 18:30 до 19:00<br>
        узнай, кого выбрало комьюнити
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

  document.getElementById('sendBtn').onclick = () =>
    submitNom(nom.id);

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

  const { error } = await supabase
    .from('mentions')
    .insert({
      nomination_id: nomId,
      nickname,
      tg_id: tgId
    });

  if (error) {
    if (error.code === '23505') {
      alert('Ты уже голосовал за эту номинацию 👀');
    } else {
      console.error(error);
      alert('Ошибка отправки 😢');
    }
    return;
  }

  votedIds.push(Number(nomId));
  currentNom++;

  skipVoted();
  loadCurrentNom();
}
