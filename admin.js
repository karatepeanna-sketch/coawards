// --- Supabase client ---
const supabaseUrl = 'https://bzgrvzaswfcqoyzindnr.supabase.co';
const supabaseKey = 'sb_publishable__PvJTawE7Ql_6ZMLmqSgFw_f2rtCVHe';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- Глобальные функции ---
async function addNomination() {
  const desc = document.getElementById('desc').value.trim();
  if (!desc) return alert('Введите описание номинации');

  const { error } = await supabase.from('nominations').insert({
    description: desc,
    active: true,
    created: new Date().toISOString()
  });

  if (error) return alert('Ошибка добавления: ' + error.message);

  document.getElementById('desc').value = '';
  loadAdmin();
}

async function loadAdmin() {
  const { data: noms, error: nomErr } = await supabase.from('nominations').select('*');
  const { data: mentions, error: menErr } = await supabase.from('mentions').select('*');

  if (nomErr || menErr) return console.error(nomErr || menErr);

  const wrap = document.getElementById('adminNoms');
  wrap.innerHTML = '';

  noms.forEach(nom => {
    const related = mentions.filter(m => m.nomination_id === nom.id);

    const count = {};
    related.forEach(r => {
      count[r.nickname] = (count[r.nickname] || 0) + 1;
    });

    const sorted = Object.entries(count).sort((a,b)=>b[1]-a[1]);

    const div = document.createElement('div');
    div.className = 'admin';
    div.innerHTML = `
      <h3>${nom.description} ${nom.active ? '' : '(неактивна)'}</h3>
      ${sorted.map(s => `<div>${s[0]} — ${s[1]}</div>`).join('')}
      <button onclick="toggleNom(${nom.id}, ${nom.active})">
        ${nom.active ? 'Выключить' : 'Включить'}
      </button>
    `;
    wrap.appendChild(div);
  });
}

async function toggleNom(id, active) {
  const { error } = await supabase.from('nominations')
    .update({ active: !active })
    .eq('id', id);

  if (error) return alert('Ошибка: ' + error.message);
  loadAdmin();
}

// --- инициализация ---
document.addEventListener('DOMContentLoaded', () => {
  loadAdmin();

  document.getElementById('addNomBtn').onclick = addNomination;
});
