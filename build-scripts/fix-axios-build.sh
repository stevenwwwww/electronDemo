#!/bin/bash

# Axios 模块打包修复脚本
# 用于解决 Electron 打包后 axios 模块找不到的问题

echo "==================================="
echo "  Axios 模块打包修复脚本"
echo "==================================="
echo ""

echo "1. 清理之前的构建产物..."
rm -rf dist/electron/

echo "2. 检查 axios 模块状态..."
if [ ! -d "node_modules/axios/dist/node" ]; then
    echo "❌ axios/dist/node 目录不存在，重新安装 axios..."
    npm install axios
else
    echo "✅ axios 模块正常"
    ls -la node_modules/axios/dist/node/
fi

echo ""
echo "3. 开始重新构建 Electron 应用..."
npm run build:electron

echo ""
echo "4. 验证构建结果..."
ASAR_PATH="dist/electron/Packaged/Electron Quasar Demo-darwin-x64/Electron Quasar Demo.app/Contents/Resources/app.asar"

if [ -f "$ASAR_PATH" ]; then
    echo "✅ app.asar 文件存在"
    
    echo "检查 axios 模块是否正确打包..."
    npx asar list "$ASAR_PATH" | grep "node_modules/axios" | head -5
    
    echo ""
    echo "检查 axios/dist 目录..."
    npx asar list "$ASAR_PATH" | grep "node_modules/axios/dist"
    
    if npx asar list "$ASAR_PATH" | grep -q "node_modules/axios/dist/node/axios.cjs"; then
        echo "✅ axios.cjs 文件已正确包含"
    else
        echo "❌ axios.cjs 文件缺失"
        
        echo ""
        echo "尝试手动验证和修复..."
        echo "提取 app.asar 到临时目录..."
        TEMP_DIR="/tmp/app_verify_$$"
        npx asar extract "$ASAR_PATH" "$TEMP_DIR"
        
        echo "检查提取的文件..."
        if [ -f "$TEMP_DIR/node_modules/axios/dist/node/axios.cjs" ]; then
            echo "✅ 提取后文件存在，可能是列表显示问题"
        else
            echo "❌ 确实缺失，需要手动复制文件"
            mkdir -p "$TEMP_DIR/node_modules/axios/dist/node"
            cp "node_modules/axios/dist/node/axios.cjs" "$TEMP_DIR/node_modules/axios/dist/node/"
            cp "node_modules/axios/dist/node/axios.cjs.map" "$TEMP_DIR/node_modules/axios/dist/node/" 2>/dev/null || true
            
            echo "重新打包 app.asar..."
            npx asar pack "$TEMP_DIR" "$ASAR_PATH"
            echo "✅ 修复完成"
        fi
        
        echo "清理临时目录..."
        rm -rf "$TEMP_DIR"
    fi
else
    echo "❌ app.asar 文件不存在，构建失败"
    exit 1
fi

echo ""
echo "==================================="
echo "  修复完成！"
echo "==================================="
echo ""
echo "现在可以测试应用："
echo "  open \"$ASAR_PATH/../../../Electron Quasar Demo.app\""
echo "" 