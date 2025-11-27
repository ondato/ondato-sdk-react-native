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
  val appearance: String?,
  val logLevel: OndatoLoggingLevel,
  val fonts: ReadableMap?
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
        "ua" -> Language.Ukrainian
        "vi" -> Language.Vietnamese
        else -> null
      }

      val logLevelString = map.getString("logLevel") ?: "info"
      val logLevel = when (logLevelString.lowercase()) {
        "error" -> OndatoLoggingLevel.Error
        "debug" -> OndatoLoggingLevel.Debug
        else -> OndatoLoggingLevel.Info
      }

      // Extract only the 'android' sub-map if present, for flat string-based font handling
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
        appearance = map.getString("appearance"),
        logLevel = logLevel,
        fonts = androidFonts
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
      .setLoggingLevel(logLevel)

    // Apply language if provided
    language?.let { builder.setLanguage(it) }

    // Apply whitelabel JSON if provided
    appearance?.let { builder.setConfiguration(it) }

    // Dynamically resolve font resource IDs
    fonts?.let { fonts ->
      val resources = context.resources
      val packageName = context.packageName
      val getFontId = { key: String ->
        fonts.getString(key)?.let { fontName ->
          val id = resources.getIdentifier(fontName, "font", packageName)
          if (id == 0) {
            android.util.Log.w(
              "OndatoModule",
              "Font resource '$fontName' not found for key '$key'"
            )
            null
          } else {
            id
          }
        }
      }

      val heading1Font = getFontId("title")
      val heading2Font = getFontId("subtitle")
      val normalFont = getFontId("body")
      val listFont = getFontId("list")
      val inputLabelFont = getFontId("inputLabel")
      val buttonTextFont = getFontId("button")

      // Only set custom fonts if at least one was resolved successfully
      if (heading1Font != null || heading2Font != null || normalFont != null ||
        listFont != null || inputLabelFont != null || buttonTextFont != null
      ) {
        builder.setCustomFonts(
          heading1FontResource = heading1Font,
          heading2FontResource = heading2Font,
          normalFontResource = normalFont,
          listFontResource = listFont,
          inputLabelFontResource = inputLabelFont,
          buttonTextFontResource = buttonTextFont
        )
      }
    }

    return builder.build()
  }
}
