async function addNomination() {
  const desc = document.getElementById('desc').value.trim();
  if (!desc) return;

  await supabase.from('nominations').insert({
    description: desc,
    active: true
  });

  document.getElementById('desc').value = '';
  loadAdmin();
}

async function loadAdmin() {
  const { data: noms } = await supabase.from('nominations').select('*');
  const { data: mentions } = await supabase.from('mentions').select('*');

  const wrap = document.getElementById('adminNoms');
  wrap.innerHTML = '';

  noms.forEach(nom => {
    const related = mentions.filter(m => m.nomination_id === nom.id);

    const count = {};
    related.forEach(r => {
      count[r.nickname] = (count[r.nickname] || 0) + 1;
    });

    const sorted = Object.entries(count)
      .sort((a,b)=>b[1]-a[1]);

    const div = document.createElement('div');
    div.className = 'admin';

    div.innerHTML = `
      <h3>${nom.description}</h3>
      ${sorted.map(s => `<div>${s[0]} — ${s[1]}</div>`).join('')}
    `;

    wrap.appendChild(div);
  });
}

loadAdmin();
