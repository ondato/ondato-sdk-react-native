//
//  OSRNView.swift
//  OndatoSdkReactNative
//
//  Created by Darius Rainys on 2023-03-22.
//  Copyright © 2023 Facebook. All rights reserved.
//

import UIKit

extension UIView {
    var parentViewController: UIViewController? {
        var parentResponder: UIResponder? = self
        while parentResponder != nil {
            parentResponder = parentResponder!.next
            if let viewController = parentResponder as? UIViewController {
                return viewController
            }
        }
        return nil
    }
}

@available(iOS 10.0, *)
class OSRNView : UIView {
    weak var vc: UIViewController?
    let coreDataManager = CoreDataManager.shared
    
    @objc var onUpdate: RCTBubblingEventBlock? = nil {
        didSet {
            OSRNUtilities.onUpdate = onUpdate
        }
    }
    
    @objc var configuration: String = "" {
        didSet {
            print("configuration: " + configuration)
            let data = Data(configuration.utf8)
            let decoder = JSONDecoder()
            
            do {
                let decoded = try decoder.decode(OSRNConfiguration.self, from: data)
                
                print("decoded: " + decoded.identityVerificationId)
               
                var config: OSRNLocalConfiguration;
                
                if let existingConfig = coreDataManager.fetchObject(OSRNLocalConfiguration.self) {
                    config = existingConfig
                } else {
                    let newConfig = coreDataManager.insertObject(OSRNLocalConfiguration.self)
                    config = newConfig
                }
                
                config.identityVerificationId = decoded.identityVerificationId
                config.mode = decoded.mode
                config.language = decoded.language
                config.showSplashScreen = decoded.showSplashScreen ?? true
                config.showSelfieFrame = decoded.showSelfieFrame ?? true
                config.showStartScreen = decoded.showStartScreen ?? true
                config.showSuccessWindow = decoded.showSuccessWindow ?? true
                config.skipRegistrationIfDriverLicense = decoded.skipRegistrationIfDriverLicense ?? false
                
                var customization: OSRNCustomization;
                
                if let existingCustomization = coreDataManager.fetchObject(OSRNCustomization.self) {
                    customization = existingCustomization
                } else {
                    let newCustomization = coreDataManager.insertObject(OSRNCustomization.self)
                    customization = newCustomization
                }
                
                customization.progressColor = decoded.customization.progressColor
                customization.errorColor = decoded.customization.errorColor
                customization.errorTextColor = decoded.customization.errorTextColor
                customization.buttonColor = decoded.customization.buttonColor
                customization.buttonTextColor = decoded.customization.buttonTextColor
                customization.textColor = decoded.customization.textColor
                customization.backgroundColor = decoded.customization.backgroundColor
                customization.imageTintColor = decoded.customization.imageTintColor
                customization.consentWindowHeaderFontSize = decoded.customization.consentWindow.header.font.size
                customization.consentWindowHeaderFontName = decoded.customization.consentWindow.header.font.name
                customization.consentWindowHeaderFontWeight = decoded.customization.consentWindow.header.font.weight
                customization.consentWindowHeaderColor = decoded.customization.consentWindow.header.color
                customization.consentWindowBodyFontSize = decoded.customization.consentWindow.body.font.size
                customization.consentWindowBodyFontName = decoded.customization.consentWindow.body.font.name
                customization.consentWindowBodyFontWeight = decoded.customization.consentWindow.body.font.weight
                customization.consentWindowBodyTextColor = decoded.customization.consentWindow.body.textColor
                customization.consentWindowAcceptButtonFontSize = decoded.customization.consentWindow.acceptButton.font.size
                customization.consentWindowAcceptButtonFontName = decoded.customization.consentWindow.acceptButton.font.name
                customization.consentWindowAcceptButtonFontWeight = decoded.customization.consentWindow.acceptButton.font.weight
                customization.consentWindowAcceptButtonBackgroundColor = decoded.customization.consentWindow.acceptButton.backgroundColor
                customization.consentWindowAcceptButtonTintColor = decoded.customization.consentWindow.acceptButton.tintColor
                customization.consentWindowAcceptButtonBorderColor = decoded.customization.consentWindow.acceptButton.borderColor
                customization.consentWindowAcceptButtonBorderWidth = decoded.customization.consentWindow.acceptButton.borderWidth
                customization.consentWindowAcceptButtonCornerRadius = decoded.customization.consentWindow.acceptButton.cornerRadius
                customization.consentWindowDeclineButtonFontSize = decoded.customization.consentWindow.declineButton.font.size
                customization.consentWindowDeclineButtonFontName = decoded.customization.consentWindow.declineButton.font.name
                customization.consentWindowDeclineButtonFontWeight = decoded.customization.consentWindow.declineButton.font.weight
                customization.consentWindowDeclineButtonBackgroundColor = decoded.customization.consentWindow.declineButton.backgroundColor
                customization.consentWindowDeclineButtonTintColor = decoded.customization.consentWindow.declineButton.tintColor
                customization.consentWindowDeclineButtonBorderColor = decoded.customization.consentWindow.declineButton.borderColor
                customization.consentWindowDeclineButtonBorderWidth = decoded.customization.consentWindow.declineButton.borderWidth
                customization.consentWindowDeclineButtonCornerRadius = decoded.customization.consentWindow.declineButton.cornerRadius

                
                coreDataManager.save()
            } catch {
                print("Failed to decode JSON")
                dump(error)
            }
        }
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        if vc == nil {
            embed()
        } else {
            vc?.view.frame = bounds
        }
    }
    
    private func embed() {
        guard
            let parentVC = parentViewController else {
            return
        }
        
        let vc = OSRNViewController()
        parentVC.addChild(vc)
        addSubview(vc.view)
        vc.view.frame = bounds
        vc.didMove(toParent: parentVC)
        self.vc = vc
    }
}

