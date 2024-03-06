#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(OSRNViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(configuration, NSString)
RCT_EXPORT_VIEW_PROPERTY(onUpdate, RCTBubblingEventBlock)

@end
