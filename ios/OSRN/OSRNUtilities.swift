//
//  OSRNUtilities.swift
//  OndatoSdkReactNative
//
//  Created by Darius Rainys on 2023-03-23.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import UIKit
import AVFoundation

class OSRNUtilities: NSObject {
    // Reference to app's main view controller
    let ondatoVC: OSRNViewController!
    static var onUpdate: RCTBubblingEventBlock?
    static var bundle: Bundle {
        let bundle = Bundle.main
        return Bundle(url: bundle.url(forResource: "OSRN",
                                      withExtension: "bundle")!)!
    }
    
    init(vc: OSRNViewController) {
        ondatoVC = vc
    }
    
    static func getFontWeight(weight: String) -> UIFont.Weight {
        switch weight.lowercased() {
        case "ultralight":
            return .ultraLight
        case "thin":
            return .thin
        case "light":
            return .light
        case "regular":
            return .regular
        case "medium":
            return .medium
        case "semibold":
            return .semibold
        case "bold":
            return .bold
        case "heavy":
            return .heavy
        case "black":
            return .black
        default:
            return .regular
        }
    }
    
    static func updateState(event: OSRNEvent) {
        if onUpdate != nil {
            self.onUpdate!(event.getEvent())
        }
    }
    
    static func getFont(name: String, size: Double, weight: String) -> UIFont {
        return UIFont(name: name, size: size) ?? UIFont.systemFont(ofSize: size, weight: getFontWeight(weight: weight))
    }
    
    static func colorFromHex(_ hexString: String) -> UIColor {
        var cString = hexString.dropFirst().trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        
        if cString.count == 3 {
            let redHex = String(repeating: cString[cString.index(cString.startIndex, offsetBy: 0)], count: 2)
            let greenHex = String(repeating: cString[cString.index(cString.startIndex, offsetBy: 1)], count: 2)
            let blueHex = String(repeating: cString[cString.index(cString.startIndex, offsetBy: 2)], count: 2)
            cString = redHex + greenHex + blueHex
        }
        
        if cString.count == 6 {
            cString = cString + "FF"
        }
        
        if cString.count != 8 {
            return UIColor.gray
        }
        
        var rgba: UInt64 = 0
        Scanner(string: cString).scanHexInt64(&rgba)
        
        let red = CGFloat((rgba & 0xFF000000) >> 24) / 255.0
        let green = CGFloat((rgba & 0x00FF0000) >> 16) / 255.0
        let blue = CGFloat((rgba & 0x0000FF00) >> 8) / 255.0
        let alpha = CGFloat(rgba & 0x000000FF) / 255.0
        
        return UIColor(red: red, green: green, blue: blue, alpha: alpha)
    }
}
