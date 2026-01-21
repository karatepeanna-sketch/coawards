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
    .eq('active', true);

  nominations = data;
  renderNomination();
}

function renderNomination() {
  const nom = nominations[currentIndex];
  if (!nom) {
    document.getElementById('nominationContainer').innerHTML =
      '<h2>Спасибо! 🎉</h2>';
    return;
  }

  document.getElementById('nominationContainer').innerHTML = `
    <h2>Номинация ${currentIndex + 1}</h2>
    <p>${nom.description}</p>
    <input id="nick" placeholder="@username">
    <button onclick="submitMention()">Отправить</button>
  `;

  document.getElementById('progress').innerText =
    `${currentIndex + 1} / ${nominations.length}`;
}

async function submitMention() {
  const nick = document.getElementById('nick').value.trim();
  if (!nick.startsWith('@')) {
    alert('Ник должен начинаться с @');
    return;
  }

  await supabase.from('mentions').insert({
    nomination_id: nominations[currentIndex].id,
    nickname: nick,
    telegram_id: getTelegramId()
  });

  currentIndex++;
  renderNomination();
}

loadNominations();
