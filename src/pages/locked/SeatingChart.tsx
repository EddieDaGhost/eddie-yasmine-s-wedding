import { useState } from 'react';
import { useIsUnlocked } from '@/hooks/useAdminPreview';
import { LockedPage } from '@/components/shared/LockedPage';
import { AdminPreviewBanner } from '@/components/shared/AdminPreviewBanner';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { sanitizeText } from '@/lib/sanitize';

interface SeatingAssignment {
  id: string;
  guest_name: string;
  table_number: string;
  table_name: string | null;
}

const SeatingChart = () => {
  const { isUnlocked, isAdminPreview } = useIsUnlocked();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['seating-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seating_assignments')
        .select('*')
        .order('table_number', { ascending: true });

      if (error) throw error;
      return (data ?? []) as SeatingAssignment[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!isUnlocked) {
    return (
      <LockedPage
        title="Find Your Table"
        description="Search for your seating assignment — available closer to the wedding day!"
      />
    );
  }

  const filtered = searchQuery.trim().length >= 2
    ? assignments.filter((a) =>
        a.guest_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const showResults = searchQuery.trim().length >= 2;

  return (
    <Layout>
      {isAdminPreview && <AdminPreviewBanner pageName="Seating Chart" />}

      <section className={`py-20 md:py-32 romantic-gradient ${isAdminPreview ? 'mt-12' : ''}`}>
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Find Your Table"
            subtitle="Search your name to find your seating assignment."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 mb-8"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Type your name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-lg py-6"
                />
              </div>
            </motion.div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-muted-foreground"
                >
                  Loading seating assignments...
                </motion.div>
              ) : showResults && filtered.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {filtered.map((assignment) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card rounded-2xl p-6 text-center"
                    >
                      <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h3 className="font-serif text-xl text-foreground mb-1">
                        {sanitizeText(assignment.guest_name)}
                      </h3>
                      <div className="text-3xl font-display text-primary font-bold my-3">
                        Table {sanitizeText(assignment.table_number)}
                      </div>
                      {assignment.table_name && (
                        <p className="text-muted-foreground text-sm italic">
                          {sanitizeText(assignment.table_name)}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : showResults && filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-2xl p-8 text-center"
                >
                  <p className="text-muted-foreground">
                    No results found for "{sanitizeText(searchQuery)}". Try checking the spelling or ask a member of the wedding party.
                  </p>
                </motion.div>
              ) : !showResults && assignments.length === 0 ? (
                <motion.div
                  key="no-data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-2xl p-8 text-center"
                >
                  <p className="text-muted-foreground">
                    Seating assignments haven't been posted yet. Check back closer to the wedding!
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SeatingChart;
