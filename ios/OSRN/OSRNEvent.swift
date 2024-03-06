//
//  OSRNEvent.swift
//  OndatoSdkReactNative
//
//  Created by Darius Rainys on 2023-03-30.
//  Copyright © 2023 Facebook. All rights reserved.
//

class OSRNEvent {
    var status: OSRNStatus
    var message: String
    var load: [String : Any]?
    
    init(status: OSRNStatus, message: String) {
        self.status = status
        self.message = message
    }
    
    init(status: OSRNStatus, message: String, load: [String : Any]) {
        self.status = status
        self.message = message
        self.load = load
    }
    
    func getStatus(status: OSRNStatus) -> String {
        var result = "Unknown"
        switch status {
        case .dormant:
            result = "Dormant"
        case .initialized:
            result = "Ready"
        case .failed:
            result = "Failed"
        case .cancelled:
            result = "Cancelled"
        case .succeeded:
            result = "Succeeded"
            
        }
        return result
    }
    
    func getEvent() -> [AnyHashable: Any] {
        var event: [AnyHashable: Any] = [:]
        
        if let dataLoad = load {
            if let json = try? JSONSerialization.data(withJSONObject: dataLoad, options: []) {
                event["status"] = self.getStatus(status: status)
                event["message"] = message
                event["load"] = String(data: json, encoding: String.Encoding.utf8)
                
                return event
            }
        }
        
        event["status"] = self.getStatus(status: OSRNStatus.failed)
        event["message"] = "Couldn't parse the data"
        return event
    }
}
