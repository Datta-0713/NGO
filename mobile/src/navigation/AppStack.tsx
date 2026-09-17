import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { NewsDetailScreen } from '../screens/NewsDetail/NewsDetailScreen';
import { SubmitNewsScreen } from '../screens/SubmitNews/SubmitNewsScreen';
import { MySubmissionsScreen } from '../screens/MySubmissions/MySubmissionsScreen';
import { ResubmitNewsScreen } from '../screens/ResubmitNews/ResubmitNewsScreen';
import { SavedStoriesScreen } from '../screens/SavedStories/SavedStoriesScreen';
import type { TabParamList } from './TabNavigator';

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  NewsDetail: { id: string };
  SubmitNews: undefined;
  MySubmissions: undefined;
  ResubmitNews: { id: string };
  SavedStories: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="SubmitNews"
        component={SubmitNewsScreen}
        options={{ presentation: 'formSheet' }}
      />
      <Stack.Screen name="MySubmissions" component={MySubmissionsScreen} />
      <Stack.Screen name="ResubmitNews" component={ResubmitNewsScreen} />
      <Stack.Screen name="SavedStories" component={SavedStoriesScreen} />
    </Stack.Navigator>
  );
};
