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
