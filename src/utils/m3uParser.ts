export interface Channel {
  id: string;
  name: string;
  cleanName: string;
  category: string;
  cleanCategory: string;
  logo: string;
  url: string;
  quality: 'UHD' | 'FHD' | 'HD' | 'SD' | null;
}

// Clean prefixes like "┃WC┃" or "┃DE┃" and trim spacing
export const cleanText = (text: string): string => {
  return text.replace(/^┃[^┃]+┃\s*/g, '').trim();
};

export const getQuality = (name: string): 'UHD' | 'FHD' | 'HD' | 'SD' | null => {
  const upper = name.toUpperCase();
  if (upper.includes('UHD') || upper.includes('4K')) return 'UHD';
  if (upper.includes('FHD') || upper.includes('1080P') || upper.includes('1080')) return 'FHD';
  if (upper.includes('HD') || upper.includes('720P') || upper.includes('720')) return 'HD';
  if (upper.includes('SD')) return 'SD';
  return null;
};

export const parseM3U = async (url: string = '/Spt.m3u'): Promise<Channel[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch M3U file: ${response.statusText}`);
    }
    const text = await response.text();
    const lines = text.split(/\r?\n/);
    const channels: Channel[] = [];

    let currentChannel: Partial<Channel> | null = null;
    let idCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('#EXTINF:')) {
        // Parse logo
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        const logo = logoMatch ? logoMatch[1] : '';

        // Parse category
        const groupMatch = line.match(/group-title="([^"]+)"/);
        const category = groupMatch ? groupMatch[1] : 'Uncategorized';
        const cleanCategory = cleanText(category);

        // Parse channel name (everything after the last comma)
        const commaIndex = line.lastIndexOf(',');
        const name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Unknown Channel';
        const cleanNameVal = cleanText(name);
        const quality = getQuality(name);

        currentChannel = {
          name,
          cleanName: cleanNameVal,
          category,
          cleanCategory,
          logo,
          quality,
        };
      } else if (line.startsWith('#EXTVLCOPT:')) {
        // Skip VLC option lines
        continue;
      } else if (line && !line.startsWith('#')) {
        // This is the stream URL
        if (currentChannel) {
          currentChannel.url = line;
          currentChannel.id = `channel-${idCounter++}`;
          channels.push(currentChannel as Channel);
          currentChannel = null;
        }
      }
    }

    return channels;
  } catch (error) {
    console.error('Error parsing M3U file:', error);
    return [];
  }
};
