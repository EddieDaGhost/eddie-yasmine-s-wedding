import { useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { isAfterWeddingDate as baseIsAfterWeddingDate } from '@/lib/wedding-utils';

/**
 * Hook to check if the current user is in admin preview mode.
 * Admin preview mode allows authenticated admins to bypass date locks.
 * 
 * Uses ?adminPreview=true query parameter, but only works for authenticated admins.
 */
export const useAdminPreview = () => {
  const [searchParams] = useSearchParams();
  const adminAuth = useAdminAuth();
  
  const hasPreviewParam = searchParams.get('adminPreview') === 'true';
  const isAuthenticated = !!adminAuth?.session;
  
  // Only allow admin preview if both conditions are met
  const isAdminPreview = hasPreviewParam && isAuthenticated;
  
  return {
    isAdminPreview,
    isAuthenticated,
  };
};

/**
 * Hook to check if locked content should be shown.
 * Returns true if:
 * - The wedding date has passed (normal unlock), OR
 * - The user is an authenticated admin with adminPreview=true
 */
export const useIsUnlocked = () => {
  const { isAdminPreview, isAuthenticated } = useAdminPreview();
  const isAfterWedding = baseIsAfterWeddingDate();
  
  return {
    isUnlocked: isAfterWedding || isAdminPreview,
    isAdminPreview,
    isAuthenticated,
    isAfterWedding,
  };
};
