import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { NewsDetailScreen } from '../screens/NewsDetail/NewsDetailScreen';
import { SubmitNewsScreen } from '../screens/SubmitNews/SubmitNewsScreen';
import { MySubmissionsScreen } from '../screens/MySubmissions/MySubmissionsScreen';

export type AppStackParamList = {
  MainTabs: undefined;
  NewsDetail: { id: string };
  SubmitNews: undefined;
  MySubmissions: undefined;
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
    </Stack.Navigator>
  );
};
