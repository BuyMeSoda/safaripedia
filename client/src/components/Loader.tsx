import { motion } from "framer-motion";

export function Loader() {
  return (
    <div className="flex flex-col space-y-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-2 text-sm text-muted-foreground mb-4"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/40"></span>
        </span>
        <span>Synthesizing thoughts...</span>
      </motion.div>
      
      <div className="space-y-3">
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-[90%] rounded animate-shimmer" />
        <div className="h-4 w-[95%] rounded animate-shimmer" />
        <div className="h-4 w-[60%] rounded animate-shimmer" />
      </div>
    </div>
  );
}
