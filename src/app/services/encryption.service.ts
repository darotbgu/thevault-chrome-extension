import { Injectable } from '@angular/core';
import {EncryptionKey} from '../modles/encryption-key';
import sha256 from 'crypto-js/sha256';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import aes from 'crypto-js/aes';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-Utf8';

interface EncryptionKeys {
  serverPassword: EncryptionKey;
  encryptionKey: EncryptionKey;
  authenticationKey: EncryptionKey;
}

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() {
    this.encryptionKeys = ({
      serverPassword: {id: 1, key: ''},
      encryptionKey: {id: 2, key: ''},
      authenticationKey: {id: 3, key: ''}
    });
  }
  private readonly localStorageKey = 'keys';
  private readonly localStorageEncKey = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  private readonly cipherLength = 44;
  private encryptionKeys: EncryptionKeys;

  private static hmac(ciphertext, key){
    return Base64.stringify(hmacSHA256(ciphertext, key));
  }

  private static aesEncrypt(message, key){
    return aes.encrypt(message, key).toString();
  }

  private static aesDecrypt(ciphertext, key){
    const bytes = aes.decrypt(ciphertext, key);
    return bytes.toString(Utf8);
  }

  public getKeys(){
    const encryptedKeys = localStorage.getItem(this.localStorageKey);
    const decryptedText = EncryptionService.aesDecrypt(encryptedKeys, this.localStorageEncKey);
    return JSON.parse(decryptedText);
  }

  private storeKeys(){
    const ciphertext = EncryptionService.aesEncrypt(JSON.stringify(this.encryptionKeys), this.localStorageEncKey);
    localStorage.setItem(this.localStorageKey, ciphertext);
  }

  private stringForKey = (message: string, num: number) => `${message}${num}`;
  private encryptedMessage = (ciphertext, authToken) => `${ciphertext}${authToken}`;

  deriveKeys(masterKey: string) {
    this.deriveKey(this.encryptionKeys.serverPassword, masterKey);
    this.deriveKey(this.encryptionKeys.encryptionKey, masterKey);
    this.deriveKey(this.encryptionKeys.authenticationKey, masterKey);
    this.storeKeys();
  }

  private deriveKey(encKey: EncryptionKey, masterKey: string){
    encKey.key = (sha256(this.stringForKey(masterKey, encKey.id))).toString();
  }

  clearKeys(){
    localStorage.removeItem(this.localStorageKey);
  }

  getServerPassword(){
    return this.encryptionKeys.serverPassword.key;
  }

  encryptMessage(message: string): string{
    this.encryptionKeys = this.getKeys();
    const ciphertext = EncryptionService.aesEncrypt(message, this.encryptionKeys.encryptionKey.key);
    const token = EncryptionService.hmac(ciphertext, this.encryptionKeys.authenticationKey.key);
    return this.encryptedMessage(ciphertext, token);
  }

  decryptMessage(message: string): string{
    this.encryptionKeys = this.getKeys();
    const ciphertext = message.slice(0, this.cipherLength);
    const token = message.slice(this.cipherLength);
    if (EncryptionService.hmac(ciphertext, this.encryptionKeys.authenticationKey.key) !== token){
      throw new Error('Data has changed');
    }
    return EncryptionService.aesDecrypt(ciphertext, this.encryptionKeys.encryptionKey.key);
  }
}
