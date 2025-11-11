#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>
#import <OndatoSDK/OndatoSDK-Swift.h>

#if __has_include("OndatoSdkReactNative-Swift.h")
#import "OndatoSdkReactNative-Swift.h"
#elif __has_include(<OndatoSdkReactNative/OndatoSdkReactNative-Swift.h>)
#import <OndatoSdkReactNative/OndatoSdkReactNative-Swift.h>
#else
#error "Could not find the generated Swift header (OndatoSdkReactNative-Swift.h)"
#endif

#if !RCT_NEW_ARCH_ENABLED   // compile only when the old bridge is active

@interface OndatoLegacyModule : NSObject <RCTBridgeModule>
@end

@implementation OndatoLegacyModule

RCT_EXPORT_MODULE(OndatoModule);

RCT_EXPORT_METHOD(startIdentification:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    @try {
      OndatoLogic *swiftModule = [OndatoLogic new];
      [swiftModule startIdentificationWithConfig:config
                                         resolve:resolve
                                          reject:reject];
    }
    @catch (NSException *exception) {
      RCTLogError(@"[Ondato] startIdentification exception: %@", exception);
      reject(@"ONDATO_ERROR", exception.reason, nil);
    }
  });
}

@end

#endif // !RCT_NEW_ARCH_ENABLED
