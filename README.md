# Electron + Quasar 跨平台Demo

这是一个使用 Quasar 框架和 Electron 技术栈开发的跨平台应用Demo，展示了现代Web技术在桌面和移动端的强大能力。

## 🚀 项目特性

### 1. 跨平台支持
- **Windows Desktop** - 使用 Electron 打包为原生桌面应用
- **Android Mobile** - 使用 Cordova 打包为原生移动应用
- **Web Browser** - 直接在浏览器中运行

### 2. 核心功能实现

#### 📱 打印机功能
- 支持驱动类型打印机连接（热敏、喷墨、激光）
- 多种接口支持（USB、串口、网络）
- 跨平台打印能力（Electron中真实打印，Web中浏览器打印）

#### 🌐 远程API调用
- 在 Electron 主进程中实现API调用
- 支持 GET/POST 等HTTP方法
- 集成示例API（GitHub API、JSONPlaceholder）
- 完整的错误处理和响应管理

#### 💾 IndexedDB数据库
- 完整的CRUD操作（增删改查）
- 事务操作支持
- 自动回滚机制
- 数据统计功能

#### 🔄 热更新系统
- 基于 electron-updater 的自动更新
- 支持增量更新和全量更新
- 更新进度显示
- 安全的更新验证机制

## 🛠️ 技术栈

### 前端框架
- **Vue 3** - 渐进式JavaScript框架
- **Quasar Framework** - 基于Vue的跨平台UI框架
- **TypeScript** - 类型安全的JavaScript超集

### 桌面应用
- **Electron** - 跨平台桌面应用开发框架
- **electron-updater** - 自动更新功能
- **IPC通信** - 主进程与渲染进程通信

### 移动应用
- **Apache Cordova** - 混合移动应用开发框架
- **Android SDK** - Android应用构建支持

### 数据存储
- **IndexedDB** - 浏览器端NoSQL数据库
- **idb** - IndexedDB的现代化Promise封装

### 网络请求
- **Axios** - HTTP客户端库
- **RESTful API** - 标准化API接口

## 📦 项目结构

```
quasar-project/
├── src/                          # 源代码目录
│   ├── components/               # Vue组件
│   ├── layouts/                  # 布局组件
│   ├── pages/                    # 页面组件
│   │   └── IndexPage.vue         # 主页面（功能演示）
│   ├── services/                 # 业务逻辑服务
│   │   ├── api-service.ts        # API调用服务
│   │   ├── db-service.ts         # 数据库操作服务
│   │   ├── printer-service.ts    # 打印机服务
│   │   └── update-service.ts     # 更新服务
│   └── router/                   # 路由配置
├── src-electron/                 # Electron相关代码
│   ├── electron-main.ts          # 主进程代码
│   └── electron-preload.ts       # 预加载脚本
├── src-cordova/                  # Cordova相关配置
├── build-scripts/                # 构建脚本
│   └── build-all.sh             # 全平台构建脚本
└── dist/                         # 构建输出目录
    ├── electron/                 # Electron构建输出
    └── cordova/                  # Cordova构建输出
```

## 🔧 环境要求

### 基础环境
- **Node.js** >= 16.x
- **npm** >= 8.x
- **Quasar CLI** >= 2.x

### Windows开发环境
- **Windows 10/11**
- **Visual Studio Build Tools** (用于native模块编译)

### Android开发环境
- **Java JDK** 8+
- **Android SDK** (API Level 23+)
- **Android Studio** (推荐)
- **Gradle** (通常随Android Studio安装)

### 环境变量设置
```bash
export ANDROID_HOME=/path/to/android-sdk
export JAVA_HOME=/path/to/java-jdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

## 🚀 快速开始

### 1. 克隆并安装依赖
```bash
git clone <repository-url>
cd quasar-project
npm install
```

### 2. 开发模式运行

#### Web开发模式
```bash
npm run dev
# 或
quasar dev
```

#### Electron开发模式
```bash
quasar dev -m electron
```

#### Cordova开发模式
```bash
quasar dev -m cordova -T android
```

### 3. 构建生产版本

#### 使用自动化脚本（推荐）
```bash
chmod +x build-scripts/build-all.sh
./build-scripts/build-all.sh
```

#### 手动构建

**构建Windows EXE:**
```bash
quasar build -m electron
```

**构建Android APK:**
```bash
quasar build -m cordova -T android
```

## 📖 功能使用说明

### 1. 打印机功能
- 点击"连接打印机"按钮连接可用的打印机
- 点击"测试打印"执行打印测试
- 支持热敏、喷墨、激光等多种打印机类型

### 2. API调用功能
- 点击"获取天气数据"调用GitHub API (演示用)
- 点击"获取随机用户"调用JSONPlaceholder API
- 返回的数据会在界面上实时显示

### 3. 数据库操作
- 在输入框中输入测试数据
- 点击"存储数据"将数据保存到IndexedDB
- 点击"查询数据"显示所有已存储的数据
- 点击"事务测试"演示数据库事务操作
- 点击"清空数据"删除所有数据

### 4. 热更新功能
- 点击"检查更新"检查是否有新版本可用
- 如果有更新，点击"下载更新"开始下载
- 下载完成后应用会提示重启以应用更新

## 🔧 配置说明

### Electron配置
主进程配置文件: `src-electron/electron-main.ts`
预加载脚本: `src-electron/electron-preload.ts`

### Cordova配置
配置文件: `src-cordova/config.xml`
插件配置: `src-cordova/package.json`

### 打包配置
Quasar配置: `quasar.config.ts`

## 🐛 常见问题

### 1. Electron构建失败
- 确保安装了Visual Studio Build Tools
- 检查Node.js版本是否兼容
- 清除node_modules后重新安装

### 2. Android构建失败
- 检查ANDROID_HOME环境变量设置
- 确保安装了正确版本的Java JDK
- 检查Android SDK工具是否完整

### 3. 打印功能异常
- 在Web环境中，打印功能使用浏览器API
- 在Electron中需要连接实际打印机
- 确保打印机驱动正确安装

### 4. API调用失败
- 检查网络连接是否正常
- 某些API可能需要认证密钥
- 查看浏览器控制台的错误信息

## 📈 性能优化

### 1. 构建优化
- 使用Tree Shaking减少包体积
- 启用代码分割和懒加载
- 压缩和混淆生产代码

### 2. 运行时优化
- IndexedDB查询优化
- API请求缓存策略
- 内存使用监控

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Quasar Framework](https://quasar.dev/) - 优秀的Vue跨平台框架
- [Electron](https://www.electronjs.org/) - 强大的桌面应用开发框架
- [Apache Cordova](https://cordova.apache.org/) - 成熟的移动应用开发框架
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 项目Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 邮箱: your-email@example.com

**祝您使用愉快！** 🎉
