import { getCookies } from './lib/handler.js';


export function getCookie(username: string, password: string, withLoginData: boolean = false) {
  return getCookies(username, password, withLoginData);
}

export { InstaService } from './lib/client.service.js';
export { LoginService } from './lib/login.service.js';
export type { LoginServiceConfig } from './lib/login.service.js';
export { BloksLoginService } from './lib/login.bloks.js';
export type { BloksLoginResult, BloksDeviceParams } from './lib/login.bloks.js';
