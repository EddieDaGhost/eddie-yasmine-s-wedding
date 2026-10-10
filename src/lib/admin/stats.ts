import { supabase } from "@/integrations/supabase/client";

// -----------------------------
// RSVP STATS
// -----------------------------
export async function getRsvpStats() {
  // Reset (archived) RSVPs are excluded throughout — they are kept only as
  // history and must not be counted as live responses.

  // Total RSVPs
  const { count: total } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .is("archived_at", null);

  // Attending
  const { count: attending } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .is("archived_at", null)
    .eq("attending", true);

  // Not attending
  const { count: notAttending } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .is("archived_at", null)
    .eq("attending", false);

  // No response
  const { count: noResponse } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .is("archived_at", null)
    .is("attending", null);

  // Late-night bite breakdown (stored in meal_preference).
  // Invite RSVPs store one choice per guest, e.g. "Eddie: Soft Pretzels | Yasmine: Asian Noodles",
  // so count each guest's choice individually.
  const { data: mealRows } = await supabase
    .from("rsvps")
    .select("meal_preference")
    .is("archived_at", null);

  const mealChoices: Record<string, number> = {};
  mealRows?.forEach((row) => {
    if (!row.meal_preference) return;
    row.meal_preference.split('|').forEach((entry) => {
      const choice = entry.includes(':') ? entry.slice(entry.lastIndexOf(':') + 1).trim() : entry.trim();
      if (!choice) return;
      mealChoices[choice] = (mealChoices[choice] || 0) + 1;
    });
  });

  // Allergies count
  const { count: allergies } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .is("archived_at", null)
    .not("allergies", "is", null)
    .neq("allergies", "");

  return {
    total,
    attending,
    notAttending,
    noResponse,
    mealChoices,
    allergies,
  };
}

// -----------------------------
// GUESTBOOK STATS
// -----------------------------
export async function getGuestbookStats() {
  const { count: total } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true });

  const { count: unread } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("approved", false);

  const { count: approved } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("approved", true);

  return {
    total,
    unread,
    approved,
    pending: unread,
  };
}

// -----------------------------
// PHOTO STATS
// -----------------------------
export async function getPhotoStats() {
  const { count: total } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true });

  const { count: pending } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("approved", false);

  const { count: approved } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("approved", true);

  return {
    total,
    pending,
    approved,
  };
}