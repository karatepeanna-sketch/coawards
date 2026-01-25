// ======== Добавление номинации ========
async function addNomination() {
  const title = document.getElementById('title').value.trim();
  const desc = document.getElementById('desc').value.trim();

  if (!title || !desc) return alert('Заполни оба поля');

  const { error } = await client.from('nominations').insert({
    title: title,
    description: desc,
    active: true
  });

  if (error) {
    alert(error.message);
    console.error(error);
    return;
  }

  document.getElementById('title').value = '';
  document.getElementById('desc').value = '';
  loadAdmin();
}

// ======== Загрузка админки ========
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
    // собираем упоминания по этой номинации
    const related = mentions.filter(
      m => Number(m.nomination_id) === Number(nom.id)
    );

    const counter = {};
    related.forEach(r => {
      counter[r.nickname] = (counter[r.nickname] || 0) + 1;
    });

    const sorted = Object.entries(counter).sort((a,b) => b[1]-a[1]);

    const div = document.createElement('div');
    div.className = 'admin';

    div.innerHTML = `
      <input value="${nom.title}" id="title-${nom.id}" placeholder="Название">
      <input value="${nom.description}" id="desc-${nom.id}" placeholder="Описание">
      <button onclick="updateNom(${nom.id})">💾</button>
      <button onclick="deleteNom(${nom.id})">🗑</button>

      ${sorted.length === 0 ? '<p>Пока нет упоминаний</p>' : ''}
      ${sorted.map(s => `<div>${s[0]} — ${s[1]}</div>`).join('')}
    `;

    wrap.appendChild(div);
  });
}

// ======== Удаление номинации ========
async function deleteNom(id) {
  if (!confirm('Удалить номинацию и все упоминания?')) return;

  await supabase.from('mentions').delete().eq('nomination_id', id);
  await supabase.from('nominations').delete().eq('id', id);

  loadAdmin();
}

// ======== Редактирование номинации ========
async function updateNom(id) {
  const title = document.getElementById(`title-${id}`).value.trim();
  const desc = document.getElementById(`desc-${id}`).value.trim();

  if (!title || !desc) return;

  const { error } = await client
    .from('nominations')
    .update({ title, description: desc })
    .eq('id', id);

  if (error) {
    alert(error.message);
    return;
  }

  loadAdmin();
}

// ======== Инициализация ========
document.getElementById('addNomBtn').onclick = addNomination;
loadAdmin();
