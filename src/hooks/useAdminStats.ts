import { useQuery } from "@tanstack/react-query";
import { getRsvpStats, getGuestbookStats, getPhotoStats } from "@/lib/admin/stats";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [rsvps, guestbook, photos] = await Promise.all([
        getRsvpStats(),
        getGuestbookStats(),
        getPhotoStats(),
      ]);

      return {
        rsvps,
        guestbook,
        photos,
      };
    },
    refetchOnWindowFocus: true,
  });
}