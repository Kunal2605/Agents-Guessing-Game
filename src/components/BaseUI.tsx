import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ children, className }) => {
  return (
    <div className={cn("glass glass-card", className)}>
      {children}
    </div>
  );
};

interface AgentBubbleProps {
  agentName: string;
  message: string;
  isThinking?: boolean;
  type: 'helper1' | 'helper2' | 'guesser';
}

export const AgentBubble: React.FC<AgentBubbleProps> = ({ agentName, message, isThinking, type }) => {
  const accentColor = {
    helper1: 'var(--primary-accent)',
    helper2: 'var(--secondary-accent)',
    guesser: 'var(--tertiary-accent)'
  }[type];

  return (
    <div className="flex flex-col gap-2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-full" 
          style={{ backgroundColor: accentColor }}
        />
        <span className="font-bold text-sm tracking-wide uppercase opacity-80" style={{ color: accentColor }}>
          {agentName}
        </span>
      </div>
      <div className="glass px-4 py-3 rounded-2xl max-w-[80%]" style={{ borderLeft: `4px solid ${accentColor}` }}>
        {isThinking ? (
          <span className="thinking-dots">Thinking</span>
        ) : (
          <p className="m-0 leading-relaxed text-slate-200">{message}</p>
        )}
      </div>
    </div>
  );
};
