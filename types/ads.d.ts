export interface Ad {
  id: number;                // bigint → number
  created_at: string;        // timestamp with time zone → ISO string
  runs_till: string | null;  // timestamp without time zone → ISO string or null
  ad_provider: string | null;
  image_link: string | null;
  redirect_link: string | null;
  tags: string[] | null;
  priority: boolean;
  dets: {
    title: string;
    subtitle: string;
  }
}


export interface FeaturedInt {
  id: number;
  created_at: string;
  name: string;
  image: string;
  link: string;
  status: boolean;
}