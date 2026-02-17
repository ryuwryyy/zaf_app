# Padding Variations Testing Guide

This guide explains how to test the 6 padding variations requested by the client for the home screen.

## Overview

The client wants to see 6 variations of horizontal padding:
- **iOS**: 10%, 14%, and 16% padding (90%, 86%, and 84% content width)
- **Android**: 10%, 14%, and 16% padding (90%, 86%, and 84% content width)

## Configuration

The padding is controlled by constants at the top of `app/(tabs)/index.tsx`:

```typescript
const CONTENT_WIDTH_PERCENT_IOS = 0.90; // 90% width = 10% padding on each side
const CONTENT_WIDTH_PERCENT_ANDROID = 0.90; // 90% width = 10% padding on each side
```

## Testing Each Variation

### For iOS (iPhone 16 or any iOS device):

1. **10% padding (90% width)**:
   - Set `CONTENT_WIDTH_PERCENT_IOS = 0.90`
   - Run: `npm run ios` or `expo start --ios`
   - Take a screenshot of the home screen

2. **14% padding (86% width)**:
   - Set `CONTENT_WIDTH_PERCENT_IOS = 0.86`
   - Run: `npm run ios` or `expo start --ios`
   - Take a screenshot of the home screen

3. **16% padding (84% width)**:
   - Set `CONTENT_WIDTH_PERCENT_IOS = 0.84`
   - Run: `npm run ios` or `expo start --ios`
   - Take a screenshot of the home screen

### For Android (any Android device):

1. **10% padding (90% width)**:
   - Set `CONTENT_WIDTH_PERCENT_ANDROID = 0.90`
   - Run: `npm run android` or `expo start --android`
   - Take a screenshot of the home screen

2. **14% padding (86% width)**:
   - Set `CONTENT_WIDTH_PERCENT_ANDROID = 0.86`
   - Run: `npm run android` or `expo start --android`
   - Take a screenshot of the home screen

3. **16% padding (84% width)**:
   - Set `CONTENT_WIDTH_PERCENT_ANDROID = 0.84`
   - Run: `npm run android` or `expo start --android`
   - Take a screenshot of the home screen

## Quick Reference

| Platform | Padding % | Content Width % | Constant Value |
|----------|-----------|-----------------|----------------|
| iOS      | 10%       | 90%             | 0.90           |
| iOS      | 14%       | 86%             | 0.86           |
| iOS      | 16%       | 84%             | 0.84           |
| Android  | 10%       | 90%             | 0.90           |
| Android  | 14%       | 86%             | 0.86           |
| Android  | 16%       | 84%             | 0.84           |

## How to capture screenshots

You only need to change one constant at a time and **reload** the app (no need to restart the dev server).

### iOS Simulator (e.g. iPhone 16)

1. Run the app: `npm run ios` or `npx expo start` then press `i` for iOS.
2. In `app/(tabs)/index.tsx`, set `CONTENT_WIDTH_PERCENT_IOS` to `0.90`, `0.86`, or `0.84`.
3. Reload: in the terminal where Expo is running press **`r`**, or in the simulator menu **Device → Reload** (or shake device → Reload).
4. Open the **Home** tab and take a screenshot:
   - **Keyboard:** **⌘ + S** (Mac) to save the simulator window to the desktop (or **File → Save Screen**).
   - Screenshots are usually saved to the Desktop or `~/Desktop`.

Repeat steps 2–4 for each iOS variation (0.90, 0.86, 0.84), then do the same for Android using `CONTENT_WIDTH_PERCENT_ANDROID`.

### Android Emulator

1. Run the app: `npm run android` or `npx expo start` then press `a` for Android.
2. In `app/(tabs)/index.tsx`, set `CONTENT_WIDTH_PERCENT_ANDROID` to `0.90`, `0.86`, or `0.84`.
3. Reload: press **`r`** in the Expo terminal (or shake device → Reload).
4. Open the **Home** tab and take a screenshot:
   - **Emulator toolbar:** click the **camera** icon on the right side of the emulator window to capture a screenshot.
   - Or **Ctrl + S** (Windows/Linux) / **⌘ + S** (Mac) in some setups.
   - Screenshots are usually saved in a folder like `.../Android/sdk/...` or you’ll get a save dialog.

### Naming the images

When saving, name them so the client can tell them apart, for example:

- `home-ios-90pct.png`, `home-ios-86pct.png`, `home-ios-84pct.png`
- `home-android-90pct.png`, `home-android-86pct.png`, `home-android-84pct.png`

## Notes

- The padding is applied to both the header and the scrollable content area
- The progress circle size automatically adjusts to respect the new padding
- Background images and colors remain unchanged - only the horizontal padding changes
- After changing the constants, reload the app (press `r` in the Expo terminal, or shake device → Reload)

## Screenshot Checklist

- [ ] iOS - 10% padding (90% width)
- [ ] iOS - 14% padding (86% width)
- [ ] iOS - 16% padding (84% width)
- [ ] Android - 10% padding (90% width)
- [ ] Android - 14% padding (86% width)
- [ ] Android - 16% padding (84% width)

## Alternative: HTML Mockup for iOS Screenshots

If you don't have access to an iOS Simulator, you can use the HTML mockup file:

1. Open `assets/home-padding-mockup.html` in your browser
2. Use the dropdown to select: **90%**, **86%**, or **84%**
3. Take a screenshot of the phone frame (or use browser DevTools device toolbar set to iPhone)
4. Save as `home-ios-90pct.png`, `home-ios-86pct.png`, `home-ios-84pct.png`

This gives you iOS-style mockup screenshots that match the app's layout and padding logic.
