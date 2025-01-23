package com.ondatosdkreactnative

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class OSRNModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "OSRNModule"

  companion object {
    fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
      reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(eventName, params)
    }
  }

  @ReactMethod
  fun addListener(eventName: String) {
    // Set up any upstream listeners or background tasks as necessary
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Remove upstream listeners, stop unnecessary background tasks
  }
}
