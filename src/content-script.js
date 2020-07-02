const autocomplete = require("autocomplete.js");

let cssStyle = `
.algolia-autocomplete {
  width: 100%;
}
.algolia-autocomplete .aa-input, .algolia-autocomplete .aa-hint {
  width: 100%;
}
.algolia-autocomplete .aa-hint {
  color: #999;
}
.algolia-autocomplete .aa-dropdown-menu {
  width: 100%;
  background-color: #fff;
  border: 1px solid #999;
  border-top: none;
}
.algolia-autocomplete .aa-dropdown-menu .aa-suggestion {
  cursor: pointer;
  padding: 5px 4px;
}
.algolia-autocomplete .aa-dropdown-menu .aa-suggestion.aa-cursor {
  background-color: #B2D7FF;
}
.algolia-autocomplete .aa-dropdown-menu .aa-suggestion em {
  font-weight: bold;
  font-style: normal;
}

.branding {
font-size: 1.3em;
margin: 0.5em 0.2em;
}

.branding img {
    height: 1.3em;
    margin-bottom: - 0.3em;
}
`;

// document.body.style.cssText += cssStyle;

console.log('content script injected');
const formsCollection = document.forms;
let autoCompleteUser = new Array(formsCollection.length);
for (let j = 0; j < formsCollection.length; j++){
  autoCompleteUser[j] = null;
}

function addAutoComplete(formIndex){
  if (autoCompleteUser[formIndex] != null){
    autoCompleteUser.destroy();
  }

  console.log('focus activated');
  const currForm = formsCollection.item(formIndex);
  let passwordInput = null;
  let usernameInput = null;
  const inputs = currForm.getElementsByTagName('input');
  let loginInputs = 2;
  for (let j = 0; j < inputs.length; j++) {
    const input = inputs[j];
    if (input.type === 'password' && !input.hidden) {
      console.log('found password');
      passwordInput = input;
      loginInputs--;
    } else if (input.type === 'text' && !input.hidden && !input.classList.contains("aa-hint")) {
      console.log('found username');
      usernameInput = input;
      if (usernameInput.className.indexOf("autocomplete") < 0) {
        usernameInput.className += ' autocomplete';
      }
      loginInputs--;
    }
  }
  if (loginInputs === 0 && passwordInput && usernameInput) {

    chrome.runtime.sendMessage({'name': 'form_focus', 'domain': location.origin}, (res) => {
      if (res.found) {
        autoCompleteUser[formIndex] = autocomplete(".autocomplete",
          {minLength: 0, openOnFocus: true},
          [{
            source: (query, callback) => {
              callback([{key: "autofill credentials", data: res.username}]);
            },
            displayKey: (suggestion) => {
              return suggestion.data;
            },
            templates: {
              suggestion: function (suggestion) {
                return suggestion.key;
              }
            }
          }])
          .on('autocomplete:selected', (event, suggestion, dataset, context) => {
            passwordInput.value = res.password;
          });

      }
    });
  }

}


for (let i = 0; i < formsCollection.length; i++){
  addAutoComplete(i);
  formsCollection.item(i).addEventListener('submit', function() {
    console.log('submit activated');
    const currForm = this;
    let password = '';
    let username = '';
    const inputs = currForm.getElementsByTagName('input');
    let loginInputsSubmit = 2;
    for (let j = 0; j < inputs.length; j++) {
      const input = inputs[j];
      if (input.type === 'password' && !input.hidden) {
        console.log('found password');
        password = input.value;
        loginInputsSubmit--;
      } else if (input.type === 'text' && !input.hidden && !input.classList.contains("aa-hint")) {
        console.log('found username');
        username = input.value;
        loginInputsSubmit--;
      }
    }
    if (loginInputsSubmit === 0 && password && username) {
      const data = [username, password]
      chrome.runtime.sendMessage({'name': 'form_submit', 'data': data}, (res)=>{
        if (res) {
          addAutoComplete(i);
        }
      });
    }


  });
  // formsCollection.item(i).addEventListener('focusin', function() {
  //
  //
  // });
}
