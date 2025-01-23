@objc(OSRNViewManager)
class OSRNViewManager: RCTViewManager {

  override func view() -> (OSRNView) {
    return OSRNView()
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
