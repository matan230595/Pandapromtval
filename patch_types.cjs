const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code += `
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
`;

fs.writeFileSync('src/types.ts', code);
