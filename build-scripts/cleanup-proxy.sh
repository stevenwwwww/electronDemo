#!/bin/bash

# 清理 Electron 构建代理配置脚本

echo "==================================="
echo "  清理 Electron 代理配置"
echo "==================================="
echo ""

echo "清理 npm 代理配置..."
npm config delete proxy
npm config delete https-proxy

echo "清理 Electron 环境变量..."
unset ELECTRON_GET_USE_PROXY
unset GLOBAL_AGENT_HTTP_PROXY
unset GLOBAL_AGENT_HTTPS_PROXY
unset ELECTRON_MIRROR
unset ELECTRON_CUSTOM_DIR
unset ELECTRON_CUSTOM_FILENAME

echo "✅ 代理配置已清理完成!"
echo ""
echo "现在可以使用默认网络设置进行构建" 