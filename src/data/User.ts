import { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";

const supabase = createClient();

export async function saveUser(data: User | null) {
  const { error } = await supabase
    .from("users")
    .insert([{ id: data?.id, email: data?.email }])
    .select();
  if (error) {
    console.error("Error saving user:", error);
  }
}

export async function checkUser() {
  const { data } = await supabase.auth.getUser();
  // if (error || !data?.user) {
  //   redirect("/login");
  // }

  // let { data: users } = await supabase
  //   .from("users")
  //   .select("*")
  //   .eq("id", data.user.id)
  //   .single();

  // return users;

  console.log(data);
}

export async function updateProfile() {
  console.log("first");
}
