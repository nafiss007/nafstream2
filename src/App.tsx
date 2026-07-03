import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { VideoPlayer } from './components/VideoPlayer';
import { ChannelList } from './components/ChannelList';
import { ChannelCard } from './components/ChannelCard';
import { parseM3U } from './utils/m3uParser';
import MessiHeroDemo from './components/MessiHeroDemo';
import type { Channel } from './utils/m3uParser';
import { Tv, Radio, ArrowRight, Search, X } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  
  // Filtering state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Grid page filtering state (independent to keep grid view clean)
  const [gridCategory, setGridCategory] = useState<string>('All');
  const [gridSearch, setGridSearch] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch and parse Spt.m3u
  useEffect(() => {
    const loadPlaylist = async () => {
      setIsLoading(true);
      try {
        const data = await parseM3U('/Spt.m3u');
        setChannels(data);
        
        // Extract unique clean categories
        const uniqueCats = new Set<string>();
        data.forEach(ch => {
          if (ch.cleanCategory) {
            uniqueCats.add(ch.cleanCategory);
          }
        });
        
        const sortedCats = ['All', ...Array.from(uniqueCats).sort()];
        setCategories(sortedCats);
      } catch (error) {
        console.error('Failed to parse playlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylist();
  }, []);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setActiveTab('live');
    // On mobile, scroll up to the player when channel is selected
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter channels for the full Channels grid page
  const filteredGridChannels = channels.filter(channel => {
    const matchesCategory = gridCategory === 'All' || channel.cleanCategory === gridCategory;
    const matchesSearch = 
      channel.cleanName.toLowerCase().includes(gridSearch.toLowerCase()) ||
      channel.name.toLowerCase().includes(gridSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      channelCount={channels.length}
    >
      {isLoading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: 16
        }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Parsing NafisStream playlist...
          </p>
        </div>
      ) : (
        <>
          {/* Tab 1: HOME PAGE */}
          {activeTab === 'home' && (
            <div className="home-container">
              <div className="welcome-hero">
                <span className="hero-subtitle">Premium IPTV Streaming</span>
                <h1 className="hero-title">Welcome to NafisStream</h1>
                <p className="hero-desc">
                  Enjoy a clean, fast, and minimal browser for all your live streams. Fully parsed from local playlists, with no redirections and zero ads.
                </p>
                <button 
                  className="btn-primary" 
                  onClick={() => setActiveTab('live')}
                >
                  <span>Start Streaming</span>
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Tv size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-number">{channels.length}</span>
                    <span className="stat-label">Live Channels</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <Radio size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-number">{categories.length > 1 ? categories.length - 1 : 0}</span>
                    <span className="stat-label">Stream Categories</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: LIVE STREAMS DASHBOARD */}
          {activeTab === 'live' && (
            <div className="dashboard-layout">
              {/* Left Side: Video Player & Info Bar */}
              <div className="dashboard-left">
                <div className="dashboard-header-block">
                  <div className="dashboard-title-area">
                    <h2 className="dashboard-title">Live Streaming IPTV Channels</h2>
                    <p className="dashboard-subtitle">
                      {selectedChannel ? 'Enjoy the stream' : 'Select a channel to start streaming'}
                    </p>
                  </div>
                  <div className="status-badge live">
                    <span className="status-dot"></span>
                    <span>LIVE</span>
                  </div>
                </div>

                <VideoPlayer
                  url={selectedChannel ? selectedChannel.url : null}
                  name={selectedChannel ? selectedChannel.cleanName : null}
                  category={selectedChannel ? selectedChannel.cleanCategory : null}
                />

                {/* Selected Channel Metadata Info Bar */}
                {selectedChannel && (
                  <div className="channel-info-bar">
                    <div className="info-channel-details">
                      <div className="info-logo-wrapper">
                        {selectedChannel.logo ? (
                          <img
                            src={selectedChannel.logo}
                            alt={selectedChannel.cleanName}
                            className="info-channel-logo"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Tv size={20} style={{ color: 'var(--text-muted)' }} />
                        )}
                      </div>
                      <div className="info-text-group">
                        <span className="info-channel-name">{selectedChannel.cleanName}</span>
                        <div className="info-channel-meta">
                          <span className="category-badge">{selectedChannel.cleanCategory}</span>
                          {selectedChannel.quality && (
                            <span className={`quality-badge ${selectedChannel.quality.toLowerCase()}`}>
                              {selectedChannel.quality}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="status-badge playing">
                      <span>Playing</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Channel Explorer */}
              <div className="dashboard-right">
                <ChannelList
                  channels={channels}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedChannel={selectedChannel}
                  onChannelSelect={handleChannelSelect}
                />
              </div>
            </div>
          )}

          {/* Tab 3: CHANNELS GRID CATALOGUE */}
          {activeTab === 'channels' && (
            <div className="channels-tab-container">
              <div className="channels-tab-filters">
                <div className="filter-row">
                  <div className="search-wrapper">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search across all channels..."
                      value={gridSearch}
                      onChange={(e) => setGridSearch(e.target.value)}
                    />
                    {gridSearch && (
                      <button
                        className="clear-search-btn"
                        onClick={() => setGridSearch('')}
                        title="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Scrollable categories bar */}
                <div className="tab-categories-container">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`category-pill ${gridCategory === category ? 'active' : ''}`}
                      onClick={() => setGridCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel Grid cards */}
              {filteredGridChannels.length > 0 ? (
                <div className="channels-grid">
                  {filteredGridChannels.map((channel) => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      onClick={() => handleChannelSelect(channel)}
                      variant="grid"
                    />
                  ))}
                </div>
              ) : (
                <div className="no-channels-state" style={{ padding: '80px 20px' }}>
                  <Tv className="no-channels-icon" style={{ width: 48, height: 48 }} />
                  <h3 style={{ marginTop: 12 }}>No channels matching filters</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 300, margin: '6px auto 0 auto' }}>
                    Try searching for another keyword or select a different category.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: ABOUT PAGE */}
          {activeTab === 'about' && (
            <div className="about-container">
              <div className="about-card">
                <h1 className="about-title">About NafisStream</h1>
                <p className="about-text" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                  This streaming platfrom is build by Nafis Mahmud, don't share or clone, otherwise you will get ip blocked, for any issue message me - tg - nafiss007
                </p>
              </div>
            </div>
          )}

          {/* Tab 5: MESSI HERO PAGE */}
          {activeTab === 'messi' && (
            <MessiHeroDemo />
          )}
        </>
      )}
    </Layout>
  );
}

export default App;
