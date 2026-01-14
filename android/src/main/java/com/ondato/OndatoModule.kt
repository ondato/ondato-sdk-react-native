package com.ondato

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.ondato.sdk.Ondato
import com.ondato.sdk.OndatoError

@ReactModule(name = OndatoModule.NAME)
class OndatoModule(reactContext: ReactApplicationContext) :
  NativeOndatoModuleSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun startIdentification(config: ReadableMap, promise: Promise) {
    try {
      val configuration = OndatoConfiguration.fromReadableMap(config)
      val ondatoConfig = configuration.toOndatoConfig(reactApplicationContext)

      Ondato.init(ondatoConfig)

      val activity = reactApplicationContext.currentActivity ?: run {
        promise.reject("NO_ACTIVITY", "Current activity is null")
        return
      }

      Ondato.startIdentification(activity, object : Ondato.ResultListener {
        override fun onSuccess(identificationId: String?) {
          promise.resolve(
            Arguments.createMap().apply {
              putString("status", "success")
              putString("id", identificationId ?: "")
            }
          )
        }

        override fun onFailure(identificationId: String?, error: OndatoError) {
          promise.resolve(
            Arguments.createMap().apply {
              putString("status", "failure")
              putString("id", identificationId ?: "")
              putString("error", error.name)
            }
          )
        }
      })
    } catch (e: Exception) {
      promise.reject("INIT_ERROR", e)
    }
  }

  override fun getLogs(): String {
    return Ondato.getLogs()
  }

  companion object {
    const val NAME = "OndatoModule"
  }
}
