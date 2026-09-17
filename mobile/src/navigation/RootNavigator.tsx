import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import type { LinkingOptions, NavigatorScreenParams } from '@react-navigation/native';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { initializeAuth } from '../store/slices/authSlice';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { SplashScreen } from '../screens/Splash/SplashScreen';
import { NotificationBridge } from './NotificationBridge';
import { registerForPushNotifications } from '../utils/pushNotifications';
import type { TabParamList } from './TabNavigator';

type RootLinkingParamList = {
  ResetPassword: { token: string };
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  NewsDetail: { id: string };
  MySubmissions: undefined;
  ResubmitNews: { id: string };
  SavedStories: undefined;
};

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

  useEffect(() => {
    if (!isAuthenticated) return;
    void registerForPushNotifications();
  }, [isAuthenticated]);


  if (showSplash || isInitializing) {
    return (
      <SplashScreen onFinish={() => setShowSplash(false)} />
    );
  }

  const linking: LinkingOptions<RootLinkingParamList> = {
    prefixes: ['asiannewsbureau://'],
    config: {
      screens: {
        ResetPassword: 'reset-password/:token',
        MainTabs: { screens: { Home: 'home', Search: 'search', Updates: 'updates', Profile: 'profile' } },
        NewsDetail: 'news/:id',
        MySubmissions: 'my-submissions',
        ResubmitNews: 'resubmit/:id',
        SavedStories: 'saved',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <><NotificationBridge /><AppStack /></> : <AuthStack />}
    </NavigationContainer>
  );
};
