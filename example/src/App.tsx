import { useState } from 'react';
import { IdentityVerificationID } from './IdentityVerificationID';
import { View, StyleSheet, Pressable, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { startIdentification, getLogs } from 'ondato-sdk-react-native';

// https://ondato.atlassian.net/wiki/spaces/PUB/pages/2320990304/Authentication
const SECRET = '<Your secret that will be provided by Ondato>';

export default function App() {
  const [id, setId] = useState('');
  const [logs, setLogs] = useState('');

  const disabled = !id;

  async function runOndato() {
    try {
      const result = await startIdentification({
        identityVerificationId: id,
        language: 'de',
        appearance: {
          brand: {
            colors: {
              primaryColor: '#ffff00',
            },
          },
        },
        fonts: {
          android: {
            body: 'eagle_lake',
          },
          ios: {
            body: {
              postScriptName: 'StoryScript-Regular',
              size: 32,
            },
          },
        },
        logLevel: 'debug',
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
    <SafeAreaView style={styles.container}>
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

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.logsButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => {
          const fetchedLogs = getLogs();
          setLogs(fetchedLogs);
        }}
      >
        <Text style={styles.buttonText}>Get Logs</Text>
      </Pressable>

      <View style={styles.logsContainer}>
        <Text style={styles.title}>Logs:</Text>
        <ScrollView style={styles.logs}>
          <Text style={styles.logsText}>{logs}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 32,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  button: {
    width: '100%',
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logsContainer: {
    width: '100%',
    flex: 1,
  },
  logsButton: {
    backgroundColor: '#caf0fc',
  },
  logs: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    padding: 8,
    backgroundColor: '#f9f9f9',
  },
  logsText: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'monospace',
  },
});
