import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import mpegts from 'mpegts.js';
import { Play, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  url: string | null;
  name: string | null;
  category: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, name }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const mpegtsPlayerRef = useRef<mpegts.Player | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCorsTip, setShowCorsTip] = useState<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Clean up previous Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Clean up previous MPEG-TS instance
    if (mpegtsPlayerRef.current) {
      mpegtsPlayerRef.current.pause();
      mpegtsPlayerRef.current.unload();
      mpegtsPlayerRef.current.detachMediaElement();
      mpegtsPlayerRef.current.destroy();
      mpegtsPlayerRef.current = null;
    }

    // Reset player state
    setError(null);
    setIsLoading(false);
    setShowCorsTip(false);

    if (!url) return;

    setIsLoading(true);

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    
    const handleNativeError = () => {
      setIsLoading(false);
      const code = video.error ? video.error.code : 'unknown';
      let message = 'An error occurred during video playback.';
      if (video.error) {
        switch (video.error.code) {
          case video.error.MEDIA_ERR_ABORTED:
            message = 'Playback was aborted.';
            break;
          case video.error.MEDIA_ERR_NETWORK:
            message = 'A network error caused the video download to fail.';
            break;
          case video.error.MEDIA_ERR_DECODE:
            message = 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.';
            break;
          case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = 'This video stream format is not natively supported by your browser, or the server is offline/CORS-blocked.';
            setShowCorsTip(true);
            break;
        }
      }
      setError(`${message} (Error Code: ${code})`);
    };

    // Attach event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleNativeError);

    // Classify URL formats
    const urlLower = url.toLowerCase();
    const isHls = urlLower.includes('.m3u8');
    const isMpegTs = urlLower.includes('.ts') || urlLower.includes('extension=ts') || urlLower.includes('play/live.php');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferSize: 30 * 1024 * 1024, // 30MB
      });

      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          setIsLoading(false);
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setIsLoading(false);
          setShowCorsTip(true); // Any CORS network issue throws HLS network errors
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network/CORS error encountered while loading HLS stream. Retrying...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error encountered. Attempting recovery...');
              hls.recoverMediaError();
              break;
            default:
              setError(`Fatal stream error: ${data.details}. Click another channel to try again.`);
              hls.destroy();
              break;
          }
        }
      });
    } else if (isMpegTs && mpegts.getFeatureList().mseLivePlayback) {
      // Use mpegts.js for MPEG-TS container streams
      try {
        const player = mpegts.createPlayer({
          type: 'mpegts',
          url: url,
          isLive: true,
        });

        mpegtsPlayerRef.current = player;
        player.attachMediaElement(video);
        player.load();
        const playPromise = player.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            setIsLoading(false);
          });
        }

        player.on(mpegts.Events.ERROR, (type, detail) => {
          setIsLoading(false);
          setShowCorsTip(true);
          setError(`MPEG-TS Player Error: ${type} (${detail}). This is usually caused by CORS blockages or offline streams.`);
        });
      } catch (err) {
        console.error('Failed to initialize mpegts.js:', err);
        // Native fallback
        video.src = url;
        video.play().catch(() => setIsLoading(false));
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => setIsLoading(false));
      });
    } else {
      // General video direct stream fallback
      video.src = url;
      video.play().catch(() => {
        setIsLoading(false);
      });
    }

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleNativeError);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      if (mpegtsPlayerRef.current) {
        mpegtsPlayerRef.current.pause();
        mpegtsPlayerRef.current.unload();
        mpegtsPlayerRef.current.detachMediaElement();
        mpegtsPlayerRef.current.destroy();
        mpegtsPlayerRef.current = null;
      }
    };
  }, [url]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setShowCorsTip(false);

    const video = videoRef.current;
    if (!video || !url) return;

    // Force full re-setup by temporarily resetting src
    video.src = '';
    
    // Re-trigger the logic
    const urlLower = url.toLowerCase();
    const isHls = urlLower.includes('.m3u8');
    const isMpegTs = urlLower.includes('.ts') || urlLower.includes('extension=ts') || urlLower.includes('play/live.php');

    if (isHls && hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (mpegtsPlayerRef.current) {
      mpegtsPlayerRef.current.destroy();
      mpegtsPlayerRef.current = null;
    }

    if (isHls && Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => setIsLoading(false)));
    } else if (isMpegTs && mpegts.getFeatureList().mseLivePlayback) {
      const player = mpegts.createPlayer({ type: 'mpegts', url, isLive: true });
      mpegtsPlayerRef.current = player;
      player.attachMediaElement(video);
      player.load();
      const playPromise = player.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => setIsLoading(false));
      }
    } else {
      video.src = url;
      video.play().catch(() => setIsLoading(false));
    }
  };

  return (
    <div className="player-container">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="video-element"
        controls
        playsInline
        autoPlay
      />

      {/* Placeholder / No Stream State */}
      {!url && (
        <div className="player-overlay player-placeholder">
          <div className="placeholder-play-icon">
            <Play size={28} fill="white" style={{ marginLeft: 3 }} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No Stream Selected</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Choose a live channel from the list on the right to start watching.
          </p>
        </div>
      )}

      {/* Loading Overlay */}
      {url && isLoading && !error && (
        <div className="player-overlay">
          <div className="spinner"></div>
          <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>
            Connecting to {name || 'Stream'}...
          </p>
        </div>
      )}

      {/* Error Overlay */}
      {url && error && (
        <div className="player-overlay" style={{ gap: 12 }}>
          <AlertCircle className="error-icon" />
          <p className="error-title">Playback Error</p>
          <p className="error-message" style={{ fontSize: '0.85rem', marginBottom: 4 }}>{error}</p>
          
          {showCorsTip && (
            <div style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(139, 92, 246, 0.06)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              maxWidth: '380px',
              lineHeight: 1.45,
              textAlign: 'left',
              marginTop: 4,
              marginBottom: 4
            }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: 4 }}>💡 Localhost CORS Restriction:</strong>
              IPTV servers often restrict web access from localhost. You can bypass this instantly by installing a Chrome extension such as <a href="https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffbjicikfjgggljhgf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-hover)', textDecoration: 'underline' }}>Allow CORS</a>, activating it in your toolbar, and clicking Retry.
            </div>
          )}
          
          <button
            className="btn-primary"
            onClick={handleRetry}
            style={{ padding: '8px 20px', fontSize: '0.85rem', marginTop: 4 }}
          >
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );
};
export default VideoPlayer;
