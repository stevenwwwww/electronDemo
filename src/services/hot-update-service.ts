export interface HotUpdateInfo {
  version: string;
  description: string;
  updateUrl: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  content?: {
    title?: string;
    features?: string[];
  };
}

export interface HotUpdateResult {
  success: boolean;
  message: string;
  newVersion?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  updatedAt: string;
}

export interface ContentConfig {
  title: string;
  features: string[];
  updatedAt: string;
}

class HotUpdateService {
  private currentVersion: string = '1.0.0';
  private updateServerUrl: string = 'http://localhost:3001'; // 热更新服务器
  
  constructor() {
    void this.initializeVersion();
  }

  private initializeVersion(): void {
    try {
      // 从localStorage获取当前热更新版本
      const savedVersion = localStorage.getItem('hotUpdateVersion');
      if (savedVersion) {
        this.currentVersion = savedVersion;
      }
    } catch (error) {
      console.error('初始化热更新版本失败:', error);
    }
  }

  // 检查是否有热更新
  async checkForHotUpdates(): Promise<{ available: boolean; updateInfo?: HotUpdateInfo }> {
    try {
      console.log('检查热更新...');
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟服务器检查（实际环境中这里会请求真实的更新服务器）
      const mockUpdateInfo: HotUpdateInfo = {
        version: '1.1.0',
        description: '主题更新：粉色主题，新增功能展示',
        updateUrl: `${this.updateServerUrl}/updates/v1.1.0`,
        theme: {
          primaryColor: '#e91e63', // 粉色
          secondaryColor: '#f06292'
        },
        content: {
          title: '🌸 粉色主题版本',
          features: [
            '全新粉色主题设计',
            '优化用户界面体验',
            '新增动画效果',
            '热更新功能演示'
          ]
        }
      };

      // 检查版本是否有更新
      if (this.compareVersions(mockUpdateInfo.version, this.currentVersion) > 0) {
        return {
          available: true,
          updateInfo: mockUpdateInfo
        };
      }

      return { available: false };
    } catch (error) {
      console.error('检查热更新失败:', error);
      throw new Error('无法连接到更新服务器');
    }
  }

  // 应用热更新
  async applyHotUpdate(updateInfo: HotUpdateInfo): Promise<HotUpdateResult> {
    try {
      console.log('开始应用热更新...', updateInfo);

      // 模拟应用更新的延迟
      await new Promise(resolve => setTimeout(resolve, 100));

      // 1. 更新主题配置
      if (updateInfo.theme) {
        this.updateTheme(updateInfo.theme);
      }

      // 2. 更新内容配置
      if (updateInfo.content) {
        this.updateContent(updateInfo.content);
      }

      // 3. 保存新版本号
      this.currentVersion = updateInfo.version;
      localStorage.setItem('hotUpdateVersion', this.currentVersion);
      localStorage.setItem('hotUpdateTime', new Date().toISOString());

      // 4. 触发页面刷新以应用更改
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      return {
        success: true,
        message: `热更新成功！版本已更新到 ${updateInfo.version}`,
        newVersion: updateInfo.version
      };
    } catch (error) {
      console.error('应用热更新失败:', error);
      return {
        success: false,
        message: '热更新应用失败: ' + (error instanceof Error ? error.message : '未知错误')
      };
    }
  }

  // 更新主题
  private updateTheme(theme: NonNullable<HotUpdateInfo['theme']>): void {
    try {
      // 保存主题配置到localStorage
      const themeConfig: ThemeConfig = {
        primaryColor: theme.primaryColor || '#1976d2',
        secondaryColor: theme.secondaryColor || '#26a69a',
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('themeConfig', JSON.stringify(themeConfig));
      
      // 立即应用主题到CSS变量
      if (theme.primaryColor) {
        document.documentElement.style.setProperty('--q-primary', theme.primaryColor);
      }
      if (theme.secondaryColor) {
        document.documentElement.style.setProperty('--q-secondary', theme.secondaryColor);
      }

      console.log('主题更新完成:', themeConfig);
    } catch (error) {
      console.error('更新主题失败:', error);
      throw error;
    }
  }

  // 更新内容
  private updateContent(content: NonNullable<HotUpdateInfo['content']>): void {
    try {
      // 保存内容配置到localStorage
      const contentConfig: ContentConfig = {
        title: content.title || '默认标题',
        features: content.features || [],
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('contentConfig', JSON.stringify(contentConfig));
      console.log('内容更新完成:', contentConfig);
    } catch (error) {
      console.error('更新内容失败:', error);
      throw error;
    }
  }

  // 获取当前热更新版本
  getCurrentVersion(): string {
    return this.currentVersion;
  }

  // 获取当前主题配置
  getCurrentTheme(): ThemeConfig | null {
    try {
      const themeStr = localStorage.getItem('themeConfig');
      return themeStr ? JSON.parse(themeStr) as ThemeConfig : null;
    } catch {
      return null;
    }
  }

  // 获取当前内容配置
  getCurrentContent(): ContentConfig | null {
    try {
      const contentStr = localStorage.getItem('contentConfig');
      return contentStr ? JSON.parse(contentStr) as ContentConfig : null;
    } catch {
      return null;
    }
  }

  // 版本比较工具
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  // 重置到默认主题
  async resetToDefault(): Promise<void> {
    // 模拟重置过程的延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    localStorage.removeItem('themeConfig');
    localStorage.removeItem('contentConfig');
    localStorage.removeItem('hotUpdateVersion');
    localStorage.removeItem('hotUpdateTime');
    
    // 重置CSS变量到默认值
    document.documentElement.style.removeProperty('--q-primary');
    document.documentElement.style.removeProperty('--q-secondary');
    
    this.currentVersion = '1.0.0';
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
}

export const hotUpdateService = new HotUpdateService(); 