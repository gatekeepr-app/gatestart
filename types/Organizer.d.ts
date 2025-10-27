export interface Organizer {
  id: number;
  uuid: string;
  name: string;
  bio: string | null;
  socialLinks:{
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    email: string | null;
  }
  image: string | null;
  events: any; 
  location: string | null;
  verified: boolean;
  slug: string;
}
