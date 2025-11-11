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
      
      // Configure Ondato SDK
      Ondato.sdk.setIdentityVerificationId(conf.identityVerificationId)
      Ondato.sdk.configuration.mode = conf.mode
      Ondato.sdk.configuration.flowConfiguration.showStartScreen = conf.showStartScreen
      Ondato.sdk.configuration.flowConfiguration.showSuccessWindow = conf.showSuccessWindow
      Ondato.sdk.configuration.flowConfiguration.removeSelfieFrame = conf.removeSelfieFrame
      Ondato.sdk.configuration.flowConfiguration.skipRegistrationIfDriverLicense = conf.skipRegistrationIfDriverLicense
      OndatoLocalizeHelper.shared.language = conf.language
      if let appearance = conf.appearance {
        Ondato.sdk.configuration.appearance = appearance
      }
      
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
}

extension OndatoLogic: OndatoFlowDelegate {
  public func flowDidSucceed(identificationId: String?) {
    finish(with: ["status": "success", "id": identificationId ?? ""])
  }
  
  public func flowDidFail(identificationId: String?, error: OndatoServiceError) {
    finish(with: ["status": "failure", "id": identificationId ?? "", "error": error.code])
  }
  
  private func finish(with result: [String: Any]) {
    resolve?(result)
    resolve = nil
    reject = nil
  }
}

extension OndatoServiceError {
  var code: String {
    switch type {
    case .cancelled: return "CANCELLED"
    case .consentDenied: return "CONSENT_DENIED"
    case .faceDataNotPresent: return "FACE_DATA_NOT_PRESENT"
    case .invalidServerResponse: return "INVALID_SERVER_RESPONSE"
    case .invalidCredentials: return "INVALID_CREDENTIALS"
    case .recorderPermissions: return "RECORDER_PERMISSIONS"
    case .recorderStartError: return "RECORDER_START_ERROR"
    case .recorderEndError: return "RECORDER_END_ERROR"
    case .verificationFailed: return "VERIFICATION_FAILED"
    case .verificationFailedNoStatus: return "VERIFICATION_FAILED_NO_STATUS"
    case .verificationStatusFailed: return "VERIFICATION_STATUS_FAILED"
    case .nfcNotSupported: return "NFC_NOT_SUPPORTED"
    case .missingModule: return "MISSING_MODULE"
    case .accessToken: return "ACCESS_TOKEN"
    case .idvConfig: return "IDV_CONFIG"
    case .idvSetup: return "IDV_SETUP"
    case .kycConfig: return "KYC_CONFIG"
    case .kycSetup: return "KYC_SETUP"
    case .facetecSdk: return "FACETEC_SDK"
    case .faceSetup: return "FACE_SETUP"
    case .facetecLicense: return "FACETEC_LICENSE"
    case .kycCompleted: return "KYC_COMPLETED"
    case .kycId: return "KYC_ID"
    case .mrzScanner: return "MRZ_SCANNER"
    case .personalCodeUpload: return "PERSONAL_CODE_UPLOAD"
    case .recordingUpload: return "RECORDING_UPLOAD"
    case .restartFailed: return "RESTART_FAILED"
    @unknown default: return "UNKNOWN_ERROR"
    }
  }
}
