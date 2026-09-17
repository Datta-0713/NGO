import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { markReadThunk, refreshUnreadCount } from '../store/slices/notificationsSlice';

export const NotificationBridge = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const handledResponseIds = useRef(new Set<string>());
  useEffect(() => {
    const handleResponse = (response: Notifications.NotificationResponse) => {
      const responseId = String(response.notification.request.identifier || '');
      if (responseId && handledResponseIds.current.has(responseId)) return;
      if (responseId) handledResponseIds.current.add(responseId);
      const data = response.notification.request.content.data as any;
      if (data?.notificationId) dispatch(markReadThunk(String(data.notificationId)));
      const newsId = data?.newsId || data?.relatedEntity?.entityId;
      if (newsId) navigation.navigate('NewsDetail', { id: String(newsId) });
      else navigation.navigate('Updates');
      void dispatch(refreshUnreadCount()).unwrap().then((next) => Notifications.setBadgeCountAsync(Math.max(0, next.count))).catch(() => null);
    };

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

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleResponse(response);
    }).catch(() => null);

    const responseSub = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => { receivedSub.remove(); responseSub.remove(); };
  }, [dispatch, navigation]);
  return null;
};
