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
    let langCode = dict["language"] as? String
    let language: OndatoSupportedLanguage = {
      guard let code = langCode?.uppercased() else { return nil }
      switch code {
      case "BG": return .BG
      case "CA": return .CA
      case "CS": return .CS
      case "DE": return .DE
      case "EL": return .EL
      case "EN": return .EN
      case "ES": return .ES
      case "ET": return .ET
      case "FI": return .FI
      case "FR": return .FR
      case "HU": return .HU
      case "IT": return .IT
      case "LT": return .LT
      case "LV": return .LV
      case "NL": return .NL
      case "PL": return .PL
      case "PT": return .PT
      case "RO": return .RO
      case "RU": return .RU
      case "SK": return .SK
      case "SQ": return .SQ
      case "SV": return .SV
      case "UA": return .UA
      case "VI": return .VI
      default: return nil
      }
    }() ?? .EN
    
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
