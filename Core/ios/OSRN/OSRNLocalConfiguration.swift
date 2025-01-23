//
//  OSRNLocalConfiguration+CoreDataProperties.swift
//  OndatoSdkReactNative
//
//  Created by Darius Rainys on 2023-03-28.
//  Copyright © 2023 Facebook. All rights reserved.
//
//

import Foundation
import CoreData
import OndatoSDK


extension OSRNLocalConfiguration {
    
    @nonobjc public class func fetchRequest() -> NSFetchRequest<OSRNLocalConfiguration> {
        return NSFetchRequest<OSRNLocalConfiguration>(entityName: "OSRNLocalConfiguration")
    }
    
    @NSManaged public var identityVerificationId: String?
    @NSManaged public var mode: String?
    @NSManaged public var language: String?
    @NSManaged public var showSplashScreen: Bool
    @NSManaged public var showStartScreen: Bool
    @NSManaged public var showSuccessWindow: Bool
    @NSManaged public var showSelfieFrame: Bool
    @NSManaged public var skipRegistrationIfDriverLicense: Bool
    
    public var ondatoMode: OndatoEnvironment {
        return mode == "live" ? .live : .test
    }
    
    public var ondatoLanguage: OndatoSupportedLanguage? {
        
        var result: OndatoSupportedLanguage?
        switch language {
        case "en":
            result = OndatoSupportedLanguage.EN
        case "lt":
            result = OndatoSupportedLanguage.LT
        case "de":
            result = OndatoSupportedLanguage.DE
        case "lv":
            result = OndatoSupportedLanguage.LV
        case "et":
            result = OndatoSupportedLanguage.ET
        case "ru":
            result = OndatoSupportedLanguage.RU
        case "sq":
            result = OndatoSupportedLanguage.SQ
        case "bg":
            result = OndatoSupportedLanguage.BG
        case "es":
            result = OndatoSupportedLanguage.ES
        case "fr":
            result = OndatoSupportedLanguage.FR
        case "it":
            result = OndatoSupportedLanguage.IT
        case "ro":
            result = OndatoSupportedLanguage.RO
        case "el":
            result = OndatoSupportedLanguage.EL
        case "nl":
            result = OndatoSupportedLanguage.NL
        default:
            result = nil
        }
        return result
    }
}

extension OSRNLocalConfiguration : Identifiable {
    
}

@objc(OSRNLocalConfiguration)
public class OSRNLocalConfiguration: NSManagedObject {
    
}
