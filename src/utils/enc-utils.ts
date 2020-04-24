
import sha256 from 'crypto-js/sha256';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import aes from 'crypto-js/aes';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-Utf8';

interface EncryptionKey {
  id: number;
  key: string;
}

interface EncryptionKeys {
  serverPassword: EncryptionKey;
  encryptionKey: EncryptionKey;
  authenticationKey: EncryptionKey;
}


const localStorageKey = 'keys';
const  localStorageEncKey = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const cipherLength = 44;


let encryptionKeys = ({
      serverPassword: {id: 1, key: ''},
      encryptionKey: {id: 2, key: ''},
      authenticationKey: {id: 3, key: ''}
});

const stringForKey = (message: string, num: number) => `${message}${num}`;
const encryptedMessage = (ciphertext, authToken) => `${ciphertext}${authToken}`;

export const hmac = (ciphertext, key) => {
    return Base64.stringify(hmacSHA256(ciphertext, key));
};

export const aesEncrypt = (message, key) => {
    return aes.encrypt(message, key).toString();
};

export const aesDecrypt = (ciphertext, key) => {
    const bytes = aes.decrypt(ciphertext, key);
    return bytes.toString(Utf8);
};

const getKeys = () => {
  // const encryptedKeys = localStorage.getItem(this.localStorageKey);
  let encKeys = null;
  chrome.storage.local.get(['encKeys'], (res) => {
    encKeys = res.encKeys;
  });
  const decryptedText = aesDecrypt(encKeys, this.localStorageEncKey);
  return JSON.parse(decryptedText);
};

const storeKeys = () => {
  const ciphertext = aesEncrypt(JSON.stringify(this.encryptionKeys), this.localStorageEncKey);
  // localStorage.setItem(this.localStorageKey, ciphertext);
  chrome.storage.local.set({encKeys: ciphertext});
};


export const deriveKeys = (masterKey: string) => {
    deriveKey(encryptionKeys.serverPassword, masterKey);
    deriveKey(encryptionKeys.encryptionKey, masterKey);
    deriveKey(encryptionKeys.authenticationKey, masterKey);
    storeKeys();
};

const  deriveKey = (encKey: EncryptionKey, masterKey: string) => {
    encKey.key = (sha256(this.stringForKey(masterKey, encKey.id))).toString();
};

const clearKeys = () => {
    // localStorage.removeItem(this.localStorageKey);
  chrome.storage.local.remove(['encKeys']);
};

// const getServerPassword(){
//     return this.encryptionKeys.serverPassword.key;
// }

export const  encryptMessage = (message: string): string => {
  encryptionKeys = this.getKeys();
  const ciphertext = aesEncrypt(message, encryptionKeys.encryptionKey.key);
  const token = hmac(ciphertext, encryptionKeys.authenticationKey.key);
  return this.encryptedMessage(ciphertext, token);
};

export const  decryptMessage = (message: string): string =>{
  encryptionKeys = this.getKeys();
  const ciphertext = message.slice(0, this.cipherLength);
  const token = message.slice(this.cipherLength);
  if (hmac(ciphertext, encryptionKeys.authenticationKey.key) !== token){
    throw new Error('Data has changed');
  }
  return aesDecrypt(ciphertext, encryptionKeys.encryptionKey.key);
};
