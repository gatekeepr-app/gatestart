"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2, Save, UserPlus, UserMinus, ExternalLink } from "lucide-react";
import { Profile } from "../../../types/profile";
import axios from "axios";
import { toast } from "sonner";

/**
 * OrganizerProfilePage — styled with the Sales Analytics Dashboard theme
 * Tokens: minimal, pill UI, soft contrast, neon accent #7DFF6A, Inter, rounded cards,
 *         soft borders (#E8E8EA), surface/surfaceAlt, focus-visible rings
 */

// Inject theme variables (kept local so the file is drop-in). Remove if you already set these globally.
const ThemeVars = () => (
  <style>{`
    :root {
      --bg: #F6F7F8;
      --surface: #FFFFFF;
      --surface-alt: #0B0B0B;
      --text: #0A0A0A;
      --muted-text: #7A7A7A;
      --border: #E8E8EA;
      --accent: #7DFF6A;
      --accent-muted: #E9FFE7;
      --chip: #EFEFF1;

      --radius-sm: 10px; 
      --radius-md: 16px; 
      --radius-lg: 22px; 
      --radius-xl: 28px; 
      --radius-pill: 9999px;

      --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
      --shadow-md: 0 6px 16px rgba(0,0,0,0.08);
      --shadow-lg: 0 20px 40px rgba(0,0,0,0.10);

      --container-x: 24px;
      --section-gap: 24px;
      --card-pad: 20px;
    }
    body { font-family: Inter, ui-sans-serif, system-ui; }
  `}</style>
);

// Types
type Organizer = {
  uuid: string;
  name: string | null;
  bio: string | null;
  image: string | null;
  slug: string | null;
  socialLinks: {
    email?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
  } | null;
};

type Member = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
};

export default function OrganizerProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [org, setOrg] = useState<Organizer | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Editable fields (name/slug are locked)
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [social, setSocial] = useState<{
    email?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
  }>({});

  // Add member (by email)
  const [inviteEmail, setInviteEmail] = useState("");
  const canInvite = useMemo(
    () => /\S+@\S+\.\S+/.test(inviteEmail),
    [inviteEmail]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      setOk(null);
      try {
        // 1) Who am I?
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) {
          setError("Please sign in to manage your organizer profile.");
          setLoading(false);
          return;
        }

        // 2) Get my profile, grab organizerRef
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name, organizerRef")
          .eq("id", user.id)
          .single();
        if (profErr) throw profErr;
        if (!prof?.organizerRef) {
          setError("No organizer linked to your profile yet.");
          setLoading(false);
          return;
        }

        // 3) Fetch organizer by uuid
        const { data: orgRow, error: orgErr } = await supabase
          .from("Organizer")
          .select("uuid, name, bio, image, slug, socialLinks")
          .eq("uuid", prof.organizerRef)
          .single();
        if (orgErr) throw orgErr;

        const organizer: Organizer = {
          uuid: orgRow.uuid,
          name: orgRow.name,
          bio: orgRow.bio,
          image: orgRow.image,
          slug: orgRow.slug,
          socialLinks: orgRow.socialLinks ?? {},
        };
        setOrg(organizer);
        setBio(organizer.bio ?? "");
        setImage(organizer.image ?? "");
        setSocial({
          email: organizer.socialLinks?.email ?? "",
          website: organizer.socialLinks?.website ?? "",
          facebook: organizer.socialLinks?.facebook ?? "",
          instagram: organizer.socialLinks?.instagram ?? "",
        });

        // 4) Members (everyone whose profiles.organizerRef == organizer.uuid)
        const { data: memberRows, error: memErr } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("organizerRef", organizer.uuid)
          .order("created_at", { ascending: true });
        if (memErr) throw memErr;
        setMembers(
          (memberRows ?? []).map((m) => ({
            id: m.id,
            full_name: m.full_name,
            email: m.email,
            avatar_url: m.avatar_url,
          }))
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data || error.message);
        } else if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("Unknown error:", error);
        }
        toast("Failed to send mail.");
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const saveOrganizer = async () => {
    if (!org) return;
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const updates = {
        bio: bio || null,
        image: image || null,
        socialLinks: {
          email: social.email ?? "",
          website: social.website ?? "",
          facebook: social.facebook ?? "",
          instagram: social.instagram ?? "",
        },
      };
      const { error: uerr } = await supabase
        .from("Organizer")
        .update(updates)
        .eq("uuid", org.uuid);
      if (uerr) throw uerr;
      setOk("Organizer updated.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown error:", error);
      }
      toast("Failed to update organizer.");
    } finally {
      setSaving(false);
    }
  };

  const addMember = async () => {
    if (!org || !canInvite) return;
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/organizer/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, organizerUuid: org.uuid }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to add member");

      // refresh members
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("organizerRef", org.uuid);
      setMembers((data ?? []) as Profile[]);
      setInviteEmail("");
      setOk("Member added.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown error:", error);
      }
      toast("Failed to send mail.");
    }
  };

  const removeMember = async (profileId: string) => {
    if (!org) return;
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/organizer/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, organizerUuid: org.uuid }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to remove member");
      setMembers((prev) => prev.filter((m) => m.id !== profileId));
      setOk("Member removed.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown error:", error);
      }
      toast("Failed to send mail.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-[var(--bg)] px-[var(--container-x)] py-10">
        <ThemeVars />
        <div className="h-9 w-48 rounded-[var(--radius-pill)] bg-[var(--chip)] animate-pulse border border-[var(--border)]" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 rounded-[var(--radius-xl)] bg-[var(--surface)] animate-pulse border border-[var(--border)] shadow-[var(--shadow-sm)]" />
          <div className="h-40 rounded-[var(--radius-xl)] bg-[var(--surface)] animate-pulse border border-[var(--border)] shadow-[var(--shadow-sm)]" />
          <div className="h-40 rounded-[var(--radius-xl)] bg-[var(--surface)] animate-pulse border border-[var(--border)] shadow-[var(--shadow-sm)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-[var(--bg)] px-[var(--container-x)] py-10">
        <ThemeVars />
        <div className="rounded-[var(--radius-xl)] border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {error}
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-dvh bg-[var(--bg)] px-[var(--container-x)] py-10">
        <ThemeVars />
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          No organizer found for this profile.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg)] px-[var(--container-x)] py-8">
      <ThemeVars />
      <div className="max-w-[960px] mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[36px] leading-[1.15] font-semibold text-[var(--text)]">
            Organizer Profile
          </h1>
          <Link
            href={`/o/${org.slug ?? org.uuid}`}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-4 h-10 text-sm border border-[var(--border)] bg-[var(--surface)] hover:shadow-[var(--shadow-sm)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Public page <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* Alerts */}
        {(ok || error) && (
          <div className="flex gap-3">
            {ok && (
              <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-4 h-10 text-sm bg-[var(--accent-muted)] border-[var(--accent)]/40 text-black">
                {ok}
              </div>
            )}
            {error && (
              <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-4 h-10 text-sm bg-red-50 border-red-200 text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Organizer card */}
        <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="grid grid-cols-1 md:grid-cols-[180px,1fr] gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-32 w-32 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--chip)]">
                {image ? (
                  <Image
                    alt="Organizer image"
                    src={image}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-[var(--muted-text)] text-sm">
                    No image
                  </div>
                )}
              </div>
              <div className="w-full space-y-1.5">
                <Label
                  htmlFor="image"
                  className="text-[var(--muted-text)] text-xs"
                >
                  Image URL
                </Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="h-11 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[var(--muted-text)] text-xs">
                    Organizer Name
                  </Label>
                  <Input
                    value={org.name ?? ""}
                    disabled
                    className="h-11 rounded-[var(--radius-lg)] bg-[var(--chip)] border border-[var(--border)] text-[var(--text)]/80"
                  />
                </div>
                <div>
                  <Label className="text-[var(--muted-text)] text-xs">
                    Slug
                  </Label>
                  <Input
                    value={org.slug ?? ""}
                    disabled
                    className="h-11 rounded-[var(--radius-lg)] bg-[var(--chip)] border border-[var(--border)] text-[var(--text)]/80"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="bio"
                  className="text-[var(--muted-text)] text-xs"
                >
                  Bio
                </Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  className="w-full rounded-[var(--radius-lg)] border border-[var(--border)] p-3 outline-none bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)] placeholder:text-[var(--muted-text)] text-[14px]"
                  placeholder="Tell people about your organizer..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="em"
                    className="text-[var(--muted-text)] text-xs"
                  >
                    Contact Email
                  </Label>
                  <Input
                    id="em"
                    value={social.email ?? ""}
                    onChange={(e) =>
                      setSocial((s) => ({ ...s, email: e.target.value }))
                    }
                    placeholder="contact@yourorg.com"
                    className="h-11 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="web"
                    className="text-[var(--muted-text)] text-xs"
                  >
                    Website
                  </Label>
                  <Input
                    id="web"
                    value={social.website ?? ""}
                    onChange={(e) =>
                      setSocial((s) => ({ ...s, website: e.target.value }))
                    }
                    placeholder="https://yourorg.com"
                    className="h-11 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="fb"
                    className="text-[var(--muted-text)] text-xs"
                  >
                    Facebook
                  </Label>
                  <Input
                    id="fb"
                    value={social.facebook ?? ""}
                    onChange={(e) =>
                      setSocial((s) => ({ ...s, facebook: e.target.value }))
                    }
                    placeholder="https://facebook.com/yourorg"
                    className="h-11 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="ig"
                    className="text-[var(--muted-text)] text-xs"
                  >
                    Instagram
                  </Label>
                  <Input
                    id="ig"
                    value={social.instagram ?? ""}
                    onChange={(e) =>
                      setSocial((s) => ({ ...s, instagram: e.target.value }))
                    }
                    placeholder="https://instagram.com/yourorg"
                    className="h-11 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={saveOrganizer}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--surface-alt)] text-white px-5 h-11 text-sm border border-black/10 hover:opacity-95 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Members */}
        <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--text)]">
              Members
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Input
              type="email"
              placeholder="Add member by email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="h-11 rounded-[var(--radius-pill)] sm:max-w-sm bg-[var(--surface)] border border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            />
            <button
              onClick={addMember}
              disabled={!canInvite}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-4 h-11 text-sm border border-[var(--border)] bg-[var(--chip)] hover:shadow-[var(--shadow-sm)] transition disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <UserPlus className="h-4 w-4" /> Add member
            </button>
          </div>

          {members.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--chip)] p-4 text-[var(--muted-text)]">
              No members yet.
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-[var(--chip)] border border-[var(--border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={m.full_name ?? m.email}
                        src={
                          m.avatar_url ||
                          "https://ui-avatars.com/api/?background=E5E7EB&color=111827&name=" +
                            encodeURIComponent(m.full_name ?? m.email)
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--text)]">
                        {m.full_name ?? "Unnamed user"}
                      </div>
                      <div className="truncate text-xs text-[var(--muted-text)]">
                        {m.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(m.id)}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 h-9 text-xs border border-[var(--border)] bg-[var(--chip)] hover:shadow-[var(--shadow-sm)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    title="Remove from organizer"
                  >
                    <UserMinus className="h-3.5 w-3.5" /> Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
