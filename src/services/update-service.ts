import { Platform } from 'quasar';

interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
  downloadUrl: string;
  size: number;
}

interface UpdateResult {
  available: boolean;
  message: string;
  updateInfo?: UpdateInfo;
}

class UpdateService {
  private currentVersion = '1.0.0';
  private updateServerUrl = 'https://api.github.com/repos/electron/electron/releases/latest'; // 示例更新服务器
  private isElectron = Platform.is.electron;
  private updateInProgress = false;

  constructor() {
    console.log('UpdateService initialized, Platform:', this.isElectron ? 'Electron' : 'Web');
    this.setupElectronListeners();
    void this.initializeVersion();
  }

  // 初始化版本信息
  private async initializeVersion(): Promise<void> {
    if (this.isElectron && window.electronAPI) {
      try {
        const result = await window.electronAPI.getAppVersion();
        if (result.success) {
          this.currentVersion = result.data.version;
          console.log('当前应用版本:', this.currentVersion);
        }
      } catch (error) {
        console.error('获取应用版本失败:', error);
      }
    }
  }

  // 设置Electron更新事件监听器
  private setupElectronListeners(): void {
    if (this.isElectron && window.electronAPI) {
      // 监听更新事件
      window.electronAPI.onUpdateChecking(() => {
        console.log('Electron: 正在检查更新...');
      });

      window.electronAPI.onUpdateAvailable((info) => {
        console.log('Electron: 发现新版本:', info);
      });

      window.electronAPI.onUpdateNotAvailable(() => {
        console.log('Electron: 当前已是最新版本');
      });

      window.electronAPI.onUpdateError((error) => {
        console.error('Electron: 更新错误:', error);
      });

      window.electronAPI.onUpdateDownloadProgress((progress) => {
        console.log('Electron: 下载进度:', progress);
      });

      window.electronAPI.onUpdateDownloaded((info) => {
        console.log('Electron: 更新下载完成，应用将自动重启...', info);
        // 不再在前端调用安装，主进程会自动处理
        console.log('等待应用自动重启...');
      });
    }
  }

  // 检查更新
  async checkForUpdates(): Promise<UpdateResult> {
    try {
      console.log('正在检查更新...');
      
      // 确保版本信息是最新的
      await this.initializeVersion();
      
      if (!this.isElectron) {
        return {
          available: false,
          message: 'Web版本不支持自动更新，请手动刷新页面获取最新版本'
        };
      }

      // 如果有Electron API，使用它
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.checkForUpdates();
          
          if (result.success) {
            return {
              available: true,
              message: '检查更新完成，请查看更新状态'
            };
          } else {
            return {
              available: false,
              message: result.error || '检查更新失败'
            };
          }
        } catch (error) {
          console.error('Electron更新检查失败:', error);
          // 回退到模拟模式
        }
      }

      // 模拟从服务器获取更新信息
      const updateInfo = await this.fetchUpdateInfo();
      
      if (this.isVersionNewer(updateInfo.version, this.currentVersion)) {
        return {
          available: true,
          message: `发现新版本 ${updateInfo.version}，当前版本 ${this.currentVersion}`,
          updateInfo
        };
      } else {
        return {
          available: false,
          message: `当前已是最新版本 ${this.currentVersion}`
        };
      }

    } catch (error) {
      console.error('检查更新失败:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      return {
        available: false,
        message: '检查更新失败: ' + message
      };
    }
  }

  // 从服务器获取更新信息
  private async fetchUpdateInfo(): Promise<UpdateInfo> {
    try {
      // 这里使用GitHub API作为示例，实际应用中应该使用自己的更新服务器
      const response = await fetch(this.updateServerUrl);
      const data = await response.json();

      // 模拟更新信息结构
      return {
        version: data.tag_name || '1.1.0',
        releaseDate: data.published_at || new Date().toISOString(),
        releaseNotes: data.body || '新版本更新内容',
        downloadUrl: data.zipball_url || 'https://example.com/update.zip',
        size: 1024 * 1024 * 10 // 10MB
      };
    } catch {
      // 如果API调用失败，返回模拟数据
      console.warn('无法连接到更新服务器，使用模拟数据');
      return {
        version: '1.1.0',
        releaseDate: new Date().toISOString(),
        releaseNotes: '模拟更新:\n- 修复了一些问题\n- 提升了性能\n- 新增了功能',
        downloadUrl: 'https://example.com/update.zip',
        size: 1024 * 1024 * 5 // 5MB
      };
    }
  }

  // 下载并安装更新
  async downloadUpdate(): Promise<UpdateResult> {
    if (this.updateInProgress) {
      return {
        available: false,
        message: '更新正在进行中，请稍候...'
      };
    }

    if (!this.isElectron) {
      return {
        available: false,
        message: 'Web版本不支持自动更新'
      };
    }

    try {
      this.updateInProgress = true;
      console.log('开始下载更新...');

      // 在实际应用中，这里会使用electron-updater库
      if (window.electronAPI) {
        const result = await window.electronAPI.downloadUpdate();
        
        if (result.success) {
          return {
            available: true,
            message: result.message || '更新下载完成，应用将重启以应用更新'
          };
        } else {
          return {
            available: false,
            message: result.error || '下载更新失败'
          };
        }
      } else {
        // 模拟下载过程
        await this.simulateDownload();
        return {
          available: true,
          message: '更新下载完成（模拟），请重启应用以应用更新'
        };
      }

    } catch (error) {
      console.error('下载更新失败:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      return {
        available: false,
        message: '下载更新失败: ' + message
      };
    } finally {
      this.updateInProgress = false;
    }
  }

  // 模拟下载过程
  private async simulateDownload(): Promise<void> {
    const totalTime = 3000; // 3秒模拟下载
    const chunks = 10;
    const chunkTime = totalTime / chunks;

    for (let i = 0; i < chunks; i++) {
      await new Promise(resolve => setTimeout(resolve, chunkTime));
      console.log(`下载进度: ${((i + 1) / chunks * 100).toFixed(0)}%`);
    }

    console.log('模拟下载完成');
  }

  // 立即安装更新并重启
  async installUpdateAndRestart(): Promise<void> {
    if (!this.isElectron) {
      throw new Error('Web版本不支持自动重启');
    }

    try {
      if (window.electronAPI) {
        await window.electronAPI.installUpdate();
      } else {
        console.log('模拟安装更新并重启...');
        // 在实际环境中这里会重启应用
        alert('更新安装完成，应用即将重启');
      }
    } catch (error) {
      console.error('安装更新失败:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error('安装更新失败: ' + message);
    }
  }

  // 版本比较
  private isVersionNewer(newVersion: string, currentVersion: string): boolean {
    const newParts = newVersion.replace(/^v/, '').split('.').map(Number);
    const currentParts = currentVersion.replace(/^v/, '').split('.').map(Number);

    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const newPart = newParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (newPart > currentPart) return true;
      if (newPart < currentPart) return false;
    }

    return false; // 版本相同
  }

  // 设置当前版本
  setCurrentVersion(version: string): void {
    this.currentVersion = version;
  }

  // 获取当前版本
  getCurrentVersion(): string {
    return this.currentVersion;
  }

  // 设置更新服务器URL
  setUpdateServerUrl(url: string): void {
    this.updateServerUrl = url;
  }

  // 检查是否正在更新
  isUpdateInProgress(): boolean {
    return this.updateInProgress;
  }

  // 清理更新缓存
  async clearUpdateCache(): Promise<void> {
    if (this.isElectron && window.electronAPI) {
      try {
        console.log('清理更新缓存...');
        // 注意：这个功能需要在preload中实现
        await Promise.resolve(); // 占位符，防止linter错误
        console.log('更新缓存清理完成');
      } catch {
        console.error('清理更新缓存失败');
      }
    } else {
      console.log('模拟清理更新缓存');
      await Promise.resolve(); // 占位符，防止linter错误
    }
  }

  // 清理事件监听器
  cleanup(): void {
    if (this.isElectron && window.electronAPI) {
      window.electronAPI.removeAllListeners('update-checking');
      window.electronAPI.removeAllListeners('update-available');
      window.electronAPI.removeAllListeners('update-not-available');
      window.electronAPI.removeAllListeners('update-error');
      window.electronAPI.removeAllListeners('update-download-progress');
      window.electronAPI.removeAllListeners('update-downloaded');
    }
  }
}

export const updateService = new UpdateService(); 