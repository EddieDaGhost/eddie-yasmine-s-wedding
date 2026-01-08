import { motion } from 'framer-motion';
import { Eye, Shield, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AdminPreviewBannerProps {
  pageName: string;
}

export const AdminPreviewBanner = ({ pageName }: AdminPreviewBannerProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const exitPreview = () => {
    // Remove the adminPreview param and navigate to the same page
    const params = new URLSearchParams(location.search);
    params.delete('adminPreview');
    const newSearch = params.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
  };

  const goToAdmin = () => {
    navigate('/admin/locked-pages');
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 shadow-lg"
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <Eye className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm">
            Admin Preview Mode: <span className="font-bold">{pageName}</span>
          </span>
          <span className="text-amber-800 text-xs">
            (This page is locked for public users)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToAdmin}
            className="text-amber-950 hover:bg-amber-400"
          >
            Back to Admin
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exitPreview}
            className="text-amber-950 hover:bg-amber-400"
          >
            <X className="w-4 h-4 mr-1" />
            Exit Preview
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
