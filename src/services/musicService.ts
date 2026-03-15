import { Track } from '../types';

const forceHttps = (url: string) => {
  if (!url) return '';
  return url.replace(/^http:/, 'https:');
};

export const searchTracks = async (query: string): Promise<Track[]> => {
  if (!query) return [];
  
  try {
    // Using https and adding a timestamp to bypass potential caching issues
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=30&_t=${Date.now()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }
    
    return data.results.map((item: any) => ({
      id: item.trackId || Math.random(),
      title: item.trackName || 'Unknown Title',
      artist: item.artistName || 'Unknown Artist',
      album: item.collectionName || 'Unknown Album',
      cover: forceHttps(item.artworkUrl100?.replace('100x100', '600x600') || ''),
      previewUrl: forceHttps(item.previewUrl || ''),
      duration: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : 0,
    }));
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

export const getTrendingTracks = async (): Promise<Track[]> => {
  // Try a few different terms if one fails or returns little data
  const terms = ['top hits', 'trending', 'popular'];
  for (const term of terms) {
    const tracks = await searchTracks(term);
    if (tracks.length > 5) return tracks;
  }
  return [];
};
