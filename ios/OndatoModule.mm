#import "OndatoModule.h"
#import <React/RCTConvert.h>
#import <OndatoSDK/OndatoSDK-Swift.h>

#if __has_include("OndatoSdkReactNative-Swift.h")
#import "OndatoSdkReactNative-Swift.h"
#elif __has_include(<OndatoSdkReactNative/OndatoSdkReactNative-Swift.h>)
#import <OndatoSdkReactNative/OndatoSdkReactNative-Swift.h>
#endif

using namespace facebook::react;

@implementation OndatoModule {
  OndatoLogic *ondato;
}

- (id)init {
  if (self = [super init]) {
    ondato = [OndatoLogic new];
  }
  return self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeOndatoModuleSpecJSI>(params);
}

- (void)startIdentification:(JS::NativeOndatoModule::OndatoNativeConfig &)config resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  // Construct configDict using accessors (already converted by Codegen)
  NSMutableDictionary *configDict = [NSMutableDictionary dictionary];
  configDict[@"identityVerificationId"] = config.identityVerificationId();
  configDict[@"mode"] = config.mode();
  configDict[@"language"] = config.language() ?: [NSNull null];
  configDict[@"skipRegistrationIfDriverLicense"] = @(config.skipRegistrationIfDriverLicense());
  configDict[@"showTranslationKeys"] = @(config.showTranslationKeys());
  configDict[@"enableNetworkIssuesScreen"] = @(config.enableNetworkIssuesScreen());
  configDict[@"disablePdfFileUpload"] = @(config.disablePdfFileUpload());
  configDict[@"switchPrimaryButtons"] = @(config.switchPrimaryButtons());
  configDict[@"appearance"] = config.appearance() ?: [NSNull null];
  configDict[@"logLevel"] = config.logLevel();
  
  if (auto fontsOpt = config.fonts()) {
    auto fontsStruct = *fontsOpt;
    
    if (auto iosOpt = fontsStruct.ios()) {
      auto iosStruct = *iosOpt;
      NSMutableDictionary *iosDict = [NSMutableDictionary dictionary];
      
      auto createFontDict = ^NSMutableDictionary *(const JS::NativeOndatoModule::IosFont& fontStruct) {
        NSMutableDictionary *fontDict = [NSMutableDictionary dictionary];
        fontDict[@"postScriptName"] = fontStruct.postScriptName();
        if (auto sizeOpt = fontStruct.size()) {
          fontDict[@"size"] = @(*sizeOpt);
        }
        if (auto weight = fontStruct.weight()) {
          fontDict[@"weight"] = weight;
        }
        return fontDict;
      };
      
      if (auto titleOpt = iosStruct.title()) {
        iosDict[@"title"] = createFontDict(*titleOpt);
      }
      if (auto subtitleOpt = iosStruct.subtitle()) {
        iosDict[@"subtitle"] = createFontDict(*subtitleOpt);
      }
      if (auto bodyOpt = iosStruct.body()) {
        iosDict[@"body"] = createFontDict(*bodyOpt);
      }
      if (auto listOpt = iosStruct.list()) {
        iosDict[@"list"] = createFontDict(*listOpt);
      }
      if (auto buttonOpt = iosStruct.button()) {
        iosDict[@"button"] = createFontDict(*buttonOpt);
      }
      
      if (iosDict.count > 0) {
        configDict[@"fonts"] = iosDict;
      }
    }
  }
  
  [ondato startIdentificationWithConfig:configDict resolve:resolve reject:reject];
}

- (NSString *)getLogs {
  return [ondato getLogs];
}

+ (NSString *)moduleName {
  return @"OndatoModule";
}

@end
