// ====== Инициализация Supabase ======
const client = supabase.createClient(
  'https://bzgrvzaswfcqoyzindnr.supabase.co',
  'sb_publishable__PvJTawE7Ql_6ZMLmqSgFw_f2rtCVHe'
);

// ====== Добавление номинации ======
async function addNomination() {
  const desc = document.getElementById('desc').value.trim();
  if (!desc) return alert('Введите описание');

  const { error } = await client.from('nominations').insert({
    description: desc,
    active: true
  });

  if (error) {
    alert(error.message);
    console.error(error);
    return;
  }

  document.getElementById('desc').value = '';
  loadAdmin();
}

document.getElementById('addNomBtn').onclick = addNomination;

// ====== Загрузка админки ======
async function loadAdmin() {
  const { data: noms, error: nomErr } = await client
    .from('nominations')
    .select('*')
    .order('id', { ascending: true });

  const { data: mentions, error: menErr } = await client
    .from('mentions')
    .select('*');

  if (nomErr || menErr) {
    console.error(nomErr || menErr);
    return;
  }

  const wrap = document.getElementById('adminNoms');
  wrap.innerHTML = '';

  noms.forEach(nom => {
    const related = mentions.filter(
      m => Number(m.nomination_id) === Number(nom.id)
    );

    const counter = {};
    related.forEach(r => {
      counter[r.nickname] = (counter[r.nickname] || 0) + 1;
    });

    const sorted = Object.entries(counter).sort((a, b) => b[1] - a[1]);

    const div = document.createElement('div');
    div.className = 'admin-nomination';

    div.innerHTML = `
      <input value="${nom.description}" id="edit-${nom.id}" style="width:60%">
      <button onclick="updateNom(${nom.id})">💾</button>
      <button onclick="deleteNom(${nom.id})">🗑</button>

      ${sorted.length === 0 ? '<p>Пока нет упоминаний</p>' : ''}
      ${sorted.map(s => `<div>${s[0]} — ${s[1]}</div>`).join('')}
    `;

    wrap.appendChild(div);
  });
}

// ====== Удаление номинации ======
async function deleteNom(id) {
  if (!confirm('Удалить номинацию и все упоминания?')) return;

  await client.from('mentions').delete().eq('nomination_id', id);
  await client.from('nominations').delete().eq('id', id);

  loadAdmin();
}

// ====== Редактирование номинации ======
async function updateNom(id) {
  const value = document.getElementById(`edit-${id}`).value.trim();
  if (!value) return;

  const { error } = await client
    .from('nominations')
    .update({ description: value })
    .eq('id', id);

  if (error) {
    alert(error.message);
    return;
  }

  loadAdmin();
}

// ====== Старт админки ======
loadAdmin();
