import React from 'react';

export const CameraFeed: React.FC = () => {
  return (
    <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-black glow-box">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_60%,rgba(0,30,50,0.8)_0%,#000_100%)]">
        {/* Buildings */}
        <div className="absolute bottom-[48%] left-0 w-[18%] h-[100px] bg-[#0a1a24] border border-cyan/10">
          <div className="grid grid-cols-3 gap-1 p-1.5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`h-2 ${i % 2 === 0 ? 'bg-amber/40' : 'bg-cyan/15'} rounded-[1px]`} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-[48%] left-[19%] h-[65px] w-[12%] bg-[#0a1a24] border border-cyan/10">
          <div className="grid grid-cols-3 gap-1 p-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-2 ${i === 1 ? 'bg-amber/40' : 'bg-cyan/15'} rounded-[1px]`} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-[48%] right-0 w-[18%] h-[120px] bg-[#0a1a24] border border-cyan/10">
          <div className="grid grid-cols-3 gap-1 p-1.5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`h-2 ${i % 2 === 0 ? 'bg-amber/40' : 'bg-cyan/15'} rounded-[1px]`} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-[48%] right-[19%] h-[75px] w-[10%] bg-[#0a1a24] border border-cyan/10">
          <div className="grid grid-cols-3 gap-1 p-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-2 ${i % 2 === 0 ? 'bg-amber/40' : 'bg-cyan/15'} rounded-[1px]`} />
            ))}
          </div>
        </div>

        {/* Horizon */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
          <div className="absolute left-1/2 top-0 bottom-0 w-1.5 -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,#ffcc00_0px,#ffcc00_30px,transparent_30px,transparent_60px)] opacity-70" />
        </div>

        {/* Sidewalks */}
        <div className="absolute bottom-0 left-0 w-[22%] h-[40%] bg-[#222] border-t-2 border-[#333]" />
        <div className="absolute bottom-0 right-0 w-[22%] h-[40%] bg-[#222] border-t-2 border-[#333]" />

        {/* Scanline */}
        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan to-transparent opacity-40 animate-scan" />
      </div>

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corners */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan/60" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan/60" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan/60" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan/60" />

        {/* Detection Boxes */}
        <div className="absolute top-[35%] left-[20%] w-[18%] h-[25%] border border-red rounded-sm">
          <div className="absolute -top-4 left-0 font-mono text-[9px] text-red bg-red-dim px-1.5 py-0.5 rounded-sm whitespace-nowrap">
            ⚠ VEHICLE 94%
          </div>
        </div>
        <div className="absolute top-[40%] right-[25%] w-[8%] h-[30%] border border-amber rounded-sm">
          <div className="absolute -top-4 left-0 font-mono text-[9px] text-amber bg-amber-dim px-1.5 py-0.5 rounded-sm whitespace-nowrap">
            PERSON 87%
          </div>
        </div>
        <div className="absolute top-[20%] right-[10%] w-[6%] h-[40%] border border-green rounded-sm">
          <div className="absolute -top-4 left-0 font-mono text-[9px] text-green bg-green-dim px-1.5 py-0.5 rounded-sm whitespace-nowrap">
            DOOR 71%
          </div>
        </div>

        {/* Alert */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-dim border border-red/50 rounded-full px-4 py-1.5 font-mono text-[11px] font-medium text-red tracking-wider flex items-center gap-2 animate-slide-in-up">
          <div className="w-2 h-2 rounded-full bg-red animate-blink" />
          VEHICLE APPROACHING LEFT — WAIT
        </div>

        {/* Navigation Arrow */}
        <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 text-3xl text-cyan animate-float">
          ▲
        </div>

        {/* Camera Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/90 to-transparent flex items-end px-4 pb-2 gap-4">
          <div className="font-mono text-[9px] text-white/50 flex items-center gap-1">
            <span className="text-red">●</span> LIVE
          </div>
          <div className="font-mono text-[9px] text-white/50">📷 30 FPS</div>
          <div className="hidden sm:block font-mono text-[9px] text-white/50">🧠 TFLite SSD</div>
          <div className="hidden md:block font-mono text-[9px] text-white/50">☁ Cloud Run</div>
          <div className="ml-auto font-mono text-[9px] text-white/50">12:47:33 PM</div>
        </div>
      </div>
    </div>
  );
}; 
