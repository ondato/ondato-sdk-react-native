package com.ondato

import com.facebook.react.bridge.ReadableMap
import com.ondato.sdk.OndatoConfig
import com.ondato.sdk.enums.Language
import com.ondato.sdk.log.Level as OndatoLoggingLevel

// JS object → ReadableMap → OndatoConfiguration → OndatoConfig.Builder → Ondato.init(...)
data class OndatoConfiguration(
  val identityVerificationId: String,
  val mode: OndatoConfig.Mode,
  val language: Language?,
  val enableNetworkIssuesScreen: Boolean,
  val disablePdfFileUpload: Boolean,
  val switchPrimaryButtons: Boolean,
  val skipRegistrationIfDriverLicense: Boolean,
  val appearance: String?,
  val logLevel: OndatoLoggingLevel,
  val fonts: ReadableMap?,
  val requireScrollToEnableTermsButton: Boolean,
  val termsButtonTimeout: Long
) {
  companion object {
    fun fromReadableMap(map: ReadableMap): OndatoConfiguration {
      val id = map.getString("identityVerificationId") ?: ""
      val modeString = map.getString("mode") ?: "test"
      val mode =
        if (modeString.lowercase() == "live") OndatoConfig.Mode.LIVE else OndatoConfig.Mode.TEST

      val languageCode = map.getString("language")
      val language = when (languageCode?.lowercase()) {
        "bg" -> Language.Bulgarian
        "ca" -> Language.Catalan
        "cs" -> Language.Czech
        "de" -> Language.German
        "el" -> Language.Greek
        "en" -> Language.English
        "es" -> Language.Spanish
        "et" -> Language.Estonian
        "fi" -> Language.Finnish
        "fr" -> Language.French
        "hr" -> Language.Croatian
        "hu" -> Language.Hungarian
        "it" -> Language.Italian
        "lt" -> Language.Lithuanian
        "lv" -> Language.Latvian
        "nl" -> Language.Dutch
        "pl" -> Language.Polish
        "pt" -> Language.Portuguese
        "ro" -> Language.Romanian
        "ru" -> Language.Russian
        "sk" -> Language.Slovak
        "sl" -> Language.Slovenian
        "sq" -> Language.Albanian
        "sv" -> Language.Swedish
        "uk" -> Language.Ukrainian
        "vi" -> Language.Vietnamese
        else -> null
      }

      val logLevelString = map.getString("logLevel") ?: "info"
      val logLevel = when (logLevelString.lowercase()) {
        "error" -> OndatoLoggingLevel.Error
        "debug" -> OndatoLoggingLevel.Debug
        else -> OndatoLoggingLevel.Info
      }

      val androidFonts = if (map.hasKey("fonts")) {
        val fullFonts = map.getMap("fonts")
        if (fullFonts?.hasKey("android") == true) fullFonts.getMap("android") else null
      } else null

      return OndatoConfiguration(
        identityVerificationId = id,
        mode = mode,
        language = language,
        enableNetworkIssuesScreen = map.getBoolean("enableNetworkIssuesScreen"),
        disablePdfFileUpload = map.getBoolean("disablePdfFileUpload"),
        switchPrimaryButtons = map.getBoolean("switchPrimaryButtons"),
        skipRegistrationIfDriverLicense = map.getBoolean("skipRegistrationIfDriverLicense"),
        appearance = map.getString("appearance"),
        logLevel = logLevel,
        fonts = androidFonts,
        requireScrollToEnableTermsButton = map.getBoolean("requireScrollToEnableTermsButton"),
        termsButtonTimeout = map.getDouble("termsButtonTimeout").toLong()
      )
    }
  }

  fun toOndatoConfig(context: android.content.Context): OndatoConfig {
    val builder = OndatoConfig.Builder()
      .setIdentityVerificationId(identityVerificationId)
      .setMode(mode)
      .enableNetworkIssuesScreen(enableNetworkIssuesScreen)
      .disablePdfFileUploadForProofOfAddress(disablePdfFileUpload)
      .setSwitchPrimaryButtons(switchPrimaryButtons)
      .setSkipRegistrationIfDriverLicense(skipRegistrationIfDriverLicense)
      .setLoggingLevel(logLevel)
      .setTermsAndConditionsRules(requireScrollToEnableTermsButton, termsButtonTimeout)

    language?.let { builder.setLanguage(it) }

    appearance?.let { builder.setConfiguration(it) }

    fonts?.let { fonts ->
      val res = context.resources
      val pkg = context.packageName
      val getFontId = { key: String ->
        fonts.getString(key)?.let { name ->
          val id = res.getIdentifier(name, "font", pkg)
          if (id == 0) {
            android.util.Log.w(
              "OndatoModule",
              "Font resource '$name' not found for key '$key'"
            )
            null
          } else {
            id
          }
        }
      }

      val h1 = getFontId("title")
      val h2 = getFontId("subtitle")
      val body = getFontId("body")
      val list = getFontId("list")
      val label = getFontId("inputLabel")
      val btn = getFontId("button")

      // Only apply if at least one valid resource ID was resolved
      if (h1 != null || h2 != null || body != null || list != null || label != null || btn != null) {
        builder.setCustomFonts(
          heading1FontResource = h1,
          heading2FontResource = h2,
          normalFontResource = body,
          listFontResource = list,
          inputLabelFontResource = label,
          buttonTextFontResource = btn
        )
      }
    }

    return builder.build()
  }
}
