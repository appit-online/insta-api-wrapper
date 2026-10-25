# [insta-api-wrapper: Node.js](https://github.com/appit-online/insta-api-wrapper)

A lightweight library to **fetch Instagram Stories, Reels, Highlights, user details, profiles, posts...**, including login and cookie handling — built for **Node.js** with `got` HTTP client.

---

## Features

- Login via **Instagram Bloks CAA** protocol directly from the caller's IP (no server proxy)
- Full **2FA support** — TOTP, SMS, and airwave (push notification) accounts
- Follow and Like via Instagram Private API
- Fetch Stories, Highlights, Tray, User Profiles, Posts by URL/shortcode/mediaId
- Session persistence via `node-localstorage`
- Optional device parameter override via `setDeviceParams()` for consistent headers

---

**Table of contents:**

* [Installation](#installation)
* [Login](#login)
* [API Usage](#api-usage)
* [License](#license)

## Installation

```bash
npm install insta-api-wrapper
```

## Login

```typescript
import { LoginService } from 'insta-api-wrapper';

const loginService = new LoginService({
  backendUrl: 'https://your-backend.example.com'  // optional — for device params & verify
});

const result = await loginService.login(username, password);

if (result.twoFactorRequired) {
  // Prompt for code, then:
  const verified = await loginService.login2FA(password, code, '', username);
}
```

All Instagram traffic goes directly from the caller — the backend is never used as a login proxy. To sync device parameters with your backend, call `loginService.setDeviceParams(...)` before login.

## API Usage

```typescript
import { InstaService } from 'insta-api-wrapper';

const igService = new InstaService();
```

All API methods accept an optional `headers` parameter for auth. The lib uses Android headers by default — you only need to pass the session-specific auth headers:

```typescript
const authHeaders = {
  'Authorization': session.headers['ig-set-authorization'],
  'Ig-U-Ds-User-Id': session.headers['ig-set-ig-u-ds-user-id'],
  'Ig-U-Rur': session.headers['ig-set-ig-u-rur'],
  'X-Ig-Www-Claim': session.headers['x-ig-set-www-claim'],
};
```

### Stories

```typescript
const tray = await igService.fetchTrayStories(authHeaders);
const stories = await igService.getStories('someuser', true, authHeaders);
const highlights = await igService.getHighlights('someuser', authHeaders);
```

### User Info

```typescript
const uid = await igService.getUIdByUsername('someuser', authHeaders);
const profile = await igService.getUserDetails('someuser', authHeaders);  // web/GraphQL
const profileV1 = await igService.getUserInfoV1('someuser', authHeaders); // V1 Private API (use with Bloks auth)
```

### Posts

```typescript
const posts = await igService.fetchUserProfilePosts('someuser', '', authHeaders);
const more = await igService.fetchUserProfilePosts('someuser', posts.next_max_id, authHeaders);
const post = await igService.fetchContentByUrl('https://www.instagram.com/p/ABC123/', authHeaders);
const post2 = await igService.fetchContentByShortCode('ABC123', authHeaders);
const post3 = await igService.fetchContentByMediaId('369174122649_457051784', authHeaders);
```

### Follow & Like

```typescript
const followed = await igService.follow('usernameOrId', authHeaders);
const liked = await igService.like('shortCode', authHeaders);
```

### Device Parameters

The lib ships with hardcoded Android device defaults (Pixel 8 Pro, Instagram 428.0.0.47.67). To override:

```typescript
loginService.setDeviceParams({ version: '428.0.0.47.67', bloksVersioningId: '...' });
```

Expected format (e.g. from a backend `/api/details` endpoint):

```json
{
  "version": "428.0.0.47.67",
  "defaultCodeName": "husky",
  "defaultManufacturer": "Google/google",
  "defaultModel": "Pixel 8 Pro",
  "defaultAndroidVersion": "34",
  "defaultAndroidRelease": "14",
  "defaultScreenDpi": "480dpi",
  "defaultResolution": "1344x2992",
  "defaultAppVersionCode": "961145276",
  "bloksVersioningId": "7189b949425f9bf80ea8bd880cf5a3080b292d9b1c4b38a18d112f7c4b71e7a8"
}
```

## License

Apache Version 2.0

See [LICENSE](https://github.com/appit-online/insta-api-wrapper/blob/master/LICENSE)
