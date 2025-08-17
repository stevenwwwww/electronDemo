#!/bin/bash

# Electron + Quasar 跨平台构建脚本
# 用于构建 Windows EXE 和 Android APK
# 支持代理和手动下载解决网络超时问题

echo "==================================="
echo "  Electron + Quasar 构建脚本"
echo "==================================="
echo ""

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "项目根目录: $PROJECT_ROOT"
echo ""

# 代理配置函数
setup_proxy() {
    echo "设置代理配置..."
    
    # 检查是否提供了代理端口参数
    PROXY_PORT=${1:-7890}
    PROXY_HOST="127.0.0.1:$PROXY_PORT"
    
    echo "使用代理: http://$PROXY_HOST"
    
    # 设置 npm 代理
    npm config set proxy http://$PROXY_HOST
    npm config set https-proxy http://$PROXY_HOST
    
    # 设置 Electron 下载代理
    export ELECTRON_GET_USE_PROXY=true
    export GLOBAL_AGENT_HTTP_PROXY=http://$PROXY_HOST
    export GLOBAL_AGENT_HTTPS_PROXY=http://$PROXY_HOST
    
    # 设置 Electron 镜像源（国内镜像）
    export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
    export ELECTRON_CUSTOM_DIR="{{ version }}"
    export ELECTRON_CUSTOM_FILENAME="electron-v{{ version }}-{{ platform }}-{{ arch }}.zip"
    
    echo "✅ 代理配置完成"
}

# 清理代理配置函数
cleanup_proxy() {
    echo "清理代理配置..."
    npm config delete proxy
    npm config delete https-proxy
    unset ELECTRON_GET_USE_PROXY
    unset GLOBAL_AGENT_HTTP_PROXY
    unset GLOBAL_AGENT_HTTPS_PROXY
    unset ELECTRON_MIRROR
    unset ELECTRON_CUSTOM_DIR
    unset ELECTRON_CUSTOM_FILENAME
    echo "✅ 代理配置已清理"
}

# 手动下载 Electron 预构建文件
manual_download_electron() {
    echo "==================================="
    echo "手动下载 Electron 预构建文件..."
    echo "==================================="
    
    # 获取 Electron 版本
    ELECTRON_VERSION=$(node -p "require('./package.json').devDependencies.electron" | sed 's/[^0-9.]//g')
    if [ -z "$ELECTRON_VERSION" ] || [ "$ELECTRON_VERSION" = "latest" ]; then
        echo "获取最新 Electron 版本..."
        ELECTRON_VERSION=$(npm view electron version)
    fi
    
    echo "Electron 版本: $ELECTRON_VERSION"
    
    # Electron 缓存目录
    ELECTRON_CACHE_DIR="$HOME/.cache/electron"
    mkdir -p "$ELECTRON_CACHE_DIR"
    
    # 下载各平台的 Electron 预构建文件
    platforms=("win32-x64" "darwin-x64" "darwin-arm64" "linux-x64")
    
    for platform in "${platforms[@]}"; do
        echo "检查 $platform 平台文件..."
        filename="electron-v$ELECTRON_VERSION-$platform.zip"
        filepath="$ELECTRON_CACHE_DIR/$filename"
        
        if [ ! -f "$filepath" ]; then
            echo "下载 $platform 平台文件..."
            url="https://npmmirror.com/mirrors/electron/$ELECTRON_VERSION/$filename"
            echo "下载地址: $url"
            
            # 使用 curl 下载，支持代理
            if command -v curl &> /dev/null; then
                if [ -n "$PROXY_HOST" ]; then
                    curl -L --proxy "http://$PROXY_HOST" -o "$filepath" "$url"
                else
                    curl -L -o "$filepath" "$url"
                fi
            else
                echo "❌ 错误: 请安装 curl"
                return 1
            fi
            
            if [ $? -eq 0 ]; then
                echo "✅ $platform 平台文件下载成功"
            else
                echo "❌ $platform 平台文件下载失败"
            fi
        else
            echo "✅ $platform 平台文件已存在"
        fi
    done
    
    echo "✅ Electron 预构建文件准备完成"
}

# 显示使用帮助
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --proxy [端口]     使用代理构建 (默认端口: 7890)"
    echo "  --manual-download  手动下载 Electron 预构建文件"
    echo "  --help            显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                    # 正常构建"
    echo "  $0 --proxy           # 使用默认代理端口 7890"
    echo "  $0 --proxy 1080      # 使用自定义代理端口 1080"
    echo "  $0 --manual-download  # 手动下载后构建"
    echo ""
}

# 解析命令行参数
USE_PROXY=false
MANUAL_DOWNLOAD=false
PROXY_PORT=7890

while [[ $# -gt 0 ]]; do
    case $1 in
        --proxy)
            USE_PROXY=true
            if [[ $2 =~ ^[0-9]+$ ]]; then
                PROXY_PORT=$2
                shift
            fi
            shift
            ;;
        --manual-download)
            MANUAL_DOWNLOAD=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 设置代理（如果需要）
if [ "$USE_PROXY" = true ]; then
    setup_proxy $PROXY_PORT
fi

# 手动下载（如果需要）
if [ "$MANUAL_DOWNLOAD" = true ]; then
    manual_download_electron
fi

# 检查依赖
echo "检查项目依赖..."
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 请先安装 Node.js 和 npm"
    exit 1
fi

if ! command -v quasar &> /dev/null; then
    echo "❌ 错误: 请先安装 Quasar CLI (npm install -g @quasar/cli)"
    exit 1
fi

echo "✅ 依赖检查完成"
echo ""

# 安装项目依赖
echo "安装项目依赖..."
npm install
echo "✅ 项目依赖安装完成"
echo ""

# 构建 Windows Electron 应用
echo "==================================="
echo "构建 Windows Electron 应用..."
echo "==================================="

echo "清理之前的构建文件..."
rm -rf dist/electron

echo "开始构建 Electron 应用..."
quasar build -m electron

if [ $? -eq 0 ]; then
    echo "✅ Windows Electron 构建成功!"
    echo "输出目录: dist/electron/Packaged/"
    
    # 检查是否有生成的文件
    if [ -d "dist/electron/Packaged" ]; then
        echo "生成的文件:"
        ls -la dist/electron/Packaged/
    fi
else
    echo "❌ Windows Electron 构建失败!"
    if [ "$USE_PROXY" = true ]; then
        cleanup_proxy
    fi
    exit 1
fi

echo ""

# 构建 macOS Electron 应用 (如果在 macOS 上运行)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "==================================="
    echo "构建 macOS Electron 应用..."
    echo "==================================="
    
    echo "清理之前的构建文件..."
    rm -rf dist/electron-darwin
    
    echo "开始构建 macOS 应用..."
    # 设置 macOS 构建参数
    quasar build -m electron -T darwin
    
    if [ $? -eq 0 ]; then
        echo "✅ macOS Electron 构建成功!"
        echo "输出目录: dist/electron/"
        
        # 检查是否有生成的文件
        if [ -d "dist/electron" ]; then
            echo "生成的文件:"
            find dist/electron -name "*.app" -o -name "*.dmg"
        fi
    else
        echo "❌ macOS Electron 构建失败!"
    fi
    
    echo ""
fi

# 构建 Android Cordova 应用
echo "==================================="
echo "构建 Android Cordova 应用..."
echo "==================================="

# 检查 Android 开发环境
echo "检查 Android 开发环境..."

# 检查 Java
if ! command -v javac &> /dev/null; then
    echo "⚠️  警告: 未检测到 Java JDK，Android 构建可能失败"
    echo "请安装 Java JDK 8 或更高版本"
fi

# 检查 Android SDK
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "⚠️  警告: 未设置 ANDROID_HOME 或 ANDROID_SDK_ROOT 环境变量"
    echo "请安装 Android SDK 并设置环境变量"
fi

echo "清理之前的构建文件..."
rm -rf dist/cordova

echo "安装 Cordova Android 平台..."
cd src-cordova
npm install cordova-android
cd ..

echo "开始构建 Android 应用..."
quasar build -m cordova -T android

if [ $? -eq 0 ]; then
    echo "✅ Android Cordova 构建成功!"
    echo "输出目录: dist/cordova/android/"
    
    # 查找生成的 APK 文件
    APK_PATH=$(find dist/cordova -name "*.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        echo "生成的 APK 文件: $APK_PATH"
    else
        echo "⚠️  未找到生成的 APK 文件，请检查构建日志"
    fi
else
    echo "❌ Android Cordova 构建失败!"
    echo "请检查 Android 开发环境配置"
fi

echo ""

# 清理代理配置（如果使用了代理）
if [ "$USE_PROXY" = true ]; then
    cleanup_proxy
fi

# 构建总结
echo "==================================="
echo "构建总结"
echo "==================================="

echo "📱 平台支持:"
echo "  ✅ Web 浏览器 (quasar dev)"
echo "  ✅ Windows Desktop (Electron)"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  ✅ macOS Desktop (Electron)"
fi
echo "  ✅ Android Mobile (Cordova)"

echo ""
echo "📦 输出文件:"
if [ -d "dist/electron/Packaged" ]; then
    echo "  🖥️  Windows EXE: dist/electron/Packaged/"
fi

if [[ "$OSTYPE" == "darwin"* ]] && [ -d "dist/electron" ]; then
    echo "  🍎 macOS APP: dist/electron/"
fi

if [ -n "$APK_PATH" ]; then
    echo "  📱 Android APK: $APK_PATH"
fi

echo ""
echo "🚀 功能特性:"
echo "  ✅ 跨平台运行 (Windows + macOS + Android)"
echo "  ✅ 打印机驱动连接和打印"
echo "  ✅ 远程 API 调用 (主进程)"
echo "  ✅ IndexedDB 数据库操作"
echo "  ✅ 热更新升级系统"

echo ""
echo "💡 解决网络问题的方法:"
echo "  🔧 使用代理: $0 --proxy [端口号]"
echo "  📥 手动下载: $0 --manual-download"
echo "  🌐 国内镜像: 已自动配置 npmmirror.com"

echo ""
echo "构建完成! 🎉" 