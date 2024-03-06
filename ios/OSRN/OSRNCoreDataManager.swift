//
//  OSRNCoreDataManager.swift
//  OndatoSdkReactNative
//
//  Created by Darius Rainys on 2023-03-27.
//  Copyright © 2023 Facebook. All rights reserved.
//

import CoreData

@available(iOS 10.0, *)
class CoreDataManager {
    static let shared = CoreDataManager()
    let model: String = "OSRNDataModel"
    
    private func onFail(message: String) {
        let event = OSRNEvent(status: OSRNStatus.failed, message: "\(message)\nPlease open an issue on our github page: https://github.com/ondato/ondato-sdk-react-native/issues")
        OSRNUtilities.updateState(event: event)
    }
    
    lazy var persistentContainer: NSPersistentContainer = {
        let osrnBundle = OSRNUtilities.bundle
        let modelURL = osrnBundle.url(forResource: self.model, withExtension: "momd")!
        let managedObjectModel =  NSManagedObjectModel(contentsOf: modelURL)
        
        let container = NSPersistentContainer(name: self.model, managedObjectModel: managedObjectModel!)
        container.loadPersistentStores { (storeDescription, error) in
            
            if let error = error as NSError? {
                self.onFail(message: "Unresolved error \(error), \(error.userInfo) while loading persistant stores.")
            }
        }
        
        return container
    }()
    
    private lazy var context = persistentContainer.viewContext // The managed object context
    
    private init() {}
    
    func save() {
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                let nserror = error as NSError
                self.onFail(message: "Unresolved error \(nserror) while trying to save data to the context, \(nserror.userInfo)")
            }
        }
    }
    
    func fetchObject<T: NSManagedObject>(_ type: T.Type, predicate: NSPredicate? = nil) -> T? {
        let request = NSFetchRequest<T>(entityName: String(describing: type))
        request.predicate = predicate
        request.fetchLimit = 1 // Only fetch one object
        do {
            let results = try context.fetch(request)
            return results.first
        } catch {
            print("Error fetching object: \(error)")
            return nil
        }
    }
    
    func insertObject<T: NSManagedObject>(_ type: T.Type) -> T {
        let entityName = String(describing: type)
        let entity = NSEntityDescription.entity(forEntityName: entityName, in: context)!
        let object = NSManagedObject(entity: entity, insertInto: context) as! T
        return object
    }
    
    func deleteObject(_ object: NSManagedObject) {
        context.delete(object)
    }
    
    func deleteAllObjects<T: NSManagedObject>(_ type: T.Type) {
        let request = NSFetchRequest<NSFetchRequestResult>(entityName: String(describing: type))
        let deleteRequest = NSBatchDeleteRequest(fetchRequest: request)
        do {
            try context.execute(deleteRequest)
        } catch {
            print("Error deleting objects: \(error)")
        }
    }
}
