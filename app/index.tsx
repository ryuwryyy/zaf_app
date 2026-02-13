import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { getOnboardingCompleted } from '@/lib/storage';

type RedirectTo = '/splash' | '/(tabs)' | null;

/**
 * Entry: redirect to (tabs) if onboarding completed, else to splash.
 * Shows a brief loading state while reading storage.
 */
export default function Index() {
  const [redirectTo, setRedirectTo] = useState<RedirectTo>(null);

  useEffect(() => {
    let cancelled = false;
    getOnboardingCompleted().then((completed) => {
      if (!cancelled) {
        setRedirectTo(completed ? '/(tabs)' : '/splash');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (redirectTo === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#F18E34" />
      </View>
    );
  }

  return <Redirect href={redirectTo} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
});
