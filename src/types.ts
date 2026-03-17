export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  cover: string;
  previewUrl: string;
  duration: number;
  lyrics?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  queue: Track[];
}
