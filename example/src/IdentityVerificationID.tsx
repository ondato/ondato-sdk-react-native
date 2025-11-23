import { useState } from 'react';
import { getId } from './idFetcher';
import { Text, View, StyleSheet, Pressable } from 'react-native';

type Props = {
  secret: string;
  id: string;
  setId: (id: string) => void;
};

export const IdentityVerificationID = ({ secret, id, setId }: Props) => {
  const [loading, setLoading] = useState(false);

  const getIdentityVerificationId = async () => {
    setId(id);

    try {
      const identitiyVerificationId = await getId(secret);
      setId(identitiyVerificationId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text>Identity Verification ID:</Text>
        <Text>{id}</Text>
      </View>
      <Pressable
        disabled={loading}
        onPress={getIdentityVerificationId}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          loading && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>Get ID</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  button: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'skyblue',
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
