const axios = require("axios");
const encUtils = require("./enc-utils");



const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
});

function getAuthDataFromServer(){
  instance.get('authentications/')
    .then((res) => {
      if (res.data.success) {
        localStorage.authData =  JSON.stringify(res.data.data);
      }
      else {
        alert(res.data.msg)
      }
    })
    .catch((err)=> alert(err));
}

if (localStorage.user){
  const userData = JSON.parse(localStorage.user);
  const authToken = userData.authToken;
  instance.defaults.headers.common.Authorization = `Token ${authToken}`;
  getAuthDataFromServer();
}

function getExistingAuthData(domain){
  let authData = JSON.parse(localStorage.authData);
  for (let i = 0; i < authData.length; i++){
    if (authData[i].site_name === domain){
        authData[i].username = encUtils.decryptMessage(authData[i].username);
        authData[i].password = encUtils.decryptMessage(authData[i].password)
      return authData[i];
    }
  }
  return null;
}
function updateData(authData, existingData){
  if (confirm("Do you want to update credentials?")){
    instance.post(`authentications/${existingData.site_id}/`, authData).then((resData) => {
      if (!resData.data.success){
        alert(resData.data.msg);
      }
      else {
        getAuthDataFromServer();
      }
    }).catch((err) => alert(err));
  }
  console.log("Not updating");
}

function storeData(data) {
  const authData = {
    site_name: data.site,
    username: encUtils.encryptMessage(data.username),
    password: encUtils.encryptMessage(data.password)
  };
  const existingData = getExistingAuthData(data.site);
  if (existingData && (existingData.username !== data.username || existingData.password !== data.password)){
    updateData(authData, existingData);
  }
  else if(!existingData) {
    instance.post('authentications/', authData).then((resData) => {
      if (!resData.data.success) {
        alert(resData.data.msg);
      } else {
        getAuthDataFromServer();
      }
    }).catch((err) => alert(err));
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('listening');
  console.log(message);
  switch (message.name) {
    case 'form_submit':
      const data = message.data;
      const senderUrl = sender['origin'];
      console.log(senderUrl);
      console.log(message.data);
      const authData = {site: senderUrl, username: data[0], password: data[1]};
      storeData(authData);
      sendResponse(true);
      break;
    case 'form_focus':
      const existingData = getExistingAuthData(message.domain);
      if (existingData){
        sendResponse({found: true, username: existingData.username, password: existingData.password});
      }
      else {
        sendResponse({found: false, username:null, password: null});
      }
      break;
    // case 'user-data':
    //   console.log('user');
    //   // localStorage.authData = JSON.stringify(message.authData);
    //   // chrome.storage.local.set(message);
    //   break;
    // case 'user-data-clear':
    //   chrome.storage.local.remove(['user', 'authData', 'encKeys']);
    //   break;
    default:
      break;
  }
});

