export interface FormSubInt {
  id: string;
  created_at: string;
  userid: string;
  formid: string;
  formdata: Record<string, any>;
  status: boolean;
};

export interface FormInt {
  id: string;
  name: string;
  description: string;
  cover_img: string;
  formdata: Record<string, any>;
  accepting: boolean;
  created_at: string;
  updated_at: string;
  orguuid: string;
  slug: string;
  status: boolean;
};