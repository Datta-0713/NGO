import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { getMeThunk } from '@/store/slices/authSlice';
import AppRoutes from './routes/AppRoutes';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Token exists — try to restore the session by fetching the user
      dispatch(getMeThunk()).finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
  }, [dispatch]);

  if (initializing) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9fafb',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '4px solid #e5e7eb',
            borderTopColor: '#16a34a',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <AppRoutes />;
};

export default App;