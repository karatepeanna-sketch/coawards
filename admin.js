const supabase = window.supabase.createClient(
  'https://bzgrvzaswfcqoyzindnr.supabase.co',
  'sb_publishable__PvJTawE7Ql_6ZMLmqSgFw_f2rtCVHe'
);

async function addNomination() {
  const desc = document.getElementById('desc').value.trim();
  if (!desc) return alert('Введите описание');

  const { error } = await supabase.from('nominations').insert({
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

async function loadAdmin() {
  const { data: noms, error: nomErr } = await supabase
    .from('nominations')
    .select('*')
    .order('id', { ascending: true });

  const { data: mentions, error: menErr } = await supabase
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
    div.className = 'admin';

    div.innerHTML = `
      <h3>${nom.description}</h3>
      ${sorted.length === 0 ? '<p>Пока нет упоминаний</p>' : ''}
      ${sorted.map(s => `<div>${s[0]} — ${s[1]}</div>`).join('')}
      <button onclick="deleteNom(${nom.id})">Удалить номинацию</button>
    `;

    wrap.appendChild(div);
  });
}

async function deleteNom(id) {
  if (!confirm('Удалить номинацию и все упоминания?')) return;

  await supabase.from('mentions').delete().eq('nomination_id', id);
  await supabase.from('nominations').delete().eq('id', id);

  loadAdmin();
}

loadAdmin();

