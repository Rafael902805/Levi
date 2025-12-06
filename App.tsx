import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from './services/storageService';
import { GeminiService } from './services/geminiService';
import { User, ViewState, UserRole, ApkItem, SystemConfig } from './types';
import { Layout } from './components/Layout';
import { Launcher } from './views/Launcher';

// --- Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.698c1.005.572 1.913.846 3.037.844 3.169 0 5.767-2.586 5.767-5.766.001-3.187-2.564-5.769-5.998-5.765zm8.553 5.75c.01 4.708-3.804 8.529-8.527 8.533-1.63 0-3.162-.435-4.48-1.187l-4.787 1.258 1.285-4.664C2.96 14.482 2.513 12.923 2.515 11.23c.014-4.735 3.864-8.557 8.59-8.557 4.697 0 8.512 3.818 8.48 8.249z"/></svg>;
const XMarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const CloudArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>;

// --- Components ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl relative animate-[fadeIn_0.2s_ease-out]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XMarkIcon />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

function App() {
    // --- State ---
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [view, setView] = useState<ViewState>('LOGIN');
    const [loginInput, setLoginInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Data
    const [users, setUsers] = useState<User[]>([]);
    const [apks, setApks] = useState<ApkItem[]>([]);
    const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);

    // Modals
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isApkModalOpen, setIsApkModalOpen] = useState(false);
    const [isLauncherUploadModalOpen, setIsLauncherUploadModalOpen] = useState(false);
    
    // Form States
    const [editingUser, setEditingUser] = useState<Partial<User>>({});
    const [editingApk, setEditingApk] = useState<Partial<ApkItem>>({});
    
    // Upload States
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [newLauncherVersion, setNewLauncherVersion] = useState('');

    // --- Effects ---
    useEffect(() => {
        const user = StorageService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
            setView('DASHBOARD');
        }
        refreshData();
    }, []);

    const refreshData = () => {
        setUsers(StorageService.getUsers());
        setApks(StorageService.getApks());
        setSystemConfig(StorageService.getSystemConfig());
    };

    // --- Handlers: Auth ---
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            const user = StorageService.login(loginInput);
            if (user) {
                setCurrentUser(user);
                setView('DASHBOARD');
            } else {
                alert('Usuário não encontrado. (Tente: admin)');
            }
            setLoading(false);
        }, 600);
    };

    // --- Handlers: Users ---
    const openUserModal = (role: UserRole, userToEdit?: User) => {
        if (userToEdit) {
            setEditingUser({ ...userToEdit });
        } else {
            // Default 30 days expiration
            const nextMonth = new Date();
            nextMonth.setDate(nextMonth.getDate() + 30);
            
            setEditingUser({
                role: role,
                resellerId: currentUser?.role === UserRole.RESELLER ? currentUser.id : undefined,
                expirationDate: nextMonth.toISOString().split('T')[0],
                credits: role === UserRole.RESELLER ? 0 : undefined,
                username: '',
                phoneNumber: ''
            });
        }
        setIsUserModalOpen(true);
    };

    const saveUser = () => {
        if (!editingUser.username || !editingUser.expirationDate) {
            alert("Preencha nome e data de expiração.");
            return;
        }

        const userToSave: User = {
            id: editingUser.id || Date.now().toString(),
            username: editingUser.username,
            role: editingUser.role as UserRole,
            expirationDate: editingUser.expirationDate,
            phoneNumber: editingUser.phoneNumber || '',
            resellerId: editingUser.resellerId,
            credits: editingUser.credits
        };

        StorageService.saveUser(userToSave);
        setIsUserModalOpen(false);
        refreshData();
    };

    const deleteUser = (id: string) => {
        if(confirm('Tem certeza que deseja remover este usuário?')) {
            StorageService.deleteUser(id);
            refreshData();
        }
    };

    // --- Handlers: APKs ---
    const openApkModal = (apk?: ApkItem) => {
        if (apk) {
            setEditingApk({ ...apk });
        } else {
            setEditingApk({
                name: '',
                packageName: '',
                version: '1.0.0',
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/3587/3587440.png',
                downloadUrl: '',
                isVisible: true,
                description: ''
            });
        }
        setIsApkModalOpen(true);
    };

    const saveApk = async () => {
        if (!editingApk.name || !editingApk.downloadUrl) {
            alert("Preencha nome e URL de download.");
            return;
        }

        setLoading(true);
        let finalDescription = editingApk.description;
        
        // Use AI to generate description if empty
        if (!finalDescription) {
            finalDescription = await GeminiService.analyzeAppDescription(editingApk.name);
        }

        const apkToSave: ApkItem = {
            id: editingApk.id || Date.now().toString(),
            name: editingApk.name,
            version: editingApk.version || '1.0.0',
            packageName: editingApk.packageName || `com.nexus.${editingApk.name.toLowerCase().replace(/\s/g, '')}`,
            iconUrl: editingApk.iconUrl || '',
            downloadUrl: editingApk.downloadUrl,
            uploadedAt: editingApk.uploadedAt || new Date().toISOString(),
            isVisible: editingApk.isVisible ?? true,
            description: finalDescription
        };

        StorageService.saveApk(apkToSave);
        setLoading(false);
        setIsApkModalOpen(false);
        refreshData();
    };

    // --- Handlers: System Launcher Upload ---
    const handleLauncherUpload = () => {
        if (!uploadFile || !newLauncherVersion) {
            alert("Selecione um arquivo APK e defina a versão.");
            return;
        }

        // Simulate Upload Process
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);

        setTimeout(() => {
            // Save System Config
            const newConfig: SystemConfig = {
                launcherVersion: newLauncherVersion,
                launcherUrl: `https://nexus-cdn.com/builds/${uploadFile.name}`, // Simulated URL
                lastUpdate: new Date().toISOString(),
                fileName: uploadFile.name
            };
            StorageService.saveSystemConfig(newConfig);
            
            clearInterval(interval);
            setUploadProgress(0);
            setUploadFile(null);
            setNewLauncherVersion('');
            setIsLauncherUploadModalOpen(false);
            refreshData();
            alert("Launcher atualizado e sincronizado com o sistema!");
        }, 3500);
    };

    // --- Handlers: WhatsApp ---
    const handleGenerateWhatsApp = async (user: User) => {
        if (!user.phoneNumber || !user.expirationDate) {
            alert('Configure um telefone e data de expiração para este usuário.');
            return;
        }

        const today = new Date();
        const exp = new Date(user.expirationDate);
        const daysLeft = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        const paymentLink = "pix.exemplo.com";

        setLoading(true);
        const message = await GeminiService.generateExpirationMessage(user.username, daysLeft, paymentLink);
        setLoading(false);

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/${user.phoneNumber}?text=${encodedMsg}`, '_blank');
    };

    // --- Views ---
    
    if (view === 'LAUNCHER') {
        return <Launcher onExit={() => setView('DASHBOARD')} />;
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">NEXUS</h1>
                        <p className="text-slate-400 text-sm">Painel Administrativo & Launcher</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Usuário</label>
                            <input 
                                type="text" 
                                value={loginInput}
                                onChange={e => setLoginInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-700"
                                placeholder="Digite seu usuário..."
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center"
                        >
                            {loading ? 'Verificando...' : 'ACESSAR PAINEL'}
                        </button>
                    </form>
                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-600">Sistema seguro v2.0</p>
                    </div>
                </div>
            </div>
        );
    }

    // Filter Logic for Alerts
    const expiringUsers = users.filter(u => {
        if (!u.expirationDate) return false;
        if (currentUser.role === UserRole.RESELLER && u.resellerId !== currentUser.id) return false;
        
        const today = new Date();
        const exp = new Date(u.expirationDate);
        const diffTime = exp.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 5 && diffDays >= -5; // Expiring within 5 days or expired up to 5 days ago
    });

    return (
        <Layout currentUser={currentUser} currentView={view} onChangeView={setView}>
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-white font-medium">Processando com AI...</div>
                    </div>
                </div>
            )}

            {/* MODAL: Upload Launcher */}
            <Modal isOpen={isLauncherUploadModalOpen} onClose={() => setIsLauncherUploadModalOpen(false)} title="Upload de Launcher (Sistema)">
                <div className="space-y-6">
                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg">
                        <p className="text-sm text-blue-300">Este upload irá atualizar o APK principal do Launcher para todos os clientes.</p>
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 ? (
                        <div className="space-y-2">
                             <div className="flex justify-between text-xs text-slate-400">
                                <span>Enviando...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <>
                             <div>
                                <label className="block text-xs text-slate-400 mb-1">Arquivo APK</label>
                                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-slate-800/50 hover:border-blue-500 transition-all cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        accept=".apk"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    />
                                    <CloudArrowUpIcon />
                                    <span className="mt-2 text-sm text-slate-400">{uploadFile ? uploadFile.name : "Clique para selecionar o APK"}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Nova Versão</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                    placeholder="ex: 2.1.0"
                                    value={newLauncherVersion}
                                    onChange={e => setNewLauncherVersion(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleLauncherUpload}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg mt-2 transition-colors flex items-center justify-center gap-2"
                            >
                                <CloudArrowUpIcon /> Iniciar Upload e Sincronizar
                            </button>
                        </>
                    )}
                </div>
            </Modal>

            {/* MODAL: User (Client/Reseller) */}
            <Modal 
                isOpen={isUserModalOpen} 
                onClose={() => setIsUserModalOpen(false)} 
                title={editingUser.role === UserRole.RESELLER ? "Dados da Revenda" : "Dados do Cliente"}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Nome / Usuário</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                            value={editingUser.username || ''}
                            onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Telefone (WhatsApp)</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                            placeholder="5511999999999"
                            value={editingUser.phoneNumber || ''}
                            onChange={e => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Data de Expiração</label>
                        <input 
                            type="date" 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                            value={editingUser.expirationDate || ''}
                            onChange={e => setEditingUser({...editingUser, expirationDate: e.target.value})}
                        />
                    </div>
                    {editingUser.role === UserRole.RESELLER && (
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Créditos</label>
                            <input 
                                type="number" 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                value={editingUser.credits || 0}
                                onChange={e => setEditingUser({...editingUser, credits: parseInt(e.target.value)})}
                            />
                        </div>
                    )}
                    <button 
                        onClick={saveUser}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors"
                    >
                        Salvar Registro
                    </button>
                </div>
            </Modal>

            {/* MODAL: APK */}
            <Modal isOpen={isApkModalOpen} onClose={() => setIsApkModalOpen(false)} title="Gerenciar Aplicativo">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Nome do App</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                            value={editingApk.name || ''}
                            onChange={e => setEditingApk({...editingApk, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Versão</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                value={editingApk.version || ''}
                                onChange={e => setEditingApk({...editingApk, version: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Package Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                placeholder="com.exemplo.app"
                                value={editingApk.packageName || ''}
                                onChange={e => setEditingApk({...editingApk, packageName: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Link de Download (Direto)</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                            placeholder="https://..."
                            value={editingApk.downloadUrl || ''}
                            onChange={e => setEditingApk({...editingApk, downloadUrl: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Ícone URL</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                            value={editingApk.iconUrl || ''}
                            onChange={e => setEditingApk({...editingApk, iconUrl: e.target.value})}
                        />
                    </div>
                    <div>
                         <label className="block text-xs text-slate-400 mb-1">Descrição (Opcional - AI gera se vazio)</label>
                         <textarea 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none h-20 resize-none"
                            value={editingApk.description || ''}
                            onChange={e => setEditingApk({...editingApk, description: e.target.value})}
                         />
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="vis"
                            checked={editingApk.isVisible ?? true}
                            onChange={e => setEditingApk({...editingApk, isVisible: e.target.checked})}
                        />
                        <label htmlFor="vis" className="text-sm text-slate-300">Visível no Launcher</label>
                    </div>
                    <button 
                        onClick={saveApk}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-2 transition-colors"
                    >
                        Salvar Aplicativo
                    </button>
                </div>
            </Modal>

            {/* DASHBOARD VIEW */}
            {view === 'DASHBOARD' && (
                <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Painel de Controle</h2>
                            <span className="text-sm text-slate-500">Bem-vindo, {currentUser.username}</span>
                        </div>
                        <div className="text-right">
                             <span className="text-xs text-slate-500 uppercase tracking-wider block">Versão do Sistema</span>
                             <span className="text-blue-400 font-mono font-bold">{systemConfig?.launcherVersion || 'v1.0'}</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            </div>
                            <p className="text-slate-500 text-sm font-medium mb-1">Meus Clientes</p>
                            <p className="text-4xl font-bold text-white">
                                {users.filter(u => u.role === UserRole.CLIENT && (currentUser.role === UserRole.ADMIN || u.resellerId === currentUser.id)).length}
                            </p>
                        </div>

                        {currentUser.role === UserRole.ADMIN && (
                            <div className="bg-gradient-to-br from-slate-900 to-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <svg className="w-24 h-24 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
                                </div>
                                <p className="text-slate-500 text-sm font-medium mb-1">Revendas</p>
                                <p className="text-4xl font-bold text-white">
                                    {users.filter(u => u.role === UserRole.RESELLER).length}
                                </p>
                            </div>
                        )}

                        <div className="bg-gradient-to-br from-slate-900 to-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-24 h-24 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>
                            </div>
                            <p className="text-slate-500 text-sm font-medium mb-1">Apps Ativos</p>
                            <p className="text-4xl font-bold text-white">
                                {apks.filter(a => a.isVisible).length}
                            </p>
                        </div>
                    </div>

                    {/* Expiration Alert System */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-red-900/20 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-500/20 p-2 rounded-lg text-red-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Alertas de Vencimento</h3>
                                    <p className="text-xs text-slate-400">Clientes vencendo em menos de 5 dias</p>
                                </div>
                            </div>
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">{expiringUsers.length}</span>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto">
                            {expiringUsers.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead className="text-slate-500 bg-slate-950/50 sticky top-0">
                                        <tr>
                                            <th className="p-4 font-medium">Cliente</th>
                                            <th className="p-4 font-medium">Expira em</th>
                                            <th className="p-4 font-medium text-right">Ação Automática</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {expiringUsers.map(user => {
                                            const today = new Date();
                                            const exp = new Date(user.expirationDate!);
                                            const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
                                            
                                            return (
                                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="p-4">
                                                        <p className="font-bold text-white">{user.username}</p>
                                                        <p className="text-xs text-slate-500">{user.phoneNumber || 'Sem telefone'}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${diffDays < 0 ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                                                            {diffDays < 0 ? 'VENCIDO' : `${diffDays} Dias`}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button 
                                                            onClick={() => handleGenerateWhatsApp(user)}
                                                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-lg hover:shadow-green-500/20"
                                                        >
                                                            <WhatsAppIcon /> Enviar Aviso
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <p>Nenhum vencimento próximo.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CLIENTS VIEW */}
            {view === 'CLIENTS' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Gerenciar Clientes</h2>
                            <p className="text-slate-400 text-xs mt-1">Total: {users.filter(u => u.role === UserRole.CLIENT && (currentUser.role === UserRole.ADMIN || u.resellerId === currentUser.id)).length}</p>
                        </div>
                        <button onClick={() => openUserModal(UserRole.CLIENT)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-blue-500/20 transition-all">
                            <PlusIcon /> Adicionar Cliente
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {users
                            .filter(u => u.role === UserRole.CLIENT && (currentUser.role === UserRole.ADMIN || u.resellerId === currentUser.id))
                            .map(client => {
                                const isExpired = new Date(client.expirationDate!) < new Date();
                                return (
                                    <div key={client.id} className={`bg-slate-900 border ${isExpired ? 'border-red-900/50' : 'border-slate-800'} rounded-xl p-5 hover:border-blue-500/30 transition-all group`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">
                                                    {client.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{client.username}</h3>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        {client.phoneNumber ? (
                                                            <>📱 {client.phoneNumber}</>
                                                        ) : (
                                                            <span className="text-slate-600">Sem telefone</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isExpired ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                                {isExpired ? 'Inativo' : 'Ativo'}
                                            </span>
                                        </div>
                                        
                                        <div className="bg-slate-950/50 rounded-lg p-3 text-sm space-y-2 mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Vencimento</span>
                                                <span className={`font-mono ${isExpired ? 'text-red-400' : 'text-slate-200'}`}>{client.expirationDate}</span>
                                            </div>
                                            {currentUser.role === UserRole.ADMIN && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Revendedor</span>
                                                    <span className="text-slate-400">
                                                        {users.find(u => u.id === client.resellerId)?.username || 'Admin'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                                            <button onClick={() => handleGenerateWhatsApp(client)} className="flex-1 bg-green-600/10 hover:bg-green-600/20 text-green-500 py-2 rounded text-xs font-medium transition-colors flex justify-center items-center gap-2">
                                                <WhatsAppIcon /> Cobrar
                                            </button>
                                            <button onClick={() => openUserModal(UserRole.CLIENT, client)} className="p-2 bg-slate-800 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 rounded transition-colors">
                                                <PencilIcon />
                                            </button>
                                            <button onClick={() => deleteUser(client.id)} className="p-2 bg-slate-800 hover:bg-red-600/20 text-slate-400 hover:text-red-400 rounded transition-colors">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* RESELLERS VIEW (Admin Only) */}
            {view === 'RESELLERS' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                         <div>
                            <h2 className="text-2xl font-bold text-white">Gestão de Revendas</h2>
                            <p className="text-slate-400 text-xs mt-1">Parceiros comerciais</p>
                        </div>
                        <button onClick={() => openUserModal(UserRole.RESELLER)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-purple-500/20 transition-all">
                            <PlusIcon /> Adicionar Revenda
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.filter(u => u.role === UserRole.RESELLER).map(reseller => (
                            <div key={reseller.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group hover:border-purple-500/30 transition-all">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xl border border-purple-500/20">
                                        {reseller.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{reseller.username}</h3>
                                        <p className="text-xs text-slate-500">Expira em: <span className="text-slate-300">{reseller.expirationDate}</span></p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-slate-950 p-3 rounded-lg text-center border border-slate-800">
                                        <p className="text-xs text-slate-500 uppercase">Créditos</p>
                                        <p className="text-xl font-bold text-white">{reseller.credits || 0}</p>
                                    </div>
                                    <div className="bg-slate-950 p-3 rounded-lg text-center border border-slate-800">
                                        <p className="text-xs text-slate-500 uppercase">Clientes</p>
                                        <p className="text-xl font-bold text-white">{users.filter(u => u.resellerId === reseller.id).length}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                     <button onClick={() => openUserModal(UserRole.RESELLER, reseller)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm transition-colors">
                                        Editar
                                    </button>
                                     <button onClick={() => deleteUser(reseller.id)} className="px-3 bg-slate-800 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* APKS VIEW */}
            {view === 'APKS' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                     {/* System Launcher Section */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-900 border border-slate-700 p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-48 h-48"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93C7.06 19.43 4 16.07 4 12zm13.89 5.4c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.05-.81 3.88-2.11 5.4z"/></svg>
                        </div>
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">SISTEMA</span>
                                    Launcher Oficial
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Gerencie a versão principal instalada nos dispositivos.</p>
                                <div className="flex gap-6 mt-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Versão Atual</p>
                                        <p className="text-lg font-mono text-white">{systemConfig?.launcherVersion || '1.0.0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Arquivo</p>
                                        <p className="text-lg font-mono text-white truncate max-w-[200px]">{systemConfig?.fileName || 'nexus_base.apk'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Último Update</p>
                                        <p className="text-lg font-mono text-white">
                                            {systemConfig?.lastUpdate ? new Date(systemConfig.lastUpdate).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsLauncherUploadModalOpen(true)}
                                className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                            >
                                <CloudArrowUpIcon /> Atualizar Launcher
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800 mt-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Loja de Aplicativos</h2>
                            <p className="text-slate-400 text-xs mt-1">Gerencie o conteúdo visível no Launcher</p>
                        </div>
                        <button onClick={() => openApkModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-blue-500/20 transition-all">
                            <PlusIcon /> Adicionar App (Externo)
                        </button>
                    </div>

                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-4">
                        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-blue-200 font-bold text-sm">Modo Kiosk Ativo</h4>
                            <p className="text-sm text-blue-300/70 mt-1">O Launcher ocultará automaticamente qualquer aplicativo do sistema Android que não esteja listado e marcado como "Visível" nesta lista.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {apks.map(apk => (
                            <div key={apk.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:bg-slate-800/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-800 rounded-xl overflow-hidden shadow-md">
                                        <img src={apk.iconUrl} alt={apk.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{apk.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>v{apk.version}</span>
                                            <span>•</span>
                                            <span className="truncate max-w-[150px]">{apk.packageName}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${apk.isVisible ? 'bg-green-500/10 text-green-500' : 'bg-slate-700 text-slate-400'}`}>
                                        {apk.isVisible ? 'Visível' : 'Oculto'}
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => openApkModal(apk)}
                                            className="p-2 hover:bg-blue-500/20 hover:text-blue-400 text-slate-400 rounded transition-colors"
                                        >
                                            <PencilIcon />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(confirm('Excluir app?')) {
                                                    StorageService.deleteApk(apk.id);
                                                    refreshData();
                                                }
                                            }}
                                            className="p-2 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded transition-colors"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default App;