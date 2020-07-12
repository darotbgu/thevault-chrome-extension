const axios = require("axios");
const encUtils = require("./enc-utils");



const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
});

async function getAuthDataFromServer(){
  await instance.get('artifacts/')
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

function getAuthenticationToken() {
  if (localStorage.user) {
    const userData = JSON.parse(localStorage.user);
    const authToken = userData.authToken;
    instance.defaults.headers.common.Authorization = `Token ${authToken}`;
    return true;
  }
  return false;
}

if (getAuthenticationToken()) {
  getAuthDataFromServer().then(()=>{});
}

async function getExistingAuthData(domain){
  if (getAuthenticationToken()) {
    return await getAuthDataFromServer().then(()=> {
      let authData = JSON.parse(localStorage.artifacts);
      for (let i = 0; i < authData.length; i++) {
        encUtils.decryptMessage(authData[i].force);
        const decryptedDomain = encUtils.decryptMessage(authData[i].crystal);
        if (decryptedDomain === domain) {
          authData[i].crystal = decryptedDomain;
          authData[i].jedi = encUtils.decryptMessage(authData[i].jedi);
          authData[i].sith = encUtils.decryptMessage(authData[i].sith);
          return authData[i];
        }
      }
    });

  }
}
async function updateData(authData, existingData){
  if (confirm("Do you want to update credentials?")){
    instance.post(`artifacts/${existingData.holocron_id}/`, authData).then((resData) => {
      if (!resData.data.success){
        alert(resData.data.msg);
      }
      else {
        getAuthenticationToken();
        getAuthDataFromServer();
      }
    }).catch((err) => alert(err));
  }
  console.log("Not updating");
}

async function storeData(data) {
  const authData = {
    crystal: encUtils.encryptMessage(data.domain),
    jedi: encUtils.encryptMessage(data.username),
    sith: encUtils.encryptMessage(data.password)
  };
  authData.force = encUtils.encryptMessage(data.domain + data.username + data.password);

  await getExistingAuthData(data.domain).then(existingData => {
    if (existingData && (existingData.jedi !== data.username || existingData.sith !== data.password)){
      updateData(authData, existingData);
    }
    else if(!existingData) {
      instance.post('artifacts/', authData).then((resData) => {
        if (!resData.data.success) {
          alert(resData.data.msg);
        } else {
          getAuthenticationToken();
          getAuthDataFromServer();
        }
      }).catch((err) => alert(err));
    }
  });

}

async function listener(message, sender, sendResponse){
  console.log('listening');
  console.log(message);
  if (message.name === 'form_submit') {
    const data = message.data;
    const senderUrl = sender['origin'];
    console.log(senderUrl);
    console.log(message.data);
    const authData = {domain: senderUrl, username: data[0], password: data[1]};
    return await storeData(authData).then(() => {
      sendResponse(true);
    });
  }
  if(message.name ===  'form_autofill') {
    return await getExistingAuthData(message.domain).then((existingData) => {
      if (existingData) {
        sendResponse({found: true, username: existingData.jedi, password: existingData.sith});
      } else {
        sendResponse({found: false, username:null, password: null});

      }
    });
  }
}

chrome.runtime.onMessage.addListener((message,sender, sendResponse) => {
  listener(message, sender,sendResponse);
  return true;
});

