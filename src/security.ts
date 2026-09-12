import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const PIN_KEY='@hane/security/pin-sha256-v1';
const MODE_KEY='@hane/security/pin-mode-v1';

async function hashPin(pin:string){
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,`HANE|${pin}|LOCAL-PIN-V1`);
}
export async function getPinMode():Promise<'new'|'enabled'|'disabled'>{
  const mode=await AsyncStorage.getItem(MODE_KEY);
  const pin=await AsyncStorage.getItem(PIN_KEY);
  if(mode==='disabled')return 'disabled';
  if(pin)return 'enabled';
  return 'new';
}
export async function hasPin(){return !!(await AsyncStorage.getItem(PIN_KEY));}
export async function savePin(pin:string){await AsyncStorage.setItem(PIN_KEY,await hashPin(pin));await AsyncStorage.setItem(MODE_KEY,'enabled');}
export async function verifyPin(pin:string){const saved=await AsyncStorage.getItem(PIN_KEY);return !!saved&&saved===await hashPin(pin);}
export async function removePin(){await AsyncStorage.removeItem(PIN_KEY);await AsyncStorage.setItem(MODE_KEY,'disabled');}
