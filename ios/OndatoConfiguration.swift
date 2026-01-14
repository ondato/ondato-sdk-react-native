import Foundation
import OndatoSDK
import React

struct OndatoConfiguration {
  let identityVerificationId: String
  let mode: OndatoEnvironment
  let language: OndatoSupportedLanguage
  let showTranslationKeys: Bool
  let skipRegistrationIfDriverLicense: Bool
  let showNoInternetConnectionView: Bool
  let disablePdfFileUpload: Bool
  let switchPrimaryButtons: Bool
  let appearance: String?
  let logLevel: Int

  static func fromDictionary(_ dict: NSDictionary) throws -> OndatoConfiguration {
    // Required fields
    guard let id = dict["identityVerificationId"] as? String, !id.isEmpty else {
      throw NSError(domain: "OndatoConfig", code: 0, userInfo: [NSLocalizedDescriptionKey: "identityVerificationId is required and must be non-empty"])
    }

    // Mode
    let mode: OndatoEnvironment = (dict["mode"] as? String)?.lowercased() == "live" ? .live : .test

    // Booleans with defaults
    let showTransKeys = dict["showTranslationKeys"] as? Bool ?? false
    let skipReg = dict["skipRegistrationIfDriverLicense"] as? Bool ?? false
    let showNoInternet = dict["enableNetworkIssuesScreen"] as? Bool ?? true
    let disablePdf = dict["disablePdfFileUpload"] as? Bool ?? false
    let switchButtons = dict["switchPrimaryButtons"] as? Bool ?? false

    // Language
    let languageCode = dict["language"] as? String
    let language: OndatoSupportedLanguage

    switch (languageCode) {
    case "bg": language = .BG
    case "ca": language = .CA
    case "cs": language = .CS
    case "de": language = .DE
    case "el": language = .EL
    case "en": language = .EN
    case "es": language = .ES
    case "et": language = .ET
    case "fi": language = .FI
    case "fr": language = .FR
    case "hu": language = .HU
    case "it": language = .IT
    case "lt": language = .LT
    case "lv": language = .LV
    case "nl": language = .NL
    case "pl": language = .PL
    case "pt": language = .PT
    case "ro": language = .RO
    case "ru": language = .RU
    case "sk": language = .SK
    case "sq": language = .SQ
    case "sv": language = .SV
    case "uk": language = .UA
    case "vi": language = .VI
    default:
      language = .EN
    }

    // Appearance JSON
    let appearance = dict["appearance"] as? String

    // Logging level
    let logLevelString = dict["logLevel"] as? String ?? "info"
    let logLevel: Int = {
      switch logLevelString.lowercased() {
      case "debug": return 1
      case "error": return 2
      default: return 0  // info
      }
    }()

    return OndatoConfiguration(
      identityVerificationId: id,
      mode: mode,
      language: language,
      showTranslationKeys: showTransKeys,
      skipRegistrationIfDriverLicense: skipReg,
      showNoInternetConnectionView: showNoInternet,
      disablePdfFileUpload: disablePdf,
      switchPrimaryButtons: switchButtons,
      appearance: appearance,
      logLevel: logLevel
    )
  }
}
