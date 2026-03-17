import React from 'react';

export function LogLine({ content }: { content: string }) {
  const levelColors: Record<string, string> = {
    '[ERROR]': '#ef4444',
    '[WARNING]': '#f59e0b',
    '[INFO]': '#3b82f6',
    '[DEBUG]': '#6b7280',
  };

  const parts: React.ReactNode[] = [];
  let currentLine = content;

  // 1. Parse brackets: [Timestamp] [Level] [Thread]
  const bracketRegex = /^(\[.*?\])\s*(\[.*?\])\s*(\[.*?\])\s*/;
  const match = currentLine.match(bracketRegex);

  if (match) {
    const timestamp = match[1];
    const level = match[2];
    const thread = match[3];

    parts.push(<span key="ts" style={{ color: '#5c6370', marginRight: 4 }}>{timestamp}</span>);
    parts.push(<span key="lvl" style={{ color: levelColors[level] || '#3b82f6', fontWeight: 600, marginRight: 4 }}>{level}</span>);
    parts.push(<span key="thr" style={{ color: '#c678dd', marginRight: 8 }}>{thread}</span>);
    currentLine = currentLine.substring(match[0].length);
  }

  // 2. Parse key=value pairs or remaining text
  const kvRegex = /(\w+)=([^\s]+)/g;
  let lastIndex = 0;
  let kvMatch;

  while ((kvMatch = kvRegex.exec(currentLine)) !== null) {
    if (kvMatch.index > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`} style={{ color: '#ffffff' }}>{currentLine.substring(lastIndex, kvMatch.index)}</span>);
    }
    parts.push(<span key={`key-${kvMatch.index}`} style={{ color: '#d19a66' }}>{kvMatch[1]}</span>);
    parts.push(<span key={`eq-${kvMatch.index}`} style={{ color: '#ffffff' }}>=</span>);
    parts.push(<span key={`val-${kvMatch.index}`} style={{ color: '#98c379' }}>{kvMatch[2]}</span>);
    lastIndex = kvRegex.lastIndex;
  }

  if (lastIndex < currentLine.length) {
    parts.push(<span key="text-end" style={{ color: '#ffffff' }}>{currentLine.substring(lastIndex)}</span>);
  }

  return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{parts}</div>;
}
