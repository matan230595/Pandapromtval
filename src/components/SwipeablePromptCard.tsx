import React, { useState } from 'react';
import { Archive } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children: React.ReactNode;
  onArchive: () => void;
  disabled?: boolean;
}

export const SwipeablePromptCard: React.FC<Props> = ({ children, onArchive, disabled = false }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);

  const minSwipeDistance = 75;

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (disabled || touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    if (diff < 0) {
      setOffsetX(Math.max(diff, -120));
      setTouchEnd(currentTouch);
    }
  };

  const onTouchEnd = () => {
    if (disabled || !touchStart || !touchEnd) {
      setOffsetX(0);
      return;
    }
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) {
      onArchive();
    }
    setOffsetX(0);
  };

  return (
    <div 
      className="relative overflow-hidden rounded-2xl transition-all"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-y-0 right-0 w-32 bg-amber-600 text-white flex items-center justify-center gap-1.5 font-bold text-xs rounded-2xl shadow-inner z-0">
        <Archive className="w-4 h-4" />
        העבר לארכיון
      </div>

      <motion.div
        animate={{ x: offsetX }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 bg-white dark:bg-[#151515]"
      >
        {children}
      </motion.div>
    </div>
  );
};
