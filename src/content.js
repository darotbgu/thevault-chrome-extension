(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
console.log('content script injected');
const formsCollection = document.forms;
let autofill = false;
for (let i = 0; i < formsCollection.length; i++){
  formsCollection.item(i).addEventListener('submit', function() {
    console.log('submit activated');
    const currForm = this;
    let password = '';
    let username = '';
    const inputs = currForm.getElementsByTagName('input');
    for (let j = 0; j < inputs.length; j++) {
      const input = inputs[j];
      if (input.type === 'password') {
        console.log('found password');
        password = input.value;
      } else if (input.type === 'text' || input.type === '') {
        console.log('found username');
        username = input.value;
      }
    }
    if (password && username) {
      const data = [username, password]
      chrome.runtime.sendMessage(message={'name':'form_submit', 'data':data});
    }
    autofill = false;
  });
  formsCollection.item(i).addEventListener('focusin', function() {
    if (!autofill) {
      console.log('focus activated');
      const currForm = this;
      let passwordInput = null;
      let usernameInput = null;
      const inputs = currForm.getElementsByTagName('input');
      for (let j = 0; j < inputs.length; j++) {
        const input = inputs[j];
        if (input.type === 'password') {
          console.log('found password');
          passwordInput = input;
        } else if (input.type === 'text' || input.type === '') {
          console.log('found username');
          usernameInput = input;
        }
      }
      if (password && username) {
        chrome.runtime.sendMessage(message = {'name': 'form_focus', 'domain': location.origin}, (res) => {
          if (res.found) {
            passwordInput.value = res.password;
            usernameInput.value = res.username;
          }
        });
      }
      autofill = true;
    }
  });
}

},{}]},{},[1]);
