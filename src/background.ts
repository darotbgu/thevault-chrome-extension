// import {encryptMessage} from './utils/enc-utils';
// import axios from 'axios';

const formListenerCode =
  `
    for (var i = 0; i < document.forms.length; i++) {
        document.forms[i].addEventListener("submit", function(){
            var form = this;
            var password = "";
            var username = "";
            var inputs = form.getElementsByTagName("input");
            for (var j = 0; j < inputs.length; j++){
              var input = inputs[j];
              if (input.type == "password"){
                password = input.value;
              }
              else if (input.type == "text" || input.type == ""){
                username = input.value;
              }
            }
            if (password && username){
              var data = [username, password];
              chrome.runtime.sendMessage(message={'name':'form_submit', 'data':data});
            }
        });
    }
    `;
chrome.runtime.onMessage.addListener((message, sender) => {
  console.log('listening');
  switch (message.name) {
    case 'form_submit':
      const data = message.data;
      const senderUrl = sender['origin'];
      console.log(senderUrl);
      console.log(message.data);
      const authData = {site: senderUrl, username: data[0], password: data[1]};
      // storeData(authData);
      break;
    case 'user-data':
      console.log('user');
      chrome.storage.local.set(message);
      break;
    case 'user-data-clear':
      chrome.storage.local.remove(['user', 'authData', 'encKeys']);
      break;
    default:
      break;
  }
});

const injectToCurrTab = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.executeScript(tab.id, {code: formListenerCode}, () => {
        console.log('injected');
      });
    });
  });
};

chrome.runtime.onInstalled.addListener(() => {
  injectToCurrTab();

});

chrome.runtime.onStartup.addListener(() => {
  injectToCurrTab();
});

chrome.tabs.onReplaced.addListener(() => {
  injectToCurrTab();
});

chrome.tabs.onHighlighted.addListener(() => {
  injectToCurrTab();
});
chrome.tabs.onUpdated.addListener(() => {
  injectToCurrTab();
});

//
// function storeData(data) {
//   const instance = axios.create({
//     baseURL: 'http://127.0.0.1:8000/authentications/',
//   });
//   let authToken = '';
//   chrome.storage.local.get(['user'], (res) => {
//     authToken = res.user.authToken;
//   });
//   instance.defaults.headers.common.Authorization = `Token ${authToken}`;
//
//   const authData = {
//     site: data.site,
//     username: encryptMessage(data.username),
//     password: encryptMessage(data.password)
//   };
//   instance.post('', authData).then((res) => {
//     console.log(res);
//     // if (!res.success){
//     //   alert(res.msg);
//     // }
//   });
// }
