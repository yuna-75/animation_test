# 🎉 购买成功动画展示

基于 Galacean Effects 引擎的交互式购买成功动画，支持动态换图和文本功能。

## ✨ 功能特性

### 🎭 多场景支持
- **默认场景**：标准购买成功动画
- **VIP场景**：专属VIP主题和文案

### 🖼️ 动态换图
- 支持根据不同场景动态替换背景图片
- 支持按钮背景图片的实时切换
- 提供备用图片机制，确保稳定性

### 📝 动态文本
- 可根据场景动态修改按钮文案
- 支持实时文本内容更新
- 使用 Galacean Effects 的 TextComponent API

### 🎮 交互功能
- **查看更多权益**：点击跳转到官网
- **关闭动画**：点击关闭按钮退出动画
- **场景切换**：左上角场景切换面板

## 🚀 在线演示

访问 [GitHub Pages 演示地址](https://your-username.github.io/animation_test) 查看实时效果

## 🛠️ 本地开发

### 环境要求
- 现代浏览器（支持 ES6 模块）
- 本地HTTP服务器

### 安装依赖
```bash
npm install @galacean/effects
```

### 启动开发服务器
```bash
# 使用Python
python3 -m http.server 8080

# 或使用Node.js
npx serve .
```

然后访问 `http://localhost:8080`

## 📁 项目结构

```
animation_test/
├── index.html              # 主页面
├── app.js                  # 主要逻辑
├── package.json            # 依赖配置
├── node_modules/           # 依赖包
└── Purchase_Success/       # 动画资源
    ├── content.json        # 动画配置
    ├── images/            # 图片资源
    └── fonts/             # 字体文件
```

## 🎨 自定义配置

### 修改文案内容
在 `app.js` 中的 `getDynamicContentByScenario` 函数里修改：

```javascript
const scenarios = {
    'default': {
        button_text: '您的自定义文案'
    },
    'vip': {
        button_text: '您的VIP文案'
    }
};
```

### 修改图片资源
在同一函数中修改图片URL：

```javascript
content: [
    '您的图片URL',
    '备用图片URL'
]
```

## 🔧 技术栈

- **动画引擎**：Galacean Effects v2.5.3+
- **模块系统**：ES6 Modules
- **图片格式**：WebP（备用PNG）
- **字体**：AlibabaSans-Regular

## 📱 兼容性

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13.1+
- ✅ Edge 80+
- ✅ 移动端浏览器

## 🐛 问题反馈

如果遇到问题，请检查：
1. 浏览器控制台错误信息
2. 网络连接状态
3. 图片资源加载情况

## 📄 开源协议

MIT License

## 🙏 致谢

- [Galacean Effects](https://www.galacean.com/effects/) - 强大的Web动画引擎
- 设计团队提供的精美动画资源