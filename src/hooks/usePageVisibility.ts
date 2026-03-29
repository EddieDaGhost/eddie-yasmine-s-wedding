import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CONTENT_KEY = 'nav_hidden_pages';

/**
 * Returns the list of hidden page paths (e.g. ["/wedding-party", "/registry"])
 */
export const useHiddenPages = () => {
  return useQuery({
    queryKey: ['content', CONTENT_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('value')
        .eq('key', CONTENT_KEY)
        .maybeSingle();

      if (error) throw error;
      if (!data?.value) return [] as string[];

      try {
        const parsed = JSON.parse(data.value);
        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        return [] as string[];
      }
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Mutation to update the hidden pages list
 */
export const useUpdateHiddenPages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hiddenPaths: string[]) => {
      const value = JSON.stringify(hiddenPaths);

      // Upsert: try update first, insert if not exists
      const { data: existing } = await supabase
        .from('content')
        .select('id')
        .eq('key', CONTENT_KEY)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('content')
          .update({ value })
          .eq('key', CONTENT_KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('content')
          .insert({ key: CONTENT_KEY, value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', CONTENT_KEY] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
};
