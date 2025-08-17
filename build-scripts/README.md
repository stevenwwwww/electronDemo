# Electron + Quasar 构建脚本使用指南

## 概述

这些脚本用于解决 Electron 构建过程中的网络超时问题，支持 Windows、macOS 和 Android 平台的跨平台构建。

## 脚本列表

### 1. 主构建脚本 - `build-all.sh`

完整的跨平台构建脚本，支持代理和手动下载功能。

**用法:**
```bash
# 正常构建
./build-scripts/build-all.sh

# 使用代理构建（默认端口 7890）
./build-scripts/build-all.sh --proxy

# 使用自定义代理端口
./build-scripts/build-all.sh --proxy 1080

# 手动下载 Electron 预构建文件后构建
./build-scripts/build-all.sh --manual-download

# 显示帮助信息
./build-scripts/build-all.sh --help
```

### 2. 代理配置脚本 - `setup-proxy.sh`

单独设置代理配置，用于解决网络问题。

**用法:**
```bash
# 使用默认端口 7890
./build-scripts/setup-proxy.sh

# 使用自定义端口
./build-scripts/setup-proxy.sh 1080
```

### 3. 清理代理脚本 - `cleanup-proxy.sh`

清理代理配置，恢复默认网络设置。

**用法:**
```bash
./build-scripts/cleanup-proxy.sh
```

### 4. 手动下载脚本 - `download-electron.sh`

手动下载 Electron 预构建文件，支持多个镜像源。

**用法:**
```bash
# 直接下载
./build-scripts/download-electron.sh

# 使用代理下载
./build-scripts/download-electron.sh 7890
```

## 解决网络超时问题的方法

### 方法一：使用代理 (推荐)

如果你有代理服务（如 7890 端口），这是最简单的解决方案：

```bash
# 一键构建（使用代理）
./build-scripts/build-all.sh --proxy 7890
```

或者分步操作：
```bash
# 1. 设置代理
./build-scripts/setup-proxy.sh 7890

# 2. 构建应用
npm run build:electron

# 3. 清理代理（可选）
./build-scripts/cleanup-proxy.sh
```

### 方法二：手动下载预构建文件

先下载必要的文件，再进行构建：

```bash
# 1. 手动下载 Electron 预构建文件
./build-scripts/download-electron.sh

# 2. 构建应用
./build-scripts/build-all.sh
```

### 方法三：使用国内镜像

脚本已自动配置了国内镜像源 (npmmirror.com)，可以提高下载成功率。

## 常见问题解决

### 1. 网络超时错误

```
RequestError: connect ETIMEDOUT 20.205.243.166:443
```

**解决方案:**
- 使用代理: `./build-scripts/build-all.sh --proxy 7890`
- 手动下载: `./build-scripts/download-electron.sh 7890`

### 2. 代理设置失效

如果代理设置后仍然超时，请检查：
- 代理服务是否正常运行
- 代理端口是否正确
- 重新设置代理配置

### 3. Android 构建失败

确保已安装：
- Java JDK 8+
- Android SDK
- 设置环境变量 `ANDROID_HOME` 或 `ANDROID_SDK_ROOT`

### 4. macOS 构建失败

在 macOS 上构建需要：
- Xcode 命令行工具
- 正确的代码签名证书（发布时）

## 构建输出

成功构建后，文件将保存在以下位置：

- **Windows EXE**: `dist/electron/Packaged/`
- **macOS APP**: `dist/electron/` (仅在 macOS 上构建)
- **Android APK**: `dist/cordova/android/`

## 环境要求

- Node.js 16+ / 18+ / 20+
- npm 6.13.4+
- Quasar CLI (`npm install -g @quasar/cli`)
- curl (用于文件下载)

### Android 构建额外要求:
- Java JDK 8+
- Android SDK
- Cordova (`npm install -g cordova`)

### macOS 构建额外要求:
- Xcode 命令行工具
- macOS 操作系统

## 技术支持

如果遇到问题，请：

1. 检查网络连接
2. 尝试使用代理
3. 查看构建日志
4. 检查依赖是否正确安装

---

**注意**: 首次构建可能需要较长时间下载依赖，请耐心等待。 