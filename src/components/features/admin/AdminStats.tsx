import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Camera, MessageSquare } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
}

const StatCard = ({ label, value, icon, color = 'primary' }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card border border-border rounded-lg p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-display text-foreground mt-1">{value}</p>
      </div>
      <div className={`p-3 bg-${color}/10 rounded-full`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

interface AdminStatsProps {
  totalGuests?: number;
  attending?: number;
  declined?: number;
  pendingMessages?: number;
  pendingPhotos?: number;
  isLoading?: boolean;
}

export const AdminStats = ({
  totalGuests = 0,
  attending = 0,
  declined = 0,
  pendingMessages = 0,
  pendingPhotos = 0,
  isLoading = false,
}: AdminStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        label="Total Guests"
        value={totalGuests}
        icon={<Users className="w-6 h-6 text-primary" />}
      />
      <StatCard
        label="Attending"
        value={attending}
        icon={<CheckCircle className="w-6 h-6 text-green-500" />}
        color="green-500"
      />
      <StatCard
        label="Declined"
        value={declined}
        icon={<XCircle className="w-6 h-6 text-red-500" />}
        color="red-500"
      />
      <StatCard
        label="Pending Messages"
        value={pendingMessages}
        icon={<MessageSquare className="w-6 h-6 text-amber-500" />}
        color="amber-500"
      />
      <StatCard
        label="Pending Photos"
        value={pendingPhotos}
        icon={<Camera className="w-6 h-6 text-blue-500" />}
        color="blue-500"
      />
    </div>
  );
};
