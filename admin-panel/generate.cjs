const fs = require('fs');
const path = require('path');

const root = 'd:/NGO/admin-panel';

const files = {
  'package.json': `{
  "name": "ngo-admin-panel",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx",
    "preview": "vite preview"
  },
  "dependencies": {
    "@reduxjs/toolkit": "^2.0.1",
    "axios": "^1.6.2",
    "date-fns": "^3.0.6",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-redux": "^9.0.4",
    "react-router-dom": "^6.21.0",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}`,

  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NEXY Foundation — Admin Panel</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,

  'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});`,

  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,

  'tsconfig.node.json': `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`,

  '.env.example': `VITE_API_BASE_URL=http://localhost:5000/api`,

  '.gitignore': `node_modules
dist
dist-ssr
*.local
.env
.env.*
!.env.example
.DS_Store`,

  'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);`,

  'src/App.tsx': `import React from 'react';
import AppRoutes from './routes/AppRoutes';

const App: React.FC = () => {
  return <AppRoutes />;
};

export default App;`,

  'src/types/index.ts': `export interface User {
  _id: string;
  name: string;
  email: string;
  profilePhoto: string;
  bio: string;
  location: string;
  role: 'user' | 'admin';
  credits: number;
  storiesCount: number;
  likesReceived: number;
  createdAt: string;
}

export interface NewsItem {
  _id: string;
  title: string;
  description: string;
  media: Array<{ url: string; type: 'image' | 'video'; publicId: string }>;
  location: string;
  date: string;
  category: 'Community' | 'Education' | 'Environment' | 'Health' | 'Events';
  status: 'pending' | 'published' | 'rejected';
  submittedBy?: User;
  createdByAdmin: boolean;
  reviewedBy?: User;
  rejectionMessage?: string;
  likes: string[];
  views: number;
  publishedAt?: string;
  createdAt: string;
}

export interface CreditTransaction {
  _id: string;
  user: User | string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  relatedNews?: NewsItem | string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  publishedNewsCount: number;
  pendingCount: number;
  totalContributors: number;
  totalCreditsAwarded: number;
  recentSubmissions: NewsItem[];
  submissionsLast30Days: Array<{ date: string; count: number }>;
  needsAttentionData: {
    pendingSubmissions: number;
    newContributorsThisMonth: number;
    creditsToBeAwarded: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}`,

  'src/constants/index.ts': `export const CATEGORIES = ['Community', 'Education', 'Environment', 'Health', 'Events'] as const;
export const SUBMISSION_STATUSES = ['pending', 'published', 'rejected'] as const;
export const COLORS = {
  primary: '#2D6A4F',
  primaryLight: '#40916C',
  accent: '#7C3AED',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textMuted: '#6B7280',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;`,

  'src/index.css': `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background-color: #F9FAFB;
  color: #111827;
  -webkit-font-smoothing: antialiased;
}

a { text-decoration: none; color: inherit; }
button { font-family: inherit; cursor: pointer; border: none; background: none; }
input, textarea, select { font-family: inherit; }

/* Utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.mt-4 { margin-top: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.rounded { border-radius: 8px; }
.shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.bg-white { background-color: #FFFFFF; }
.text-primary { color: #2D6A4F; }
.text-muted { color: #6B7280; }
.text-error { color: #EF4444; }
.text-sm { font-size: 0.875rem; }
.text-lg { font-size: 1.125rem; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.grid { display: grid; }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
`,

  'src/api/axios.ts': `import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(\`\${api.defaults.baseURL}/auth/refresh-token\`, { token: refreshToken });
        localStorage.setItem('accessToken', res.data.data.accessToken);
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;`,

  'src/api/authApi.ts': `import api from './axios';

export const login = (data: any) => api.post('/auth/login', data).then(res => res.data);
export const getMe = () => api.get('/auth/me').then(res => res.data);`,

  'src/api/newsApi.ts': `import api from './axios';

export const getFeed = (params: any) => api.get('/news', { params }).then(res => res.data);
export const getNewsById = (id: string) => api.get(\`/news/\${id}\`).then(res => res.data);
export const createNews = (data: any) => api.post('/news', data).then(res => res.data);
export const deleteNews = (id: string) => api.delete(\`/news/\${id}\`).then(res => res.data);`,

  'src/api/submissionsApi.ts': `import api from './axios';

export const getSubmissions = (params: any) => api.get('/submissions', { params }).then(res => res.data);
export const getSubmissionById = (id: string) => api.get(\`/submissions/\${id}\`).then(res => res.data);
export const approveSubmission = (id: string) => api.post(\`/submissions/\${id}/approve\`).then(res => res.data);
export const rejectSubmission = (id: string, rejectionMessage: string) => api.post(\`/submissions/\${id}/reject\`, { rejectionMessage }).then(res => res.data);`,

  'src/api/usersApi.ts': `import api from './axios';

export const getUsers = (params: any) => api.get('/users', { params }).then(res => res.data);
export const getUserById = (id: string) => api.get(\`/users/\${id}\`).then(res => res.data);`,

  'src/api/creditsApi.ts': `import api from './axios';

export const adjustCredits = (userId: string, amount: number, reason: string) => api.post(\`/users/\${userId}/credits\`, { amount, reason }).then(res => res.data);`,

  'src/api/notificationsApi.ts': `import api from './axios';

export const broadcastNotification = (data: { title: string, message: string }) => api.post('/notifications/broadcast', data).then(res => res.data);
export const getNotifications = () => api.get('/notifications').then(res => res.data);`,

  'src/api/adminApi.ts': `import api from './axios';

export const getDashboardStats = () => api.get('/admin/dashboard').then(res => res.data);`,

  'src/store/index.ts': `import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import submissionsReducer from './slices/submissionsSlice';
import newsReducer from './slices/newsSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    submissions: submissionsReducer,
    news: newsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;`,

  'src/store/slices/authSlice.ts': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '@/api/authApi';
import { User } from '@/types';

interface AuthState { user: User | null; accessToken: string | null; isAuthenticated: boolean; loading: boolean; error: string | null; }

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk('auth/login', async (credentials: any) => {
  const res = await authApi.login(credentials);
  localStorage.setItem('accessToken', res.data.accessToken);
  localStorage.setItem('refreshToken', res.data.refreshToken);
  return res.data;
});

export const getMeThunk = createAsyncThunk('auth/getMe', async () => {
  const res = await authApi.getMe();
  return res.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(loginThunk.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Login failed'; })
      .addCase(getMeThunk.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(getMeThunk.rejected, (state) => { authSlice.caseReducers.logout(state); });
  }
});
export const { logout } = authSlice.actions;
export default authSlice.reducer;`,

  'src/store/slices/dashboardSlice.ts': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '@/api/adminApi';
import { DashboardStats } from '@/types';

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async () => {
  const res = await adminApi.getDashboardStats();
  return res.data;
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { stats: null as DashboardStats | null, loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to load stats'; });
  }
});
export default dashboardSlice.reducer;`,

  'src/store/slices/submissionsSlice.ts': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '@/api/submissionsApi';
import { NewsItem } from '@/types';

export const fetchSubmissions = createAsyncThunk('submissions/fetch', async (params: any) => {
  const res = await api.getSubmissions(params);
  return res;
});
export const approveSubmission = createAsyncThunk('submissions/approve', async (id: string) => {
  const res = await api.approveSubmission(id);
  return res.data;
});
export const rejectSubmission = createAsyncThunk('submissions/reject', async ({ id, msg }: {id: string, msg: string}) => {
  const res = await api.rejectSubmission(id, msg);
  return res.data;
});

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState: { items: [] as NewsItem[], total: 0, page: 1, loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissions.pending, (state) => { state.loading = true; })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      });
  }
});
export default submissionsSlice.reducer;`,

  'src/store/slices/newsSlice.ts': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '@/api/newsApi';
import { NewsItem } from '@/types';

export const fetchFeed = createAsyncThunk('news/fetch', async (params: any) => {
  const res = await api.getFeed(params);
  return res;
});

const newsSlice = createSlice({
  name: 'news',
  initialState: { items: [] as NewsItem[], total: 0, page: 1, loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => { state.loading = true; })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      });
  }
});
export default newsSlice.reducer;`,

  'src/store/slices/usersSlice.ts': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '@/api/usersApi';
import { User } from '@/types';

export const fetchUsers = createAsyncThunk('users/fetch', async (params: any) => {
  const res = await api.getUsers(params);
  return res;
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [] as User[], total: 0, page: 1, loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      });
  }
});
export default usersSlice.reducer;`,

  'src/components/ui/StatCard.tsx': `import React from 'react';

export const StatCard = ({ title, value, change, icon: Icon, trendUp }: any) => (
  <div className="bg-white p-6 rounded shadow flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <h3 className="text-muted text-sm font-medium">{title}</h3>
      <div style={{ color: '#2D6A4F', backgroundColor: '#e6f4ea', padding: '8px', borderRadius: '8px' }}>
        <Icon size={20} />
      </div>
    </div>
    <div className="text-2xl font-bold">{value}</div>
    {change && (
      <div className="text-sm font-medium" style={{ color: trendUp ? '#22C55E' : '#EF4444' }}>
        {trendUp ? '↑' : '↓'} {change}% from last month
      </div>
    )}
  </div>
);`,

  'src/components/ui/Badge.tsx': `import React from 'react';

export const Badge = ({ status }: { status: string }) => {
  let color = '#6B7280';
  let bg = '#F3F4F6';
  
  if (status === 'published' || status === 'approved') { color = '#22C55E'; bg = '#DCFCE7'; }
  if (status === 'pending') { color = '#F59E0B'; bg = '#FEF3C7'; }
  if (status === 'rejected') { color = '#EF4444'; bg = '#FEE2E2'; }

  return (
    <span style={{ backgroundColor: bg, color, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
};`,

  'src/components/ui/Avatar.tsx': `import React from 'react';

export const Avatar = ({ src, name, size = 40 }: { src?: string, name: string, size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#2D6A4F', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 'bold', overflow: 'hidden' }}>
    {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name.charAt(0).toUpperCase()}
  </div>
);`,

  'src/components/ui/Button.tsx': `import React from 'react';

export const Button = ({ children, variant = 'primary', onClick, ...props }: any) => {
  const baseStyle = { padding: '8px 16px', borderRadius: '6px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
  const styles: any = {
    primary: { backgroundColor: '#2D6A4F', color: '#FFF' },
    secondary: { backgroundColor: '#FFF', color: '#111827', border: '1px solid #E5E7EB' },
    danger: { backgroundColor: '#EF4444', color: '#FFF' },
  };
  return <button style={{ ...baseStyle, ...styles[variant] }} onClick={onClick} {...props}>{children}</button>;
};`,

  'src/components/ui/Input.tsx': `import React from 'react';

export const Input = ({ label, error, ...props }: any) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-sm font-medium">{label}</label>}
    <input style={{ padding: '10px', borderRadius: '6px', border: '1px solid #E5E7EB', outline: 'none' }} {...props} />
    {error && <span className="text-error text-sm">{error}</span>}
  </div>
);`,

  'src/components/ui/Modal.tsx': `import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ backgroundColor: '#FFF', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'col' }}>
        <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};`,

  'src/components/ui/Table.tsx': `import React from 'react';

export const Table = ({ children }: any) => (
  <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
  </div>
);`,

  'src/layouts/Sidebar.tsx': `import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, Users, Coins, Bell, Settings, Leaf } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileText, label: 'News', path: '/news' },
  { icon: CheckSquare, label: 'Submissions', path: '/submissions' },
  { icon: Users, label: 'Users', path: '/users' },
  { icon: Coins, label: 'Credits', path: '/credits' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  return (
    <div style={{ width: '240px', backgroundColor: '#FFF', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
      <div className="p-6 flex items-center gap-2 text-primary font-bold text-lg border-b border-gray-200">
        <Leaf size={24} /> NEXY Foundation
      </div>
      <div className="flex-col gap-2 p-4 flex-grow" style={{ display: 'flex' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
              backgroundColor: isActive ? '#e6f4ea' : 'transparent',
              color: isActive ? '#2D6A4F' : '#6B7280',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none'
            })}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="p-4 text-center text-sm text-muted border-t border-gray-200">
        Empowering Communities
      </div>
    </div>
  );
};`,

  'src/layouts/Topbar.tsx': `import React from 'react';
import { Bell } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';

export const Topbar = ({ title = 'Dashboard' }: { title?: string }) => {
  const { user } = useAuth();
  return (
    <div style={{ height: '72px', backgroundColor: '#FFF', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="flex items-center gap-6">
        <button style={{ position: 'relative' }}>
          <Bell size={20} className="text-muted" />
          <span style={{ position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', width: 8, height: 8, borderRadius: '50%' }}></span>
        </button>
        <div className="flex items-center gap-2">
          <Avatar name={user?.name || 'Admin'} />
          <span className="text-sm font-medium">{user?.name || 'Admin User'}</span>
        </div>
      </div>
    </div>
  );
};`,

  'src/layouts/AppLayout.tsx': `import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Sidebar />
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};`,

  'src/hooks/useAuth.ts': `import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  return { ...auth, logout: () => dispatch(logout()) };
};`,

  'src/routes/ProtectedRoute.tsx': `import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};`,

  'src/routes/AppRoutes.tsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import LoginPage from '@/pages/Auth/LoginPage';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import NewsPage from '@/pages/News/NewsPage';
import SubmissionsPage from '@/pages/Submissions/SubmissionsPage';
import UsersPage from '@/pages/Users/UsersPage';
import CreditsPage from '@/pages/Credits/CreditsPage';
import NotificationsPage from '@/pages/Notifications/NotificationsPage';
import SettingsPage from '@/pages/Settings/SettingsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};
export default AppRoutes;`,

  'src/pages/Auth/LoginPage.tsx': `import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginThunk } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Leaf } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginThunk({ email, password })).unwrap();
      navigate('/');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="bg-white p-8 rounded shadow w-full" style={{ maxWidth: '400px' }}>
        <div className="flex flex-col items-center gap-2 mb-6 text-primary">
          <Leaf size={48} />
          <h1 className="text-2xl font-bold text-center text-primary">NEXY Foundation</h1>
          <p className="text-muted text-sm">Admin Panel Login</p>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input label="Email" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full mt-4">Login</Button>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;`,

  'src/pages/Dashboard/DashboardPage.tsx': `import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import { StatCard } from '@/components/ui/StatCard';
import { FileText, CheckSquare, Users, Coins } from 'lucide-react';

const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading || !stats) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <StatCard title="Published News" value={stats.publishedNewsCount} icon={FileText} change={12} trendUp={true} />
        <StatCard title="Pending Review" value={stats.pendingCount} icon={CheckSquare} change={5} trendUp={false} />
        <StatCard title="Total Contributors" value={stats.totalContributors} icon={Users} change={18} trendUp={true} />
        <StatCard title="Credits Awarded" value={stats.totalCreditsAwarded} icon={Coins} change={2} trendUp={true} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold mb-4">Recent Submissions</h2>
          <div className="text-muted">Table component goes here...</div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold mb-4">Needs Attention</h2>
          <div className="text-muted">Attention panel goes here...</div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;`,

  'src/pages/News/NewsPage.tsx': `import React from 'react';

const NewsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">News Management</h1>
    <div className="bg-white p-6 rounded shadow">News content goes here...</div>
  </div>
);
export default NewsPage;`,

  'src/pages/Submissions/SubmissionsPage.tsx': `import React from 'react';

const SubmissionsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Submissions Review</h1>
    <div className="bg-white p-6 rounded shadow">Submissions content goes here...</div>
  </div>
);
export default SubmissionsPage;`,

  'src/pages/Users/UsersPage.tsx': `import React from 'react';

const UsersPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">User Management</h1>
    <div className="bg-white p-6 rounded shadow">Users content goes here...</div>
  </div>
);
export default UsersPage;`,

  'src/pages/Credits/CreditsPage.tsx': `import React from 'react';

const CreditsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Credits Management</h1>
    <div className="bg-white p-6 rounded shadow">Credits content goes here...</div>
  </div>
);
export default CreditsPage;`,

  'src/pages/Notifications/NotificationsPage.tsx': `import React from 'react';

const NotificationsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Notifications</h1>
    <div className="bg-white p-6 rounded shadow">Notifications content goes here...</div>
  </div>
);
export default NotificationsPage;`,

  'src/pages/Settings/SettingsPage.tsx': `import React from 'react';

const SettingsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <div className="bg-white p-6 rounded shadow">Settings content goes here...</div>
  </div>
);
export default SettingsPage;`,

  'README.md': `# NEXY Foundation Admin Panel

React + Vite + TypeScript admin panel.

## Run
\`\`\`
npm install
npm run dev
\`\`\`
`
};

Object.entries(files).forEach(([filepath, content]) => {
  const fullPath = path.join(root, filepath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
});

console.log('All files generated successfully.');
