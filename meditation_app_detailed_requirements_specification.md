## 1. Project Overview

### 1.1 Purpose
This application is a video-first meditation app designed to help users build and maintain a consistent meditation habit. It combines guided meditation videos, gentle reminders, inspirational content, and accurate meditation tracking in a calm, Zen-inspired user experience.

### 1.2 Goals
- Encourage daily meditation through structure and motivation
- Provide immersive, high-quality guided meditation sessions
- Accurately track meaningful meditation time
- Reduce user friction and cognitive load
- Enable future monetization through premium analytics features

### 1.3 Target Users
- Meditation beginners
- Users seeking habit-building support
- Users who prefer visual and guided meditation over audio-only timers

---

## 2. Core App Structure

### 2.1 Platforms
- iOS
- Android

### 2.2 User Authentication
- Anonymous or basic account system (email / social optional)
- Required to sync meditation history across devices

---

## 3. Onboarding & Initial Setup

### 3.1 Onboarding Flow
- Intro screens explaining the app concept
- Video-based visual introduction

### 3.2 Goal & Reminder Setup (Independent Screen)
- Weekly meditation goal (minutes per week)
- Daily reminder time(s)
- Tutorial-style UI
- Can be skipped

### 3.3 Permissions
- Notification permission (OS-native modal)
- Meditation tracking permission (skippable)

### 3.4 First-Time Home Guidance
- Coach-mark / spotlight UI
- Explains timer, guidance toggle, and session controls

---

## 4. Home Screen Requirements

### 4.1 Visual Design
- Video background
- Calm, minimal UI

### 4.2 Dynamic Content
- Daily meditation quote
- Daily recommended session (menu)
- Resume previous session button (if applicable)

---

## 5. Session (Meditation) System

### 5.1 Session Types
- Guidance-only sessions
- Guidance + meditate-together sessions

### 5.2 Session Video Requirements
Each session video must store:
- Total video duration
- Meditation-counted duration
- Guidance duration
- Whether meditation time should be counted

### 5.3 Meditation Time Calculation
- Only meditation-counted duration is added to:
  - Total meditation time
  - Session count
- Guidance-only portions are excluded

### 5.4 Session Resume
- If interrupted, session state is saved
- User can resume from the last position

---

## 6. Timer & Preferences

### 6.1 Timer Settings
- Adjustable meditation duration
- Guidance ON/OFF toggle

### 6.2 Persistence
- Last-used timer and guidance settings are restored on next app launch

---

## 7. Notifications

### 7.1 Reminder Notifications
- Morning reminder (default: 6:00 AM)
- Night reminder (default: 9:00 PM)
- Admin-configurable enable/disable
- Target users: active users (weekly login)

### 7.2 Campaign Notifications
- Manually triggered by admin
- Displayed as modal popup on Home screen
- Triggered on next login or Home open

### 7.3 Notification Infrastructure
- Firebase Cloud Messaging
- Designed for MAU 1,000–2,000

---

## 8. Content Rotation Logic

### 8.1 Daily Meditation Quotes
- Stored in database (approx. 100 items)
- Format: "Quote" – Author (Profession)
- Random selection
- Same quote cannot appear on consecutive days

### 8.2 Daily Menu
- One session selected per day
- Avoid consecutive repetition
- Can be optimized by session type

---

## 9. Achievements & Feedback

### 9.1 Achievement Types
- Consecutive days meditated (e.g. 7 days)
- Time-based milestones (e.g. 30 minutes)

### 9.2 Display
- Popup modal at achievement moment
- Server-side validation

---

## 10. Data & Sync

### 10.1 Local Storage
- Session progress
- Timer settings
- Last displayed quote/menu ID

### 10.2 Server Sync
- Meditation history
- Achievements
- User profile data

---

## 11. Premium Features (Post-Initial Release)

### 11.1 ANALYSIS Feature
- Meditation statistics
- Trend visualization
- Free users see locked UI only

### 11.2 Export
- CSV / PDF export of meditation history
- Premium users only

### 11.3 Payments
- App Store / Google Play native in-app purchase

---

## 12. Admin / Management Requirements

### 12.1 Content Management
- Session video upload
- Meditation-time metadata configuration
- Quote and menu management

### 12.2 Notification Control
- Enable/disable reminders
- Trigger campaign notifications

---

## 13. Non-Functional Requirements

### 13.1 Performance
- Smooth video playback
- Fast Home screen loading

### 13.2 UX Principles
- Calm, minimal, distraction-free
- No aggressive gamification

### 13.3 Privacy
- Meditation data treated as personal data
- Export functionality compliant with platform guidelines

---

## 14. Out of Scope (Initial Release)
- ANALYSIS feature UI
- Advanced social features
- Wearable integrations

---

## 15. Success Criteria
- Users complete onboarding
- Users meditate multiple days per week
- Accurate meditation time tracking
- Low churn during first 7 days

