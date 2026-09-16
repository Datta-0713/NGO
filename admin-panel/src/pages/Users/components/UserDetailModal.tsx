import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { MapPin, Mail, BookOpen, Heart, Coins, Calendar } from 'lucide-react';
import { safeFormat } from '@/utils/date';
import type { User } from '@/types';

interface UserDetailModalProps {
  user: User;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => (
  <Modal isOpen={true} onClose={onClose} title="Contributor Profile" size="md">
    <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-100 mb-6">
      <Avatar src={user.profilePhoto} name={user.name} size={72} />
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
        <p className="text-sm text-muted">{user.role}</p>
      </div>
    </div>

    <div className="flex flex-col gap-4">
      {user.bio && <p className="text-sm text-gray-600 italic">"{user.bio}"</p>}

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Mail, label: 'Email', value: user.email },
          { icon: MapPin, label: 'Location', value: user.location || 'Not specified' },
          { icon: Calendar, label: 'Joined', value: safeFormat(user.createdAt, 'MMM d, yyyy') },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
            <Icon size={16} className="text-muted mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted">{label}</p>
              <p className="text-sm font-medium text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-2">
        {[
          { icon: BookOpen, label: 'Stories', value: user.storiesCount, color: 'text-primary bg-primary-xlight' },
          { icon: Heart, label: 'Likes', value: user.likesReceived, color: 'text-red-500 bg-red-50' },
          { icon: Coins, label: 'Credits', value: user.credits, color: 'text-yellow-600 bg-yellow-50' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
            <div className={`p-2 rounded-lg ${color} mb-2`}><Icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </Modal>
);