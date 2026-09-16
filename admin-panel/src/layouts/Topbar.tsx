import { Bell, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import type { RootState } from '@/store';
import { Avatar } from '@/components/ui/Avatar';

const PAGE_TITLES: Record<string, string> = {
  '/':              'Dashboard',
  '/news':          'News Management',
  '/submissions':   'Submissions',
  '/users':         'Contributors',
  '/credits':       'Credits Ledger',
  '/notifications': 'Notifications',
  '/settings':      'Settings',
};

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Admin Panel';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 md:hidden"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <Link to="/notifications" className="p-2 rounded-xl hover:bg-gray-100 text-muted transition-colors relative">
          <Bell size={19} />
        </Link>

        <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-gray-100">
          <Avatar src={user?.profilePhoto} name={user?.name ?? 'Admin'} size={34} />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-muted">Asian News Bureau</p>
          </div>
        </div>
      </div>
    </header>
  );
};