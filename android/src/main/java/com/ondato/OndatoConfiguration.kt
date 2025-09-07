package com.ondato

import com.facebook.react.bridge.ReadableMap
import com.ondato.sdk.OndatoConfig
import com.ondato.sdk.enums.Language

// JS object → ReadableMap → OndatoConfiguration → OndatoConfig.Builder → Ondato.init(...)
data class OndatoConfiguration(
  val identityVerificationId: String,
  val mode: OndatoConfig.Mode,
  val language: Language,
  val showSplashScreen: Boolean,
  val showStartScreen: Boolean,
  val showWaitingScreen: Boolean,
  val removeSelfieFrame: Boolean,
  val showIdentificationWaitingPage: Boolean,
  val skipRegistrationIfDriverLicense: Boolean
) {
  companion object {
    fun fromReadableMap(map: ReadableMap): OndatoConfiguration {
      val id = map.getString("identityVerificationId") ?: ""
      val modeString = map.getString("mode") ?: "test"
      val mode =
        if (modeString.lowercase() == "live") OndatoConfig.Mode.LIVE else OndatoConfig.Mode.TEST

      val languageCode = map.getString("language") ?: "system"
      val language = when (languageCode.lowercase()) {
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

      return OndatoConfiguration(
        identityVerificationId = id,
        mode = mode,
        language = language,
        showSplashScreen = map.getBoolean("showSplashScreen"),
        showStartScreen = map.getBoolean("showStartScreen"),
        showWaitingScreen = map.getBoolean("showWaitingScreen"),
        removeSelfieFrame = map.getBoolean("removeSelfieFrame"),
        showIdentificationWaitingPage = map.getBoolean("showIdentificationWaitingPage"),
        skipRegistrationIfDriverLicense = map.getBoolean("skipRegistrationIfDriverLicense")
      )
    }
  }

  fun toOndatoConfig(): OndatoConfig {
    return OndatoConfig.Builder()
      .setIdentityVerificationId(identityVerificationId)
      .setMode(mode)
      .setLanguage(language)
      .showSplashScreen(showSplashScreen)
      .showStartScreen(showStartScreen)
      .showIdentificationWaitingScreen(showIdentificationWaitingPage)
      .setRemoveSelfieFrame(removeSelfieFrame)
      .setSkipRegistrationIfDriverLicense(skipRegistrationIfDriverLicense)
      .build()
  }
}
