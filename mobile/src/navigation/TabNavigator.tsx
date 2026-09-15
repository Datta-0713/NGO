import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { SearchScreen } from '../screens/Search/SearchScreen';
import { UpdatesScreen } from '../screens/Updates/UpdatesScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from './AppStack';

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  AddPlaceholder: undefined;
  Updates: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const CustomTabBarButton = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  
  return (
    <TouchableOpacity
      style={styles.fabContainer}
      onPress={() => navigation.navigate('SubmitNews')}
      activeOpacity={0.8}
    >
      <View style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, color }) => {
          let icon = '';
          if (route.name === 'Home') icon = focused ? '🏠' : '🏠';
          else if (route.name === 'Search') icon = '🔍';
          else if (route.name === 'Updates') icon = focused ? '🔔' : '🔔';
          else if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen 
        name="AddPlaceholder" 
        component={View} 
        options={{
          tabBarButton: () => <CustomTabBarButton />,
        }}
      />
      <Tab.Screen name="Updates" component={UpdatesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 60,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fabContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.fabGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.fabGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
});
