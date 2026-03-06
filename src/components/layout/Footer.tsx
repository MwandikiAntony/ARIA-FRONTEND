import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const techStack = [
    'Next.js 15',
    'FastAPI',
    'WebSocket',
    'Gemini Live',
    'Firebase',
    'Cloud Run',
    'Vertex AI',
    'TFLite',
    'Terraform',
  ];

  return (
    <footer className="bg-bg-deep border-t border-border px-4 md:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
      <div className="md:col-span-1">
        <div className="font-display text-3xl md:text-4xl font-bold tracking-wider text-text-primary mb-3">
          AR<span className="text-cyan">I</span>A
        </div>
        <p className="text-sm text-text-muted leading-relaxed max-w-xs">
          Adaptive Real-time Intelligence Agent.
          <br />
          Navigate the world. Master every conversation.
          <br />
          Built with Gemini Live API on Google Cloud.
        </p>
      </div>

      <div>
        <div className="font-mono text-xs tracking-wider uppercase text-text-muted mb-4">Product</div>
        <ul className="flex flex-col gap-2.5">
          {['Navigation Mode', 'Coach Mode', 'Session Dashboard', 'Emergency SOS', 'API Reference'].map(
            (item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="text-sm text-text-secondary hover:text-cyan transition-colors duration-200"
                >
                  {item}
                </Link>
              </li>
            )
          )}
        </ul>
      </div>

      <div>
        <div className="font-mono text-xs tracking-wider uppercase text-text-muted mb-4">Tech Stack</div>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[10px] px-2.5 py-1 rounded-sm border border-border text-text-muted bg-bg-surface"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};