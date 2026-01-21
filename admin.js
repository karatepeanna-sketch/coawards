<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Connected Awards</title>
<link rel="stylesheet" href="style.css">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
</head>
<body>

<h1>Админка Connected Awards</h1>

<div>
  <input type="text" id="desc" placeholder="Описание новой номинации">
  <button id="addNomBtn">Добавить номинацию</button>
</div>

<div id="adminNoms"></div>

<script>
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Добавление новой номинации ---
async function addNomination() {
  const desc = document.getElementById('desc').value.trim();
  if (!desc) return alert('Введите описание номинации');

  const { data, error } = await supabase
    .from('nominations')
    .insert([{ description: desc, active: true }])
    .select();

  if (error) return console.error('Ошибка при добавлении номинации:', error);

  document.getElementById('desc').value = '';
  loadAdmin();
}

// --- Загрузка номинаций и подсчет упоминаний ---
async function loadAdmin() {
  const { data: noms, error: nomsErr } = await supabase
    .from('nominations')
    .select('*')
    .order('created', { ascending: true });

  if (nomsErr) return console.error('Ошибка при загрузке номинаций:', nomsErr);

  const { data: mentions, error: mentionsErr } = await supabase
    .from('mentions')
    .select('*');

  if (mentionsErr) return console.error('Ошибка при загрузке упоминаний:', mentionsErr);

  const wrap = document.getElementById('adminNoms');
  wrap.innerHTML = '';

  noms.forEach(nom => {
    // фильтруем все упоминания к этой номинации
    const related = mentions.filter(m => m.nomination_id === nom.id);

    // считаем количество упоминаний каждого ника
    const count = {};
    related.forEach(r => {
      count[r.nickname] = (count[r.nickname] || 0) + 1;
    });

    const sorted = Object.entries(count)
      .sort((a,b)=>b[1]-a[1]); // по убыванию

    const div = document.createElement('div');
    div.className = 'admin';
    div.innerHTML = `
      <h3>${nom.description}</h3>
      ${sorted.length > 0 
        ? sorted.map(s => `<div>${s[0]} — ${s[1]}</div>`).join('')
        : '<p>Пока нет упоминаний</p>'}
    `;

    wrap.appendChild(div);
  });
}

// --- Инициализация ---
document.getElementById('addNomBtn').onclick = addNomination;
loadAdmin();
</script>

</body>
</html>
