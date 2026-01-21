// --- Supabase client ---
const supabaseUrl = 'https://bzgrvzaswfcqoyzindnr.supabase.co';
const supabaseKey = 'sb_publishable__PvJTawE7Ql_6ZMLmqSgFw_f2rtCVHe';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- Глобальные функции ---
window.addNomination = async function() {
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

window.loadAdmin = async function() {
  const { data: noms, error: nomErr } = await supabase.from('nominations').select('*');
  const { data: mentions, error: menErr } = await supabase.from('mentions').select('*');

  if (nomErr || menErr) return console.error(nomErr || menErr);

  const wrap = document.getElementById('adminNoms');
  wrap.innerHTML = '';

  noms.forEach(nom => {
    const related = mentions.filter(m => m.nomination_id === nom.id);

    // Считаем упоминания
    const count = {};
    related.forEach(r => {
      count[r.nickname] = (count[r.nickname] || 0) + 1;
    });

    // Сортируем по убыванию
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);

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

window.toggleNom = async function(id, active) {
  const { error } = await supabase.from('nominations')
    .update({ active: !active })
    .eq('id', id);

  if (error) return alert('Ошибка: ' + error.message);
  loadAdmin();
}

// --- Инициализация админки ---
document.addEventListener('DOMContentLoaded', () => {
  loadAdmin();

  const addBtn = document.getElementById('addNomBtn');
  if (addBtn) addBtn.onclick = addNomination;
});
