# 💧 AgentWater

> Your personal AI hydration coach — smart reminders, daily tracking, and weekly/monthly insights. Available for iOS & Android.

![AgentWater Banner](./assets/banner.png)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Personalized Goal** | Daily water goal calculated from your weight, activity level & climate |
| 💧 **Quick Add** | One-tap logging with 7 preset amounts + custom entry |
| 🔔 **Smart Notifications** | iOS & Android push reminders at your chosen interval |
| 📊 **Weekly Summary** | Bar chart + insights for the last 7 days |
| 🗓 **Monthly Summary** | 30-day view with trend analysis |
| 🔥 **Streak Tracking** | Build daily hydration habits with streak badges |
| 🧑‍💻 **Onboarding** | 4-step personalization wizard |
| 🌙 **Dark/Light Aware** | Respects system appearance |

---

## 📱 Screenshots

> Add screenshots here after building the app.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+  
- [Expo CLI](https://docs.expo.dev/get-started/installation/)  
- [EAS CLI](https://docs.expo.dev/build/setup/) (for building)
- iOS Simulator (macOS only) or Android Emulator

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/AgentWater.git
cd AgentWater

# 2. Install dependencies
npm install

# 3. Start the Expo dev server
npm start
```

### Running on Devices

```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Physical device — scan the QR code with Expo Go app
npm start
```

> ⚠️ **Push notifications only work on physical devices**, not simulators.

---

## 🏗 Project Structure

```
AgentWater/
├── App.tsx                    # Root component + navigation
├── app.json                   # Expo configuration
├── src/
│   ├── context/
│   │   └── WaterContext.tsx   # Global state (entries, profile, history)
│   ├── hooks/
│   │   └── useNotifications.ts # Notification scheduling logic
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Main hydration tracker
│   │   ├── StatsScreen.tsx    # Weekly & monthly summaries
│   │   ├── SettingsScreen.tsx # Profile & notification settings
│   │   └── OnboardingScreen.tsx # First-time setup wizard
│   ├── components/
│   │   └── WaterBottle.tsx    # Animated water bottle UI
│   └── utils/
│       └── constants.ts       # Colors, quick-add options, tips
├── assets/                    # App icons, splash screen
└── package.json
```

---

## 🧮 Hydration Formula

AgentWater calculates your daily goal using a science-backed formula:

```
Daily Goal (ml) = (Weight × 35) × Activity Multiplier + Climate Bonus
```

| Activity Level | Multiplier |
|---|---|
| Sedentary | 1.0× |
| Light | 1.1× |
| Moderate | 1.2× |
| Active | 1.35× |
| Very Active | 1.5× |

| Climate | Bonus |
|---|---|
| Cold (< 15°C) | +0 ml |
| Temperate (15–25°C) | +200 ml |
| Hot (> 25°C) | +500 ml |

**Example:** 70kg, moderate activity, temperate climate = `(70 × 35) × 1.2 + 200 = **2,750ml**`

---

## 🔔 Notifications

AgentWater schedules **repeating local notifications** between your wake-up and sleep times at your chosen interval. No server required — everything runs on-device.

### iOS
- Requires explicit permission prompt
- Uses `expo-notifications`

### Android
- Creates a dedicated `hydration` notification channel
- Supports vibration patterns and custom colors

---

## 📦 Building for Production

### Setup EAS

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Update `app.json` with your bundle identifiers and EAS project ID.

### Build

```bash
# iOS (requires Apple Developer account)
npm run build:ios

# Android
npm run build:android
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| [Expo](https://expo.dev) | React Native framework |
| [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) | iOS & Android push notifications |
| [expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) | Beautiful gradients |
| [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) | Tactile feedback |
| [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) | Local persistence |
| [date-fns](https://date-fns.org/) | Date utilities |
| [React Navigation](https://reactnavigation.org/) | Tab navigation |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 💡 Roadmap

- [ ] Apple Watch / WearOS companion app
- [ ] Widget for home screen (iOS 16+ / Android)
- [ ] AI-powered hydration insights
- [ ] Caffeine tracker
- [ ] Integration with Apple Health / Google Fit
- [ ] Social streaks with friends
- [ ] Dark mode
- [ ] Localization (Spanish, French, Portuguese)

---

Made with 💧 and ❤️ — Stay hydrated!
