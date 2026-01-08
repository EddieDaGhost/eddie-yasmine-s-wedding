import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  Eye, 
  Edit, 
  Calendar,
  Image,
  MessageSquare,
  HelpCircle,
  Bell,
  Upload,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminLayout } from '@/components/features/admin';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { isAfterWeddingDate, formatWeddingDate, getTimeUntilWedding } from '@/lib/wedding-utils';

interface LockedPageInfo {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  contentKeys?: string[];
}

const lockedPages: LockedPageInfo[] = [
  {
    id: 'timeline',
    name: 'Interactive Timeline',
    description: 'Visual timeline of Eddie & Yasmine\'s love story with photos and memories',
    path: '/timeline',
    icon: <Clock className="w-5 h-5" />,
    contentKeys: ['timeline_events', 'timeline_photos'],
  },
  {
    id: 'quiz',
    name: 'Guest Quiz',
    description: 'Fun trivia game testing how well guests know the couple',
    path: '/quiz',
    icon: <HelpCircle className="w-5 h-5" />,
    contentKeys: ['quiz_questions'],
  },
  {
    id: 'guestbook',
    name: 'Message Wall / Guestbook',
    description: 'Guest messages and wishes for the couple (with moderation)',
    path: '/guestbook',
    icon: <MessageSquare className="w-5 h-5" />,
    contentKeys: ['guestbook_settings'],
  },
  {
    id: 'photos',
    name: 'Photo Upload',
    description: 'Guests can upload photos from the celebration',
    path: '/photos',
    icon: <Upload className="w-5 h-5" />,
    contentKeys: ['photo_upload_settings'],
  },
  {
    id: 'updates',
    name: 'Live Updates',
    description: 'Real-time updates and announcements during the wedding',
    path: '/updates',
    icon: <Bell className="w-5 h-5" />,
    contentKeys: ['live_updates'],
  },
  {
    id: 'gallery',
    name: 'Photo Gallery',
    description: 'Grid of all approved wedding photos',
    path: '/gallery',
    icon: <Image className="w-5 h-5" />,
    contentKeys: ['gallery_settings'],
  },
  {
    id: 'secret',
    name: 'Secret QR Page',
    description: 'Hidden page accessible via QR codes at the venue',
    path: '/secret',
    icon: <Sparkles className="w-5 h-5" />,
    contentKeys: ['secret_page_content'],
  },
];

const AdminLockedPages = () => {
  const { session } = useAdminAuth();
  const isUnlocked = isAfterWeddingDate();
  const timeUntil = getTimeUntilWedding();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Locked Pages</h1>
          <p className="text-muted-foreground mt-1">
            Preview and manage pages that are locked until the wedding day
          </p>
        </div>

        {/* Status Banner */}
        <Card className={isUnlocked ? 'border-green-500/50 bg-green-50/50' : 'border-amber-500/50 bg-amber-50/50'}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isUnlocked ? (
                  <Unlock className="w-6 h-6 text-green-600" />
                ) : (
                  <Lock className="w-6 h-6 text-amber-600" />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    {isUnlocked 
                      ? 'All pages are now unlocked for the public!'
                      : 'Pages are currently locked for public users'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Wedding date: {formatWeddingDate()}
                  </p>
                </div>
              </div>
              
              {!isUnlocked && !timeUntil.isWeddingDay && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Time until unlock:</p>
                  <p className="font-mono text-lg font-bold text-amber-700">
                    {timeUntil.days}d {timeUntil.hours}h {timeUntil.minutes}m
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Admin Preview Mode</p>
                <p className="text-sm text-muted-foreground">
                  As an admin, you can preview any locked page by clicking "Preview Page". 
                  This uses a secure admin override that only works for authenticated admins.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pages Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {lockedPages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {page.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{page.name}</CardTitle>
                        <Badge 
                          variant={isUnlocked ? "default" : "secondary"}
                          className="mt-1"
                        >
                          {isUnlocked ? (
                            <>
                              <Unlock className="w-3 h-3 mr-1" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{page.description}</CardDescription>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="default" size="sm">
                      <Link to={`${page.path}?adminPreview=true`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Page
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/admin/content?filter=${page.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Content
                      </Link>
                    </Button>
                  </div>

                  {page.contentKeys && page.contentKeys.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Content keys:</p>
                      <div className="flex flex-wrap gap-1">
                        {page.contentKeys.map((key) => (
                          <code 
                            key={key} 
                            className="text-xs bg-muted px-1.5 py-0.5 rounded"
                          >
                            {key}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Related Admin Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/guestbook">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Moderate Guestbook
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/photos">
                  <Image className="w-4 h-4 mr-2" />
                  Moderate Photos
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/content">
                  <Edit className="w-4 h-4 mr-2" />
                  Content Editor
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminLockedPages;
