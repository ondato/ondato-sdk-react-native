# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

### Deprecated

### Security

## [3.5.1] - 2026-06-22

### Fixed

- bump iOS deployment target to 16.4 for Expo modules compatibility

### Deprecated

- support for old React Native architecture

## [3.5.0] - 2026-06-12

### Added

- Support for navigation bar color customization via `brand.colors.navigationBarColor`
- Support for certificate icon color customization via `brand.colors.certificateColor`
- Support for modal whitelabel configuration via `modalConfiguration`
- New `showComplianceTextDocSelect` configuration property
- Support for additional iOS locales: `zh`, `th`, `pt-PT`, `ko`, and `da`
- Separate Portuguese locales for Android: `pt-PT` and `pt-BR`

### Changed

- **Android:** [Updated native SDK to v3.5.0](https://github.com/ondato/ondato-sdk-android/releases/tag/3.5.0)
- **iOS:** [Updated native SDK to v3.5.1](https://github.com/ondato/ondato-sdk-ios/releases/tag/3.5.1)

## [3.4.2] - 2026-05-27

### Changed

- **Android:** [Updated native SDK to v3.4.2](https://github.com/ondato/ondato-sdk-android/releases/tag/3.4.2)

## [3.4.1] - 2026-04-29

### Changed

- **Android:** [Updated native SDK to v3.4.1](https://github.com/ondato/ondato-sdk-android/releases/tag/3.4.1)
- **iOS:** [Updated native SDK to v3.2.4](https://github.com/ondato/ondato-sdk-ios/releases/tag/3.2.4)

## [3.4.0] - 2026-03-31

### Added

- Added Android language support for `da`, `ko`, `th`, and `zh`.
- Introduced unified `OndatoError` TypeScript union for identification results.
- Added comprehensive error handling tables and implementation examples to README.

### Changed

- **iOS:** [Updated native SDK to v3.2.3](https://github.com/ondato/ondato-sdk-ios/releases/tag/3.2.3)
- **Android:** [Updated native SDK to v3.4.0](https://github.com/ondato/ondato-sdk-android/releases/tag/3.4.0)
- Unified Flow Error codes across both platforms (e.g., `ABORTED`, `CONSENT_DECLINED`).
- Standardized Bridge Error rejections to `CONFIG_ERROR` and `UI_NOT_AVAILABLE` for platform parity.

## [3.3.1] - 2026-03-24

### Added

- Added `setSkipRegistrationIfDriverLicense` configuration property on Android.
- Added `requireScrollToEnableTermsButton` and `termsButtonTimeout` configuration properties on Android.

### Changed

- **iOS:** [Updated native SDK to v3.2.2](https://github.com/ondato/ondato-sdk-ios/releases/tag/3.2.2)
- **Android:** [Updated native SDK to v3.3.2](https://github.com/ondato/ondato-sdk-android/releases/tag/3.3.2)
