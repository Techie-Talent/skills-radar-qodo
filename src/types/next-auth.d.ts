import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: {
        id: string;
        name: string;
        description?: string | null;
        isDefault: boolean;
      } | null;
      permissions?: {
        id: string;
        name: string;
        description?: string | null;
        category: string;
        action: string;
      }[];
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role?: {
      id: string;
      name: string;
      description?: string | null;
      isDefault: boolean;
    } | null;
  }
}