import { createClient } from "../utils/supabase/client";

export async function getUser() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  console.log(data);
  if (error) {
    console.error("Error fetching user:", error);
  }

  return data;
}
