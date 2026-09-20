import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/axios';
import { store } from '../store';
import { refreshUnreadCount } from '../store/slices/notificationsSlice';

// Custom notification sound served from the bundled assets.
// Falls back to the default system sound when the custom file is absent.
const NOTIFICATION_SOUND = 'notification';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    // Play the custom sound when available; expo-notifications will fall
    // back to the default if the asset is missing on a given build.
    sound: NOTIFICATION_SOUND,
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

/**
 * Ensures the Android notification channel exists with a custom sound.
 * Must be called before any notification is delivered while the app is foregrounded.
 */
export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Asian News Bureau',
      description: 'Breaking news, contributor highlights and moderation updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: NOTIFICATION_SOUND as any,
      enableVibrate: true,
      showBadge: true,
    });
  } catch (err) {
    console.warn('[Push] Failed to set notification channel:', err);
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  // Ensure the Android channel exists before requesting a token — some
  // Android versions silently drop notifications when the channel is missing.
  await ensureNotificationChannel();

  // Check existing permission; if permanently denied, do not re-prompt.
  let status = (await Notifications.getPermissionsAsync()).status;
  if (status === 'denied') {
    console.warn('[Push] Push permissions permanently denied by user.');
    return null;
  }
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') {
    console.warn('[Push] Push permission not granted:', status);
    return null;
  }

  let lastError: unknown = null;
  // Retry the Expo token fetch once — transient network issues are common
  // on first launch and a single failure should not permanently block pushes.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
      if (!projectId) throw new Error('Expo EAS projectId is not configured');
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      const deviceId = await ensureDeviceId();

      // Persist the token on the server. Use the authed axios instance so the
      // 401 interceptor can transparently refresh before this request.
      await api.patch('/users/me/push-token', {
        pushToken: token,
        platform: Platform.OS,
        deviceId,
        appVersion: Constants.expoConfig?.version || '1.0.0',
      });

      // Best-effort: refresh the in-app badge count now that we are registered.
      try {
        await store.dispatch(refreshUnreadCount()).unwrap();
      } catch {}

      return token;
    } catch (err) {
      lastError = err;
      console.warn(`[Push] Registration attempt ${attempt + 1} failed:`, err);
      if (attempt === 0) {
        // Brief pause before retrying
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  console.warn('[Push] Push notification registration failed after retries:', lastError);
  return null;
}

export async function unregisterForPushNotifications(): Promise<void> {
  try {
    await api.delete('/users/me/push-token', { data: { deviceId: await ensureDeviceId() } });
  } catch (err) {
    console.warn('[Push] Failed to unregister push token:', err);
  }
}

/**
 * Plays the notification sound immediately (foreground alert preview).
 * Useful when the app is in foreground and we want an audible cue.
 */
export async function playNotificationSound(): Promise<void> {
  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Asian News Bureau',
      importance: Notifications.AndroidImportance.MAX,
      sound: NOTIFICATION_SOUND as any,
    });
  } catch {}
}