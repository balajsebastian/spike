# Spike

A loud glucose alarm app for people with diabetes (or their loved ones) who need alerts that actually wake them up at night.

The default CGM apps often have quiet alarms that aren't enough during sleep. Spike fixes that with aggressive sound and haptic alerts that cut through the silence.

## Supported CGM Sources

- **Dexcom Share** (G6, G7, ONE)
- **LibreLinkUp** (Libre 2, Libre 3)
- **Nightscout** (any CGM via your self-hosted instance)

## Features

- Large, readable glucose display — optimized for nightstand mode
- Loud alarm with haptic feedback that plays even in silent mode
- Configurable thresholds (urgent low, low, high)
- Trend alerts (rapid rise/fall)
- Snooze (1–15 min, default 5)
- Keep screen on option
- Dark and light themes
- mg/dL and mmol/L units
- No data collection — credentials stay on your device

## Getting Started

```bash
# Install dependencies
npm install

# Run on iOS simulator (requires Xcode)
npx expo run:ios

# Run on Android emulator (requires Android Studio)
npx expo run:android
```

> **Note:** This app uses native modules (expo-audio, expo-crypto, expo-haptics) and requires a development build. It will not work in Expo Go.

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

## Disclaimer

Spike is **not a medical device**. It is a personal helper that displays glucose data from your existing CGM system. Do not make treatment decisions based solely on this app. Always verify with your official CGM app or a blood glucose meter.

## Privacy

No data is collected, stored, or transmitted. Your credentials are stored locally on your device using the OS secure keychain. Glucose data is fetched directly from your CGM provider. See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.

## Feedback

Found a bug or have a suggestion? Open an [issue](https://github.com/balajsebastian/spike/issues) or email balajdariussebastian@gmail.com.

## License

MIT
