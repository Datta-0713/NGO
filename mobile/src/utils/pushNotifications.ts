import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from '../api/axios';

/**
 * Register for Expo push notifications.
 * Call this once after the user is logged in.
 * Silently returns null if permissions are denied or on simulator.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // Simulators cannot receive push notifications
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'nexy-foundation', // matches your eas.json / app.json
    });
    const token = tokenData.data;

    // Register token with our backend
    await api.patch('/users/me/push-token', { pushToken: token });

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#16a34a',
      });
    }

    return token;
  } catch (err) {
    console.warn('Push token registration failed (non-fatal):', err);
    return null;
  }
}
