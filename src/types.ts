
export interface Review {
  id: string;
  rating: number;
  text: string;
  date: string;
  user?: string;
}

export interface PromptVersion {

  versionId?: string;
  content: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  platform: string; 
  tags: string[];
  folder: string; 
  projectId: string | null;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  useCount: number;
  dueDate?: string;
  lastUsedAt?: string;
  successRating?: number;
  notes?: string;
  exampleOutput?: string;
  language: 'he' | 'en';
  topic?: string;
  history?: PromptVersion[];
  isReadOnly?: boolean;
  usageHistory?: string[];
  reviews?: Review[];
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  icon?: string; 
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface PlatformConfig {
  id: string;
  name: string;
  color: string;      
  bgColor: string;    
  textColor: string;  
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
  followers?: string[];
  following?: string[];
}

export interface PublicPrompt extends Prompt {
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  likes: string[];
  commentsCount: number;
}

export interface PromptComment {
  id: string;
  promptId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  createdAt: string;
}
