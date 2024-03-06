//
//  OSRNCustomization+CoreDataClass.swift
//  OndatoSdkReactNative
//
//  Created by Darius Rainys on 2023-04-11.
//  Copyright © 2023 Facebook. All rights reserved.
//
//

import Foundation
import CoreData

extension OSRNCustomization {

    @nonobjc public class func fetchRequest() -> NSFetchRequest<OSRNCustomization> {
        return NSFetchRequest<OSRNCustomization>(entityName: "OSRNCustomization")
    }

    @NSManaged public var progressColor: String?
    @NSManaged public var errorColor: String?
    @NSManaged public var errorTextColor: String?
    @NSManaged public var buttonColor: String?
    @NSManaged public var buttonTextColor: String?
    @NSManaged public var textColor: String?
    @NSManaged public var backgroundColor: String?
    @NSManaged public var imageTintColor: String?
    @NSManaged public var consentWindowHeaderFontSize: Double
    @NSManaged public var consentWindowHeaderFontName: String?
    @NSManaged public var consentWindowHeaderFontWeight: String?
    @NSManaged public var consentWindowHeaderColor: String?
    @NSManaged public var consentWindowBodyFontSize: Double
    @NSManaged public var consentWindowBodyFontName: String?
    @NSManaged public var consentWindowBodyFontWeight: String?
    @NSManaged public var consentWindowBodyTextColor: String?
    @NSManaged public var consentWindowAcceptButtonFontSize: Double
    @NSManaged public var consentWindowAcceptButtonFontName: String?
    @NSManaged public var consentWindowAcceptButtonFontWeight: String?
    @NSManaged public var consentWindowAcceptButtonBackgroundColor: String?
    @NSManaged public var consentWindowAcceptButtonTintColor: String?
    @NSManaged public var consentWindowAcceptButtonBorderColor: String?
    @NSManaged public var consentWindowAcceptButtonBorderWidth: Double
    @NSManaged public var consentWindowAcceptButtonCornerRadius: Double
    @NSManaged public var consentWindowDeclineButtonFontSize: Double
    @NSManaged public var consentWindowDeclineButtonFontName: String?
    @NSManaged public var consentWindowDeclineButtonFontWeight: String?
    @NSManaged public var consentWindowDeclineButtonBackgroundColor: String?
    @NSManaged public var consentWindowDeclineButtonTintColor: String?
    @NSManaged public var consentWindowDeclineButtonBorderColor: String?
    @NSManaged public var consentWindowDeclineButtonBorderWidth: Double
    @NSManaged public var consentWindowDeclineButtonCornerRadius: Double
}

extension OSRNCustomization : Identifiable {

}

@objc(OSRNCustomization)
public class OSRNCustomization: NSManagedObject {

}
