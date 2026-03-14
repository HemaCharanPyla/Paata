import { Track } from '../types';

const THEAUDIODB_API_KEY = import.meta.env.VITE_THEAUDIODB_API_KEY || '2';

// TheAudioDB doesn't provide audio previews directly. 
// We use a high-quality placeholder audio to keep the player functional.
const PLACEHOLDER_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export const searchTracks = async (query: string): Promise<Track[]> => {
  if (!query) return [];
  
  try {
    // Search by track name
    const response = await fetch(`https://www.theaudiodb.com/api/v1/json/${THEAUDIODB_API_KEY}/searchtrack.php?t=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text) return [];
    
    const data = JSON.parse(text);
    
    if (!data.track) return [];

    return data.track.map((item: any) => ({
      id: item.idTrack,
      title: item.strTrack,
      artist: item.strArtist,
      album: item.strAlbum,
      cover: item.strTrackThumb || `https://www.theaudiodb.com/images/media/album/thumb/${item.idAlbum}.jpg` || 'https://picsum.photos/seed/music/500/500',
      previewUrl: PLACEHOLDER_AUDIO, // TheAudioDB is metadata-only
      duration: parseInt(item.intDuration, 10) / 1000 || 210,
    }));
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

export const getTrendingTracks = async (): Promise<Track[]> => {
  try {
    // Get trending singles from iTunes chart via TheAudioDB
    const response = await fetch(`https://www.theaudiodb.com/api/v1/json/${THEAUDIODB_API_KEY}/trending.php?type=itunes&format=singles`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      console.warn('Empty response from trending API, falling back to search');
      return searchTracks('top hits');
    }
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse trending JSON:', e);
      return searchTracks('top hits');
    }
    
    if (!data.trending) {
      return searchTracks('top hits');
    }

    return data.trending.map((item: any) => ({
      id: item.idTrack,
      title: item.strTrack,
      artist: item.strArtist,
      album: item.strAlbum,
      cover: item.strTrackThumb || 'https://picsum.photos/seed/music/500/500',
      previewUrl: PLACEHOLDER_AUDIO,
      duration: 210, // Trending endpoint doesn't return duration
    }));
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    // Fallback to a generic search if trending fails
    return searchTracks('top hits');
  }
};
