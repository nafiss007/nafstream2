import React, { useState } from 'react';
import { Tv, Play } from 'lucide-react';
import type { Channel } from '../utils/m3uParser';

interface ChannelCardProps {
  channel: Channel;
  isActive?: boolean;
  onClick: () => void;
  variant?: 'list' | 'grid';
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isActive = false,
  onClick,
  variant = 'list',
}) => {
  const [imgError, setImgError] = useState(false);

  const renderQualityBadge = () => {
    if (!channel.quality) return null;
    const qClass = channel.quality.toLowerCase();
    return (
      <span className={`quality-badge ${qClass}`}>
        {channel.quality}
      </span>
    );
  };

  if (variant === 'grid') {
    return (
      <button className="grid-channel-card" onClick={onClick}>
        <div className="grid-card-top">
          <div className="grid-card-logo-container">
            {!channel.logo || imgError ? (
              <Tv className="grid-card-fallback-icon" />
            ) : (
              <img
                src={channel.logo}
                alt={channel.cleanName}
                className="grid-card-logo"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            )}
          </div>
          <div className="grid-card-play-btn">
            <Play size={16} fill="currentColor" />
          </div>
        </div>

        <div className="grid-card-bottom">
          <span className="grid-channel-title" title={channel.cleanName}>
            {channel.cleanName}
          </span>
          <div className="grid-channel-meta">
            <span className="category-badge" style={{ fontSize: '0.7rem' }}>
              {channel.cleanCategory}
            </span>
            {renderQualityBadge()}
          </div>
        </div>
      </button>
    );
  }

  // Sidebar 'list' variant
  return (
    <button
      className={`channel-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="channel-card-left">
        <div className="channel-card-logo-container">
          {!channel.logo || imgError ? (
            <Tv className="channel-card-fallback-icon" />
          ) : (
            <img
              src={channel.logo}
              alt={channel.cleanName}
              className="channel-card-logo"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}
        </div>
        <div className="channel-card-text">
          <span className="channel-card-title" title={channel.cleanName}>
            {channel.cleanName}
          </span>
          <span className="channel-card-subtitle">
            {channel.cleanCategory}
          </span>
        </div>
      </div>

      <div className="channel-card-right">
        {renderQualityBadge()}
        <Play className="card-play-arrow" fill="currentColor" />
      </div>
    </button>
  );
};
export default ChannelCard;
