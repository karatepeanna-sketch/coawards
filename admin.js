const STORAGE_KEY = 'connectedDB';

// ======== Работа с базой ========
function loadDB() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"nominations":[]}');
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ======== Рендер админки ========
function renderAdmin() {
  const db = loadDB();
  const wrap = document.getElementById('adminNoms');
  wrap.innerHTML = '';

  // --- Добавление новой номинации ---
  const addNomDiv = document.createElement('div');
  addNomDiv.className = 'admin';
  addNomDiv.innerHTML = `
    <input placeholder="Название новой номинации" id="newNom">
    <button id="addNomBtn">Добавить номинацию</button>
  `;
  wrap.appendChild(addNomDiv);

  document.getElementById('addNomBtn').onclick = addNomination;

  // --- Существующие номинации ---
  db.nominations.forEach(nom => {
    const div = document.createElement('div');
    div.className = 'admin';
    div.innerHTML = `
      <h3>${nom.title} ${nom.active ? '' : '(неактивна)'}</h3>
      <button class="toggleBtn">${nom.active ? 'Выключить' : 'Включить'}</button>
      <div id="list-${nom.id}"></div>
      <input placeholder="Имя участника" id="name-${nom.id}">
      <input type="file" id="file-${nom.id}">
      <button class="addPartBtn">Добавить участника</button>
      <canvas id="chart-${nom.id}" height="100"></canvas>
    `;
    wrap.appendChild(div);

    // Навешиваем события на кнопки
    div.querySelector('.toggleBtn').onclick = () => toggleNom(nom.id);
    div.querySelector('.addPartBtn').onclick = () => addParticipant(nom.id);

    renderParticipants(nom);
    renderChart(nom);
  });

  renderVoteStats(db);
}

// ======== Добавление номинации ========
function addNomination() {
  const nameInput = document.getElementById('newNom');
  const name = nameInput.value.trim();
  if(!name) return alert('Введите название номинации');

  const db = loadDB();
  db.nominations.push({id:Date.now(), title:name, active:true, participants:[]});
  saveDB(db);
  nameInput.value = '';
  renderAdmin();
}

// ======== Добавление участника ========
function addParticipant(nomId) {
  const nameInput = document.getElementById(`name-${nomId}`);
  const fileInput = document.getElementById(`file-${nomId}`);
  const name = nameInput.value.trim();
  const file = fileInput.files[0];

  if(!name || !file) return alert('Введите имя и выберите фото');

  const reader = new FileReader();
  reader.onload = () => {
    const db = loadDB();
    const nom = db.nominations.find(n => n.id === nomId);
    nom.participants.push({id:Date.now(), name, photo:reader.result, votes:[]});
    saveDB(db);
    renderAdmin();
  };
  reader.readAsDataURL(file);
}

// ======== Рендер участников ========
function renderParticipants(nom) {
  const list = document.getElementById(`list-${nom.id}`);
  list.innerHTML = '';

  nom.participants.forEach(p => {
    const row = document.createElement('div');
    row.className = 'drag';
    row.innerHTML = `
      <img src="${p.photo}" alt="${p.name}">
      <input type="text" value="${p.name}" id="edit-name-${p.id}">
      <label style="cursor:pointer;">📷<input type="file" id="edit-file-${p.id}" style="display:none;"></label>
      <button onclick="editParticipant(${nom.id},${p.id})">✏️</button>
      <button onclick="deleteParticipant(${nom.id},${p.id})" style="background:red;color:#000;">🗑</button>
    `;
    list.appendChild(row);
  });
}

// ======== Редактирование участника ========
function editParticipant(nomId, partId) {
  const db = loadDB();
  const nom = db.nominations.find(n => n.id === nomId);
  const part = nom.participants.find(p => p.id === partId);

  const newName = document.getElementById(`edit-name-${part.id}`).value.trim();
  if(newName) part.name = newName;

  const fileInput = document.getElementById(`edit-file-${part.id}`);
  if(fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => { part.photo = reader.result; saveDB(db); renderAdmin(); };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    saveDB(db);
    renderAdmin();
  }
}

// ======== Удаление участника ========
function deleteParticipant(nomId, partId) {
  if(!confirm('Удалить участника?')) return;
  const db = loadDB();
  const nom = db.nominations.find(n => n.id === nomId);
  nom.participants = nom.participants.filter(p => p.id !== partId);
  saveDB(db);
  renderAdmin();
}

// ======== Включить/Выключить номинацию ========
function toggleNom(nomId) {
  const db = loadDB();
  const nom = db.nominations.find(n => n.id === nomId);
  nom.active = !nom.active;
  saveDB(db);
  renderAdmin();
}

// ======== График голосов ========
function renderChart(nom) {
  const ctx = document.getElementById(`chart-${nom.id}`).getContext('2d');
  new Chart(ctx, {
    type:'bar',
    data:{
      labels: nom.participants.map(p => p.name),
      datasets:[{label:'Голоса', data: nom.participants.map(p => p.votes.length), backgroundColor:'#00ff00'}]
    },
    options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}
  });
}

// ======== Статистика голосов ========
function renderVoteStats(db) {
  const wrap = document.getElementById('voteStats');
  wrap.innerHTML = '';
  db.nominations.forEach(nom => {
    const div = document.createElement('div');
    div.className = 'admin';
    div.innerHTML = `<h4>${nom.title}</h4>`;
    nom.participants.forEach(p => {
      const total = nom.participants.reduce((s,x)=>s+x.votes.length,0);
      div.innerHTML += `
        <div class="card">
          ${p.name} — ${p.votes.length} голосов
          <div class="progress"><span style="width:${total? (p.votes.length/total*100):0}%"></span></div>
        </div>
      `;
    });
    wrap.appendChild(div);
  });
}

// ======== Инициализация ========
renderAdmin();
