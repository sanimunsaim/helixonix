import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  noPadding?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, noPadding = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass-card',
        hover && 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3)] transition-shadow duration-200',
        !noPadding && 'p-5',
        className
      )}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
