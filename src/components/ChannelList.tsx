import React from 'react';
import { Search, X, Tv } from 'lucide-react';
import type { Channel } from '../utils/m3uParser';
import ChannelCard from './ChannelCard';

interface ChannelListProps {
  channels: Channel[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  selectedChannel,
  onChannelSelect,
}) => {
  // Filter channels based on selected category and search query
  const filteredChannels = channels.filter((channel) => {
    const matchesCategory =
      selectedCategory === 'All' || channel.cleanCategory === selectedCategory;
    const matchesSearch =
      channel.cleanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Search and Header */}
      <div className="channels-panel-header">
        <div className="panel-title">
          <span>Channels</span>
          <span className="channel-count">
            {filteredChannels.length} of {channels.length}
          </span>
        </div>
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs / Pills */}
      <div className="categories-container">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Scrollable Channels List */}
      <div className="channels-list-scrollable">
        {filteredChannels.length > 0 ? (
          filteredChannels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              isActive={selectedChannel?.id === channel.id}
              onClick={() => onChannelSelect(channel)}
              variant="list"
            />
          ))
        ) : (
          <div className="no-channels-state">
            <Tv className="no-channels-icon" />
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No channels found</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Try adjusting your search query or category filters.
            </p>
          </div>
        )}
      </div>
    </>
  );
};
export default ChannelList;
