import React from 'react';
import { motion } from 'framer-motion';

interface SquareCardProps {
  title: string;
  subtitle: string;
  delay?: number;
  children: React.ReactNode;
}

export function SquareCard({ title, subtitle, delay = 0, children }: SquareCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
      }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#344767', margin: '0 0 2px' }}>{title}</h3>
      <p style={{ fontSize: 11, color: '#7b809a', margin: '0 0 16px' }}>{subtitle}</p>
      {children}
    </motion.div>
  );
}
