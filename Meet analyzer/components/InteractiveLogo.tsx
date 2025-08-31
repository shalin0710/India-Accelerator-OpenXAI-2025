"use client";

import { motion } from 'framer-motion';

const InteractiveLogo = () => {
  return (
    <motion.div
      className="relative w-16 h-16"
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative w-full h-full">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: 'spring', stiffness: 200 }}
        />
        <motion.div
          className="absolute inset-2 bg-card rounded-xl flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.span
            className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            M
          </motion.span>
        </motion.div>
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2, type: 'spring' }}
        />
      </div>
    </motion.div>
  );
};

export default InteractiveLogo;


