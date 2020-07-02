const hmacSHA256 = require("crypto-js/hmac-sha256");
const aes = require("crypto-js/aes");
const Base64 = require("crypto-js/enc-base64");
const Utf8 = require("crypto-js/enc-utf8");

const  localStorageEncKey = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const tokenLength = 44;


let encryptionKeys = ({
  serverPassword: {id: 1, key: ''},
  encryptionKey: {id: 2, key: ''},
  authenticationKey: {id: 3, key: ''}
});

const encryptedMessage = (ciphertext, authToken) => `${ciphertext}${authToken}`;

const hmac = (ciphertext, key) => {
  return Base64.stringify(hmacSHA256(ciphertext, key));
};

const aesEncrypt = (message, key) => {
  return aes.encrypt(message, key).toString();
};

const aesDecrypt = (ciphertext, key) => {
  const bytes = aes.decrypt(ciphertext, key);
  return bytes.toString(Utf8);
};

const getKeys = () => {
  let encKeys = localStorage["keys"];
  const decryptedText = aesDecrypt(encKeys, localStorageEncKey);
  return JSON.parse(decryptedText);
};

const  encryptMessage = (message) => {
  encryptionKeys = getKeys();
  const ciphertext = aesEncrypt(message, encryptionKeys.encryptionKey.key);
  const token = hmac(ciphertext, encryptionKeys.authenticationKey.key);
  return encryptedMessage(ciphertext, token);
};

const  decryptMessage = (message) =>{
  encryptionKeys = getKeys();
  const ciphertext = message.slice(0, message.length - tokenLength);
  const token = message.slice(message.length - tokenLength);
  if (hmac(ciphertext, encryptionKeys.authenticationKey.key) !== token){
    throw new Error('Data has changed');
  }
  return aesDecrypt(ciphertext, encryptionKeys.encryptionKey.key);
};

module.exports = {
  encryptMessage,
  decryptMessage
};
