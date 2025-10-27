import { createClient } from "../utils/supabase/client";
import { FormData } from "../types";

const supabase = createClient();

export async function fetchArrEvents(events: string[]) {
  const { data } = await supabase
    .from("Events")
    .select("*")
    .in("eventuuid", events)
    .order("date", { ascending: false }); // Use .in() to filter by multiple UUIDs

  return data;
}

export async function fetchEvent(slug: string) {
  const { data, error } = await supabase
    .from("Events")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function createEvent(formData: FormData) {

  const { data, error } = await supabase
    .from("Events")
    .insert([
      {
        name: formData.eventName,
        details: formData.eventDetails,
        slug: formData.eventSlug,
        date_range: formData.date_range,
        image: formData.coverImageUrl,
        category: formData.eventCategory,
        place: formData.eventPlace,
        amount: formData.eventAmount,
        additional: formData.additional,
        orgarr: formData.selectedOrganizers,
        formdata: formData.parsedData
      },
    ])
    .select();

    return error;
}
