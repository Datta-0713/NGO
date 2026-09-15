import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from '../hooks/useAppSelector';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';

export const RootNavigator = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
