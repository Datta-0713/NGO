import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { initializeAuth } from '../store/slices/authSlice';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { SplashScreen } from '../screens/Splash/SplashScreen';

export const RootNavigator = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    dispatch(initializeAuth()).finally(() => {
      setIsInitializing(false);
    });
  }, [dispatch]);

  // Show splash until both auth is initialized AND splash animation finishes
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash || isInitializing) {
    return (
      <SplashScreen onFinish={() => setShowSplash(false)} />
    );
  }

  const linking = {
    prefixes: ['asiannewsbureau://'],
    config: {
      screens: {
        ResetPassword: 'reset-password/:token',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
