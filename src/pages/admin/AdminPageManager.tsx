import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Save,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useHiddenPages, useUpdateHiddenPages } from '@/hooks/usePageVisibility';
import { allNavLinks } from '@/components/layout/Navigation';

// Extended page list including pages not in nav but that could be toggled
const allPages = [
  ...allNavLinks,
  { href: '/registry', label: 'Registry' },
].filter((page, index, self) =>
  index === self.findIndex((p) => p.href === page.href)
);

const AdminPageManager = () => {
  const { session } = useAdminAuth();
  const { toast } = useToast();
  const { data: hiddenPages, isLoading } = useHiddenPages();
  const updateHidden = useUpdateHiddenPages();
  const [localHidden, setLocalHidden] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // Sync DB state to local
  useEffect(() => {
    if (hiddenPages) {
      setLocalHidden(new Set(hiddenPages));
      setHasChanges(false);
    }
  }, [hiddenPages]);

  const togglePage = (href: string) => {
    setLocalHidden((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateHidden.mutateAsync(Array.from(localHidden));
      setHasChanges(false);
      toast({
        title: 'Page visibility updated',
        description: `${localHidden.size} page(s) are now hidden from navigation.`,
      });
    } catch {
      toast({
        title: 'Error saving',
        description: 'Could not update page visibility. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Page Manager</h1>
            <p className="text-muted-foreground mt-1">
              Show or hide pages from the website navigation
            </p>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={updateHidden.isPending}>
              {updateHidden.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          )}
        </div>

        {/* Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p>
                  Hidden pages are removed from the navigation bar and footer. The pages still exist and
                  can be accessed directly via URL — this only controls navigation visibility.
                </p>
                <p className="mt-1">
                  The <strong>Home</strong> and <strong>RSVP</strong> pages cannot be hidden.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page toggles */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-3">
            {allPages.map((page, index) => {
              const isHidden = localHidden.has(page.href);
              const isProtected = page.href === '/' || page.href === '/rsvp';

              return (
                <motion.div
                  key={page.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className={isHidden ? 'opacity-60' : ''}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isHidden ? (
                            <EyeOff className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Eye className="w-5 h-5 text-primary" />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{page.label}</p>
                            <p className="text-xs text-muted-foreground font-mono">{page.href}</p>
                          </div>
                          {isHidden && (
                            <Badge variant="secondary" className="text-xs">
                              Hidden
                            </Badge>
                          )}
                          {isProtected && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {isHidden ? 'Hidden' : 'Visible'}
                          </span>
                          <Switch
                            checked={!isHidden}
                            onCheckedChange={() => togglePage(page.href)}
                            disabled={isProtected}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Status</CardTitle>
            <CardDescription>
              {localHidden.size === 0
                ? 'All pages are visible in navigation.'
                : `${localHidden.size} page(s) hidden from navigation.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allPages.map((page) => (
                <Badge
                  key={page.href}
                  variant={localHidden.has(page.href) ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {localHidden.has(page.href) ? (
                    <EyeOff className="w-3 h-3 mr-1" />
                  ) : (
                    <Globe className="w-3 h-3 mr-1" />
                  )}
                  {page.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPageManager;
