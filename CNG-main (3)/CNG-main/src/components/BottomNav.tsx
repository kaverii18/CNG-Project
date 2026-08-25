import React from 'react';
import { Map, ListFilter, Radio, User, Bell } from 'lucide-react';

export type ActiveTab = 'home' | 'nearby' | 'updates' | 'profile';

interface Props {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  updatesBadgeCount?: number;
}

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  updatesBadgeCount = 0
}) => {
  const tabs = [
    {
      id: 'home' as ActiveTab,
      label: 'Home',
      icon: Map,
      description: 'Live Map'
    },
    {
      id: 'nearby' as ActiveTab,
      label: 'Nearby',
      icon: ListFilter,
      description: 'Stations List'
    },
    {
      id: 'updates' as ActiveTab,
      label: 'Updates',
      icon: Radio,
      badge: updatesBadgeCount > 0 ? updatesBadgeCount : undefined,
      description: 'Driver Wire'
    },
    {
      id: 'profile' as ActiveTab,
      label: 'Profile',
      icon: User,
      description: 'Favorites & Fuel'
    }
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="w-full bg-white/95 backdrop-blur-lg border-t border-slate-200 sticky bottom-0 z-40 px-3 py-1.5"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all ${
                isActive
                  ? 'text-blue-600 font-bold bg-blue-50/80 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.7]'}`} />
                {typeof tab.badge === 'number' && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 leading-none tracking-tight font-medium">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
