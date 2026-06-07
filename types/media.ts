export type MediaPlatform = 
  | "twitter" | "x" 
  | "instagram" 
  | "tiktok" 
  | "threads" 
  | "reddit" 
  | "youtube" 
  | "facebook" 
  | "pinterest" 
  | "snapchat" 
  | "vimeo" 
  | "dailymotion" 
  | "twitch"
  | "unknown";

export type MediaType = "image" | "video" | "carousel" | "unknown";

export interface QualityOption {
  label: string;
  value: string;
  url?: string;
}

export interface MediaInfo {
  platform: MediaPlatform;
  type: MediaType;
  preview?: string;
  filename?: string;
  duration?: string;
  dimensions?: string;
  author?: string;
  size?: string;
  qualities?: QualityOption[];
  directUrl?: string;
}

export interface AnalyzeResponse {
  media: MediaInfo;
}

export interface DownloadRequest {
  url: string;
  platform: MediaPlatform;
  quality: string;
}
