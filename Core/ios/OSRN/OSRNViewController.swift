//
//  OSRNController.swift
//  OndatoSdkReactNative
//
//  Created by Darius Rainys on 2023-03-23.
//  Copyright © 2023 Facebook. All rights reserved.
//

import UIKit
import Foundation
import OndatoSDK

extension OSRNViewController: OndatoFlowDelegate {
    func flowDidSucceed(identificationId: String?) {
        let message: String = "Identification was successful."
        let status = OSRNStatus.succeeded
        let event = OSRNEvent(status: status, message: message)
        
        if let id = identificationId {
            event.load = ["identificationId": id]
        }
        
        OSRNUtilities.updateState(event: event)
    }
    
    func flowDidFail(identificationId: String?, error: OndatoServiceError) {
        print("Identification ID: \(String(describing: identificationId))")
        print("OndatoError: \(error.type.rawValue)")
        
        let message: String = "Unexpected error: \(error.type.rawValue). Please open an issue on our github page: https://github.com/ondato/ondato-sdk-react-native/issues"
        let event = OSRNEvent(status: OSRNStatus.failed, message: message)
        
        switch error.type {
        case .cancelled:
            event.status = OSRNStatus.cancelled
            event.message = "The process was cancelled by the user."
        case .consentDenied:
            event.message = "The user has denied consent."
        case .faceDataNotPresent:
            event.message = "Face authenticaton data is not present."
        case .invalidServerResponse:
            event.message = "Received an invalid server response."
        case .invalidCredentials:
            event.message = "Invalid credentials provided."
        case .recorderPermissions:
            event.message = "Recorder permissions are not granted."
        case .recorderStartError:
            event.message = "Recorder failed to start recording."
        case .recorderEndError:
            event.message = "Recorder failed to finish recording."
        case .verificationFailed:
            event.message = "Verification process failed."
        case .nfcNotSupported:
            event.message = "NFC is not supported on this device."
        case .accessToken:
            event.message = "Failed to retrieve full access token."
        case .idvConfig:
            event.message = "Failed to retrieve IDV configuration."
        case .idvSetup:
            event.message = "Failed to retrieve IDV setup"
        case .facetecSdk:
            event.message = "Face recognition sessio failed"
        case .faceSetup:
            event.message = "Failed to retrive face auth config"
        case .facetecLicense:
            event.message = "Failed to retrieve face license"
        case .kycCompleted:
            event.message = "Failed to complete verification"
        case .kycConfig:
            event.message = "Failed to retrieve kyc config"
        case .kycId:
            event.message = "Failed to retrieve kyc id"
        case .kycSetup:
            event.message = "Failed to retrieve kyc setup"
        case .mrzScanner:
            event.message = "Failed to start mrz scanner"
        case .personalCodeUpload:
            event.message = "Personal code upload fialed"
        case .recordingUpload:
            event.message = "Recording upload failed"
        case .restartFailed:
            event.message = "Session restart failed"
        case .verificationFailedNoStatus:
            event.message = "Verification failed with an unknown status"
        case .verificationStatusFailed:
            event.message = "Verification status check failed"
        case .missingModule:
            event.message = "Application is attempting to use unsupported behavior (recording, NFC)"
        @unknown default:
            print("This was unexpected")
        }
        
        if let id = identificationId {
            event.load = ["identificationId": id]
        }
        
        OSRNUtilities.updateState(event: event)
    }
}

class OSRNViewController: UIViewController {
    var utils: OSRNUtilities!
    let coreDataManager = CoreDataManager.shared
    private var configuration = OndatoServiceConfiguration()
    
    let myLabel = UILabel()
    let myButton = UIButton()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        openOndatoSDK()
    }
    
    func openOndatoSDK() {
        Ondato.sdk.delegate = self
        
        let localConfig = coreDataManager.fetchObject(OSRNLocalConfiguration.self)
        let customization = coreDataManager.fetchObject(OSRNCustomization.self)
        
        if let id = localConfig?.identityVerificationId, let config = localConfig {
            Ondato.sdk.setIdentityVerificationId(id)
            
            // Apply default configuration
            Ondato.sdk.configuration = configuration
            
            // Change execution environment
            Ondato.sdk.configuration.mode = config.ondatoMode
            
            // Change language
            if let language = config.ondatoLanguage {
                OndatoLocalizeHelper.language = language
            }
            // To do: add custom language support
            //
            //        if let bundlePath = Bundle.main.path(forResource: "lt", ofType: "bundle"),
            //           let bundle = Bundle(path: bundlePath) {
            //            let localizationBundle = OndatoLocalizationBundle(bundle: bundle, tableName: "Localizable")
            //            OndatoLocalizeHelper.setLocalizationBundle(localizationBundle, for: .EN)
            //        }
            
            
            // Update the flow
            Ondato.sdk.configuration.flowConfiguration.showStartScreen = config.showStartScreen
            Ondato.sdk.configuration.flowConfiguration.removeSelfieFrame = !config.showSelfieFrame
            Ondato.sdk.configuration.flowConfiguration.showSuccessWindow = config.showSuccessWindow
            Ondato.sdk.configuration.flowConfiguration.skipRegistrationIfDriverLicense = config.skipRegistrationIfDriverLicense
            
            // Change the appearance
            Ondato.sdk.configuration.appearance.progressColor = OSRNUtilities.colorFromHex(customization?.progressColor ?? "#fff000")
            Ondato.sdk.configuration.appearance.errorColor = OSRNUtilities.colorFromHex(customization?.errorColor ?? "#fff000")
            Ondato.sdk.configuration.appearance.errorTextColor = OSRNUtilities.colorFromHex(customization?.errorTextColor ?? "#fff000")
            Ondato.sdk.configuration.appearance.buttonColor = OSRNUtilities.colorFromHex(customization?.buttonColor ?? "#fff000")
            Ondato.sdk.configuration.appearance.buttonTextColor = OSRNUtilities.colorFromHex(customization?.buttonTextColor ?? "#fff000")
            Ondato.sdk.configuration.appearance.textColor = OSRNUtilities.colorFromHex(customization?.textColor ?? "#fff000")
            Ondato.sdk.configuration.appearance.backgroundColor = OSRNUtilities.colorFromHex(customization?.backgroundColor ?? "#fff000")
            Ondato.sdk.configuration.appearance.imageTintColor = OSRNUtilities.colorFromHex(customization?.imageTintColor ?? "#fff000")
            
            let header = OndatoLabelAppearance(font:
                                                OSRNUtilities.getFont(name: customization?.consentWindowHeaderFontName ?? "default", size: customization?.consentWindowHeaderFontSize ?? 15, weight: customization?.consentWindowHeaderFontWeight ?? "regular")
                                               , color: OSRNUtilities.colorFromHex(customization?.consentWindowHeaderColor ?? "#ff00ff"))
            let body = OndatoTextViewAppearance(font:
                                                    OSRNUtilities.getFont(name: customization?.consentWindowBodyFontName ?? "default", size: customization?.consentWindowBodyFontSize ?? 15, weight: customization?.consentWindowBodyFontWeight ?? "regular")
                                                , textColor: OSRNUtilities.colorFromHex(customization?.consentWindowBodyTextColor ?? "#ff00ff"))
            let acceptButton = OndatoButtonAppearance(
                font:
                    OSRNUtilities.getFont(name: customization?.consentWindowAcceptButtonFontName ?? "default", size: customization?.consentWindowAcceptButtonFontSize ?? 15, weight: customization?.consentWindowAcceptButtonFontWeight ?? "regular")
                ,
                backgroundColor: OSRNUtilities.colorFromHex( customization?.consentWindowAcceptButtonBackgroundColor ?? "#fff000") ,
                tintColor: OSRNUtilities.colorFromHex(customization?.consentWindowAcceptButtonTintColor ?? "#ffffff"),
                borderWidth: customization?.consentWindowAcceptButtonBorderWidth ?? 0,
                borderColor: OSRNUtilities.colorFromHex( customization?.consentWindowAcceptButtonBorderColor ?? "#ffffff00"),
                cornerRadius: customization?.consentWindowAcceptButtonCornerRadius ?? 25
            )
            let declineButton = OndatoButtonAppearance(
                font:
                    OSRNUtilities.getFont(name: customization?.consentWindowDeclineButtonFontName ?? "default", size: customization?.consentWindowDeclineButtonFontSize ?? 17, weight: customization?.consentWindowDeclineButtonFontWeight ?? "regular")
                ,
                backgroundColor: OSRNUtilities.colorFromHex( customization?.consentWindowDeclineButtonBackgroundColor ?? "#ffffff") ,
                tintColor: OSRNUtilities.colorFromHex(customization?.consentWindowDeclineButtonTintColor ?? "#fff000"),
                borderWidth: customization?.consentWindowDeclineButtonBorderWidth ?? 3,
                borderColor: OSRNUtilities.colorFromHex( customization?.consentWindowDeclineButtonBorderColor ?? "#fff000"),
                cornerRadius: customization?.consentWindowDeclineButtonCornerRadius ?? 25
            )
            
            
            Ondato.sdk.configuration.appearance.consentWindow.header = header
            Ondato.sdk.configuration.appearance.consentWindow.body = body
            Ondato.sdk.configuration.appearance.consentWindow.acceptButton = acceptButton
            Ondato.sdk.configuration.appearance.consentWindow.declineButton = declineButton
            
            
            let vc = Ondato.sdk.instantiateOndatoViewController()
            vc.modalPresentationStyle = .fullScreen
            self.present(vc, animated: true, completion: nil)
        } else {
            print("id does not have a value.")
        }
        
    }
}
