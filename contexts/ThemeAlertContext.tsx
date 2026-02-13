/**
 * Theme-aware alert: shows a Modal styled with app theme (dark/light) instead of native Alert.
 * Use showAlert(title, message?, buttons?, options?) from useThemeAlert().
 */
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemeAlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'cancel' | 'destructive' | 'default';
};

type ThemeAlertOptions = { cancelable?: boolean };

type ThemeAlertState = {
  visible: boolean;
  title: string;
  message: string;
  buttons: ThemeAlertButton[];
  cancelable: boolean;
};

type ThemeAlertContextValue = {
  showAlert: (
    title: string,
    message?: string,
    buttons?: ThemeAlertButton[],
    options?: ThemeAlertOptions
  ) => void;
};

const defaultState: ThemeAlertState = {
  visible: false,
  title: '',
  message: '',
  buttons: [],
  cancelable: true,
};

const ThemeAlertContext = createContext<ThemeAlertContextValue | null>(null);

export function ThemeAlertProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeAlertState>(defaultState);
  const colorScheme = useEffectiveColorScheme();
  const colors = Colors[colorScheme];
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const overlayBg = colorScheme === 'dark' ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.5)';

  const hide = useCallback(() => {
    setState(defaultState);
  }, []);

  const showAlert = useCallback(
    (title: string, message?: string, buttons?: ThemeAlertButton[], options?: ThemeAlertOptions) => {
      setState({
        visible: true,
        title,
        message: message ?? '',
        buttons: buttons ?? [{ text: 'OK', onPress: () => {} }],
        cancelable: options?.cancelable ?? true,
      });
    },
    []
  );

  const handlePress = useCallback(
    (button: ThemeAlertButton) => {
      button.onPress?.();
      hide();
    },
    [hide]
  );

  return (
    <ThemeAlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        visible={state.visible}
        transparent
        animationType="fade"
        onRequestClose={state.cancelable ? hide : undefined}>
        <Pressable
          style={[styles.overlay, { backgroundColor: overlayBg }]}
          onPress={state.cancelable ? hide : undefined}>
          <Pressable
            style={[styles.dialog, { backgroundColor: surfaceColor, borderColor }]}
            onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.title, { color: textColor }]}>{state.title}</Text>
            {state.message ? (
              <Text style={[styles.message, { color: textMuted }]}>{state.message}</Text>
            ) : null}
            <View style={styles.buttons}>
              {state.buttons.map((btn, i) => (
                <Pressable
                  key={i}
                  onPress={() => handlePress(btn)}
                  style={({ pressed }) => [
                    styles.button,
                    { borderColor },
                    btn.style === 'destructive' && { borderColor: colors.accent },
                    pressed && { opacity: 0.85 },
                  ]}>
                  <Text
                    style={[
                      styles.buttonText,
                      { color: btn.style === 'destructive' ? colors.accent : textColor },
                    ]}>
                    {btn.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemeAlertContext.Provider>
  );
}

export function useThemeAlert(): ThemeAlertContextValue {
  const ctx = useContext(ThemeAlertContext);
  if (!ctx) {
    return {
      showAlert: (title, message?, buttons?, _options?) => {
        if (typeof require('react-native').Alert !== 'undefined') {
          require('react-native').Alert.alert(
            title,
            message ?? '',
            buttons?.map((b) => ({ text: b.text, onPress: b.onPress, style: b.style })) ?? [{ text: 'OK' }]
          );
        }
      },
    };
  }
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  buttons: {
    gap: Spacing.sm,
  },
  button: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
