export interface eventInt {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  details: string;
  date_range: { from: string; to: string };
  image: string;
  category: string;
  place: { title: string; details: string; maps_link: string };
  amount: string;
  eventuuid: string;
  orgarr: string[];
  status: boolean;
  formdata: Record[];
  cardData: {
    title: string;
    description: string;
    button: { label: string; url: string; new_tab: boolean };
  }[];
  additional: {
    faq?: { q: string; a: string }[];
    gallery?: string[];
    button?: { text: string; link: string };
    schedule?: { time: string; item: string }[];
    sheetUrl?: string;
  };
  accepting: boolean;
}
