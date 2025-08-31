"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import InteractiveLogo from './InteractiveLogo';

const SplashScreen = ({ onFinished }: { onFinished: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onFinished();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-card to-accent/5 backdrop-blur-xl"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => !isVisible && onFinished()}
    >
      <div className="text-center">
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', type: 'spring' }}
          className="mb-8"
        >
          <InteractiveLogo />
        </motion.div>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            MeetAnalyzer
          </h1>
          <p className="text-lg font-medium text-base-content/80 mb-4">
            AI-Powered Meeting Intelligence
          </p>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="flex items-center justify-center space-x-2 text-base-content/60"
        >
          <div className="flex space-x-1">
            <motion.div 
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div 
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div 
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          <span className="text-sm font-medium">Loading your workspace...</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
