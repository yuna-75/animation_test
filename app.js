// 直接使用本地已安装的Galacean Effects
import { Player } from './node_modules/@galacean/effects/dist/index.mjs';

class PurchaseSuccessAnimation {
    constructor() {
        this.player = null;
        this.isLoading = false;
        this.currentScenario = 'default'; // 当前场景：default, vip, premium
        this.isAnimationPlaying = false;
        
        // 绑定方法到this
        this.handleClickInteraction = this.handleClickInteraction.bind(this);
        this.handleMessageInteraction = this.handleMessageInteraction.bind(this);
        this.handlePlayerError = this.handlePlayerError.bind(this);
        
        // 页面加载完成后自动启动动画
        this.autoStartAnimation();
    }

    /**
     * 自动启动动画
     */
    async autoStartAnimation() {
        console.log(`🚀 开始启动动画，当前场景: ${this.currentScenario}`);
        
        if (this.isLoading || this.isAnimationPlaying) {
            console.log('⚠️ 动画正在加载或播放中，跳过启动');
            return;
        }

        const loadingText = document.getElementById('loadingText');
        
        // 显示加载状态
        this.isLoading = true;
        if (loadingText) {
            loadingText.style.display = 'block';
            loadingText.textContent = `正在加载${this.currentScenario === 'vip' ? 'VIP' : '默认'}场景动画...`;
        }
        
        try {
            await this.initializePlayer();
            await this.loadAnimationScene();
            
            // 隐藏加载文本
            loadingText.style.display = 'none';
            this.isAnimationPlaying = true;
            
            console.log('✅ 购买成功动画加载完成');
        } catch (error) {
            console.error('❌ 动画加载失败:', error);
            
            // 尝试显示降级图片
            this.showFallbackContent();
            
            loadingText.textContent = '已切换到静态模式，交互功能依然可用';
            loadingText.style.color = '#fbbf24';
            
            // 3秒后隐藏错误提示
            setTimeout(() => {
                loadingText.style.display = 'none';
            }, 3000);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 初始化Galacean Effects播放器
     */
    async initializePlayer() {
        console.log('🔧 开始初始化播放器...');
        
        const container = document.getElementById('effectsContainer');
        
        if (!container) {
            throw new Error('找不到动画容器');
        }

        if (!Player) {
            throw new Error('Galacean Effects Player 未加载');
        }

        // 清理已存在的播放器
        if (this.player) {
            this.player.dispose();
            this.player = null;
        }

        console.log('🎮 创建播放器实例...');

        // 创建新的播放器实例
        this.player = new Player({
            container: container,
            interactive: true, // 开启交互监听
            pixelRatio: window.devicePixelRatio || 1,
            renderFramework: 'webgl', // 使用WebGL渲染
            onError: this.handlePlayerError,
            // 增加调试选项
            env: 'editor' // 启用编辑器模式以便调试
        });

        // 监听交互事件
        this.player.on('click', this.handleClickInteraction);
        this.player.on('message', this.handleMessageInteraction);
        
        // 添加额外的事件监听器来调试
        this.player.on('itemClicked', (data) => {
            console.log('🎯 [itemClicked事件] 元素被点击:', data);
        });
        
        // 监听所有可能的交互事件
        ['tap', 'touch', 'mousedown', 'mouseup'].forEach(eventType => {
            this.player.on(eventType, (data) => {
                console.log(`🖱️ [${eventType}事件] 触发:`, data);
            });
        });

        console.log('✅ 播放器初始化完成');
    }

    /**
     * 加载动画场景
     */
    async loadAnimationScene() {
        if (!this.player) {
            throw new Error('播放器未初始化');
        }

        try {
            console.log('📦 开始加载动画场景...');
            
            // 根据场景获取动态内容配置（图片+文本）
            const dynamicContent = this.getDynamicContentByScenario(this.currentScenario);
            console.log('🎭 当前场景动态内容:', this.currentScenario, dynamicContent);
            
            // 分离图片和文本配置
            const dynamicImages = {
                content: dynamicContent.content,
                button_bg: dynamicContent.button_bg
            };
            const dynamicTexts = {
                button_text: dynamicContent.button_text
            };
            
            // 加载动画JSON文件（使用URL编码处理空格）
            const sceneUrl = './Purchase_Success%20/content.json';
            console.log('📂 加载场景文件:', sceneUrl);
            
            // 合并图片和文本配置作为variables
            const allVariables = { ...dynamicImages, ...dynamicTexts };
            console.log('📋 传递给loadScene的variables:', allVariables);
            
            // 详细调试variables参数
            console.log('🔍 [详细调试] Variables参数:');
            for (const [key, value] of Object.entries(allVariables)) {
                console.log(`  - ${key}:`, value);
                if (Array.isArray(value)) {
                    console.log(`    主图片: ${value[0]}`);
                    console.log(`    备用图片: ${value[1]}`);
                } else if (typeof value === 'string') {
                    console.log(`    文本内容: "${value}"`);
                }
            }
            
            const composition = await this.player.loadScene(sceneUrl, {
                variables: allVariables
            });
            
            console.log('✅ 场景加载完成，使用了动态图片配置');
            console.log('🎬 Composition详细信息:', composition);
            
            if (!composition) {
                throw new Error('场景加载失败 - composition为空');
            }

            console.log('✅ 场景加载成功:', composition);

            // 使用setText方法确保文本正确设置（作为备用方案）
            await this.applyDynamicTexts(composition, dynamicTexts);
            
            // 如果不是默认场景，使用setTexture方法动态替换图片
            if (this.currentScenario !== 'default') {
                await this.applyDynamicTextures(composition, dynamicImages);
            }

            // 获取交互元素并添加监听器
            const moreButton = composition.getItemByName('more');
            const closeButton = composition.getItemByName('close');
            
            // 打印交互元素的详细信息
            if (moreButton) {
                console.log('📍 more元素位置:', moreButton.transform);
            }
            if (closeButton) {
                console.log('📍 close元素位置:', closeButton.transform);
                console.log('📍 close元素尺寸:', closeButton.transform.scale);
            }
            
            // 只显示"more"按钮状态，不添加直接监听器（避免重复触发）
            if (moreButton) {
                console.log('✅ "more"按钮已找到，将通过全局监听器处理');
                
                // 强制启用more按钮的预览边框
                try {
                    if (moreButton.content && moreButton.content.options) {
                        moreButton.content.options.showPreview = true;
                        moreButton.content.options.previewColor = [8, [0, 255, 0, 128]]; // 绿色半透明边框
                        console.log('🟢 已启用more按钮绿色调试边框');
                    }
                } catch (error) {
                    console.warn('⚠️ 无法启用more按钮预览边框:', error);
                }
            } else {
                console.warn('⚠️ 找不到名为"more"的交互元素');
            }
            
            // 只显示"close"按钮状态，不添加直接监听器（避免重复触发）
            if (closeButton) {
                console.log('✅ "close"按钮已找到，将通过全局监听器处理');
                
                // 强制启用close按钮的预览边框
                try {
                    if (closeButton.content && closeButton.content.options) {
                        closeButton.content.options.showPreview = true;
                        closeButton.content.options.previewColor = [8, [255, 0, 0, 128]]; // 红色半透明边框
                        console.log('🔴 已启用close按钮红色调试边框');
                    }
                } catch (error) {
                    console.warn('⚠️ 无法启用close按钮预览边框:', error);
                }
            } else {
                console.warn('⚠️ 找不到名为"close"的交互元素');
            }
            
            // 列出所有可用的元素
            const items = composition.items || [];
            console.log('📋 场景中的所有元素:', items.map(item => ({
                name: item.name,
                type: item.type,
                id: item.id
            })));
            
            // 查找所有动态元素
            const contentItem = composition.getItemByName('content');
            const buttonBgItem = composition.getItemByName('button_bg');
            const buttonTextItem = composition.getItemByName('button_text');
            console.log('🖼️ content元素:', contentItem ? '✅找到' : '❌未找到');
            console.log('🔲 button_bg元素:', buttonBgItem ? '✅找到' : '❌未找到');
            console.log('📝 button_text元素:', buttonTextItem ? '✅找到' : '❌未找到');
            
            // 专门查找交互元素
            const interactiveItems = items.filter(item => item.type === "4" || item.type === 4);
            console.log('🎮 交互元素列表:', interactiveItems.map(item => ({
                name: item.name,
                id: item.id,
                position: item.transform?.position,
                scale: item.transform?.scale
            })));
            
            if (!moreButton || !closeButton) {
                console.warn('⚠️ 某些交互元素未找到:', {
                    moreFound: !!moreButton,
                    closeFound: !!closeButton
                });
            }

            console.log('🎬 动画场景加载完成');
            
            // 显示调试信息
            this.showDebugInfo(composition);
            
            return composition;
            
        } catch (error) {
            console.error('❌ 场景加载错误详情:', error);
            throw new Error(`动画资源加载失败: ${error.message}`);
        }
    }

    /**
     * 处理点击交互事件
     */
    handleClickInteraction(clickedItem) {
        console.log('🖱️ [全局监听] 点击交互触发');
        console.log('点击的元素详细信息:', {
            name: clickedItem.name,
            clickInfo: clickedItem.clickInfo,
            player: !!clickedItem.player,
            compositionId: clickedItem.compositionId,
            compositionName: clickedItem.compositionName,
            type: typeof clickedItem,
            keys: Object.keys(clickedItem)
        });
        
        // 根据元素名称处理不同的交互
        if (clickedItem.name === 'more') {
            console.log('🎯 [全局监听] 点击了"查看更多权益"按钮');
            this.handleMoreButtonClick();
        } else if (clickedItem.name === 'close') {
            console.log('🎯 [全局监听] 点击了"关闭"按钮');
            this.handleCloseButtonClick();
        } else {
            console.log(`❓ 点击了其他元素: ${clickedItem.name || '未知元素'}`);
            console.log('完整的点击信息:', clickedItem);
        }
    }

    /**
     * 处理消息交互事件
     */
    handleMessageInteraction(messageItem) {
        console.log('📨 [消息监听] 消息交互触发');
        console.log('消息元素:', messageItem.name, '状态:', messageItem.phrase);
        
        // 这里可以根据不同的消息元素执行相应逻辑
        // 例如：播放音效、显示提示等
    }

    /**
     * 处理"查看更多权益"按钮点击
     */
    handleMoreButtonClick() {
        console.log('🌐 [唯一处理] 准备跳转到数有引力网站...');
        
        try {
            // 直接在新窗口打开数有引力网站
            const targetUrl = 'https://www.shuyouyinli.com/';
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
            
            console.log('✅ [唯一处理] 成功跳转到:', targetUrl);
            
        } catch (error) {
            console.error('❌ [唯一处理] 跳转失败:', error);
            
            // 只在出错时显示提示
            const loadingText = document.getElementById('loadingText');
            if (loadingText) {
                loadingText.style.display = 'block';
                loadingText.textContent = '跳转失败，请手动访问 www.shuyouyinli.com';
                loadingText.style.color = '#ff6b6b';
                
                // 3秒后隐藏错误信息
                setTimeout(() => {
                    loadingText.style.display = 'none';
                }, 3000);
            }
        }
    }

    /**
     * 处理播放器错误
     */
    handlePlayerError(error, ...args) {
        console.error('❌ 播放器错误:', error, args);
        
        // 显示降级图片
        const container = document.getElementById('effectsContainer');
        if (container) {
            container.innerHTML = `
                <div style="
                    width: 100%; 
                    height: 100%; 
                    background-image: url('./Purchase_Success%20/downgrade/content.png'); 
                    background-size: contain; 
                    background-repeat: no-repeat; 
                    background-position: center;
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    padding: 50px 20px;
                ">
                    <button 
                        onclick="handleFallbackCloseClick()" 
                        style="
                            background: linear-gradient(45deg, #64748b, #475569);
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            font-size: 14px;
                            font-weight: 600;
                            border-radius: 15px;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(100, 116, 139, 0.3);
                            transition: all 0.3s ease;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'"
                    >
                        关闭
                    </button>
                    <button 
                        onclick="handleFallbackMoreClick()" 
                        style="
                            background: linear-gradient(45deg, #f5c49d, #e67e22);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            font-size: 16px;
                            font-weight: 600;
                            border-radius: 20px;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
                            transition: all 0.3s ease;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'"
                    >
                        查看更多权益
                    </button>
                </div>
            `;
        }
        
        // 创建降级模式下的点击处理函数
        window.handleFallbackMoreClick = () => {
            console.log('🔄 降级模式：点击查看更多权益按钮');
            
            try {
                // 直接跳转，不显示提示
                const targetUrl = 'https://www.shuyouyinli.com/';
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
                console.log('✅ 降级模式跳转成功到:', targetUrl);
            } catch (error) {
                console.error('❌ 降级模式跳转失败:', error);
            }
        };
        
        // 创建降级模式下的关闭处理函数
        window.handleFallbackCloseClick = () => {
            console.log('🔄 降级模式：点击关闭按钮');
            this.closeAnimation();
        };

        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.style.display = 'block';
            loadingText.style.color = '#fbbf24';
            loadingText.textContent = '已切换到静态模式，交互功能依然可用';
            
            // 3秒后隐藏提示
            setTimeout(() => {
                loadingText.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * 根据场景获取动态图片配置
     */
    getDynamicContentByScenario(scenario) {
        console.log(`🎭 [动态内容] 获取场景配置: ${scenario}`);
        
        const scenarios = {
            'default': {
                // 动态图片
                content: [
                    'https://i.ibb.co/9mfsG8XM/black-level.png',
                    './Purchase_Success /images/04a90d7bc3db830ae1f477b33523d5ce.png'
                ],
                button_bg: [
                    'https://i.ibb.co/wNMpNZ2x/button.png',
                    './Purchase_Success /images/1896408455d98e4b89bd7fcb0f9c1f15.png'
                ],
                // 动态文本
                button_text: '查看更多权益'
            },
            'vip': {
                // 动态图片
                content: [
                    'https://i.ibb.co/RT1rKS7s/funding-level.png',
                    './Purchase_Success /images/04a90d7bc3db830ae1f477b33523d5ce.png'
                ],
                button_bg: [
                    'https://i.ibb.co/VWtSkwpV/button-1.png',
                    './Purchase_Success /images/1896408455d98e4b89bd7fcb0f9c1f15.png'
                ],
                // 动态文本
                button_text: '查看 VIP权益'
            }
        };
        
        const result = scenarios[scenario] || scenarios['default'];
        console.log(`📋 [动态内容] 返回配置:`, result);
        return result;
    }

        /**
     * 使用setText方法动态设置文本
     */
    async applyDynamicTexts(composition, dynamicTexts) {
        console.log('📝 [setText] 开始动态设置文本...');
        
        try {
            // 导入TextComponent
            const { TextComponent } = await import('./node_modules/@galacean/effects/dist/index.mjs');
            
            // 设置button_text文本
            if (dynamicTexts.button_text) {
                const buttonTextItem = composition.getItemByName('button_text');
                if (buttonTextItem) {
                    const textComponent = buttonTextItem.getComponent(TextComponent);
                    if (textComponent) {
                        console.log(`📝 [setText] 设置button_text文本: "${dynamicTexts.button_text}"`);
                        textComponent.setText(dynamicTexts.button_text);
                        console.log('✅ [setText] button_text文本设置成功');
                    } else {
                        console.warn('⚠️ [setText] button_text元素没有TextComponent');
                    }
                } else {
                    console.warn('⚠️ [setText] 找不到名为"button_text"的元素');
                }
            }
            
            console.log('📝 [setText] 动态文本设置完成');
            
        } catch (error) {
            console.error('❌ [setText] 动态文本设置失败:', error);
            // 不抛出错误，继续执行动画
        }
    }

    /**
     * 使用setTexture方法动态替换图片
     */
    async applyDynamicTextures(composition, dynamicImages) {
        console.log('🎨 [setTexture] 开始动态替换图片...');
        
        try {
            // 导入SpriteComponent
            const { SpriteComponent } = await import('./node_modules/@galacean/effects/dist/index.mjs');
            
            // 替换content图片
            if (dynamicImages.content && dynamicImages.content[0]) {
                const contentItem = composition.getItemByName('content');
                if (contentItem) {
                    const contentComponent = contentItem.getComponent(SpriteComponent);
                    if (contentComponent) {
                        console.log(`🖼️ [setTexture] 替换content图片: ${dynamicImages.content[0]}`);
                        await contentComponent.setTexture(dynamicImages.content[0]);
                        console.log('✅ [setTexture] content图片替换成功');
                    } else {
                        console.warn('⚠️ [setTexture] content元素没有SpriteComponent');
                    }
                } else {
                    console.warn('⚠️ [setTexture] 找不到名为"content"的元素');
                }
            }
            
            // 替换button_bg图片
            if (dynamicImages.button_bg && dynamicImages.button_bg[0]) {
                const buttonBgItem = composition.getItemByName('button_bg');
                if (buttonBgItem) {
                    const buttonBgComponent = buttonBgItem.getComponent(SpriteComponent);
                    if (buttonBgComponent) {
                        console.log(`🔲 [setTexture] 替换button_bg图片: ${dynamicImages.button_bg[0]}`);
                        await buttonBgComponent.setTexture(dynamicImages.button_bg[0]);
                        console.log('✅ [setTexture] button_bg图片替换成功');
                    } else {
                        console.warn('⚠️ [setTexture] button_bg元素没有SpriteComponent');
                    }
                } else {
                    console.warn('⚠️ [setTexture] 找不到名为"button_bg"的元素');
                }
            }
            
            console.log('🎨 [setTexture] 动态图片替换完成');
            
        } catch (error) {
            console.error('❌ [setTexture] 动态图片替换失败:', error);
            // 不抛出错误，继续执行动画
        }
    }

    /**
     * 切换场景并重新加载动画
     */
    async changeScenario(scenario) {
        console.log(`🔄 [场景切换] 从 ${this.currentScenario} 切换到 ${scenario}`);
        
        if (this.currentScenario === scenario) {
            console.log('⚠️ 已经是当前场景，跳过切换');
            return;
        }
        
        this.currentScenario = scenario;
        console.log(`✅ 场景已更新为: ${this.currentScenario}`);
        
        // 停止当前动画
        if (this.player) {
            console.log('🛑 停止当前播放器');
            this.player.dispose();
            this.player = null;
        }
        
        // 清理容器
        const container = document.getElementById('effectsContainer');
        if (container) {
            container.innerHTML = '';
        }
        
        // 重置状态
        this.isAnimationPlaying = false;
        this.isLoading = false;
        
        console.log('🚀 开始重新加载动画...');
        // 重新启动动画
        await this.autoStartAnimation();
    }

    /**
     * 显示调试信息
     */
    showDebugInfo(composition) {
        const debugOverlay = document.getElementById('debugOverlay');
        const debugInfo = document.getElementById('debugInfo');
        
        if (debugOverlay && debugInfo) {
            const moreButton = composition.getItemByName('more');
            const closeButton = composition.getItemByName('close');
            
                         const dynamicContent = this.getDynamicContentByScenario(this.currentScenario);
            const debugText = `
📊 调试信息:<br>
🎭 当前场景: ${this.currentScenario}<br>
🖼️ Content图片: ${dynamicContent.content?.[0] || '未设置'}<br>
🔲 Button_bg图片: ${dynamicContent.button_bg?.[0] || '未设置'}<br>
📝 Button_text文本: ${dynamicContent.button_text || '未设置'}<br>
🟢 More按钮: ${moreButton ? '✅找到' : '❌未找到'}<br>
🔴 Close按钮: ${closeButton ? '✅找到' : '❌未找到'}<br>
📍 交互元素数: ${composition.items.filter(item => item.type === "4" || item.type === 4).length}<br>
🎮 播放器交互: ${this.player?.interactive ? '✅启用' : '❌禁用'}
             `;
            
            debugInfo.innerHTML = debugText;
            debugOverlay.style.display = 'block';
            
            // 5秒后自动隐藏
            setTimeout(() => {
                debugOverlay.style.display = 'none';
            }, 8000);
        }
    }

    /**
     * 处理"关闭"按钮点击
     */
    handleCloseButtonClick() {
        console.log('🔒 关闭购买成功动画...');
        
        // 隐藏动画容器
        this.closeAnimation();
    }

    /**
     * 关闭动画并显示关闭状态
     */
    closeAnimation() {
        const container = document.getElementById('effectsContainer');
        const loadingText = document.getElementById('loadingText');
        
        if (container) {
            // 清理播放器
            if (this.player) {
                this.player.dispose();
                this.player = null;
            }
            
            // 显示关闭状态界面
            container.innerHTML = `
                <div style="
                    width: 100%; 
                    height: 100%; 
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                    color: white;
                    text-align: center;
                    padding: 40px 20px;
                ">
                    <div style="
                        font-size: 48px;
                        margin-bottom: 20px;
                        opacity: 0.8;
                    ">✓</div>
                    <div style="
                        font-size: 18px;
                        font-weight: 500;
                        margin-bottom: 8px;
                        color: #e2e8f0;
                    ">动画已关闭</div>
                    <div style="
                        font-size: 14px;
                        color: #94a3b8;
                        margin-bottom: 30px;
                    ">感谢您的体验</div>
                    <button 
                        onclick="window.location.reload()" 
                        style="
                            background: linear-gradient(45deg, #3b82f6, #1d4ed8);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            font-size: 16px;
                            font-weight: 600;
                            border-radius: 20px;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                            transition: all 0.3s ease;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'"
                    >
                        重新播放动画
                    </button>
                </div>
            `;
        }
        
        // 隐藏加载文本
        if (loadingText) {
            loadingText.style.display = 'none';
        }
        
        // 重置状态
        this.isAnimationPlaying = false;
        this.isLoading = false;
        
        console.log('✅ 动画已关闭');
    }

    /**
     * 显示降级内容
     */
    showFallbackContent() {
        console.log('🔄 显示降级静态内容');
        
        const container = document.getElementById('effectsContainer');
        if (container) {
            container.innerHTML = `
                <div style="
                    width: 100%; 
                    height: 100%; 
                    background-image: url('./Purchase_Success%20/downgrade/content.png'); 
                    background-size: contain; 
                    background-repeat: no-repeat; 
                    background-position: center;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    padding: 50px 20px;
                ">
                    <button 
                        onclick="handleFallbackMoreClick()" 
                        style="
                            background: linear-gradient(45deg, #f5c49d, #e67e22);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            font-size: 16px;
                            font-weight: 600;
                            border-radius: 20px;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
                            transition: all 0.3s ease;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'"
                    >
                        查看更多权益
                    </button>
                </div>
            `;
        }
        
        // 创建降级模式下的点击处理函数
        window.handleFallbackMoreClick = () => {
            console.log('🔄 降级模式：点击查看更多权益按钮');
            
            try {
                // 直接跳转，不显示提示
                const targetUrl = 'https://www.shuyouyinli.com/';
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
                console.log('✅ 降级模式跳转成功到:', targetUrl);
            } catch (error) {
                console.error('❌ 降级模式跳转失败:', error);
            }
        };
    }

    /**
     * 清理资源
     */
    dispose() {
        // 清理播放器资源
        if (this.player) {
            this.player.dispose();
            this.player = null;
        }
        
        // 清理全局函数
        if (window.handleFallbackMoreClick) {
            delete window.handleFallbackMoreClick;
        }
        
        // 重置状态
        this.isAnimationPlaying = false;
        this.isLoading = false;
        
        console.log('🔄 动画资源已清理');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 购买成功动画自动播放系统初始化中...');
    
    try {
        // 创建动画实例，会自动开始播放动画
        const animationApp = new PurchaseSuccessAnimation();
        
        // 将实例绑定到window对象，供HTML按钮调用
        window.animationManager = animationApp;
        
        // 创建全局场景切换函数
        window.handleScenarioChange = async function(scenario) {
            console.log(`🎭 [全局] 场景切换请求: ${scenario}`);
            
            try {
                // 更新按钮状态
                document.querySelectorAll('.scenario-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector(`[data-scenario="${scenario}"]`)?.classList.add('active');
                
                // 执行场景切换
                await window.animationManager.changeScenario(scenario);
                console.log(`✅ [全局] 场景切换完成: ${scenario}`);
            } catch (error) {
                console.error(`❌ [全局] 场景切换失败:`, error);
            }
        };
        
        // 验证函数是否正确绑定
        console.log('🔧 handleScenarioChange函数绑定状态:', typeof window.handleScenarioChange);
        
        // 添加备用的事件监听器（以防onclick方法有问题）
        document.addEventListener('click', async function(e) {
            if (e.target.classList.contains('scenario-btn')) {
                e.preventDefault();
                const scenario = e.target.getAttribute('data-scenario');
                if (scenario) {
                    console.log(`🎭 [备用监听器] 场景切换请求: ${scenario}`);
                    
                    // 更新按钮状态
                    document.querySelectorAll('.scenario-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    e.target.classList.add('active');
                    
                    // 执行场景切换
                    try {
                        await window.animationManager.changeScenario(scenario);
                        console.log(`✅ [备用监听器] 场景切换完成: ${scenario}`);
                    } catch (error) {
                        console.error(`❌ [备用监听器] 场景切换失败:`, error);
                    }
                }
            }
        });
        
        // 页面卸载时清理资源
        window.addEventListener('beforeunload', () => {
            animationApp.dispose();
        });
        
        console.log('✅ 系统初始化完成，动画即将自动播放');
    } catch (error) {
        console.error('❌ 系统初始化失败:', error);
        
        // 显示错误信息
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = '初始化失败：' + error.message;
            loadingText.style.color = '#ff6b6b';
        }
    }
});

// 使动画类在全局可用
window.PurchaseSuccessAnimation = PurchaseSuccessAnimation;