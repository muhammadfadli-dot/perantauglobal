export interface BlogPostFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  image: string;
  tags: string[];
  audience: "pmi" | "employer";
  category: string;
  locale: "id" | "en";
}

export interface DestinationFrontmatter {
  title: string;
  description: string;
  country: string;
  flag: string;
  image: string;
  industries: string[];
  locale: "id" | "en";
}

export interface ServiceFrontmatter {
  title: string;
  description: string;
  image: string;
  locale: "id" | "en";
}
