import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface PageDraft {
  id: string;
  page_key: string;
  content: Record<string, unknown>;
  is_published: boolean;
  version: number;
  created_by: string | null;
  created_at: string;
  published_at: string | null;
  notes: string | null;
}

/**
 * Hook to fetch drafts for a specific page
 */
export const usePageDrafts = (pageKey: string) => {
  return useQuery({
    queryKey: ['page_drafts', pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_drafts')
        .select('*')
        .eq('page_key', pageKey)
        .order('version', { ascending: false });

      if (error) throw error;
      return data as PageDraft[];
    },
    enabled: !!pageKey,
  });
};

/**
 * Hook to fetch the latest draft for a page
 */
export const useLatestDraft = (pageKey: string) => {
  return useQuery({
    queryKey: ['page_drafts', pageKey, 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_drafts')
        .select('*')
        .eq('page_key', pageKey)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data as PageDraft | null;
    },
    enabled: !!pageKey,
  });
};

/**
 * Hook to fetch the currently published version for a page
 */
export const usePublishedDraft = (pageKey: string) => {
  return useQuery({
    queryKey: ['page_drafts', pageKey, 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_drafts')
        .select('*')
        .eq('page_key', pageKey)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PageDraft | null;
    },
    enabled: !!pageKey,
  });
};

/**
 * Hook to fetch all pages with drafts
 */
export const useAllPageDrafts = () => {
  return useQuery({
    queryKey: ['page_drafts', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_drafts')
        .select('*')
        .order('page_key')
        .order('version', { ascending: false });

      if (error) throw error;
      return data as PageDraft[];
    },
  });
};

/**
 * Hook to create a new draft
 */
export const useCreateDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pageKey,
      content,
      notes,
      createdBy,
    }: {
      pageKey: string;
      content: Record<string, unknown>;
      notes?: string;
      createdBy?: string;
    }) => {
      // Get the latest version number
      const { data: latestDraft } = await supabase
        .from('page_drafts')
        .select('version')
        .eq('page_key', pageKey)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      const newVersion = (latestDraft?.version || 0) + 1;

      const { data, error } = await supabase
        .from('page_drafts')
        .insert([{
          page_key: pageKey,
          content: content as unknown as Json,
          version: newVersion,
          notes: notes || null,
          created_by: createdBy || null,
          is_published: false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as PageDraft;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['page_drafts', variables.pageKey] });
      queryClient.invalidateQueries({ queryKey: ['page_drafts', 'all'] });
    },
  });
};

/**
 * Hook to publish a draft (marks it as published and updates content table)
 */
export const usePublishDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ draftId, pageKey }: { draftId: string; pageKey: string }) => {
      // First, unpublish any currently published version
      await supabase
        .from('page_drafts')
        .update({ is_published: false })
        .eq('page_key', pageKey)
        .eq('is_published', true);

      // Mark this draft as published
      const { data: draft, error: draftError } = await supabase
        .from('page_drafts')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq('id', draftId)
        .select()
        .single();

      if (draftError) throw draftError;

      // Update the content table with the published content
      const content = draft.content as Record<string, unknown>;
      for (const [key, value] of Object.entries(content)) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        // Check if key exists
        const { data: existing } = await supabase
          .from('content')
          .select('id')
          .eq('key', key)
          .single();

        if (existing) {
          await supabase
            .from('content')
            .update({ value: stringValue })
            .eq('key', key);
        } else {
          await supabase
            .from('content')
            .insert({ key, value: stringValue });
        }
      }

      return draft as PageDraft;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['page_drafts', variables.pageKey] });
      queryClient.invalidateQueries({ queryKey: ['page_drafts', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
};

/**
 * Hook to restore a previous version (creates a new draft from old content)
 */
export const useRestoreVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      draftId,
      pageKey,
      createdBy,
    }: {
      draftId: string;
      pageKey: string;
      createdBy?: string;
    }) => {
      // Get the draft to restore
      const { data: oldDraft, error: fetchError } = await supabase
        .from('page_drafts')
        .select('*')
        .eq('id', draftId)
        .single();

      if (fetchError) throw fetchError;

      // Get the latest version number
      const { data: latestDraft } = await supabase
        .from('page_drafts')
        .select('version')
        .eq('page_key', pageKey)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      const newVersion = (latestDraft?.version || 0) + 1;

      // Create a new draft with the old content
      const { data, error } = await supabase
        .from('page_drafts')
        .insert([{
          page_key: pageKey,
          content: oldDraft.content,
          version: newVersion,
          notes: `Restored from version ${oldDraft.version}`,
          created_by: createdBy || null,
          is_published: false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as PageDraft;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['page_drafts', variables.pageKey] });
      queryClient.invalidateQueries({ queryKey: ['page_drafts', 'all'] });
    },
  });
};
