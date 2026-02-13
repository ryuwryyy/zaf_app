# Push Notifications (Expo Push)

## What’s implemented

1. **Registration** – On app launch we request notification permission (if needed) and get an **Expo Push Token**.
2. **Storage** – The token is saved locally (`@zaf/expo_push_token`). You can send it to your backend so the server can target this device.
3. **Tap handling** – When the user taps a push, we open a screen if the payload includes `data.url` or `data.screen` (e.g. `"/goal-detail"`).

## Requirements

- **Android:** FCM credentials in EAS (you already uploaded the Firebase service account key). Use a **development build** (e.g. `eas build --platform android`); Expo Go does not support FCM push on Android.
- **iOS:** APNs credentials in EAS (needed for production). Configure in [EAS credentials](https://docs.expo.dev/build-reference/credentials/).
- **projectId** – Set in `app.json` under `extra.eas.projectId` (already set).

## How to send a push

### Option 1: Expo Push API (HTTP)

Send a `POST` request to Expo’s push service:

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "title": "ZAF リマインダー",
    "body": "瞑想の時間です。",
    "data": { "screen": "/(tabs)" }
  }'
```

- **to** – Expo Push Token (e.g. from `getStoredExpoPushToken()` or your backend). Format: `ExponentPushToken[xxx]`.
- **data** – Optional. Use `screen` (e.g. `"/(tabs)"`, `"/goal-detail"`) or `url` for deep link; the app will navigate when the user taps the notification.

### Option 2: Your backend

1. When the app gets the token, send it to your API (e.g. `POST /api/register-push` with `{ token }`).
2. Store the token per user/device in your DB.
3. When you want to send a push, call Expo’s API from your server (same JSON as above). You can send to multiple tokens in one request.

### Option 3: EAS Submit / dashboard

You can also send test notifications from the [Expo dashboard](https://expo.dev) if the project is linked.

## Getting the token for testing

- In the app, after opening once on a **physical device** (not simulator), the token is stored. You can expose it temporarily (e.g. in Profile/Settings or via `getStoredExpoPushToken()` and `console.log`) and use it in the `curl` above.
- Or implement a “Send test push” in your backend that uses the stored token.

## References

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Sending notifications](https://docs.expo.dev/push-notifications/sending-notifications/)
