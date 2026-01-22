import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://bzgrvzaswfcqoyzindnr.supabase.co";
const supabaseKey = "sb_publishable__PvJTawE7Ql_6ZMLmqSgFw_f2rtCVHe";

const client = supabase.createClient(supabaseUrl, supabaseKey);

let nominations = [];
let currentNom = 0;

// ===== Загрузка номинаций =====
async function loadNominations() {
  const { data, error } = await client
    .from('nominations')
    .select('*')
    .eq('active', true)
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  nominations = data;
  if (nominations.length === 0) {
    document.getElementById('nominationContainer').innerHTML =
      `<p>Номинации скоро появятся...</p>`;
    return;
  }

  loadCurrentNomination();
}

// ===== Загрузка одной номинации =====
async function loadCurrentNomination() {
  const nom = nominations[currentNom];

  document.getElementById('progress').innerText =
    `Номинация ${currentNom + 1} из ${nominations.length}`;

  const container = document.getElementById('nominationContainer');

  container.innerHTML = `
    <h2>${nom.description}</h2>
    <input id="nickname" placeholder="@nickname" style="width:100%;margin-top:12px">
    <button id="sendBtn">Отправить</button>
  `;

  document.getElementById('sendBtn').onclick = () => submitNomination(nom.id);
}

// ===== Отправка никнейма =====
async function submitNomination(nominationId) {
  const input = document.getElementById('nickname');
  const nickname = input.value.trim();

  if (!nickname || !nickname.startsWith('@')) {
    alert('Введите ник в формате @username');
    return;
  }

  const tgId =
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id ||
    'web_' + navigator.userAgent;

  const { error } = await client
  .from('mentions')
  .insert({
    nomination_id: nomId,
    nickname,
    tg_id: userId
  });

if (error) {
  if (error.code === '23505') {
    alert('Ты уже отправлял вариант для этой номинации 👀');
  } else {
    alert('Ошибка отправки 😢');
    console.error(error);
  }
  return;
}

  if (error) {
    alert('Ошибка отправки');
    console.error(error);
    return;
  }

  currentNom++;

  if (currentNom >= nominations.length) {
    document.getElementById('nominationContainer').innerHTML =
      `<h2>Спасибо 💚</h2>`;
    document.getElementById('progress').innerText = '';
  } else {
    loadCurrentNomination();
  }
}

loadNominations();
