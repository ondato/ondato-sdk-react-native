import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { OndatoSdkView } from './OndatoSdkView';

const OndatoSdk = forwardRef<Types.OndatoSdkRef, Types.OndatoSdkProps>(
  function OndatoSdk({ config, onStateUpdate }, ref) {
    const [showView, setShowView] = useState(false);
    const [state, setState] = useState<Types.OndatoSdkState>({
      status: 'Dormant',
    });

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          setShowView(true);
        },
        close: () => {
          setShowView(false);
        },
      }),
      []
    );

    useEffect(() => {
      if (showView && !config?.identityVerificationId) {
        setState({
          status: 'Failed',
          message: 'No identityVerificationId provided',
        });
      }
    }, [showView, config?.identityVerificationId]);

    useEffect(() => {
      const { status } = state;
      if (onStateUpdate) {
        onStateUpdate(state);
      }

      if (
        status === 'Cancelled' ||
        status === 'Failed' ||
        status === 'Succeeded'
      ) {
        setShowView(false);
      }
    }, [onStateUpdate, state]);

    if (showView && config?.identityVerificationId) {
      const { identityVerificationId, ...rest } = config;

      return (
        <OndatoSdkView
          onStateUpdate={setState}
          config={{
            identityVerificationId,
            ...rest,
          }}
        />
      );
    }

    return null;
  }
);

type OndatoSdkProps = Types.OndatoSdkProps;
type OndatoSdkRef = Types.OndatoSdkRef;
type OndatoSdkLanguage = Types.OndatoSdkLanguage;
type OndatoSdkMode = Types.OndatoSdkMode;
type OndatoSdkConfig = Partial<Types.OndatoSdkConfig>;
type OndatoSdkStatus = Types.OndatoSdkStatus;
type OndatoSdkState = Types.OndatoSdkState;
type OndatoSdkLoad = Types.OndatoSdkLoad;

export {
  OndatoSdk,
  OndatoSdkProps,
  OndatoSdkRef,
  OndatoSdkLanguage,
  OndatoSdkConfig,
  OndatoSdkStatus,
  OndatoSdkState,
  OndatoSdkLoad,
  OndatoSdkMode,
};
