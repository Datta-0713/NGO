import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, Users, Coins, Bell, Settings, Leaf, LogOut, Flag, ScrollText } from 'lucide-react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/',             end: true  },
  { icon: FileText,        label: 'News',         path: '/news',         end: false },
  { icon: CheckSquare,     label: 'Submissions',  path: '/submissions',  end: false },
  { icon: Users,           label: 'Users',        path: '/users',        end: false },
  { icon: Coins,           label: 'Credits',      path: '/credits',      end: false },
  { icon: Bell,            label: 'Notifications',path: '/notifications',end: false },
  { icon: Flag,            label: 'Reports',      path: '/reports',      end: false },
  { icon: ScrollText,      label: 'Audit Log',    path: '/audit',        end: false },
  { icon: Settings,        label: 'Settings',     path: '/settings',     end: false },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside className={`fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 flex flex-col z-50 shadow-sm transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="bg-green-50 p-2 rounded-xl flex-shrink-0">
          <Leaf size={20} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-tight">Asian News Bureau</p>
          <p className="text-xs text-muted">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, path, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={() => { if (window.innerWidth < 768) onClose(); }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 text-primary'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
        <p className="text-xs text-center text-muted mt-3 opacity-60">Empowering communities</p>
      </div>
    </aside>
    </>
  );
};