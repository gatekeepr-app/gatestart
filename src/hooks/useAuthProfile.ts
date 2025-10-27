// hooks/useAuthProfile.ts
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Profile } from "../../types/profile";
import { Organizer } from "../../types/Organizer";

const supabase = createClient();

export function useAuthProfile() {
  const [user, setUser] = useState<
    Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | null
  >(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(user ?? null);

      if (user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (!mounted) return;
        setProfile(p ?? null);
      }

      if (user) {
        const { data: o } = await supabase
          .from("Organizer")
          .select("*")
          .eq("uuid", profile?.organizerRef)
          .single();
        if (!mounted) return;
        setOrganizer(o ?? null);
      }
    

      setLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null); // Clear profile if user logs out
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  });

  return { user, profile, organizer, loading };
}
