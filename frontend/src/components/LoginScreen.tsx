import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (auth: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const credentials = btoa(`${username}:${password}`);
    onLogin(`Basic ${credentials}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: 400, padding: 40, background: '#fff', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #344767, #4a6fa5)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(52, 71, 103, 0.2)' }}>
            <LogIn size={32} color="#fff" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#344767', margin: 0 }}>Welcome Back</h2>
          <p style={{ fontSize: 14, color: '#7b809a', marginTop: 8 }}>Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#344767', marginLeft: 4 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #d2d6da', fontSize: 14, outline: 'none' }}
              placeholder="Username"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#344767', marginLeft: 4 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #d2d6da', fontSize: 14, outline: 'none' }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            style={{ marginTop: 12, padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #344767, #4a6fa5)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <LogIn size={18} /> Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}
