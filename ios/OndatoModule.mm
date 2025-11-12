#import "OndatoModule.h"
#import <React/RCTConvert.h>
#import <OndatoSDK/OndatoSDK-Swift.h>

#if __has_include("OndatoSdkReactNative-Swift.h")
#import "OndatoSdkReactNative-Swift.h"
#elif __has_include(<OndatoSdkReactNative/OndatoSdkReactNative-Swift.h>)
#import <OndatoSdkReactNative/OndatoSdkReactNative-Swift.h>
#endif

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
  configDict[@"showStartScreen"] = @(config.showStartScreen());
  configDict[@"showSuccessWindow"] = @(config.showSuccessWindow());
  configDict[@"removeSelfieFrame"] = @(config.removeSelfieFrame());
  configDict[@"skipRegistrationIfDriverLicense"] = @(config.skipRegistrationIfDriverLicense());
  
  // Handle appearance
  if (auto appearance = config.appearance()) {
    NSMutableDictionary *appearanceDict = [NSMutableDictionary dictionary];
    appearanceDict[@"progressColor"] = appearance->progressColor() ?: [NSNull null];
    appearanceDict[@"buttonColor"] = appearance->buttonColor() ?: [NSNull null];
    appearanceDict[@"buttonTextColor"] = appearance->buttonTextColor() ?: [NSNull null];
    appearanceDict[@"errorColor"] = appearance->errorColor() ?: [NSNull null];
    appearanceDict[@"errorTextColor"] = appearance->errorTextColor() ?: [NSNull null];
    appearanceDict[@"textColor"] = appearance->textColor() ?: [NSNull null];
    appearanceDict[@"backgroundColor"] = appearance->backgroundColor() ?: [NSNull null];
    appearanceDict[@"imageTintColor"] = appearance->imageTintColor() ?: [NSNull null];
    
    if (auto consentWindow = appearance->consentWindow()) {
      NSMutableDictionary *consentDict = [NSMutableDictionary dictionary];
      // Header
      consentDict[@"header"] = @{
        @"font": @{
          @"size": @(consentWindow->header().font().size()),
          @"weight": consentWindow->header().font().weight() ?: [NSNull null],
          @"name": consentWindow->header().font().name() ?: [NSNull null],
        },
        @"color": consentWindow->header().color(),
      };
      // Body
      consentDict[@"body"] = @{
        @"font": @{
          @"size": @(consentWindow->body().font().size()),
          @"weight": consentWindow->body().font().weight() ?: [NSNull null],
          @"name": consentWindow->body().font().name() ?: [NSNull null],
        },
        @"textColor": consentWindow->body().textColor(),
      };
      // Accept Button
      consentDict[@"acceptButton"] = @{
        @"font": @{
          @"size": @(consentWindow->acceptButton().font().size()),
          @"weight": consentWindow->acceptButton().font().weight() ?: [NSNull null],
          @"name": consentWindow->acceptButton().font().name() ?: [NSNull null],
        },
        @"backgroundColor": consentWindow->acceptButton().backgroundColor(),
        @"tintColor": consentWindow->acceptButton().tintColor(),
        @"borderWidth": @(consentWindow->acceptButton().borderWidth()),
        @"borderColor": consentWindow->acceptButton().borderColor(),
        @"cornerRadius": @(consentWindow->acceptButton().cornerRadius()),
      };
      // Decline Button
      consentDict[@"declineButton"] = @{
        @"font": @{
          @"size": @(consentWindow->declineButton().font().size()),
          @"weight": consentWindow->declineButton().font().weight() ?: [NSNull null],
          @"name": consentWindow->declineButton().font().name() ?: [NSNull null],
        },
        @"backgroundColor": consentWindow->declineButton().backgroundColor(),
        @"tintColor": consentWindow->declineButton().tintColor(),
        @"borderWidth": @(consentWindow->declineButton().borderWidth()),
        @"borderColor": consentWindow->declineButton().borderColor(),
        @"cornerRadius": @(consentWindow->declineButton().cornerRadius()),
      };
      appearanceDict[@"consentWindow"] = consentDict;
    }
    configDict[@"appearance"] = appearanceDict;
  }
  
  [ondato startIdentificationWithConfig:configDict resolve:resolve reject:reject];
}

+ (NSString *)moduleName {
  return @"OndatoModule";
}

@end
