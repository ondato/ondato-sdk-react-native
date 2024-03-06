package com.ondatosdkreactnative

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.facebook.react.bridge.ReactContext

class OSRNModel : ViewModel() {
  private val reactContext = MutableLiveData<ReactContext>()
  private val configuration = MutableLiveData<OSRNConfiguration>()

  fun getReactContext(): LiveData<ReactContext> = reactContext
  fun getConfiguration(): LiveData<OSRNConfiguration> = configuration

  fun setReactContext(context: ReactContext) {
    reactContext.postValue(context)
  }
  fun setConfiguration(conf: OSRNConfiguration) {
    configuration.postValue(conf)
  }
}
