import { createClient } from "../utils/supabase/client";

const supabase = createClient();

//arrayed organizers

export async function fetchOrganizers(orgarr: string[]) {
  const { data } = await supabase
    .from("Organizer")
    .select("*")
    .in("uuid", orgarr); // Use .in() to filter by multiple UUIDs

  return data;
}

export async function getCategory() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
  if (error) throw error;

  if (data.length === 0) {
    throw new Error("No categories found");
  }
  return data;
}


//all organizers

export async function getOrganizers() {
  const { data, error } = await supabase.from("Organizer").select("*");
  if (error) throw error;
  return data;
}
