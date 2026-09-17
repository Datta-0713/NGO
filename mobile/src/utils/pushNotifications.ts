import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/axios';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function ensureDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync('deviceId');
  if (!deviceId) {
    deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await SecureStore.setItemAsync('deviceId', deviceId);
  }
  return deviceId;
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;
  let status = (await Notifications.getPermissionsAsync()).status;
  if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    if (!projectId) throw new Error('Expo EAS projectId is not configured');
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const deviceId = await ensureDeviceId();
    await api.patch('/users/me/push-token', {
      pushToken: token,
      platform: Platform.OS,
      deviceId,
      appVersion: Constants.expoConfig?.version || '1.0.0',
    });
    return token;
  } catch (err) {
    console.warn('Push notification registration failed:', err);
    return null;
  }
}

export async function unregisterForPushNotifications(): Promise<void> {
  try {
    await api.delete('/users/me/push-token', { data: { deviceId: await ensureDeviceId() } });
  } catch {}
}
