#!/bin/bash

# Electron 预构建文件手动下载脚本
# 解决网络超时问题

echo "==================================="
echo "  Electron 预构建文件下载器"
echo "==================================="
echo ""

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 获取 Electron 版本
ELECTRON_VERSION=$(node -p "require('./package.json').devDependencies.electron" | sed 's/[^0-9.]//g')
if [ -z "$ELECTRON_VERSION" ] || [ "$ELECTRON_VERSION" = "latest" ]; then
    echo "获取最新 Electron 版本..."
    ELECTRON_VERSION=$(npm view electron version)
fi

echo "项目目录: $PROJECT_ROOT"
echo "Electron 版本: $ELECTRON_VERSION"
echo ""

# Electron 缓存目录
ELECTRON_CACHE_DIR="$HOME/.cache/electron"
mkdir -p "$ELECTRON_CACHE_DIR"

echo "缓存目录: $ELECTRON_CACHE_DIR"
echo ""

# 代理设置（可选）
PROXY_PORT=${1:-7890}
if [ -n "$1" ]; then
    PROXY_HOST="127.0.0.1:$PROXY_PORT"
    echo "使用代理: http://$PROXY_HOST"
    echo ""
fi

# 下载各平台的 Electron 预构建文件
platforms=(
    "win32-x64"
    "win32-arm64"
    "darwin-x64"
    "darwin-arm64"
    "linux-x64"
    "linux-arm64"
)

echo "开始下载 Electron 预构建文件..."
echo ""

success_count=0
total_count=${#platforms[@]}

for platform in "${platforms[@]}"; do
    echo "处理 $platform 平台..."
    filename="electron-v$ELECTRON_VERSION-$platform.zip"
    filepath="$ELECTRON_CACHE_DIR/$filename"
    
    if [ -f "$filepath" ]; then
        echo "  ✅ 文件已存在: $filename"
        ((success_count++))
        continue
    fi
    
    # 尝试多个镜像源
    mirrors=(
        "https://npmmirror.com/mirrors/electron/$ELECTRON_VERSION/$filename"
        "https://registry.npmmirror.com/-/binary/electron/$ELECTRON_VERSION/$filename"
        "https://github.com/electron/electron/releases/download/v$ELECTRON_VERSION/$filename"
    )
    
    downloaded=false
    for mirror in "${mirrors[@]}"; do
        echo "  📥 尝试下载: $mirror"
        
        # 下载命令
        if [ -n "$PROXY_HOST" ]; then
            curl_cmd="curl -L --connect-timeout 30 --max-time 300 --proxy http://$PROXY_HOST -o $filepath $mirror"
        else
            curl_cmd="curl -L --connect-timeout 30 --max-time 300 -o $filepath $mirror"
        fi
        
        # 执行下载
        if eval $curl_cmd; then
            if [ -f "$filepath" ] && [ -s "$filepath" ]; then
                echo "  ✅ 下载成功: $filename"
                ((success_count++))
                downloaded=true
                break
            else
                echo "  ❌ 下载的文件无效"
                rm -f "$filepath"
            fi
        else
            echo "  ❌ 下载失败"
        fi
    done
    
    if [ "$downloaded" = false ]; then
        echo "  ⚠️  所有镜像源都失败: $filename"
    fi
    
    echo ""
done

echo "==================================="
echo "下载完成统计"
echo "==================================="
echo "成功下载: $success_count/$total_count"
echo ""

if [ $success_count -eq $total_count ]; then
    echo "🎉 所有文件下载成功!"
    echo ""
    echo "现在可以正常构建 Electron 应用:"
    echo "  ./build-scripts/build-all.sh"
    echo "  或者"
    echo "  npm run build:electron"
elif [ $success_count -gt 0 ]; then
    echo "⚠️  部分文件下载成功，可以尝试构建"
    echo ""
    echo "如果构建失败，请:"
    echo "1. 检查网络连接"
    echo "2. 使用代理: $0 [代理端口]"
    echo "3. 手动下载失败的文件"
else
    echo "❌ 没有文件下载成功"
    echo ""
    echo "建议:"
    echo "1. 检查网络连接"
    echo "2. 使用代理: $0 7890"
    echo "3. 联系网络管理员"
fi

echo ""
echo "缓存目录内容:"
ls -la "$ELECTRON_CACHE_DIR" | grep electron-v 