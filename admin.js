const { createClient } = supabase;

const SUPABASE_URL = 'https://bzgrvzaswfcqoyzindnr.supabase.co';
const SUPABASE_KEY = 'sb_publishable__PvJTawE7Ql_6ZMLmqSgFw_f2rtCVHe';

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// === добавление номинации ===
async function addNomination() {
  const desc = document.getElementById('desc').value.trim();
  if (!desc) return alert('Введите описание');

  const { error } = await db.from('nominations').insert({
    description: desc,
    active: true
  });

  if (error) {
    alert('Ошибка: ' + error.message);
    return;
  }

  document.getElementById('desc').value = '';
  loadAdmin();
}

// === загрузка админки ===
async function loadAdmin() {
  const { data: noms, error } = await db
    .from('nominations')
    .select('*')
    .order('id');

  if (error) {
    alert('Ошибка загрузки: ' + error.message);
    return;
  }

  const wrap = document.getElementById('adminNoms');
  wrap.innerHTML = '';

  noms.forEach(nom => {
    const div = document.createElement('div');
    div.className = 'admin';

    div.innerHTML = `
      <h3>${nom.description}</h3>
      <div>ID: ${nom.id}</div>
    `;

    wrap.appendChild(div);
  });
}

// === кнопка ===
document.getElementById('addNomBtn').onclick = addNomination;

// === старт ===
loadAdmin();
