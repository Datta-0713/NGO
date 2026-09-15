import React from 'react';
import { Clock, UserPlus, Coins } from 'lucide-react';

interface Props {
  data?: {
    pendingSubmissions: number;
    newContributorsThisMonth: number;
    creditsToBeAwarded: number;
  };
}

export const NeedsAttentionPanel: React.FC<Props> = ({ data }) => {
  const items = [
    {
      icon: Clock,
      iconStyle: 'bg-yellow-50 text-yellow-600',
      label: `${data?.pendingSubmissions ?? 0} submissions awaiting review`,
      cta: 'Review Now',
      href: '/submissions',
    },
    {
      icon: UserPlus,
      iconStyle: 'bg-blue-50 text-blue-600',
      label: `${data?.newContributorsThisMonth ?? 0} new contributors this month`,
      cta: 'View Users',
      href: '/users',
    },
    {
      icon: Coins,
      iconStyle: 'bg-purple-50 text-purple-600',
      label: `${data?.creditsToBeAwarded ?? 0} credits pending approval`,
      cta: 'Manage Credits',
      href: '/credits',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map(({ icon: Icon, iconStyle, label, cta, href }) => (
        <div key={label} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl">
          <div className={`w-fit p-2.5 rounded-xl ${iconStyle}`}>
            <Icon size={18} />
          </div>
          <p className="text-sm text-gray-700 font-medium leading-snug">{label}</p>
          <a href={href} className="text-sm font-semibold text-primary hover:underline mt-auto">
            {cta} →
          </a>
        </div>
      ))}
    </div>
  );
};