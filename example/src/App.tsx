import { useState } from 'react';
import { IdentityVerificationID } from './IdentityVerificationID';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { startIdentification } from 'ondato-sdk-react-native';

// https://ondato.atlassian.net/wiki/spaces/PUB/pages/2320990304/Authentication
const SECRET = '<Your secret that will be provided by Ondato>';

export default function App() {
  const [id, setId] = useState('');

  const disabled = !id;

  console.log('id is ', id);

  async function runOndato() {
    try {
      const result = await startIdentification({
        identityVerificationId: id,
        appearance: {
          buttonColor: '#FF0000',
          consentWindow: {
            header: { font: { size: 20, weight: 'bold' }, color: '#00FF00' },
            acceptButton: {
              font: { size: 15 },
              backgroundColor: '#007AFF',
              tintColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#007AFF',
              cornerRadius: 10,
            },
            declineButton: {
              font: { size: 15 },
              backgroundColor: '#FFFFFF',
              tintColor: '#007AFF',
              borderWidth: 1,
              borderColor: '#007AFF',
              cornerRadius: 10,
            },
            body: {
              font: { size: 15 },
              textColor: '#000000',
            },
          },
        },
      });

      if (result.status === 'success') {
        console.log('Success, id:', result.id);
      } else {
        console.error('Failed:', result.error);
      }
    } catch (e) {
      console.error('Native error:', e);
    }
  }

  return (
    <View style={styles.container}>
      <IdentityVerificationID secret={SECRET} id={id} setId={setId} />

      <Pressable
        disabled={disabled}
        onPress={runOndato}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>Start Ondato</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 32,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cafc81',
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#f6f2f5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#262626',
  },
});
