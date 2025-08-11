package com.ondatosdkreactnative

import android.os.Bundle
import android.view.View
import androidx.lifecycle.ViewModelProvider
import android.util.Log
import androidx.fragment.app.Fragment
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.google.gson.JsonObject
import com.ondato.sdk.Ondato
import com.ondato.sdk.OndatoConfig
import com.ondato.sdk.OndatoError
import com.ondato.sdk.enums.Language

class OSRNFragment : Fragment(R.layout.activity_main) {
  private var viewModel: OSRNModel? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    viewModel = ViewModelProvider(requireActivity()).get(OSRNModel::class.java)
  }

  fun updateState(state: OSRNState) {
    val data: WritableMap = Arguments.createMap()

    data.putString(
      "status",
      when (state.status) {
        (OSRNStatus.DORMANT) -> "Not ready"
        (OSRNStatus.INITIALIZED) -> "Ready"
        (OSRNStatus.SUCCEEDED) -> "Succeeded"
        (OSRNStatus.FAILED) -> "Failed"
        (OSRNStatus.CANCELLED) -> "Cancelled"
        else -> "Unknown"
      }
    )

    if (state.message != null)
      data.putString("message", state.message)
    if (state.load != null)
      data.putString("load", state.load.toString())


    viewModel?.getReactContext()?.value?.let { OSRNModule.sendEvent(it, "onUpdate", data) }
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    val configuration = viewModel!!.getConfiguration().value
    val id = configuration?.identityVerificationId
    val ctx = requireContext().applicationContext

    if (id != null && id.isNotBlank()) {
      val config = OndatoConfig.Builder()
        //.setLoadingScreenProvider(provider: LoadingScreenProvider)
        //.setStartScreenProvider(provider: StartScreenProvider)
        //.setSuccessScreenProvider(provider: SuccessScreenProvider)
        .setIdentityVerificationId(id)
        .setMode(configuration.getOndatoMode())
        .showSplashScreen(configuration.showSplashScreen)
        .setLanguage(configuration.getOndatoLanguage())
        .showStartScreen(configuration.showStartScreen)
        .showIdentificationWaitingScreen(configuration.showIdentificationWaitingScreen)
        .setRemoveSelfieFrame(!configuration.showSelfieFrame)
        .setSkipRegistrationIfDriverLicense(configuration.skipRegistrationIfDriverLicense)
        .build()


      Ondato.init(config)
      updateState(
        OSRNState(
          OSRNStatus.INITIALIZED,
          "OndatoSdk was initialized with the provided configuration and will start shortly"
        )
      )

      Ondato.startIdentification(ctx, object : Ondato.ResultListener {
        override fun onSuccess(identificationId: String?) {
          Log.d("OndatoSdk", "Success!")
          if (identificationId != null) {
            val load = JsonObject()
            load.addProperty("identificationId", identificationId)
            updateState(
              OSRNState(
                OSRNStatus.SUCCEEDED,
                "Identification was successful",
                load
              )
            )
          } else
            updateState(OSRNState(OSRNStatus.SUCCEEDED, "Identification was successful"))
        }

        override fun onFailure(identificationId: String?, error: OndatoError) {
          val errorName = error.name
          val errorMessage = error.message.replaceFirstChar { it.uppercaseChar() }
          Log.d("OndatoSdk", "Failure!")
          Log.d("OndatoSdk", "identificationId: $identificationId")
          Log.d("OndatoSdk", "errorName: $errorName; errorMessage: $errorMessage")

          var status = when (error) {
            OndatoError.CANCELED -> OSRNStatus.CANCELLED
            OndatoError.BAD_SERVER_RESPONSE,
            OndatoError.NFC_NOT_SUPPORTED,
            OndatoError.TOO_MANY_ATTEMPTS,
            OndatoError.NO_AVAILABLE_DOCUMENT_TYPES -> OSRNStatus.FAILED
          }

          if (identificationId != null) {
            val load = JsonObject()
            load.addProperty("identificationId", identificationId)
            updateState(
              OSRNState(
                status,
                errorMessage,
                load
              )
            )
          } else
            updateState(OSRNState(status, errorMessage))
        }
      })
    } else {
      updateState(
        OSRNState(
          OSRNStatus.FAILED,
          "Unexpected error. Please open an issue on our github page: https://github.com/ondato/ondato-sdk-react-native/issues"
        )
      )
    }
  }
}
