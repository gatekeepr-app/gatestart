export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;   // ISO timestamp
  updated_at: string | null;   // ISO timestamp
  email: string;
  phone: string | null;
  gender: string | null;
  location: string | null;
  dob: string | null;
  anniversary_date: string | null;
  organizerRef: string | null;   // quoted column -> exact casing in types
}