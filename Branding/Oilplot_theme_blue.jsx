import React, { useState } from 'react';
import { 
  BarChart3, 
  Map as MapIcon, 
  Activity, 
  Database, 
  MessageSquare, 
  ChevronRight,
  Zap,
  Droplets,
  Factory,
  Globe,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';

const COLORS = {
  bgBlue: '#A5C2D0',       // Pale Blue Background
  cardCream: '#F2EBD4',    // Pale Yellow/Cream Cards
  inkBrown: '#3E322D',     // Dark Brown Ink/Text
  yellow: '#F8C43F',       // Highlights - Level 1
  amber: '#F2A83A',        // Highlights - Level 2
  burnt: '#F27D3B',        // Highlights - Level 3
  coral: '#F14A42',        // Alerts - Level 4
};

const App = () => {
  const [activeTab, setActiveTab] = useState('stories');

  const stories = [
    { title: "THE VENEZUELA PIVOT", summary: "Texas refineries shift to Canadian Heavy as exports from Caracas drop 14%.", tag: "FLOW", color: COLORS.amber },
    { title: "SULFUR SENSITIVITY", summary: "Sweet crude premium hits 5-year high against sour grades.", tag: "CHEMISTRY", color: COLORS.yellow },
    { title: "THE SINGAPORE JAM", summary: "Visualizing 42 tankers anchored off the coast of Jurong Island.", tag: "SHIPPING", color: COLORS.coral },
    { title: "DISTILLERY DYNAMICS", summary: "Natural gas inputs driving 12% increase in neutral spirit costs.", tag: "REFINING", color: COLORS.burnt },
    { title: "BRENT VOLATILITY", summary: "Seismic price shifts mapped against OPEC production caps.", tag: "MARKET", color: COLORS.amber },
    { title: "NIGERIAN LIGHT", summary: "Forcados blend seeing increased demand from European diesel processors.", tag: "FLOW", color: COLORS.yellow }
  ];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: COLORS.bgBlue, color: COLORS.inkBrown }}>
      
      {/* Top Navigation */}
      <nav className="border-b-4 border-inkBrown bg-inkBrown text-cardCream px-8 py-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center border-2 border-cardCream" style={{ backgroundColor: COLORS.yellow }}>
            <Droplets size={24} color={COLORS.inkBrown} fill={COLORS.inkBrown} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">OILPLOT</h1>
        </div>
        
        <div className="hidden md:flex gap-10 font-bold uppercase text-xs tracking-[0.2em]">
          {['stories', 'explorer', 'reserves', 'terminal'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 transition-all ${activeTab === tab ? 'border-b-4 border-yellow' : 'opacity-60 hover:opacity-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-coral text-white font-bold uppercase text-xs shadow-[4px_4px_0px_#3E322D]">
          <Zap size={16} fill="white" /> Analyst AI
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Story Engine / Main Visuals */}
        <div className="lg:col-span-8 space-y-12">
          
          <header className="space-y-2">
            <div className="inline-block px-3 py-1 bg-inkBrown text-cardCream text-[10px] font-bold uppercase tracking-widest mb-4">
              Daily Intelligence Report // 19.03.2026
            </div>
            <h2 className="text-6xl font-black uppercase italic leading-[0.85] tracking-tighter">
              Automated <br />Insights Gallery
            </h2>
          </header>

          {/* Pudding-style High Density Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story, i) => (
              <div 
                key={i} 
                className="group p-8 border-4 border-inkBrown shadow-[8px_8px_0px_#3E322D] flex flex-col justify-between min-h-[300px] transition-transform hover:-translate-y-1"
                style={{ backgroundColor: COLORS.cardCream }}
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-bold border-2 border-inkBrown px-2 py-0.5" style={{ backgroundColor: story.color }}>
                      {story.tag}
                    </span>
                    <ArrowRight size={20} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic leading-none mb-4">{story.title}</h3>
                  <p className="text-sm font-medium leading-relaxed opacity-80">{story.summary}</p>
                </div>
                
                {/* Simplified "Infographic" Component */}
                <div className="mt-8 pt-6 border-t-2 border-inkBrown/10">
                   <div className="flex gap-1 h-8 items-end">
                      {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4].map((h, j) => (
                        <div key={j} className="flex-1 bg-inkBrown opacity-20" style={{ height: `${h * 100}%` }}></div>
                      ))}
                      <div className="flex-1" style={{ height: '95%', backgroundColor: story.color }}></div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sticky Controls & Maps */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Refinery Explorer Card */}
          <div className="p-6 border-4 border-inkBrown shadow-[8px_8px_0px_#3E322D]" style={{ backgroundColor: COLORS.cardCream }}>
            <h4 className="text-xl font-black uppercase italic mb-4 flex items-center gap-2">
              <Factory size={20} /> Refinery Explorer
            </h4>
            <div className="aspect-square bg-blue-200/50 border-2 border-inkBrown relative mb-6 overflow-hidden">
               {/* Mock Map Background */}
               <Globe className="absolute inset-0 m-auto opacity-10 text-inkBrown" size={200} />
               <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-coral border-2 border-inkBrown rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
               <div className="absolute bottom-2 left-2 right-2 bg-inkBrown text-cardCream p-2 text-[10px] font-bold uppercase tracking-tighter">
                  Location: Port Arthur, TX
               </div>
            </div>
            
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase opacity-60 mb-1">
                    <span>Input: Heavy Sour</span>
                    <span>82%</span>
                  </div>
                  <div className="h-2 w-full bg-inkBrown/10">
                    <div className="h-full bg-amber" style={{ width: '82%' }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase opacity-60 mb-1">
                    <span>Output: Diesel / Jet</span>
                    <span>64%</span>
                  </div>
                  <div className="h-2 w-full bg-inkBrown/10">
                    <div className="h-full bg-yellow" style={{ width: '64%' }}></div>
                  </div>
               </div>
            </div>
          </div>

          {/* AI Terminal Card */}
          <div className="p-6 border-4 border-inkBrown shadow-[8px_8px_0px_#3E322D] text-cardCream" style={{ backgroundColor: COLORS.inkBrown }}>
            <div className="flex items-center gap-2 mb-6 text-yellow">
              <MessageSquare size={20} />
              <h4 className="text-xl font-black uppercase italic tracking-tighter">AI Knowledge Base</h4>
            </div>
            <p className="text-xs leading-relaxed opacity-80 mb-6">
              "Analyzing global reserves. Current data suggests a 4% increase in offshore production from Guyana. Would you like a breakdown by grade?"
            </p>
            <div className="space-y-2">
               {['Compare API Gravity', 'Sanctioned Flows', 'Refinery Yields'].map(q => (
                 <button key={q} className="w-full text-left p-2 border border-cardCream/20 hover:bg-yellow hover:text-inkBrown transition-all text-[10px] font-bold uppercase">
                   {q}
                 </button>
               ))}
            </div>
            <input 
              type="text" 
              placeholder="Query Repository..." 
              className="w-full mt-6 bg-transparent border-b-2 border-yellow py-2 text-sm text-yellow placeholder:text-yellow/40 outline-none"
            />
          </div>

          {/* Spot Price Widget */}
          <div className="p-4 border-2 border-inkBrown font-bold" style={{ backgroundColor: COLORS.yellow }}>
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest opacity-60 mb-2">
               <span>Live Spot Prices</span>
               <Activity size={12} />
            </div>
            <div className="flex justify-between items-end">
               <div>
                  <span className="text-xs opacity-60 uppercase block">Brent Crude</span>
                  <span className="text-2xl font-black italic leading-none">$82.40</span>
               </div>
               <div className="text-right">
                  <span className="text-xs opacity-60 uppercase block">WTI Cushing</span>
                  <span className="text-2xl font-black italic leading-none">$78.15</span>
               </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="py-20 px-8 border-t-4 border-inkBrown mt-20 text-center bg-cardCream">
        <h2 className="text-8xl font-black uppercase italic opacity-10 tracking-tighter mb-4">OILPLOT</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40">
          Energy Transparency // Open Data Repository // © 2026
        </p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Space Grotesk', sans-serif;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
};

export default App;