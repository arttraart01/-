export interface VideoClip {
  id: string;
  url: string;
  file: File;
  duration: number; // in seconds
  thumbnail?: string;
}

export interface Mix {
  id: string;
  clips: VideoClip[]; // Should contain exactly 3 clips
  title: string;
  description: string;
  theme: string;
  createdAt: number;
}

export interface GeminiMixMetadata {
  title: string;
  description: string;
}