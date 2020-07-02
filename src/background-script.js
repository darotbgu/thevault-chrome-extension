const axios = require("axios");
const encUtils = require("./enc-utils");



const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
});

function getAuthDataFromServer(){
  instance.get('artifacts/')
    .then((res) => {
      if (res.data.success) {
        localStorage.artifacts =  JSON.stringify(res.data.data);
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
  let authData = JSON.parse(localStorage.artifacts);
  for (let i = 0; i < authData.length; i++){
    encUtils.decryptMessage(authData[i].force);
    const decryptedDomain = encUtils.decryptMessage(authData[i].crystal);
    if (decryptedDomain === domain){
      authData[i].crystal = decryptedDomain;
      authData[i].jedi = encUtils.decryptMessage(authData[i].jedi);
      authData[i].sith = encUtils.decryptMessage(authData[i].sith);
      return authData[i];
    }
  }
  return null;
}
function updateData(authData, existingData){
  if (confirm("Do you want to update credentials?")){
    instance.post(`artifacts/${existingData.holocron_id}/`, authData).then((resData) => {
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
    crystal: encUtils.encryptMessage(data.domain),
    jedi: encUtils.encryptMessage(data.username),
    sith: encUtils.encryptMessage(data.password)
  };
  authData.force = encUtils.encryptMessage(data.domain + data.username + data.password);

  const existingData = getExistingAuthData(data.domain);
  if (existingData && (existingData.jedi !== data.username || existingData.sith !== data.password)){
    updateData(authData, existingData);
  }
  else if(!existingData) {
    instance.post('artifacts/', authData).then((resData) => {
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
      const authData = {domain: senderUrl, username: data[0], password: data[1]};
      storeData(authData);
      sendResponse(true);
      break;
    case 'form_focus':
      const existingData = getExistingAuthData(message.domain);
      if (existingData){
        sendResponse({found: true, username: existingData.jedi, password: existingData.sith});
      }
      else {
        sendResponse({found: false, username:null, password: null});
      }
      break;
    default:
      break;
  }
});

