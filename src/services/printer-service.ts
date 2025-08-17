import { Platform } from 'quasar';

interface PrinterConfig {
  name: string;
  type: 'thermal' | 'inkjet' | 'laser';
  interface: 'usb' | 'serial' | 'network';
  width?: number;
  encoding?: string;
}

class PrinterService {
  private connectedPrinter: PrinterConfig | null = null;
  private isElectron = Platform.is.electron;

  constructor() {
    console.log('PrinterService initialized, Platform:', this.isElectron ? 'Electron' : 'Web');
  }

  // 模拟获取可用打印机列表
  async getAvailablePrinters(): Promise<PrinterConfig[]> {
    // 在实际应用中，这里会调用系统API获取打印机列表
    const mockPrinters: PrinterConfig[] = [
      {
        name: 'HP LaserJet Pro',
        type: 'laser',
        interface: 'usb',
        width: 210
      },
      {
        name: 'Epson TM-T88V',
        type: 'thermal',
        interface: 'serial',
        width: 80,
        encoding: 'GB18030'
      },
      {
        name: 'Canon PIXMA',
        type: 'inkjet',
        interface: 'network',
        width: 210
      }
    ];

    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockPrinters;
  }

  // 连接打印机
  async connectPrinter(printerName?: string): Promise<boolean> {
    try {
      const printers = await this.getAvailablePrinters();
      
      // 如果没有指定打印机名称，连接第一个可用的
      const targetPrinter = printerName 
        ? printers.find(p => p.name === printerName)
        : printers[0];

      if (!targetPrinter) {
        throw new Error('未找到指定的打印机');
      }

      if (this.isElectron) {
        // 在Electron环境中，这里会调用主进程的打印机连接逻辑
        await this.connectPrinterInElectron(targetPrinter);
      } else {
        // 在Web环境中，只能模拟连接
        await this.mockConnect(targetPrinter);
      }

      this.connectedPrinter = targetPrinter;
      console.log('打印机连接成功:', targetPrinter.name);
      return true;

    } catch (error) {
      console.error('打印机连接失败:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error('打印机连接失败: ' + message);
    }
  }

  // Electron环境中的打印机连接
  private async connectPrinterInElectron(printer: PrinterConfig): Promise<void> {
    // 在实际应用中，这里会通过IPC与主进程通信
    // 主进程中会使用node-thermal-printer或其他打印库
    
    if (window.electronAPI) {
      // 使用electronAPI与主进程通信
      try {
        const result = await window.electronAPI.connectPrinter({
          name: printer.name,
          type: printer.type,
          interface: printer.interface
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Electron打印机连接失败');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '未知错误';
        throw new Error('Electron打印机连接失败: ' + message);
      }
    } else {
      // 如果没有electronAPI，模拟连接
      await this.mockConnect(printer);
    }
  }

  // 模拟连接（用于Web环境或测试）
  private async mockConnect(printer: PrinterConfig): Promise<void> {
    // 模拟连接延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟连接可能失败的情况
    if (Math.random() < 0.1) {
      throw new Error('模拟连接失败');
    }
    
    console.log(`模拟连接到打印机: ${printer.name}`);
  }

  // 测试打印
  async testPrint(): Promise<boolean> {
    if (!this.connectedPrinter) {
      throw new Error('请先连接打印机');
    }

    try {
      const testContent = this.generateTestContent();
      
      if (this.isElectron) {
        await this.printInElectron(testContent);
      } else {
        await this.printInWeb(testContent);
      }

      console.log('测试打印完成');
      return true;

    } catch (error) {
      console.error('打印失败:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error('打印失败: ' + message);
    }
  }

  // 生成测试打印内容
  private generateTestContent(): string {
    const now = new Date();
    return `
=================================
      打印机测试页面
=================================
时间: ${now.toLocaleString()}
打印机: ${this.connectedPrinter?.name}
类型: ${this.connectedPrinter?.type}
接口: ${this.connectedPrinter?.interface}
=================================
这是一个测试打印页面
用于验证打印机功能是否正常
=================================
    `;
  }

  // Electron环境中的打印
  private async printInElectron(content: string): Promise<void> {
    if (window.electronAPI) {
      try {
        const printerName = this.connectedPrinter?.name;
        const result = await window.electronAPI.print({
          content,
          ...(printerName && { printer: printerName })
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Electron打印失败');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '未知错误';
        throw new Error('Electron打印失败: ' + message);
      }
    } else {
      // 回退到Web打印
      await this.printInWeb(content);
    }
  }

  // Web环境中的打印（使用浏览器打印API）
  private async printInWeb(content: string): Promise<void> {
    // 创建一个隐藏的打印窗口
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('无法打开打印窗口');
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>打印测试</title>
          <style>
            body { font-family: monospace; white-space: pre-wrap; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);

    printWindow.document.close();
    
    // 等待内容加载完成后打印
    await new Promise<void>(resolve => {
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
        resolve();
      };
    });
  }

  // 打印自定义内容
  async printCustom(content: string): Promise<boolean> {
    if (!this.connectedPrinter) {
      throw new Error('请先连接打印机');
    }

    try {
      if (this.isElectron) {
        await this.printInElectron(content);
      } else {
        await this.printInWeb(content);
      }

      console.log('自定义内容打印完成');
      return true;

    } catch (error) {
      console.error('打印失败:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error('打印失败: ' + message);
    }
  }

  // 断开打印机连接
  disconnect(): void {
    if (this.connectedPrinter) {
      console.log('断开打印机连接:', this.connectedPrinter.name);
      this.connectedPrinter = null;
    }
  }

  // 获取当前连接的打印机信息
  getConnectedPrinter(): PrinterConfig | null {
    return this.connectedPrinter;
  }
}

export const printerService = new PrinterService(); 