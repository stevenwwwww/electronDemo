import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import axios from 'axios';

let mainWindow: BrowserWindow | null = null;
let isQuittingForUpdate = false;

// 配置自动更新
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false; // 改为false，手动控制重启
autoUpdater.allowDowngrade = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.resolve(__dirname, 'electron-preload.js'),
    },
  });

  if (process.env.DEBUGGING) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  if (process.env.DEV) {
    void mainWindow.loadURL(process.env.APP_URL || '');
  } else {
    void mainWindow.loadFile('index.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 系统信息IPC处理器
ipcMain.handle('get-system-info', () => {
  try {
    return {
      success: true,
      data: {
        platform: os.platform(),
        arch: os.arch(),
        version: os.version(),
        hostname: os.hostname(),
        cpus: os.cpus().length,
        memory: os.totalmem()
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: errorMessage
    };
  }
});

// 添加获取应用版本信息的IPC处理器
ipcMain.handle('get-app-version', () => {
  try {
    return {
      success: true,
      data: {
        version: app.getVersion(),
        name: app.getName()
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: errorMessage
    };
  }
});

// API调用IPC处理器
ipcMain.handle('api-call', async (event, { url, method = 'GET', data }: { url: string; method?: string; data?: unknown }) => {
  try {
    const response = await axios({
      method,
      url,
      data,
      timeout: 10000,
      headers: {
        'User-Agent': 'Electron-App/1.0.0'
      }
    });
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const status = axios.isAxiosError && axios.isAxiosError(error) ? error.response?.status : undefined;
    return {
      success: false,
      error: errorMessage,
      status
    };
  }
});

// 打印机连接IPC处理器
ipcMain.handle('connect-printer', async (event, config: { name?: string; type?: string; interface?: string }) => {
  try {
    console.log('连接打印机:', config);
    
    if (!mainWindow) {
      return {
        success: false,
        error: '主窗口未初始化'
      };
    }
    
    // 获取系统打印机列表
    const printers = await mainWindow.webContents.getPrintersAsync();
    console.log('可用打印机:', printers);
    
    // 查找指定的打印机
    const targetPrinter = printers.find(p => 
      p.name === config.name || 
      p.displayName === config.name ||
      printers.length === 1  // 如果只有一台打印机，直接使用
    );
    
    if (!targetPrinter && printers.length > 0) {
      // 如果没找到指定打印机，使用第一台可用的
      const firstPrinter = printers[0];
      console.log('使用第一台可用打印机:', firstPrinter.name);
      return {
        success: true,
        data: {
          connected: true,
          printer: firstPrinter.name,
          message: `已连接到打印机: ${firstPrinter.name}`
        }
      };
    }
    
    if (targetPrinter) {
      return {
        success: true,
        data: {
          connected: true,
          printer: targetPrinter.name,
          message: `已连接到打印机: ${targetPrinter.name}`
        }
      };
    } else {
      return {
        success: false,
        error: '未找到可用的打印机'
      };
    }
  } catch (error) {
    console.error('打印机连接失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: errorMessage
    };
  }
});

// 打印IPC处理器
ipcMain.handle('print', async (event, { content, printer }: { content: string; printer?: string }) => {
  try {
    console.log('开始打印:', { content: content.substring(0, 100) + '...', printer });
    
    if (!mainWindow) {
      return {
        success: false,
        error: '主窗口未初始化'
      };
    }
    
    // 创建打印选项
    const printOptions: Electron.WebContentsPrintOptions = {
      silent: false,  // 显示打印对话框
      printBackground: true,
      color: false,
      margins: {
        marginType: 'printableArea'
      },
      landscape: false,
      pagesPerSheet: 1,
      collate: false,
      copies: 1
    };
    
    // 如果指定了打印机，添加到选项中
    if (printer) {
      printOptions.deviceName = printer;
    }
    
    // 创建打印内容的HTML
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>打印测试</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 20px;
              white-space: pre-wrap;
            }
            .print-header {
              text-align: center;
              border-bottom: 1px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .print-content {
              white-space: pre-wrap;
            }
            @page {
              margin: 1cm;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h2>Electron 打印测试</h2>
            <p>时间: ${new Date().toLocaleString()}</p>
          </div>
          <div class="print-content">${content}</div>
        </body>
      </html>
    `;
    
    // 打印到PDF然后发送到打印机，或者直接显示打印对话框
    try {
      // Electron 的 print 方法是同步的，但为了保持一致性，我们仍然await
      mainWindow.webContents.print(printOptions, (success, failureReason) => {
        if (!success && failureReason) {
          console.log('打印失败原因:', failureReason);
        }
      });
      
      return {
        success: true,
        message: '打印任务已发送到打印机'
      };
    } catch (printError) {
      const errorMessage = printError instanceof Error ? printError.message : '未知错误';
      console.log('直接打印失败，尝试创建临时窗口打印:', errorMessage);
      
      // 创建临时窗口进行打印
      const printWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      
      await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(printHtml)}`);
      
      // 打印完成后关闭窗口
      printWindow.webContents.print(printOptions, (success, failureReason) => {
        if (!success && failureReason) {
          console.log('临时窗口打印失败原因:', failureReason);
        }
        printWindow.close();
      });
      
      return {
        success: true,
        message: '打印任务已完成'
      };
    }
  } catch (error) {
    console.error('打印失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: errorMessage
    };
  }
});

// 文件对话框IPC处理器
ipcMain.handle('show-open-dialog', async () => {
  try {
    if (!mainWindow) {
      return {
        success: false,
        error: '主窗口未初始化'
      };
    }
    
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: errorMessage
    };
  }
});

ipcMain.handle('show-save-dialog', async () => {
  try {
    if (!mainWindow) {
      return {
        success: false,
        error: '主窗口未初始化'
      };
    }
    
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: errorMessage
    };
  }
});

// 自动更新IPC处理器
ipcMain.handle('check-for-updates', async () => {
  try {
    console.log('开始检查更新...');
    await autoUpdater.checkForUpdatesAndNotify();
    return {
      success: true,
      message: '正在检查更新...'
    };
  } catch (error) {
    console.error('检查更新失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: errorMessage
    };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    console.log('开始下载更新...');
    await autoUpdater.downloadUpdate();
    return {
      success: true,
      message: '正在下载更新...'
    };
  } catch (error) {
    console.error('下载更新失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: errorMessage
    };
  }
});

ipcMain.handle('install-update', () => {
  try {
    console.log('安装更新并重启...');
    isQuittingForUpdate = true;
    // 确保在重启前给前端足够时间显示消息
    setTimeout(() => {
      autoUpdater.quitAndInstall(false, true);
    }, 1000);
    return {
      success: true,
      message: '正在安装更新并重启应用...'
    };
  } catch (error) {
    console.error('安装更新失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: errorMessage
    };
  }
});

// 自动更新事件处理
autoUpdater.on('checking-for-update', () => {
  console.log('正在检查更新...');
  if (mainWindow) {
    mainWindow.webContents.send('update-checking');
  }
});

autoUpdater.on('update-available', (info) => {
  console.log('发现新版本:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    });
  }
});

autoUpdater.on('update-not-available', () => {
  console.log('当前已是最新版本');
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available');
  }
});

autoUpdater.on('error', (err) => {
  console.error('自动更新错误:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`下载进度: ${progressObj.percent.toFixed(2)}%`);
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('更新下载完成，准备自动安装...');
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
      autoInstall: true // 标记为自动安装
    });
    
    // 在macOS上直接自动安装，不依赖前端调用
    console.log('自动安装更新并重启...');
    console.log('当前平台:', process.platform);
    isQuittingForUpdate = true;
    
    // 延迟2秒确保前端收到消息
    setTimeout(() => {
      console.log('执行quitAndInstall...');
      try {
        // 对于macOS，尝试不同的参数组合
        if (process.platform === 'darwin') {
          console.log('macOS平台：使用特殊的重启参数');
          autoUpdater.quitAndInstall(true, true);
        } else {
          autoUpdater.quitAndInstall(false, true);
        }
        console.log('quitAndInstall执行完成');
      } catch (error) {
        console.error('quitAndInstall执行失败:', error);
      }
    }, 2000);
  }
});

// 文件操作IPC处理器
ipcMain.handle('write-file', async (_event, filename: string, content: string) => {
  try {
    const userDataPath = app.getPath('userData');
    const filePath = path.join(userDataPath, filename);
    
    await fs.writeFile(filePath, content, 'utf8');
    
    return {
      success: true,
      path: filePath,
      message: '文件写入成功'
    };
  } catch (error) {
    console.error('文件写入失败:', error);
    return {
      success: false,
      path: '',
      message: error instanceof Error ? error.message : '文件写入失败'
    };
  }
});

ipcMain.handle('read-file', async (_event, filename: string) => {
  try {
    const userDataPath = app.getPath('userData');
    const filePath = path.join(userDataPath, filename);
    
    const content = await fs.readFile(filePath, 'utf8');
    
    return {
      success: true,
      path: filePath,
      content: content,
      message: '文件读取成功'
    };
  } catch (error) {
    console.error('文件读取失败:', error);
    return {
      success: false,
      path: '',
      content: '',
      message: error instanceof Error ? error.message : '文件读取失败'
    };
  }
});

void app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
  // 应用启动后检查更新
  setTimeout(() => {
    if (!process.env.DEV) {
      void autoUpdater.checkForUpdatesAndNotify();
    }
  }, 3000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理应用退出前的清理工作
app.on('before-quit', () => {
  console.log('应用即将退出，进行清理工作...');
  
  // 如果是因为更新而退出，允许退出
  if (isQuittingForUpdate) {
    console.log('正在为更新退出应用...');
    return;
  }
  
  // 其他情况下的清理工作可以在这里进行
});

