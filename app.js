const STORAGE_KEY = 'connectedDB';

function getUserId(){
  if(window.Telegram && Telegram.WebApp) return Telegram.WebApp.initDataUnsafe?.user?.id;
  return 'local_' + navigator.userAgent;
}

function loadDB(){
  let db = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if(!db){
    db = { nominations: [], votes:{} };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
  return db;
}

function saveDB(db){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}
