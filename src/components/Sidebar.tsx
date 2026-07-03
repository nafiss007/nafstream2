import React from 'react';
import { Home, Tv, List, Info, X, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  channelCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  channelCount,
}) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'live', label: 'Live Streams', icon: Tv },
    { id: 'channels', label: 'Channels', icon: List },
    { id: 'messi', label: 'Goat Tribute', icon: Sparkles },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'mobile-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="logo-icon">
            <Tv size={20} strokeWidth={2.5} />
          </div>
          <div className="brand-details">
            <span className="brand-name">NafisStream</span>
            <span className="brand-sub">Live IPTV Dashboard</span>
          </div>
          {mobileOpen && (
            <button
              className="menu-toggle-btn"
              onClick={() => setMobileOpen(false)}
              style={{ marginLeft: 'auto' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
              >
                <Icon className="menu-item-icon" size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="system-status">
            <div className="status-dot"></div>
            <span>System Ready</span>
          </div>
          {channelCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {channelCount} channels
            </span>
          )}
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
