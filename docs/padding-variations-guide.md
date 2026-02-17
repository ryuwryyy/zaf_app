# Padding Variations Testing Guide

This guide explains how to test the 6 padding variations requested by the client for the home screen.

## Overview

The client wants to see 6 variations of horizontal padding:
- **iOS**: 5%, 7%, and 10% padding (95%, 93%, and 90% content width)
- **Android**: 5%, 7%, and 10% padding (95%, 93%, and 90% content width)

## Configuration

The padding is controlled by constants at the top of `app/(tabs)/index.tsx`:

```typescript
const CONTENT_WIDTH_PERCENT_IOS = 0.95; // 95% width = 5% padding on each side
const CONTENT_WIDTH_PERCENT_ANDROID = 0.95; // 95% width = 5% padding on each side
```

## Testing Each Variation

### For iOS (iPhone 16 or any iOS device):

1. **5% padding (95% width)**:
   - Set `CONTENT_WIDTH_PERCENT_IOS = 0.95`
   - Run: `npm run ios` or `expo start --ios`
   - Take a screenshot of the home screen

2. **7% padding (93% width)**:
   - Set `CONTENT_WIDTH_PERCENT_IOS = 0.93`
   - Run: `npm run ios` or `expo start --ios`
   - Take a screenshot of the home screen

3. **10% padding (90% width)**:
   - Set `CONTENT_WIDTH_PERCENT_IOS = 0.90`
   - Run: `npm run ios` or `expo start --ios`
   - Take a screenshot of the home screen

### For Android (any Android device):

1. **5% padding (95% width)**:
   - Set `CONTENT_WIDTH_PERCENT_ANDROID = 0.95`
   - Run: `npm run android` or `expo start --android`
   - Take a screenshot of the home screen

2. **7% padding (93% width)**:
   - Set `CONTENT_WIDTH_PERCENT_ANDROID = 0.93`
   - Run: `npm run android` or `expo start --android`
   - Take a screenshot of the home screen

3. **10% padding (90% width)**:
   - Set `CONTENT_WIDTH_PERCENT_ANDROID = 0.90`
   - Run: `npm run android` or `expo start --android`
   - Take a screenshot of the home screen

## Quick Reference

| Platform | Padding % | Content Width % | Constant Value |
|----------|-----------|-----------------|----------------|
| iOS      | 5%        | 95%             | 0.95           |
| iOS      | 7%        | 93%             | 0.93           |
| iOS      | 10%       | 90%             | 0.90           |
| Android  | 5%        | 95%             | 0.95           |
| Android  | 7%        | 93%             | 0.93           |
| Android  | 10%       | 90%             | 0.90           |

## How to capture screenshots

You only need to change one constant at a time and **reload** the app (no need to restart the dev server).

### iOS Simulator (e.g. iPhone 16)

1. Run the app: `npm run ios` or `npx expo start` then press `i` for iOS.
2. In `app/(tabs)/index.tsx`, set `CONTENT_WIDTH_PERCENT_IOS` to `0.95`, `0.93`, or `0.90`.
3. Reload: in the terminal where Expo is running press **`r`**, or in the simulator menu **Device → Reload** (or shake device → Reload).
4. Open the **Home** tab and take a screenshot:
   - **Keyboard:** **⌘ + S** (Mac) to save the simulator window to the desktop (or **File → Save Screen**).
   - Screenshots are usually saved to the Desktop or `~/Desktop`.

Repeat steps 2–4 for each iOS variation (0.95, 0.93, 0.90), then do the same for Android using `CONTENT_WIDTH_PERCENT_ANDROID`.

### Android Emulator

1. Run the app: `npm run android` or `npx expo start` then press `a` for Android.
2. In `app/(tabs)/index.tsx`, set `CONTENT_WIDTH_PERCENT_ANDROID` to `0.95`, `0.93`, or `0.90`.
3. Reload: press **`r`** in the Expo terminal (or shake device → Reload).
4. Open the **Home** tab and take a screenshot:
   - **Emulator toolbar:** click the **camera** icon on the right side of the emulator window to capture a screenshot.
   - Or **Ctrl + S** (Windows/Linux) / **⌘ + S** (Mac) in some setups.
   - Screenshots are usually saved in a folder like `.../Android/sdk/...` or you’ll get a save dialog.

### Naming the images

When saving, name them so the client can tell them apart, for example:

- `home-ios-95pct.png`, `home-ios-93pct.png`, `home-ios-90pct.png`
- `home-android-95pct.png`, `home-android-93pct.png`, `home-android-90pct.png`

## Notes

- The padding is applied to both the header and the scrollable content area
- The progress circle size automatically adjusts to respect the new padding
- Background images and colors remain unchanged - only the horizontal padding changes
- After changing the constants, reload the app (press `r` in the Expo terminal, or shake device → Reload)

## Screenshot Checklist

- [ ] iOS - 5% padding (95% width)
- [ ] iOS - 7% padding (93% width)
- [ ] iOS - 10% padding (90% width)
- [ ] Android - 5% padding (95% width)
- [ ] Android - 7% padding (93% width)
- [ ] Android - 10% padding (90% width)
