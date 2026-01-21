let nominations = [];
let currentIndex = 0;

function getTelegramId() {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return Telegram.WebApp.initDataUnsafe.user.id.toString();
  }
  return 'guest_' + navigator.userAgent;
}

async function loadNominations() {
  const { data } = await supabase
    .from('nominations')
    .select('*')
    .eq('active', true)
    .order('created_at');

  nominations = data || [];
  renderNomination();
}

function renderNomination() {
  const container = document.getElementById('nominationContainer');
  const progress = document.getElementById('progress');

  if (currentIndex >= nominations.length) {
    container.innerHTML = `<h2>Спасибо 💚</h2>`;
    progress.innerText = '';
    return;
  }

  const nom = nominations[currentIndex];

  container.innerHTML = `
    <h2>Номинация ${currentIndex + 1}</h2>
    <p>${nom.description}</p>

    <input id="nickname" placeholder="@username">
    <button onclick="submitMention()">Отправить</button>
  `;

  progress.innerText = `${currentIndex + 1} / ${nominations.length}`;
}

async function submitMention() {
  const nick = document.getElementById('nickname').value.trim();
  if (!nick.startsWith('@')) {
    alert('Ник должен начинаться с @');
    return;
  }

  const telegramId = getTelegramId();

  // защита от повторной отправки
  const { data: exists } = await supabase
    .from('mentions')
    .select('id')
    .eq('nomination_id', nominations[currentIndex].id)
    .eq('telegram_id', telegramId);

  if (exists.length > 0) {
    alert('Ты уже отправляла ответ в этой номинации');
    return;
  }

  await supabase.from('mentions').insert({
    nomination_id: nominations[currentIndex].id,
    nickname: nick,
    telegram_id: telegramId
  });

  currentIndex++;
  renderNomination();
}

loadNominations();
