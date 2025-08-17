#!/bin/bash

# Electron 构建代理配置脚本
# 用于解决网络超时问题

PROXY_PORT=${1:-7890}
PROXY_HOST="127.0.0.1:$PROXY_PORT"

echo "==================================="
echo "  Electron 构建代理配置"
echo "==================================="
echo ""

echo "设置代理: http://$PROXY_HOST"

# 设置 npm 代理
echo "配置 npm 代理..."
npm config set proxy http://$PROXY_HOST
npm config set https-proxy http://$PROXY_HOST

# 设置 Electron 下载代理和镜像
echo "配置 Electron 下载..."
export ELECTRON_GET_USE_PROXY=true
export GLOBAL_AGENT_HTTP_PROXY=http://$PROXY_HOST
export GLOBAL_AGENT_HTTPS_PROXY=http://$PROXY_HOST

# 设置 Electron 镜像源（国内镜像）
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
export ELECTRON_CUSTOM_DIR="{{ version }}"
export ELECTRON_CUSTOM_FILENAME="electron-v{{ version }}-{{ platform }}-{{ arch }}.zip"

echo "✅ 代理配置完成!"
echo ""
echo "现在可以运行构建命令:"
echo "  npm run build:electron"
echo "  或者"
echo "  quasar build -m electron"
echo ""
echo "如需清理代理配置，请运行:"
echo "  ./build-scripts/cleanup-proxy.sh" 