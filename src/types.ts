export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  cover: string;
  previewUrl: string;
  duration: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

export interface QuickUser {
  id: string;
  name: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  queue: Track[];
}
