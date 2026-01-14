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

#if !RCT_NEW_ARCH_ENABLED   // Compile only when the old bridge is active

@interface OndatoLegacyModule : NSObject <RCTBridgeModule>
@property (nonatomic, strong) OndatoLogic *logic;
@end

@implementation OndatoLegacyModule

RCT_EXPORT_MODULE(OndatoModule);

- (instancetype)init {
  if (self = [super init]) {
    _logic = [OndatoLogic new];
  }
  return self;
}

RCT_EXPORT_METHOD(startIdentification:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    @try {
      NSMutableDictionary *flattened = [config mutableCopy];
      NSDictionary *fonts = config[@"fonts"];
      if (fonts && [fonts isKindOfClass:[NSDictionary class]]) {
        NSDictionary *iosFonts = fonts[@"ios"];
        if (iosFonts && [iosFonts isKindOfClass:[NSDictionary class]]) {
          flattened[@"fonts"] = iosFonts;
        }
      }
      
      [self.logic startIdentificationWithConfig:flattened
                                        resolve:resolve
                                         reject:reject];
    }
    @catch (NSException *exception) {
      RCTLogError(@"[Ondato] startIdentification exception: %@", exception);
      reject(@"ONDATO_ERROR", exception.reason, nil);
    }
  });
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getLogs)
{
  return [self.logic getLogs];
}

@end

#endif // !RCT_NEW_ARCH_ENABLED
