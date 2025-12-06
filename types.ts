export enum UserRole {
    ADMIN = 'ADMIN',
    RESELLER = 'RESELLER',
    CLIENT = 'CLIENT'
}

export interface User {
    id: string;
    username: string;
    role: UserRole;
    resellerId?: string; // If user is a client, who owns them
    credits?: number; // For resellers
    expirationDate?: string; // ISO date string
    phoneNumber?: string;
    notes?: string;
}

export interface ApkItem {
    id: string;
    name: string;
    version: string;
    packageName: string;
    iconUrl: string;
    downloadUrl: string;
    uploadedAt: string;
    isVisible: boolean;
    description?: string;
}

export interface SystemConfig {
    launcherVersion: string;
    launcherUrl: string;
    lastUpdate: string;
    fileName: string;
}

export interface NotificationTemplate {
    id: string;
    name: string;
    content: string;
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'CLIENTS' | 'RESELLERS' | 'APKS' | 'LAUNCHER';