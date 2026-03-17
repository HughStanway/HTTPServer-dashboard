import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Activity color="#e67e22" size={48} />
      </motion.div>
    </div>
  );
}
