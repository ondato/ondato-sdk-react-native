//
//  OSRNConfiguration.swift
//  OndatoSdkReactNative
//
//  Created by Darius Rainys on 2023-03-22.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation

struct Font: Codable {
    let name: String
    let size: Double
    let weight: String
}

struct ConsentButton: Codable {
    let font: Font
    let backgroundColor: String
    let tintColor: String
    let borderWidth: Double
    let borderColor: String
    let cornerRadius: Double
}

struct ConsentWindowHeader: Codable {
    let font: Font
    let color: String
}

struct ConsentWindowBody: Codable {
    let font: Font
    let textColor: String
}

struct ConsentWindow: Codable {
    let header: ConsentWindowHeader
    let body: ConsentWindowBody
    let acceptButton: ConsentButton
    let declineButton: ConsentButton
}

struct Customization: Codable {
    let progressColor: String
    let errorColor: String
    let errorTextColor: String
    let buttonColor: String
    let buttonTextColor: String
    let textColor: String
    let backgroundColor: String
    let imageTintColor: String
    let consentWindow: ConsentWindow
}

struct OSRNConfiguration: Codable {
    let identityVerificationId: String
    let mode: String?
    let language: String?
    let showSplashScreen: Bool?
    let showStartScreen: Bool?
    let showSuccessWindow: Bool?
    let showSelfieFrame: Bool?
    let skipRegistrationIfDriverLicense: Bool?
    let customization: Customization
}
