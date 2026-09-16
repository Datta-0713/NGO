import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/store';
import type { RootState } from './src/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { registerForPushNotifications } from './src/utils/pushNotifications';

// Inner component so it can access Redux state
function AppInner() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      // Register for push notifications once logged in — fire and forget
      registerForPushNotifications().catch(() => null);
    }
  }, [isAuthenticated]);

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppInner />
      </SafeAreaProvider>
    </Provider>
  );
}
