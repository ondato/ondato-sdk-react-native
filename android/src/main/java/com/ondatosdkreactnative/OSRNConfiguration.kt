package com.ondatosdkreactnative

import android.util.Log
import com.ondato.sdk.OndatoConfig
import com.ondato.sdk.enums.Language

class OSRNConfiguration(
  var identityVerificationId: String = "",
  private var mode: String = "test",
  private var language: String = "system",
  var showSplashScreen: Boolean = true,
  var showStartScreen: Boolean = true,
  var showIdentificationWaitingScreen: Boolean = true,
  var showSelfieFrame: Boolean = true,
  var skipRegistrationIfDriverLicense: Boolean = false
) {
  override fun toString(): String {
    return "OSRNConfiguration(\n  identityVerificationId='$identityVerificationId',\n  mode=$mode,\n  language=$language,\n  showSplashScreen=$showSplashScreen,\n  showStartScreen=$showStartScreen,\n  showIdentificationWaitingScreen=$showIdentificationWaitingScreen,\n  showSelfieFrame=$showSelfieFrame,\n  skipRegistrationIfDriverLicense=$skipRegistrationIfDriverLicense\n)"
  }

  fun getOndatoMode(): OndatoConfig.Mode {
    return when (mode) {
      "test" -> OndatoConfig.Mode.TEST
      else -> OndatoConfig.Mode.LIVE
    }
  }

  fun getOndatoLanguage(): Language {
    return when (language.trim().lowercase()) {
      "en" -> Language.English
      "lt" -> Language.Lithuanian
      "de" -> Language.German
      "lv" -> Language.Latvian
      "et" -> Language.Estonian
      "ru" -> Language.Russian
      "sq" -> Language.Albanian
      "bg" -> Language.Bulgarian
      "es" -> Language.Spanish
      "fr" -> Language.French
      "it" -> Language.Italian
      "ro" -> Language.Romanian
      "el" -> Language.Greek
      "nl" -> Language.Dutch
      else -> Language.System
    }
  }
}
