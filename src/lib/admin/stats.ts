import { supabase } from "@/lib/supabase";

// -----------------------------
// RSVP STATS
// -----------------------------
export async function getRsvpStats() {
  // Total RSVPs
  const { count: total } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true });

  // Attending
  const { count: attending } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("status", "attending");

  // Not attending
  const { count: notAttending } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("status", "not_attending");

  // No response
  const { count: noResponse } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .is("status", null);

  // Meal choices breakdown
  const { data: mealRows } = await supabase
    .from("rsvps")
    .select("meal_choice");

  const mealChoices: Record<string, number> = {};
  mealRows?.forEach((row) => {
    if (!row.meal_choice) return;
    mealChoices[row.meal_choice] = (mealChoices[row.meal_choice] || 0) + 1;
  });

  // Allergies count
  const { count: allergies } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
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
    .from("guestbook")
    .select("*", { count: "exact", head: true });

  const { count: unread } = await supabase
    .from("guestbook")
    .select("*", { count: "exact", head: true })
    .eq("approved", false);

  const { count: approved } = await supabase
    .from("guestbook")
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