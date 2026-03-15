import { Track } from '../types';

const THEAUDIODB_API_KEY = import.meta.env.VITE_THEAUDIODB_API_KEY || '2';

// TheAudioDB doesn't provide audio previews directly. 
// We use a high-quality placeholder audio to keep the player functional.
const PLACEHOLDER_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const MOCK_TRACKS: Track[] = [
  {
    id: 'mock-1',
    title: 'Midnight Resonance',
    artist: 'Aura Collective',
    album: 'Atmospheric Vol. 1',
    cover: 'https://picsum.photos/seed/aura1/500/500',
    previewUrl: PLACEHOLDER_AUDIO,
    duration: 245,
  },
  {
    id: 'mock-2',
    title: 'Ethereal Echoes',
    artist: 'Luna Sol',
    album: 'Sanctuary',
    cover: 'https://picsum.photos/seed/aura2/500/500',
    previewUrl: PLACEHOLDER_AUDIO,
    duration: 198,
  },
  {
    id: 'mock-3',
    title: 'Deep Focus',
    artist: 'The Ambient Project',
    album: 'Focus States',
    cover: 'https://picsum.photos/seed/aura3/500/500',
    previewUrl: PLACEHOLDER_AUDIO,
    duration: 312,
  },
  {
    id: 'mock-4',
    title: 'Starlight Ritual',
    artist: 'Celestial',
    album: 'Night Sky',
    cover: 'https://picsum.photos/seed/aura4/500/500',
    previewUrl: PLACEHOLDER_AUDIO,
    duration: 225,
  },
  {
    id: 'mock-5',
    title: 'Oceanic Drift',
    artist: 'Tide Watcher',
    album: 'Blue Horizon',
    cover: 'https://picsum.photos/seed/aura5/500/500',
    previewUrl: PLACEHOLDER_AUDIO,
    duration: 278,
  },
  {
    id: 'mock-6',
    title: 'Forest Whisper',
    artist: 'Nature Synth',
    album: 'Green Spirits',
    cover: 'https://picsum.photos/seed/aura6/500/500',
    previewUrl: PLACEHOLDER_AUDIO,
    duration: 185,
  },
  {
    id: 'mock-7',
    title: 'Solar Flare',
    artist: 'Helios',
    album: 'Sun Spots',
    cover: 'https://picsum.photos/seed/aura7/500/500',
    previewUrl: PLACEHOLDER_AUDIO,
    duration: 215,
  },
  {
    id: 'mock-8',
    title: 'Crystal Rain',
    artist: 'Prism',
    album: 'Refractions',
    cover: 'https://picsum.photos/seed/aura8/500/500',
    previewUrl: PLACEHOLDER_AUDIO,
    duration: 240,
  }
];

export const getInitialTracks = (): Track[] => MOCK_TRACKS;

export const searchTracks = async (query: string): Promise<Track[]> => {
  if (!query) return [];
  
  console.log(`Searching for: ${query}`);
  
  try {
    // Try searching by track name first
    const trackResponse = await fetch(`https://www.theaudiodb.com/api/v1/json/${THEAUDIODB_API_KEY}/searchtrack.php?t=${encodeURIComponent(query)}`);
    
    let tracks: any[] = [];
    
    if (trackResponse.ok) {
      const text = await trackResponse.text();
      if (text && text.trim()) {
        try {
          const trackData = JSON.parse(text);
          if (trackData && trackData.track) {
            tracks = [...trackData.track];
          }
        } catch (e) {
          console.error('Failed to parse track search JSON:', e);
        }
      }
    }

    // If no tracks found, try searching by artist name to get their top tracks
    if (tracks.length === 0) {
      const artistResponse = await fetch(`https://www.theaudiodb.com/api/v1/json/${THEAUDIODB_API_KEY}/search.php?s=${encodeURIComponent(query)}`);
      if (artistResponse.ok) {
        const text = await artistResponse.text();
        if (text && text.trim()) {
          try {
            const artistData = JSON.parse(text);
            if (artistData && artistData.artists && artistData.artists[0]) {
              const artistId = artistData.artists[0].idArtist;
              const topTracksResponse = await fetch(`https://www.theaudiodb.com/api/v1/json/${THEAUDIODB_API_KEY}/track-top10.php?s=${artistId}`);
              if (topTracksResponse.ok) {
                const topText = await topTracksResponse.text();
                if (topText && topText.trim()) {
                  const topTracksData = JSON.parse(topText);
                  if (topTracksData && topTracksData.track) {
                    tracks = [...topTracksData.track];
                  }
                }
              }
            }
          } catch (e) {
            console.error('Failed to parse artist search JSON:', e);
          }
        }
      }
    }
    
    if (tracks.length === 0) {
      console.log('No API results, using mock fallback');
      return MOCK_TRACKS.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) || 
        t.artist.toLowerCase().includes(query.toLowerCase())
      );
    }

    return tracks.map((item: any) => ({
      id: item.idTrack || `track-${Math.random().toString(36).substr(2, 9)}`,
      title: item.strTrack || 'Unknown Track',
      artist: item.strArtist || 'Unknown Artist',
      album: item.strAlbum || 'Unknown Album',
      cover: item.strTrackThumb || (item.idAlbum ? `https://www.theaudiodb.com/images/media/album/thumb/${item.idAlbum}.jpg` : `https://picsum.photos/seed/${item.idTrack || 'music'}/500/500`),
      previewUrl: PLACEHOLDER_AUDIO,
      duration: parseInt(item.intDuration, 10) / 1000 || 210,
    }));
  } catch (error) {
    console.error('Error searching tracks:', error);
    return MOCK_TRACKS.filter(t => 
      t.title.toLowerCase().includes(query.toLowerCase()) || 
      t.artist.toLowerCase().includes(query.toLowerCase())
    );
  }
};

let cachedTrending: Track[] | null = null;

export const getTrendingTracks = async (): Promise<Track[]> => {
  if (cachedTrending) return cachedTrending;

  const endpoints = [
    `https://www.theaudiodb.com/api/v1/json/${THEAUDIODB_API_KEY}/trending.php?type=itunes&format=singles`,
    `https://www.theaudiodb.com/api/v1/json/${THEAUDIODB_API_KEY}/mostloved.php?format=track`
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;

      const text = await response.text();
      if (!text || !text.trim()) continue;

      const data = JSON.parse(text);
      const rawTracks = data.trending || data.loved || data.track;

      if (rawTracks && Array.isArray(rawTracks) && rawTracks.length > 0) {
        const tracks = rawTracks.map((item: any) => ({
          id: item.idTrack || `trending-${Math.random().toString(36).substr(2, 9)}`,
          title: item.strTrack || 'Unknown Track',
          artist: item.strArtist || 'Unknown Artist',
          album: item.strAlbum || 'Unknown Album',
          cover: item.strTrackThumb || `https://picsum.photos/seed/${item.idTrack || Math.random()}/500/500`,
          previewUrl: PLACEHOLDER_AUDIO,
          duration: parseInt(item.intDuration, 10) / 1000 || 210,
        }));
        cachedTrending = tracks;
        return tracks;
      }
    } catch (e) {
      console.error(`Failed to fetch from ${url}:`, e);
    }
  }

  console.log('All trending endpoints failed or returned empty. Using curated mock collection.');
  cachedTrending = MOCK_TRACKS;
  return MOCK_TRACKS;
};
