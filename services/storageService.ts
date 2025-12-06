import { User, ApkItem, UserRole, SystemConfig } from '../types';

const STORAGE_KEYS = {
    USERS: 'nexus_users',
    APKS: 'nexus_apks',
    CURRENT_USER: 'nexus_current_user',
    SYSTEM_CONFIG: 'nexus_system_config'
};

// Initial Mock Data
const INITIAL_USERS: User[] = [
    { id: '1', username: 'admin', role: UserRole.ADMIN, expirationDate: '2099-12-31', phoneNumber: '5511999999999' },
    { id: '2', username: 'revenda1', role: UserRole.RESELLER, credits: 50, expirationDate: '2024-12-31', phoneNumber: '5511888888888' },
];

const INITIAL_APKS: ApkItem[] = [
    { 
        id: '1', 
        name: 'Nexus Player TV', 
        version: '2.0.1', 
        packageName: 'com.nexus.player', 
        iconUrl: 'https://picsum.photos/200', 
        downloadUrl: '#', 
        uploadedAt: new Date().toISOString(),
        isVisible: true,
        description: 'Player oficial para clientes Nexus.'
    },
    { 
        id: '2', 
        name: 'Cinema 4K', 
        version: '1.5.0', 
        packageName: 'com.cinema.fourk', 
        iconUrl: 'https://picsum.photos/201', 
        downloadUrl: '#', 
        uploadedAt: new Date().toISOString(),
        isVisible: true,
        description: 'Filmes e séries em alta definição.'
    }
];

const INITIAL_SYSTEM_CONFIG: SystemConfig = {
    launcherVersion: '1.0.0',
    launcherUrl: '#',
    lastUpdate: new Date().toISOString(),
    fileName: 'nexus_launcher_v1.apk'
};

export const StorageService = {
    getUsers: (): User[] => {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        if (!stored) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
            return INITIAL_USERS;
        }
        return JSON.parse(stored);
    },

    saveUser: (user: User) => {
        const users = StorageService.getUsers();
        const existingIndex = users.findIndex(u => u.id === user.id);
        if (existingIndex >= 0) {
            users[existingIndex] = user;
        } else {
            users.push(user);
        }
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    },

    deleteUser: (id: string) => {
        const users = StorageService.getUsers().filter(u => u.id !== id);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    },

    getApks: (): ApkItem[] => {
        const stored = localStorage.getItem(STORAGE_KEYS.APKS);
        if (!stored) {
            localStorage.setItem(STORAGE_KEYS.APKS, JSON.stringify(INITIAL_APKS));
            return INITIAL_APKS;
        }
        return JSON.parse(stored);
    },

    saveApk: (apk: ApkItem) => {
        const apks = StorageService.getApks();
        const existingIndex = apks.findIndex(a => a.id === apk.id);
        if (existingIndex >= 0) {
            apks[existingIndex] = apk;
        } else {
            apks.push(apk);
        }
        localStorage.setItem(STORAGE_KEYS.APKS, JSON.stringify(apks));
    },

    deleteApk: (id: string) => {
        const apks = StorageService.getApks().filter(a => a.id !== id);
        localStorage.setItem(STORAGE_KEYS.APKS, JSON.stringify(apks));
    },

    getSystemConfig: (): SystemConfig => {
        const stored = localStorage.getItem(STORAGE_KEYS.SYSTEM_CONFIG);
        if (!stored) {
            localStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, JSON.stringify(INITIAL_SYSTEM_CONFIG));
            return INITIAL_SYSTEM_CONFIG;
        }
        return JSON.parse(stored);
    },

    saveSystemConfig: (config: SystemConfig) => {
        localStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, JSON.stringify(config));
    },

    getCurrentUser: (): User | null => {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return stored ? JSON.parse(stored) : null;
    },

    login: (username: string): User | null => {
        const users = StorageService.getUsers();
        // Simple login simulation (no password for demo simplicity)
        const user = users.find(u => u.username === username);
        if (user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            return user;
        }
        return null;
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
};