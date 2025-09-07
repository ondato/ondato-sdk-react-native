//
//  OndatoConfiguration.swift
//  Pods
//
//  Created by Darius Rainys on 01/09/2025.
//

import Foundation
import OndatoSDK
import React

struct OndatoConfiguration {
  let identityVerificationId: String
  let mode: OndatoEnvironment
  let showStartScreen: Bool
  let showSuccessWindow: Bool
  let removeSelfieFrame: Bool
  let skipRegistrationIfDriverLicense: Bool
  let language: OndatoSupportedLanguage
  let appearance: OndatoAppearance?
  
  static func fromDictionary(_ dict: NSDictionary) throws -> OndatoConfiguration {
    // Reject Android-only fields
    if dict["showSplashScreen"] != nil || dict["showWaitingScreen"] != nil || dict["showIdentificationWaitingPage"] != nil {
      throw NSError(domain: "OndatoConfig", code: 1, userInfo: [NSLocalizedDescriptionKey: "Android-only fields (showSplashScreen, showWaitingScreen, showIdentificationWaitingPage) not supported on iOS"])
    }
    
    // Required fields
    guard let id = dict["identityVerificationId"] as? String, !id.isEmpty else {
      throw NSError(domain: "OndatoConfig", code: 0, userInfo: [NSLocalizedDescriptionKey: "identityVerificationId is required and must be non-empty"])
    }
    
    // Mode
    let mode: OndatoEnvironment = (dict["mode"] as? String)?.lowercased() == "live" ? .live : .test
    
    // Booleans with defaults
    let showStart = dict["showStartScreen"] as? Bool ?? true
    let showSuccess = dict["showSuccessWindow"] as? Bool ?? false
    let removeFrame = dict["removeSelfieFrame"] as? Bool ?? false
    let skipReg = dict["skipRegistrationIfDriverLicense"] as? Bool ?? false
    
    // Language
    let langCode = (dict["language"] as? String ?? "en").uppercased()
    let language: OndatoSupportedLanguage = {
      switch langCode {
      case "BG": return .BG
      case "DE": return .DE
      case "EL": return .EL
      case "EN": return .EN
      case "ES": return .ES
      case "ET": return .ET
      case "FR": return .FR
      case "IT": return .IT
      case "LT": return .LT
      case "LV": return .LV
      case "NL": return .NL
      case "RO": return .RO
      case "RU": return .RU
      case "SQ": return .SQ
      default: return .EN
      }
    }()
    
    // Appearance
    let appearance = try parseAppearance(dict["appearance"] as? NSDictionary)
    
    return OndatoConfiguration(
      identityVerificationId: id,
      mode: mode,
      showStartScreen: showStart,
      showSuccessWindow: showSuccess,
      removeSelfieFrame: removeFrame,
      skipRegistrationIfDriverLicense: skipReg,
      language: language,
      appearance: appearance
    )
  }
  
  private static func parseAppearance(_ dict: NSDictionary?) throws -> OndatoAppearance? {
    guard let dict = dict else { return nil }
    let appear = OndatoAppearance()
    
    // Colors with defaults
    appear.progressColor = try colorFromHex(dict["progressColor"] as? String, "progressColor") ?? .systemBlue
    appear.buttonColor = try colorFromHex(dict["buttonColor"] as? String, "buttonColor") ?? .systemBlue
    appear.buttonTextColor = try colorFromHex(dict["buttonTextColor"] as? String, "buttonTextColor") ?? .white
    appear.errorColor = try colorFromHex(dict["errorColor"] as? String, "errorColor") ?? .red
    appear.errorTextColor = try colorFromHex(dict["errorTextColor"] as? String, "errorTextColor") ?? .white
    appear.textColor = try colorFromHex(dict["textColor"] as? String, "textColor") ?? .black
    appear.backgroundColor = try colorFromHex(dict["backgroundColor"] as? String, "backgroundColor") ?? .white
    appear.imageTintColor = try colorFromHex(dict["imageTintColor"] as? String, "imageTintColor") ?? .black
    
    // Consent window
    if let consentDict = dict["consentWindow"] as? NSDictionary {
      let consent = OndatoConsentAppearance()
      consent.header = try parseLabel(consentDict["header"] as? NSDictionary, "consentWindow.header") ?? OndatoLabelAppearance()
      consent.body = try parseTextView(consentDict["body"] as? NSDictionary, "consentWindow.body") ?? OndatoTextViewAppearance()
      consent.acceptButton = try parseButton(consentDict["acceptButton"] as? NSDictionary, "consentWindow.acceptButton") ?? OndatoButtonAppearance()
      consent.declineButton = try parseButton(consentDict["declineButton"] as? NSDictionary, "consentWindow.declineButton") ?? OndatoButtonAppearance()
      appear.consentWindow = consent
    }
    
    return appear
  }
  
  private static func colorFromHex(_ hex: String?, _ field: String) throws -> UIColor? {
    guard let hex = hex, hex.hasPrefix("#"), let rgb = Int(hex.dropFirst(), radix: 16) else {
      if hex != nil { throw NSError(domain: "OndatoConfig", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid hex color for \(field)"]) }
      return nil
    }
    return UIColor(red: CGFloat((rgb >> 16) & 0xFF) / 255, green: CGFloat((rgb >> 8) & 0xFF) / 255, blue: CGFloat(rgb & 0xFF) / 255, alpha: 1)
  }
  
  private static func fontFromDict(_ dict: NSDictionary?, _ field: String) throws -> UIFont? {
    guard let dict = dict else { return nil }
    
    // Validate and extract font size
    guard let sizeValue = dict["size"] else {
      throw NSError(domain: "OndatoConfig", code: 3, userInfo: [NSLocalizedDescriptionKey: "Missing font size for \(field)"])
    }
    
    guard let size = sizeValue as? CGFloat else {
      throw NSError(domain: "OndatoConfig", code: 3, userInfo: [NSLocalizedDescriptionKey: "Invalid font size type for \(field). Expected number, got \(type(of: sizeValue))"])
    }
    
    guard size > 0 else {
      throw NSError(domain: "OndatoConfig", code: 3, userInfo: [NSLocalizedDescriptionKey: "Font size must be positive for \(field). Got: \(size)"])
    }
    
    // Extract font name and weight
    let name = dict["name"] as? String
    let weight: UIFont.Weight = {
      guard let weightString = dict["weight"] as? String else { return .regular }
      
      switch weightString.lowercased() {
      case "ultralight": return .ultraLight
      case "thin": return .thin
      case "light": return .light
      case "medium": return .medium
      case "semibold": return .semibold
      case "bold": return .bold
      case "heavy": return .heavy
      case "black": return .black
      default: return .regular
      }
    }()
    
    // Create and return the font
    if let fontName = name {
      // For custom named fonts
      guard let font = UIFont(name: fontName, size: size) else {
        throw NSError(domain: "OndatoConfig", code: 3, userInfo: [NSLocalizedDescriptionKey: "Invalid font name '\(fontName)' for \(field)"])
      }
      return font
    } else {
      // For system fonts with weight
      return UIFont.systemFont(ofSize: size, weight: weight)
    }
  }
  
  private static func parseLabel(_ dict: NSDictionary?, _ field: String) throws -> OndatoLabelAppearance? {
    guard let dict = dict else { return nil }
    let label = OndatoLabelAppearance()
    guard let font = try fontFromDict(dict["font"] as? NSDictionary, "\(field).font") else {
      throw NSError(domain: "OndatoConfig", code: 3, userInfo: [NSLocalizedDescriptionKey: "Invalid font for \(field)"])
    }
    label.font = font
    guard let color = try colorFromHex(dict["color"] as? String, "\(field).color") else {
      throw NSError(domain: "OndatoConfig", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid color for \(field)"])
    }
    label.color = color
    return label
  }
  
  private static func parseTextView(_ dict: NSDictionary?, _ field: String) throws -> OndatoTextViewAppearance? {
    guard let dict = dict else { return nil }
    let textView = OndatoTextViewAppearance()
    guard let font = try fontFromDict(dict["font"] as? NSDictionary, "\(field).font") else {
      throw NSError(domain: "OndatoConfig", code: 3, userInfo: [NSLocalizedDescriptionKey: "Invalid font for \(field)"])
    }
    textView.font = font
    guard let textColor = try colorFromHex(dict["textColor"] as? String, "\(field).textColor") else {
      throw NSError(domain: "OndatoConfig", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid textColor for \(field)"])
    }
    textView.textColor = textColor
    return textView
  }
  
  private static func parseButton(_ dict: NSDictionary?, _ field: String) throws -> OndatoButtonAppearance? {
    guard let dict = dict else { return nil }
    let button = OndatoButtonAppearance()
    guard let font = try fontFromDict(dict["font"] as? NSDictionary, "\(field).font") else {
      throw NSError(domain: "OndatoConfig", code: 3, userInfo: [NSLocalizedDescriptionKey: "Invalid font for \(field)"])
    }
    button.font = font
    guard let bgColor = try colorFromHex(dict["backgroundColor"] as? String, "\(field).backgroundColor") else {
      throw NSError(domain: "OndatoConfig", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid backgroundColor for \(field)"])
    }
    button.backgroundColor = bgColor
    guard let tintColor = try colorFromHex(dict["tintColor"] as? String, "\(field).tintColor") else {
      throw NSError(domain: "OndatoConfig", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid tintColor for \(field)"])
    }
    button.tintColor = tintColor
    guard let borderColor = try colorFromHex(dict["borderColor"] as? String, "\(field).borderColor") else {
      throw NSError(domain: "OndatoConfig", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid borderColor for \(field)"])
    }
    button.borderColor = borderColor
    button.borderWidth = dict["borderWidth"] as? CGFloat ?? 0
    button.cornerRadius = dict["cornerRadius"] as? CGFloat ?? 0
    return button
  }
}
