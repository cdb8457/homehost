export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "guest";
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  avatarUrl?: string;
  bio?: string;
  preferences: Record<string, any>;
}