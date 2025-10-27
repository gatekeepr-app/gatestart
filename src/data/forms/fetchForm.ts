import { createClient } from "../../utils/supabase/client";

const supabase = createClient();

export async function fetchForm(id: string) {
  const { data } = await supabase
    .from("formsubmi")
    .select("*")
    .eq("formid", id)
    .single();

  return data;
}
