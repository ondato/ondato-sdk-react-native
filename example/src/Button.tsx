import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { COLORS } from './App';

type CustomButtonProps = { title: string; style?: ViewStyle } & Omit<
  PressableProps,
  'children' | 'style'
>;
export const Button = ({
  onPress,
  title,
  disabled,
  style,
}: CustomButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        {
          opacity: pressed ? 0.8 : 1,
        },
        disabled && { opacity: 0.5, backgroundColor: COLORS.light },
        style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.dark,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    textTransform: 'uppercase',
  },
});
