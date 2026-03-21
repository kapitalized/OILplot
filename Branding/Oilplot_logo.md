import React, { useState } from 'react';
import { 
  BarChart3, 
  Map as MapIcon, 
  Activity, 
  Database, 
  MessageSquare, 
  Zap,
  Factory,
  Globe,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  Wind,
  Anchor,
  PenTool
} from 'lucide-react';

const COLORS = {
  bgCream: '#F2EBD4',      // Cream Background
  btnBlue: '#A5C2D0',      // Pale Blue
  cardDark: '#3E322D',     // Dark Brown Cards
  whiteOffset: '#FFFFFF',  // White Offset Shadow
  yellow: '#F8C43F',       // Hot Highlight 1
  amber: '#F2A83A',        // Hot Highlight 2
  burnt: '#F27D3B',        // Hot Highlight 3
  coral: '#F14A42',        // Hot Highlight 4
};

const OilplotLogo = ({ variant = "dark", showTagline = true, className = "w-full h-auto" }) => {
  const mainColor = variant === "crude" ? COLORS.bgCream : COLORS.cardDark;
  const barrelBody = variant === "crude" ? "rgba(255,255,255,0.05)" : "rgba(62, 50, 45, 0.05)";

  return (
    <svg viewBox="0 0 460 140" className={className} xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(15, 10)">
        
        {/* ISOMETRIC OIL BARREL ICON */}
        <g transform="translate(10, 5)">
          {/* Barrel Shadow/Side Depth */}
          <path 
            d="M20 30 L20 80 C20 95, 80 95, 80 80 L80 30" 
            fill={barrelBody} 
            stroke={mainColor} 
            strokeWidth="3" 
          />
          
          {/* Top Surface (The Lid) */}
          <ellipse cx="50" cy="30" rx="30" ry="12" fill={variant === "crude" ? COLORS.cardDark : "white"} stroke={mainColor} strokeWidth="3" />
          <circle cx="58" cy="26" r="3" fill={mainColor} opacity="0.4" />

          {/* Industrial Ribs */}
          <g fill="none" stroke={mainColor} strokeWidth="2" opacity="0.3">
            <path d="M20 48 C20 60, 80 60, 80 48" />
            <path d="M20 65 C20 77, 80 77, 80 65" />
          </g>
        </g>

        {/* INSTITUTIONAL UNDERLINE */}
        <rect x="0" y="105" width="120" height="8" fill={mainColor} />
        
        {/* BRAND TYPOGRAPHY (Helena/Archivo Style) */}
        <text 
          x="140" 
          y="75" 
          fontFamily="'Archivo Black', sans-serif" 
          fontSize="58" 
          fontWeight="900" 
          fill={mainColor}
          letterSpacing="-3"
          style={{ textTransform: 'uppercase', fontStretch: 'extra-expanded' }}
        >
          OIL<tspan fill={COLORS.amber}>PLOT</tspan>
        </text>
        
        {/* TAGLINE (Space Grotesk Style) */}
        {showTagline && (
          <text 
            x="144" 
            y="98" 
            fontFamily="'Space Grotesk', sans-serif" 
            fontSize="11" 
            fontWeight="700" 
            fill={mainColor} 
            letterSpacing="5"
            style={{ textTransform: 'uppercase', opacity: 0.7 }}
          >
            Open Energy Intelligence
          </text>
        )}
      </g>
    </svg>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('stories');

  const stories = [
    { title: "THE VENEZUELA PIVOT", summary: "Texas refineries shift to Canadian Heavy as exports from Caracas drop 14%.", tag: "FLOW", color: COLORS.amber, variant: 'dark' },
    { title: "SULFUR SENSITIVITY", summary: "Sweet crude premium hits 5-year high against sour grades.", tag: "CHEMISTRY", color: COLORS.yellow, variant: 'dark' },
    { title: "THE SINGAPORE JAM", summary: "Visualizing 42 tankers anchored off the coast of Jurong Island.", tag: "SHIPPING", color: COLORS.coral, variant: 'blue' },
    { title: "DISTILLERY DYNAMICS", summary: "Natural gas inputs driving 12% increase in neutral spirit costs.", tag: "REFINING", color: COLORS.burnt, variant: 'dark' },
    { title: "BRENT VOLATILITY", summary: "Seismic price shifts mapped against OPEC production caps.", tag: "MARKET", color: COLORS.amber, variant: 'blue' },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: COLORS.bgCream, color: COLORS.cardDark }}>
      
      {/* 1. HEADER INTEGRATION */}
      <nav className="border-b-4 border-cardDark px-8 py-4 flex justify-between items-center sticky top-0 z-50 bg-[#F2EBD4]">
        <div className="flex items-center gap-4">
          <div className="w-[280px]">
            {/* Tagline is hidden here for a cleaner nav look */}
            <OilplotLogo variant="dark" showTagline={false} className="w-full" />
          </div>
        </div>
        
        <div className="hidden md:flex gap-8 font-bold uppercase text-[10px] tracking-[0.25em]">
          {['stories', 'explorer', 'reserves', 'terminal'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-1 border-b-4 ${activeTab === tab ? 'border-coral' : 'border-transparent opacity-40'}`}>{tab}</button>
          ))}
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-coral text-white font-bold uppercase text-xs border-2 border-cardDark shadow-[4px_4px_0px_#3E322D]">
            <Zap size={16} fill="white" /> Analyst AI
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <h2 className="text-7xl font-black uppercase italic leading-[0.8] tracking-tighter">Automated <br />Visual Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {stories.map((story, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 translate-x-3 translate-y-3 border-2 border-cardDark z-0" style={{ backgroundColor: COLORS.whiteOffset }}></div>
                <div className="relative z-10 p-8 border-2 border-cardDark h-full flex flex-col justify-between" style={{ backgroundColor: story.variant === 'blue' ? COLORS.btnBlue : COLORS.cardDark, color: story.variant === 'blue' ? COLORS.cardDark : COLORS.bgCream }}>
                  <h3 className="text-3xl font-black uppercase italic leading-none mb-4">{story.title}</h3>
                  <p className="text-sm opacity-60">{story.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 2. FOOTER INTEGRATION */}
      <footer className="py-24 px-8 border-t-4 border-cardDark mt-20" style={{ backgroundColor: COLORS.bgCream }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="w-[200px] opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
              <OilplotLogo variant="dark" showTagline={true} />
            </div>
            <p className="text-xs font-bold leading-relaxed opacity-60 uppercase">
              The premier open-source repository for global energy intelligence. Visualizing the invisible flows of oil and distillery assets.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Navigation</h4>
            {['Methodology', 'API Documentation', 'Source Log'].map(l => (
              <button key={l} className="text-left text-[10px] font-black uppercase hover:text-coral transition-colors">{l}</button>
            ))}
          </div>

          <div className="flex flex-col items-end gap-6">
             <button className="flex items-center gap-3 px-8 py-4 bg-btnBlue border-2 border-cardDark font-black uppercase italic text-sm shadow-[6px_6px_0px_#3E322D] hover:shadow-none transition-all">
                <PenTool size={18} /> Create Your Own Visuals
             </button>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@300;400;700&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; }
      `}} />
    </div>
  );
};

export default App;
