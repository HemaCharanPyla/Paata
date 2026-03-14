export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  previewUrl: string;
  duration: number;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  queue: Track[];
}
