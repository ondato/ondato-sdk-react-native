import Foundation
import OndatoSDK
import React

@objc public class OndatoLogic: NSObject {
  private var resolve: RCTPromiseResolveBlock?
  private var reject: RCTPromiseRejectBlock?
  
  @objc public func startIdentification(
    config: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      let conf: OndatoConfiguration
      do {
        conf = try OndatoConfiguration.fromDictionary(config)
      } catch {
        reject("INVALID_CONFIG", "Failed to parse config: \(error.localizedDescription)", error)
        return
      }
      
      OndatoLog.setLogLevel(index: conf.logLevel)
      
      // Configure Ondato SDK
      Ondato.sdk.setIdentityVerificationId(conf.identityVerificationId)
      Ondato.sdk.configuration.mode = conf.mode
      Ondato.sdk.configuration.flowConfiguration.skipRegistrationIfDriverLicense = conf.skipRegistrationIfDriverLicense
      Ondato.sdk.configuration.flowConfiguration.showTranslationKeys = conf.showTranslationKeys
      Ondato.sdk.configuration.flowConfiguration.showNoInternetConnectionView = conf.showNoInternetConnectionView
      Ondato.sdk.configuration.flowConfiguration.disablePdfFileUpload = conf.disablePdfFileUpload
      Ondato.sdk.configuration.flowConfiguration.switchPrimaryButtons = conf.switchPrimaryButtons
      
      let language = conf.language
      OndatoLocalizeHelper.shared.setLanguage(code: language.identifier)
      // By convention, check for a user-provided "OndatoSDK.strings" file.
      let customTableName = "OndatoSDK"
      // Manually find the localized strings file for the active language, load it into a
      // dictionary, and pass it directly to the Ondato SDK.
      if let path = Bundle.main.path(forResource: customTableName, ofType: "strings", inDirectory: nil, forLocalization: language.identifier),
         let translations = NSDictionary(contentsOfFile: path) as? [String: String] {
        OndatoLocalizeHelper.shared.setLocalization(table: translations, for: language)
      }
      
      if let appearance = conf.appearance {
        if let appearanceJson = appearance.data(using: .utf8) {
          do {
            try Ondato.sdk.setWhitelabel(appearanceJson)
          } catch {
            reject("INVALID_APPEARANCE", "Failed to set appearance: \(error.localizedDescription)", error)
            return
          }
        } else {
          reject("INVALID_APPEARANCE", "Failed to convert appearance JSON to data", nil)
          return
        }
      }
      
      // Apply provided fonts
      if let fontsDict = config["fonts"] as? [String: Any] {
        self.applyCustomFonts(fontsDict: fontsDict)
      }
      
      // Apply custom illustrations
      self.applyCustomIllustrations()
      
      // Present view controller
      guard let root = RCTPresentedViewController() else {
        reject("NO_UI", "No presented view controller", nil)
        return
      }
      
      let sdkVC = Ondato.sdk.instantiateOndatoViewController()
      sdkVC.modalPresentationStyle = .fullScreen
      Ondato.sdk.delegate = self
      
      root.present(sdkVC, animated: true, completion: nil)
      
      self.resolve = resolve
      self.reject = reject
    }
  }
  
  @objc public func getLogs() -> String {
    return OndatoLog.shared.logs.joined(separator: "\n")
  }
}

extension OndatoLogic: OndatoFlowDelegate {
  public func flowDidSucceed(identificationId: String?) {
    finish(with: ["status": "success", "id": identificationId ?? ""])
  }
  
  public func flowDidFail(identificationId: String?, error: OndatoServiceError) {
    finish(with: [
      "status": "failure",
      "id": identificationId ?? "",
      "error": error.code
    ])
  }
  
  private func finish(with result: [String: Any]) {
    resolve?(result)
    resolve = nil
    reject = nil
  }
  
  private func applyCustomFonts(fontsDict: [String: Any]) {
    guard !fontsDict.isEmpty else {
      return
    }
    
    // Helper to create a UIFont from the dictionary.
    func createFont(from fontInfo: [String: Any]) -> UIFont? {
      guard let postScriptName = fontInfo["postScriptName"] as? String else {
        return nil
      }
      
      let size = fontInfo["size"] as? CGFloat ?? 16.0
      
      var weight: UIFont.Weight = .regular
      if let weightString = fontInfo["weight"] as? String {
        switch weightString {
        case "ultralight": weight = .ultraLight
        case "thin": weight = .thin
        case "light": weight = .light
        case "regular": weight = .regular
        case "medium": weight = .medium
        case "semibold": weight = .semibold
        case "bold": weight = .bold
        case "heavy": weight = .heavy
        case "black": weight = .black
        default: weight = .regular
        }
      }
      
      // This descriptor approach to get a font with a specific weight.
      guard let font = UIFont(name: postScriptName, size: size) else {
        print("Warning: Failed to load font with PostScript name '\(postScriptName)' – check bundling in Info.plist.")
        return nil
      }
      let descriptor = font.fontDescriptor.addingAttributes([
        .traits: [UIFontDescriptor.TraitKey.weight: weight]
      ])
      return UIFont(descriptor: descriptor, size: size)
    }
    
    // Create the fonts if they are provided in the dictionary.
    let titleFont = (fontsDict["title"] as? [String: Any]).flatMap(createFont)
    let subtitleFont = (fontsDict["subtitle"] as? [String: Any]).flatMap(createFont)
    let bodyFont = (fontsDict["body"] as? [String: Any]).flatMap(createFont)
    let listFont = (fontsDict["list"] as? [String: Any]).flatMap(createFont)
    let buttonFont = (fontsDict["button"] as? [String: Any]).flatMap(createFont)
    
    // Check if at least one font was successfully created.
    if titleFont != nil || subtitleFont != nil || bodyFont != nil || listFont != nil || buttonFont != nil {
      Ondato.sdk.configuration.resources.fonts = OndatoFonts(
        heading1: titleFont,
        heading2: subtitleFont,
        normal: bodyFont,
        list: listFont,
        button: buttonFont
      )
    } else {
      print("Warning: No valid custom fonts provided or loaded.")
    }
  }
  
  private func applyCustomIllustrations() {
    let resources = Ondato.sdk.configuration.resources
    let images = resources.images
    let animations = resources.animations
    
    // --- Part A: Simple Top-Level Images ---
    // Maps to: OndatoImages.backButton, .closeButton, .warning
    if let image = UIImage(named: "ondato.images.backButton") { images.backButton = image }
    if let image = UIImage(named: "ondato.images.closeButton") { images.closeButton = image }
    if let image = UIImage(named: "ondato.images.warning") { images.warning = image }
    
    // --- Part B: Document Selection Icons ---
    // Maps to: OndatoDocumentImages.selectionCardIcons
    var customSelectionIcons = [OndatoDocumentType: UIImage]()
    if let image = UIImage(named: "ondato.images.documentImages.selectionCardIcons.passport") { customSelectionIcons[.passport] = image }
    if let image = UIImage(named: "ondato.images.documentImages.selectionCardIcons.idCard") { customSelectionIcons[.idCard] = image }
    if let image = UIImage(named: "ondato.images.documentImages.selectionCardIcons.drivingLicence") { customSelectionIcons[.drivingLicence] = image }
    if let image = UIImage(named: "ondato.images.documentImages.selectionCardIcons.residencePermit") { customSelectionIcons[.residencePermit] = image }
    if let image = UIImage(named: "ondato.images.documentImages.selectionCardIcons.internalPassport") { customSelectionIcons[.internalPassport] = image }
    if let image = UIImage(named: "ondato.images.documentImages.selectionCardIcons.socialIdentityCard") { customSelectionIcons[.socialIdentityCard] = image }
    if !customSelectionIcons.isEmpty {
      images.documentImages = OndatoDocumentImages(selectionCardIcons: customSelectionIcons)
    }
    
    // --- Part C: Document Capture Instruction Images ---
    // Maps to: OndatoImages.documentCaptureInstructions
    var customDocInstructions = [OndatoDocumentType: [OndatoDocumentPart: UIImage]]()
    
    var passportParts = [OndatoDocumentPart: UIImage]()
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.passport.front") { passportParts[.front] = image }
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.passport.back") { passportParts[.back] = image }
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.passport.frontCover") { passportParts[.frontCover] = image }
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.passport.dataPage") { passportParts[.dataPage] = image }
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.passport.blankPages") { passportParts[.blankPages] = image }
    if !passportParts.isEmpty { customDocInstructions[.passport] = passportParts }
    
    var idCardParts = [OndatoDocumentPart: UIImage]()
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.idCard.front") { idCardParts[.front] = image }
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.idCard.back") { idCardParts[.back] = image }
    if !idCardParts.isEmpty { customDocInstructions[.idCard] = idCardParts }
    
    var drivingLicenceParts = [OndatoDocumentPart: UIImage]()
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.drivingLicence.front") { drivingLicenceParts[.front] = image }
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.drivingLicence.back") { drivingLicenceParts[.back] = image }
    if !drivingLicenceParts.isEmpty { customDocInstructions[.drivingLicence] = drivingLicenceParts }
    
    var residencePermitParts = [OndatoDocumentPart: UIImage]()
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.residencePermit.front") { residencePermitParts[.front] = image }
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.residencePermit.back") { residencePermitParts[.back] = image }
    if !residencePermitParts.isEmpty { customDocInstructions[.residencePermit] = residencePermitParts }
    
    var internalPassportParts = [OndatoDocumentPart: UIImage]()
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.internalPassport.front") { internalPassportParts[.front] = image }
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.internalPassport.back") { internalPassportParts[.back] = image }
    if !internalPassportParts.isEmpty { customDocInstructions[.internalPassport] = internalPassportParts }
    
    var socialIdParts = [OndatoDocumentPart: UIImage]()
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.socialIdentityCard.front") { socialIdParts[.front] = image }
    if let image = UIImage(named: "ondato.images.documentCaptureInstructions.socialIdentityCard.back") { socialIdParts[.back] = image }
    if !socialIdParts.isEmpty { customDocInstructions[.socialIdentityCard] = socialIdParts }
    
    if !customDocInstructions.isEmpty {
      images.documentCaptureInstructions = customDocInstructions
    }
    
    // --- Part D: Additional Document Capture Instruction Images ---
    // Maps to: OndatoImages.additionalDocumentCaptureInstructions
    var customAddDocInstructions = [OndatoAdditionalDocumentType: UIImage]()
    if let image = UIImage(named: "ondato.images.additionalDocumentCaptureInstructions.proofOfAddress") { customAddDocInstructions[.proofOfAddress] = image }
    if let image = UIImage(named: "ondato.images.additionalDocumentCaptureInstructions.selfieWithDocument") { customAddDocInstructions[.selfieWithDocument] = image }
    if !customAddDocInstructions.isEmpty {
      images.additionalDocumentCaptureInstructions = customAddDocInstructions
    }
    
    // --- Part E: Face Capture Instruction Images ---
    // Maps to: OndatoImages.faceCaptureInstructions
    var customFaceInstructions = [OndatoFaceCaptureType: UIImage]()
    if let image = UIImage(named: "ondato.images.faceCaptureInstructions.activeLiveness") { customFaceInstructions[.activeLiveness] = image }
    if let image = UIImage(named: "ondato.images.faceCaptureInstructions.passiveLiveness") { customFaceInstructions[.passiveLiveness] = image }
    if let image = UIImage(named: "ondato.images.faceCaptureInstructions.faceAuth") { customFaceInstructions[.faceAuth] = image }
    if !customFaceInstructions.isEmpty {
      images.faceCaptureInstructions = customFaceInstructions
    }
    
    // --- Part F: NFC Instruction Images ---
    // Maps to: OndatoImages.nfcCaptureInstructions
    var customNFCInstructions = [OndatoDocumentType: [OndatoNFCCaptureComponent: UIImage]]()
    
    var nfcPassportParts = [OndatoNFCCaptureComponent: UIImage]()
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.passport.mrz") { nfcPassportParts[.mrz] = image }
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.passport.nfc") { nfcPassportParts[.nfc] = image }
    if !nfcPassportParts.isEmpty { customNFCInstructions[.passport] = nfcPassportParts }
    
    var nfcIdCardParts = [OndatoNFCCaptureComponent: UIImage]()
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.idCard.mrz") { nfcIdCardParts[.mrz] = image }
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.idCard.nfc") { nfcIdCardParts[.nfc] = image }
    if !nfcIdCardParts.isEmpty { customNFCInstructions[.idCard] = nfcIdCardParts }
    
    var nfcDrivingLicenceParts = [OndatoNFCCaptureComponent: UIImage]()
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.drivingLicence.mrz") { nfcDrivingLicenceParts[.mrz] = image }
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.drivingLicence.nfc") { nfcDrivingLicenceParts[.nfc] = image }
    if !nfcDrivingLicenceParts.isEmpty { customNFCInstructions[.drivingLicence] = nfcDrivingLicenceParts }
    
    var nfcResidencePermitParts = [OndatoNFCCaptureComponent: UIImage]()
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.residencePermit.mrz") { nfcResidencePermitParts[.mrz] = image }
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.residencePermit.nfc") { nfcResidencePermitParts[.nfc] = image }
    if !nfcResidencePermitParts.isEmpty { customNFCInstructions[.residencePermit] = nfcResidencePermitParts }
    
    var nfcInternalPassportParts = [OndatoNFCCaptureComponent: UIImage]()
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.internalPassport.mrz") { nfcInternalPassportParts[.mrz] = image }
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.internalPassport.nfc") { nfcInternalPassportParts[.nfc] = image }
    if !nfcInternalPassportParts.isEmpty { customNFCInstructions[.internalPassport] = nfcInternalPassportParts }
    
    var nfcSocialIdParts = [OndatoNFCCaptureComponent: UIImage]()
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.socialIdentityCard.mrz") { nfcSocialIdParts[.mrz] = image }
    if let image = UIImage(named: "ondato.images.nfcCaptureInstructions.socialIdentityCard.nfc") { nfcSocialIdParts[.nfc] = image }
    if !nfcSocialIdParts.isEmpty { customNFCInstructions[.socialIdentityCard] = nfcSocialIdParts }
    
    if !customNFCInstructions.isEmpty {
      images.nfcCaptureInstructions = customNFCInstructions
    }
    
    // --- Part G: Lottie Animations ---
    // Maps to: OndatoAnimations.waitingScreenAnimationFilePath
    let animationName = "ondato.animations.waitingScreenAnimation"
    if let animationPath = Bundle.main.path(forResource: animationName, ofType: "json") {
      animations.waitingScreenAnimationFilePath = animationPath
    }
  }
}


extension OndatoServiceError {
  var code: String {
    switch type {
    case .cancelled: return "CANCELLED"
    case .consentDenied: return "CONSENT_DENIED"
    case .invalidServerResponse: return "INVALID_SERVER_RESPONSE"
    case .invalidCredentials: return "INVALID_CREDENTIALS"
    case .recorderPermissions: return "RECORDER_PERMISSIONS"
    case .unexpectedInternalError: return "UNEXPECTED_INTERNAL_ERROR"
    case .verificationFailed: return "VERIFICATION_FAILED"
    case .nfcNotSupported: return "NFC_NOT_SUPPORTED"
    case .missingModule: return "MISSING_MODULE"
    case .hostCanceled: return "HOST_CANCELED"
    @unknown default: return "UNKNOWN_ERROR"
    }
  }
}
