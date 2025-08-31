import { motion } from 'framer-motion';

const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0.7 }}
    animate={{ opacity: [0.7, 1, 0.7] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    className="relative bg-card/80 backdrop-blur-xl rounded-xl shadow-lg border border-border p-6 card-hover"
  >
    {/* Status indicator skeleton */}
    <div className="absolute top-4 left-4 w-3 h-3 bg-primary/30 rounded-full animate-pulse"></div>
    
    {/* Content skeleton */}
    <div className="mt-8 mb-6">
      <div className="h-6 bg-primary/20 rounded-lg w-4/5 mb-3 animate-pulse"></div>
      <div className="h-4 bg-primary/10 rounded-lg w-3/4 animate-pulse"></div>
    </div>
    
    {/* Metadata skeleton */}
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-primary/20 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-3 bg-primary/10 rounded w-16 mb-1 animate-pulse"></div>
          <div className="h-4 bg-primary/20 rounded w-24 animate-pulse"></div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-accent/20 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-3 bg-accent/10 rounded w-12 mb-1 animate-pulse"></div>
          <div className="h-4 bg-accent/20 rounded w-20 animate-pulse"></div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default SkeletonCard;
