import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      activeOpacity={0.85}
    >
      <View style={styles.fab}>
        <Ionicons name="add" size={30} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home')    iconName = focused ? 'home'          : 'home-outline';
          if (route.name === 'Search')  iconName = focused ? 'search'        : 'search-outline';
          if (route.name === 'Updates') iconName = focused ? 'notifications' : 'notifications-outline';
          if (route.name === 'Profile') iconName = focused ? 'person'        : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ title: 'Home' }} />
      <Tab.Screen name="Search"  component={SearchScreen}  options={{ title: 'Search' }} />
      <Tab.Screen
        name="AddPlaceholder"
        component={View}
        options={{
          title: '',
          tabBarButton: () => <CustomTabBarButton />,
        }}
      />
      <Tab.Screen name="Updates" component={UpdatesScreen} options={{ title: 'Updates' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  fabContainer: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});
