import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storageService';
import { ApkItem } from '../types';

interface LauncherProps {
    onExit: () => void;
}

export const Launcher: React.FC<LauncherProps> = ({ onExit }) => {
    const [apps, setApps] = useState<ApkItem[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // "Oculta todos outros apks do sistema que não for via painel"
        // In the web simulation, we simply only render what is in the storage marked as visible.
        const allApps = StorageService.getApks();
        setApps(allApps.filter(a => a.isVisible));

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col overflow-hidden select-none">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900 z-0"></div>
            
            {/* Header / Info Bar */}
            <div className="relative z-10 flex justify-between items-start p-10">
                <div className="flex flex-col">
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                        NEXUS
                    </h1>
                    <span className="text-white/40 text-sm tracking-widest uppercase mt-1">Entertainment System</span>
                </div>
                
                <div className="flex flex-col items-end">
                    <div className="text-6xl font-thin tracking-tight font-sans">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-lg text-white/50 font-light uppercase tracking-wide">
                        {currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
            </div>

            {/* Main App Grid */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-12 overflow-y-auto">
                {apps.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 w-full max-w-7xl">
                        {apps.map((app) => (
                            <div 
                                key={app.id} 
                                className="group flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-2 outline-none focus:outline-none"
                                tabIndex={0}
                            >
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-slate-800 shadow-2xl relative overflow-hidden group-hover:shadow-blue-500/40 group-hover:ring-4 ring-blue-500/50 transition-all duration-300 cursor-pointer">
                                    <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    
                                    {/* Glass Overlay effect on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                        <span className="text-xs font-bold uppercase tracking-widest">Abrir</span>
                                    </div>
                                </div>
                                <div className="text-center group-hover:text-blue-300 transition-colors">
                                    <h3 className="font-bold text-lg md:text-xl truncate max-w-[160px]">{app.name}</h3>
                                </div>
                            </div>
                        ))}
                        
                        {/* Empty Slots for Visual Balance (optional mock feeling) */}
                        {Array.from({ length: Math.max(0, 5 - apps.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-2 border-dashed border-white/5 flex items-center justify-center opacity-20">
                                <span className="text-2xl text-white/50">+</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-white/30">
                        <p className="text-2xl">Nenhum aplicativo disponível.</p>
                        <p className="text-sm">Contate o suporte.</p>
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="relative z-10 p-6 flex justify-between items-center text-xs text-white/20 uppercase tracking-widest font-bold">
                <div className="flex gap-6">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div> Online</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Wi-Fi</span>
                </div>
                
                {/* Hidden Exit Button for Demo */}
                <button 
                    onClick={onExit} 
                    className="hover:text-white/60 transition-colors cursor-pointer"
                    title="Sair para Painel"
                >
                    ID: 884-212-001
                </button>
            </div>
        </div>
    );
};