import React, { useState } from 'react';
import { Menu, Tv } from 'lucide-react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  channelCount: number;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  channelCount,
}) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        channelCount={channelCount}
      />

      {/* Main Content Area wrapper */}
      <div className="main-content-wrapper">
        {/* Mobile Header Bar */}
        <header className="mobile-header">
          <button
            className="menu-toggle-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tv size={18} style={{ color: 'var(--accent-hover)' }} />
            <span className="mobile-logo-text">NafisStream</span>
          </div>
          <div style={{ width: 24 }}></div> {/* Balance spacer */}
        </header>

        {/* Scrollable Body Content */}
        <main className="main-content-body">{children}</main>
      </div>
    </div>
  );
};
export default Layout;
