import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useRsvps() {
  return useQuery({
    queryKey: ["rsvps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}