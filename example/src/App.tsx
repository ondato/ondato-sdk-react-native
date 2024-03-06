import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Platform,
  StatusBar,
} from 'react-native';
import {
  OndatoSdk,
  OndatoSdkState,
  OndatoSdkRef,
  OndatoSdkConfig,
  OndatoSdkLanguage,
} from 'ondato-sdk-react-native';
import type { Items } from './Picker';
import { Picker } from './Picker';
import { Button as CustomButton } from './Button';

type OAuth2Data = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export const COLORS = {
  primary: '#cafc81',
  light: '#f6f2f5',
  dark: '#262626',
};

export default () => {
  const ondatoSdkRef = useRef<OndatoSdkRef>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newLogEntry, setNewLogEntry] = useState<any>();
  const [log, setLog] = useState<string[]>([]);
  const [clientSecret, setClientSecret] = useState(0);
  const [setupId, setSetupId] = useState(0);
  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);
  const [showSetupIdPicker, setShowSetupIdPicker] = useState<boolean>(false);
  const [showClientSecretPicker, setShowClientSecretPicker] =
    useState<boolean>(false);
  const [config, setConfig] = useState<OndatoSdkConfig>({
    mode: 'test',
    showSplashScreen: true,
    showStartScreen: true,
    showSelfieFrame: true,
    showSuccessWindow: true,
    skipRegistrationIfDriverLicense: false,
    showIdentificationWaitingScreen: true,
    simpleCustomization: {
      primaryColor: COLORS.primary,
      textColor: COLORS.dark,
      buttonTextColor: COLORS.light,
    },
  });

  const updateConfig = (property: {
    [Property in keyof OndatoSdkConfig]: OndatoSdkConfig[Property];
  }) => {
    setConfig({ ...config, ...property });
  };

  const onStateUpdate = useCallback((state: OndatoSdkState) => {
    setNewLogEntry(state);
  }, []);

  useEffect(() => {
    if (newLogEntry) {
      setLog([
        `${new Date().toISOString()}:\n${JSON.stringify(newLogEntry, null, 2)}`,
        ...log,
      ]);
      setNewLogEntry(null);
    }
  }, [log, newLogEntry]);

  console.log(JSON.stringify(config, null, 2));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ondato SDK Example</Text>
        </View>

        <View
          style={[styles.scrollViewWrapper, styles.configScrollViewWrapper]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContainer}
            stickyHeaderIndices={[0]}
          >
            <View style={styles.scrollViewTitleContainer}>
              <Text style={styles.scrollViewTitle}>Configuration:</Text>
            </View>
            <View style={styles.section}>
              <Text style={[styles.secondaryTitle, styles.noMargin]}>
                Identity verification id
              </Text>
              <TextInput
                value={config.identityVerificationId}
                style={[styles.input, styles.fullWidthInput]}
                onChangeText={(value) =>
                  updateConfig({ identityVerificationId: value })
                }
              />
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <CustomButton
            disabled={!config?.identityVerificationId}
            title="Start"
            onPress={() => ondatoSdkRef.current?.open()}
          />
        </View>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
        <OndatoSdk
          ref={ondatoSdkRef}
          config={config}
          onStateUpdate={onStateUpdate}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scrollViewWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  configScrollViewWrapper: {
    flex: 2,
    marginBottom: 16,
  },
  logScrollViewWrapper: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: COLORS.light,
  },
  scrollViewContainer: {},
  scrollViewItem: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scrollViewTitleContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
  },
  scrollViewTitle: {
    fontSize: 18,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  logItem: {
    fontSize: 12,
    color: '#888888',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },

  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  noMargin: {
    marginBottom: 0,
  },
  fullWidthInput: {
    width: '100%',
    textAlign: 'left',
  },
  input: {
    padding: 0,
    borderColor: COLORS.dark,
    borderBottomWidth: 1,
    width: 100,
    textAlign: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selfieMode: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
    color: COLORS.dark,
  },
  secondaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.dark,
  },
  tertiaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 16,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
