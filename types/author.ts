export type AuthorLinks = {
  website?: string;
  twitter?: string;
  scholar?: string;
  researchgate?: string;
  github?: string;
};

export type Author = {
  id: string;
  name: string;
  slug: string;
  role?: string;
  institution?: string;
  bio?: string;
  avatarUrl?: string;
  links: AuthorLinks;
  userId?: string;
  createdAt: string;
};

// Lightweight version used in article cards and sidebars
export type AuthorSummary = Pick<Author, "id" | "name" | "slug" | "avatarUrl" | "role" | "institution">;
