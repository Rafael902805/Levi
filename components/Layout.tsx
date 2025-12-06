import React from 'react';
import { User, ViewState, UserRole } from '../types';
import { StorageService } from '../services/storageService';

interface LayoutProps {
    children: React.ReactNode;
    currentUser: User;
    currentView: ViewState;
    onChangeView: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentUser, currentView, onChangeView }) => {
    const handleLogout = () => {
        StorageService.logout();
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex bg-slate-950 text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                        NEXUS
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Panel & Launcher System</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button 
                        onClick={() => onChangeView('DASHBOARD')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'DASHBOARD' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                    >
                        📊 Dashboard
                    </button>
                    
                    <button 
                        onClick={() => onChangeView('CLIENTS')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'CLIENTS' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                    >
                        👥 Clientes
                    </button>

                    {currentUser.role === UserRole.ADMIN && (
                        <>
                            <button 
                                onClick={() => onChangeView('RESELLERS')}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'RESELLERS' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                            >
                                👔 Revendas
                            </button>
                            <button 
                                onClick={() => onChangeView('APKS')}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'APKS' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                            >
                                📲 Gerenciar APKs
                            </button>
                        </>
                    )}

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <button 
                            onClick={() => onChangeView('LAUNCHER')}
                            className={`w-full text-left px-4 py-3 rounded-lg border border-primary-600 text-primary-400 hover:bg-primary-600 hover:text-white transition-all`}
                        >
                            🚀 Abrir Launcher
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                            {currentUser.username[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{currentUser.username}</p>
                            <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full text-xs text-red-400 hover:text-red-300 transition-colors text-left"
                    >
                        Sair do sistema
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
