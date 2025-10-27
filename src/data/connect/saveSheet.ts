import { createClient } from "../../utils/supabase/client";

const supabase = createClient();

interface PageProps {
  sheetUrl: string;
  eventuuid: string | undefined;
}

export async function saveSheet({ sheetUrl, eventuuid }: PageProps) {
  const { data: current, error: fetchError } = await (await supabase)
    .from("Events")
    .select("additional")
    .eq("eventuuid", eventuuid)
    .single();

  if (fetchError) {
    console.error(fetchError);
    return;
  }

  const updatedAdditional = {
    ...(current?.additional || {}),
    sheet: sheetUrl,
  };

  const { data, error } = await (await supabase)
    .from("Events")
    .update({ additional: updatedAdditional })
    .eq("eventuuid", eventuuid)
    .select();

  if (error) console.error(error);
  return data;
}

export async function deleteSheet(eventuuid: string | undefined) {
  const { error } = await (
    await supabase
  )
    .from("Events")
    .update({ additional: { sheet: "" } })
    .eq("eventuuid", eventuuid)
    .select();

    if (error) console.error(error);
}
