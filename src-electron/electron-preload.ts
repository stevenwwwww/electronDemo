/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 */

import { contextBridge, ipcRenderer } from 'electron';

// 定义API接口
interface ElectronAPI {
  // 系统信息
  getSystemInfo: () => Promise<any>;
  
  // 应用版本信息
  getAppVersion: () => Promise<any>;
  
  // API调用
  apiCall: (params: { url: string; method?: string; data?: any }) => Promise<any>;
  
  // 打印机功能
  connectPrinter: (config: any) => Promise<any>;
  print: (data: { content: string; printer?: string }) => Promise<any>;
  
  // 文件对话框
  showOpenDialog: () => Promise<any>;
  showSaveDialog: () => Promise<any>;
  
  // 更新功能
  checkForUpdates: () => Promise<any>;
  downloadUpdate: () => Promise<any>;
  installUpdate: () => Promise<void>;
  
  // 更新事件监听
  onUpdateChecking: (callback: () => void) => void;
  onUpdateAvailable: (callback: (info: any) => void) => void;
  onUpdateNotAvailable: (callback: () => void) => void;
  onUpdateError: (callback: (error: string) => void) => void;
  onUpdateDownloadProgress: (callback: (progress: any) => void) => void;
  onUpdateDownloaded: (callback: (info: any) => void) => void;
  
  // 移除事件监听器
  removeAllListeners: (channel: string) => void;
  
  // 文件操作
  writeFile: (filename: string, content: string) => Promise<{ success: boolean; path: string; message: string }>;
  readFile: (filename: string) => Promise<{ success: boolean; path: string; content: string; message: string }>;
}

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 系统信息
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // 应用版本信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // API调用
  apiCall: (params: { url: string; method?: string; data?: any }) => 
    ipcRenderer.invoke('api-call', params),
  
  // 打印机功能
  connectPrinter: (config: any) => 
    ipcRenderer.invoke('connect-printer', config),
  print: (data: { content: string; printer?: string }) => 
    ipcRenderer.invoke('print', data),
  
  // 文件对话框
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  
  // 更新功能
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  // 更新事件监听
  onUpdateChecking: (callback: () => void) => {
    ipcRenderer.on('update-checking', callback);
  },
  onUpdateAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on('update-available', (_event, info) => callback(info));
  },
  onUpdateNotAvailable: (callback: () => void) => {
    ipcRenderer.on('update-not-available', callback);
  },
  onUpdateError: (callback: (error: string) => void) => {
    ipcRenderer.on('update-error', (_event, error) => callback(error));
  },
  onUpdateDownloadProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('update-download-progress', (_event, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback: (info: any) => void) => {
    ipcRenderer.on('update-downloaded', (_event, info) => callback(info));
  },
  
  // 移除事件监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
  
  // 文件操作
  writeFile: (filename: string, content: string) => {
    return ipcRenderer.invoke('write-file', filename, content);
  },
  readFile: (filename: string) => {
    return ipcRenderer.invoke('read-file', filename);
  }
} as ElectronAPI);

// 类型声明，供TypeScript使用
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
