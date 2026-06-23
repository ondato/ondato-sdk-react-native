require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "OndatoSdkReactNative"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/ondato/ondato-sdk-react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.private_header_files = "ios/**/*.h"

  # Used to test local ondato sdk builds, if used, ondato pod dependencies should be commented out in the Podfiles (don't forget example)
  # s.vendored_frameworks = [
  #   "ios/Frameworks/FaceTecSDK.xcframework",
  #   "ios/Frameworks/OndatoAutocapture.xcframework",
  #   "ios/Frameworks/OndatoNFC.xcframework",
  #   "ios/Frameworks/OndatoScreenRecorder.xcframework",
  #   "ios/Frameworks/OndatoSDK.xcframework",
  #   "ios/Frameworks/OpenSSL.xcframework"
  # ]

  s.dependency "OndatoSDK-Core", "= 3.5.1"

  install_modules_dependencies(s)
end
