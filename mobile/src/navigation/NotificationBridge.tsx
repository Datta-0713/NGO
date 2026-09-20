import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { markReadThunk, refreshUnreadCount } from '../store/slices/notificationsSlice';

export const NotificationBridge = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const handledResponseIds = useRef(new Set<string>());

  useEffect(() => {
    if (lastNotificationResponse) {
      const responseId = String(lastNotificationResponse.notification.request.identifier || '');
      if (responseId && handledResponseIds.current.has(responseId)) return;
      if (responseId) handledResponseIds.current.add(responseId);

      const data = lastNotificationResponse.notification.request.content.data as any;
      if (data?.notificationId) {
        dispatch(markReadThunk(String(data.notificationId)));
      }

      const newsId = data?.newsId || data?.relatedEntity?.entityId;
      if (newsId) {
        navigation.navigate('NewsDetail', { id: String(newsId) });
      } else {
        navigation.navigate('Updates');
      }

      void dispatch(refreshUnreadCount())
        .unwrap()
        .then((next) => Notifications.setBadgeCountAsync(Math.max(0, next.count)))
        .catch(() => null);
    }
  }, [lastNotificationResponse, dispatch, navigation]);

  useEffect(() => {
    const refreshBadge = async () => {
      try {
        const action = await dispatch(refreshUnreadCount()).unwrap();
        await Notifications.setBadgeCountAsync(Math.max(0, action.count));
      } catch {}
    };

    void refreshBadge();

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      void refreshBadge();
    });

    return () => { receivedSub.remove(); };
  }, [dispatch]);

  return null;
};
