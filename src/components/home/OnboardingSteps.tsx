import React from 'react';

export const OnboardingSteps: React.FC = () => {
  const steps = [
    {
      number: '✓',
      title: 'Create Account',
      description: 'Sign in with Google Firebase Auth. Your sessions sync across devices.',
      status: 'done',
    },
    {
      number: '✓',
      title: 'Grant Permissions',
      description: 'Allow camera, microphone, and location access for full ARIA functionality.',
      status: 'done',
    },
    {
      number: '3',
      title: 'Choose Mode',
      description: 'Select General Assistant for daily tasks, Navigation for outdoor guidance, or Coach for performance improvement.',
      status: 'active',
    },
    {
      number: '4',
      title: 'Start Session',
      description: 'ARIA connects via WebSocket and begins real-time AI assistance instantly.',
      status: 'pending',
    },
  ];

  return (
    <section className="py-12 md:py-16 px-4 md:px-8 bg-bg-void border-t border-border">
      <div className="mb-8 md:mb-10">
        <div className="section-label">Setup Flow</div>
        <h2 className="section-title">
          Get Started in <span className="text-cyan">4 Steps</span>
        </h2>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
        {/* Desktop connecting line */}
        <div className="hidden lg:block absolute top-7 left-[12.5%] w-3/4 h-px bg-border z-0" />

        {steps.map((step, index) => (
          <div
            key={index}
            className={`relative z-10 flex flex-col items-center lg:items-start gap-4 px-4 ${
              step.status === 'active' ? 'active' : ''
            }`}
          >
            <div
              className={`
                w-14 h-14 rounded-full border-2 flex items-center justify-center font-display text-xl font-bold
                transition-all duration-200
                ${step.status === 'done' ? 'border-green bg-green-dim text-green' : ''}
                ${step.status === 'active' ? 'border-cyan bg-cyan-ghost text-cyan shadow-[0_0_20px_rgba(0,229,255,0.08)]' : ''}
                ${step.status === 'pending' ? 'border-border bg-bg-card text-text-muted' : ''}
              `}
            >
              {step.number}
            </div>
            <div>
              <h3
                className={`
                  font-display text-base font-semibold tracking-wide mb-1
                  ${step.status === 'active' ? 'text-text-primary' : 'text-text-secondary'}
                `}
              >
                {step.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed max-w-[220px]">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};