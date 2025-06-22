// API設定（config.jsから取得）
let API_BASE_URL = 'http://localhost:7028/api'; // デフォルト値
let API_KEY = ''; // APIキー

// DOM要素の取得
const fireworksArea = document.getElementById('fireworksArea');
const messageInput = document.getElementById('messageInput');
const effectsCanvas = document.getElementById('effectsCanvas');

// 花火メッセージの配列
let activeFireworks = [];

// エフェクト制限のためのカウンター（パフォーマンス向上）
let activeEffectsCount = 0;
const MAX_ACTIVE_EFFECTS = 3; // 同時実行エフェクト数を制限

// カラフルなグラデーション配列 - 大幅に追加
const gradients = [
    // 暖色系グラデーション
    'linear-gradient(45deg, #ff6b6b, #ffa726)',
    'linear-gradient(45deg, #ff8a80, #ff5722)',
    'linear-gradient(135deg, #ff9a9e, #fecfef)',
    'linear-gradient(45deg, #ff6f91, #ff9671)',
    'linear-gradient(135deg, #ffecd2, #fcb69f)',
    'linear-gradient(45deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #ff758c, #ff7eb3)',
    'linear-gradient(45deg, #ffa726, #fb8c00)',
    
    // 寒色系グラデーション
    'linear-gradient(45deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(45deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #667eea, #a8edea)',
    'linear-gradient(45deg, #5ee7df, #66a6ff)',
    'linear-gradient(135deg, #4facfe, #764ba2)',
    'linear-gradient(45deg, #74b9ff, #0984e3)',
    'linear-gradient(135deg, #3742fa, #2f3542)',
    
    // パープル系グラデーション
    'linear-gradient(45deg, #a8edea, #fed6e3)',
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(45deg, #c471f5, #fa71cd)',
    'linear-gradient(135deg, #667eea, #a8edea)',
    'linear-gradient(45deg, #c44569, #f8b500)',
    'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    
    // グリーン系グラデーション
    'linear-gradient(45deg, #56ab2f, #a8e6cf)',
    'linear-gradient(135deg, #11998e, #38ef7d)',
    'linear-gradient(45deg, #00b09b, #96c93d)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(45deg, #2ed573, #7bed9f)',
    
    // ゴールド・シルバー系
    'linear-gradient(45deg, #f7971e, #ffd200)',
    'linear-gradient(135deg, #ffd89b, #19547b)',
    'linear-gradient(45deg, #c9d6ff, #e2e2e2)',
    'linear-gradient(135deg, #ddd6f3, #faaca8)',
    'linear-gradient(45deg, #ffafbd, #ffc3a0)',
    
    // 虹色・マルチカラー
    'linear-gradient(45deg, #ff0844, #ffb199)',
    'linear-gradient(135deg, #fc466b, #3f5efb)',
    'linear-gradient(45deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(45deg, #667eea, #764ba2)',
    
    // パステル系
    'linear-gradient(45deg, #ffeaa7, #fab1a0)',
    'linear-gradient(135deg, #74b9ff, #e17055)',
    'linear-gradient(45deg, #fd79a8, #fdcb6e)',
    'linear-gradient(135deg, #6c5ce7, #fd79a8)',
    'linear-gradient(45deg, #a29bfe, #ffeaa7)',
    
    // ダーク系
    'linear-gradient(45deg, #2d3436, #636e72)',
    'linear-gradient(135deg, #74b9ff, #0984e3)',
    'linear-gradient(45deg, #fd79a8, #fdcb6e)',
    'linear-gradient(135deg, #e17055, #f39c12)',
    
    // ネオン系
    'linear-gradient(45deg, #00ff88, #00b8ff)',
    'linear-gradient(135deg, #ff006e, #8338ec)',
    'linear-gradient(45deg, #06ffa5, #f9ca24)',
    'linear-gradient(135deg, #ff9ff3, #f368e0)',
    'linear-gradient(45deg, #54a0ff, #5f27cd)',
    
    // 夕焼け・朝焼け系
    'linear-gradient(45deg, #ff9a56, #ffad56)',
    'linear-gradient(135deg, #ff6348, #ff7675)',
    'linear-gradient(45deg, #fd79a8, #fa8072)',
    'linear-gradient(135deg, #ff7675, #fab1a0)',
    
    // 海・空系
    'linear-gradient(45deg, #74b9ff, #0984e3)',
    'linear-gradient(135deg, #00cec9, #55a3ff)',
    'linear-gradient(45deg, #74b9ff, #00b894)',
    'linear-gradient(135deg, #0984e3, #74b9ff)'
];

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
    setupMobileOptimizations();
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // API URLとキーを設定から取得
    if (window.API_BASE_URL) {
        API_BASE_URL = window.API_BASE_URL;
    }
    if (window.API_KEY) {
        API_KEY = window.API_KEY;
    }
    
    console.log('初期化:', { API_BASE_URL, hasApiKey: !!API_KEY });
    

    // GSAPプラグインを登録
    gsap.registerPlugin(Draggable);
    

    // 即座にローディング表示を開始
    showLoadingIndicator();
    
    // APIの疎通確認
    checkApiConnection();
      
    // 既存のメッセージを取得して表示
    loadExistingMessages();
    
    // メッセージの定期取得を開始
    startMessagePolling();
    
    // 定期的なお祝いエフェクト開始
    startPeriodicCelebration();
    
    // 追加の定期エフェクト（画面を常に活発に保つ）
    startContinuousEffects();
    
    // GSAP初期設定
    gsap.set('.gift-btn', { scale: 1 });
}

// 連続エフェクトで画面を常に活発に保つ（60%に調整）
function startContinuousEffects() {
    // 5-12秒ごとに小さなエフェクトを実行（間隔を延長）
    setInterval(() => {
        // 60%の確率でエフェクトを実行
        if (Math.random() < 0.6) {
            const miniEffects = [
                () => createSparkleEffect(),
                () => createFloatingHearts(),
                () => {
                    // ランダムメッセージを表示
                    const randomMessages = [
                        '✨', '🎉', '💖', '🌟', '🎊', '💫', '🎈', '🥳'
                    ];
                    const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
                    createFireworkMessage(randomMsg);
                }
            ];
            
            const randomMiniEffect = miniEffects[Math.floor(Math.random() * miniEffects.length)];
            randomMiniEffect();
        }
    }, Math.random() * 7000 + 5000); // 5-12秒間隔に延長
}

function setupEventListeners() {
    // Enter キーでメッセージ送信
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // ウィンドウリサイズ時の対応
    window.addEventListener('resize', function() {
        // アクティブな花火メッセージの最大幅を再調整
        const screenWidth = window.innerWidth;
        const maxWidth = screenWidth > 768 ? 400 : screenWidth - 60;
        
        activeFireworks.forEach(firework => {
            firework.style.maxWidth = maxWidth + 'px';
        });
    });
      // ボタンのホバーエフェクト（ギフトボタンのみ）
    document.querySelector('.gift-btn').addEventListener('mouseenter', function() {
        gsap.to(this, { scale: 1.1, duration: 0.3, ease: "elastic.out(1, 0.3)" });
    });
    
    document.querySelector('.gift-btn').addEventListener('mouseleave', function() {
        gsap.to(this, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.3)" });
    });
}

// ローディングインジケーターを表示する関数
function showLoadingIndicator() {
    createFireworkMessage('🔄 メッセージを読み込み中...');
    
    // ローディング中も複数のエフェクトで空白感を完全に排除
    setTimeout(() => {
        createSparkleEffect();
        createFloatingHearts();
    }, 300);
    
    setTimeout(() => {
        createBubbleFloat();
        createConfettiEffect();
    }, 800);
    
    setTimeout(() => {
        createHeartRain();
    }, 1200);
    
    // ローディング中にも追加メッセージを表示
    const loadingMessages = [
        '🌟 準備中です...',
        '✨ もうすぐです！',
        '🎉 お楽しみに！'
    ];
    
    loadingMessages.forEach((msg, index) => {
        setTimeout(() => {
            createFireworkMessage(msg);
        }, (index + 1) * 600);
    });
}

// ローディングインジケーターをクリアする関数
function clearLoadingIndicator() {
    // 既存のローディングメッセージを削除
    const loadingMessages = document.querySelectorAll('.message-firework');
    loadingMessages.forEach(msg => {
        if (msg.textContent.includes('🔄 メッセージを読み込み中')) {
            gsap.to(msg, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                onComplete: () => {
                    if (msg.parentNode) {
                        msg.parentNode.removeChild(msg);
                    }
                }
            });
        }
    });
}

// 花火メッセージを作成する関数
function createFireworkMessage(message) {
    const firework = document.createElement('div');
    firework.className = 'message-firework';
    firework.textContent = message;
    
    // メッセージ内容に応じてグラデーションを選択
    let selectedGradient;
    
    // 特定のキーワードに応じて色合いを変更
    if (message.includes('❤️') || message.includes('💖') || message.includes('💕') || message.includes('愛') || message.includes('好き')) {
        // 愛情系：暖色系グラデーション
        const loveGradients = gradients.slice(0, 8); // 暖色系の最初の8個
        selectedGradient = loveGradients[Math.floor(Math.random() * loveGradients.length)];
    } else if (message.includes('🎉') || message.includes('🎊') || message.includes('おめでとう') || message.includes('祝')) {
        // お祝い系：明るい多色グラデーション
        const celebrationGradients = gradients.slice(32, 42); // 虹色・マルチカラー系
        selectedGradient = celebrationGradients[Math.floor(Math.random() * celebrationGradients.length)];
    } else if (message.includes('✨') || message.includes('⭐') || message.includes('🌟') || message.includes('キラキラ')) {
        // キラキラ系：ゴールド・シルバー系
        const sparkleGradients = gradients.slice(24, 32); // ゴールド・シルバー系
        selectedGradient = sparkleGradients[Math.floor(Math.random() * sparkleGradients.length)];
    } else if (message.includes('🌊') || message.includes('💙') || message.includes('青') || message.includes('海') || message.includes('空')) {
        // 海・空系：寒色系グラデーション
        const blueGradients = gradients.slice(8, 16); // 寒色系
        selectedGradient = blueGradients[Math.floor(Math.random() * blueGradients.length)];
    } else if (message.includes('🌸') || message.includes('桜') || message.includes('春') || message.includes('ピンク')) {
        // 春・桜系：パステル系
        const pastelGradients = gradients.slice(42, 48); // パステル系
        selectedGradient = pastelGradients[Math.floor(Math.random() * pastelGradients.length)];
    } else if (message.includes('🔥') || message.includes('熱い') || message.includes('情熱') || message.includes('やふ')) {
        // 熱情・エネルギー系：ネオン系
        const energyGradients = gradients.slice(52, 58); // ネオン系
        selectedGradient = energyGradients[Math.floor(Math.random() * energyGradients.length)];
    } else {
        // 通常のメッセージ：全ての中からランダム
        selectedGradient = gradients[Math.floor(Math.random() * gradients.length)];
    }
    
    firework.style.background = selectedGradient;
    
    // レスポンシブ対応：画面サイズに応じてメッセージ幅を調整
    const screenWidth = window.innerWidth;
    const maxWidth = screenWidth > 768 ? 400 : screenWidth - 60;
    firework.style.maxWidth = maxWidth + 'px';
    
    // 画面の下部からランダムな横位置でスタート（マージンを考慮）
    // モバイル対応：メッセージを中央寄りに配置
    const margin = screenWidth > 768 ? 100 : 30;
    let startX;
    
    if (screenWidth <= 768) {
        // モバイル・タブレット：画面中央寄りに配置
        const centerX = screenWidth / 2;
        const range = Math.min(screenWidth * 0.3, 150); // 中央から左右150px以内
        startX = centerX + (Math.random() - 0.5) * range - maxWidth / 2;
        startX = Math.max(margin, Math.min(startX, screenWidth - maxWidth - margin));
    } else {
        // デスクトップ：従来通り
        startX = Math.random() * (screenWidth - maxWidth - margin * 2) + margin;
    }
    
    const startY = window.innerHeight;
    
    firework.style.left = startX + 'px';
    firework.style.bottom = '0px';
    
    fireworksArea.appendChild(firework);
    
    // ドラッグ機能を追加
    makeDraggable(firework);
    
    // 花火のような軌道でアニメーション（横移動を控えめに）
    const endX = startX + (Math.random() - 0.5) * 80; // 横移動を80pxに制限
    const endY = Math.random() * (window.innerHeight * 0.3) + window.innerHeight * 0.2; // 画面の20%-50%の高さ
    const duration = Math.random() * 2 + 3; // 3-5秒のランダム
    
    // GSAPで打ち上げアニメーション（回転を控えめに）
    gsap.fromTo(firework, {
        scale: 0.5,
        opacity: 0,
        rotation: Math.random() * 60 - 30 // -30度から30度の範囲に制限
    }, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
    });
    
    gsap.to(firework, {
        x: endX - startX,
        y: -endY,
        duration: duration,
        ease: "power2.out",
        onComplete: () => {
            // フェードアウト
            gsap.to(firework, {
                opacity: 0,
                scale: 0.8,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    if (firework.parentNode) {
                        firework.parentNode.removeChild(firework);
                    }
                    // activeFireworksから削除
                    const index = activeFireworks.indexOf(firework);
                    if (index > -1) {
                        activeFireworks.splice(index, 1);
                    }
                }
            });
        }
    });
    
    // 回転を大幅に減らす（ゆっくりと軽い回転のみ）
    gsap.to(firework, {
        rotation: (Math.random() - 0.5) * 60, // -30度から30度のゆっくりした回転
        duration: duration + 1,
        ease: "sine.inOut"
    });
    
    activeFireworks.push(firework);
    return firework;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // 花火メッセージを作成
    createFireworkMessage(message);
    
    // 入力フィールドをクリア
    messageInput.value = '';
    
    // APIにメッセージを送信
    const result = await sendMessageToAPI(message);
    if (result) {        // 成功時にキラキラエフェクト
        createSparkleEffect();
    }
}

function sendGift() {
    const giftMessage = '🎁 ギフト爆弾！';
    const firework = createFireworkMessage(giftMessage);
    
    // ギフト専用のエフェクト
    gsap.to(firework, {
        scale: 1.3,
        duration: 0.3,
        yoyo: true,
        repeat: 3,
        ease: "power2.inOut"
    });
    
    // ギフト爆弾エフェクト
    createGiftExplosion();
    
    // APIに送信
    sendMessageToAPI(giftMessage);
}

async function sendMessageToAPI(message) {
    try {
        // URL構築（APIキーがある場合はクエリパラメータとして追加）
        let url = `${API_BASE_URL}/PostComment`;
        if (API_KEY) {
            url += `?code=${encodeURIComponent(API_KEY)}`;
        }
        
        const requestData = {
            method: 'POST',
            url: url,
            headers: { 'Content-Type': 'application/json' },
            body: { message: message }
        };
        
        console.log('HTTP リクエスト送信:', requestData);
        logToDebugPanel('request', requestData);
        
        // HTTPリクエストを送信
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        
        const responseData = {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url
        };
        
        console.log('HTTP レスポンス:', responseData);
        
        if (response.ok) {
            const jsonResponse = await response.json();
            responseData.body = jsonResponse;
            logToDebugPanel('response', responseData);
            
            console.log('API レスポンス:', jsonResponse);
            
            // 成功時の処理
            showSuccessMessage(jsonResponse.message || '送信完了！');
            return jsonResponse;
        } else {
            const errorText = await response.text();
            responseData.body = errorText;
            responseData.error = true;
            logToDebugPanel('response', responseData);
            
            console.error('API エラー:', { status: response.status, error: errorText });
            showErrorMessage(`送信エラー: ${response.status}`);
            return null;
        }
    } catch (error) {
        const errorData = {
            error: true,
            message: error.message,
            stack: error.stack
        };
        
        logToDebugPanel('response', errorData);
        console.error('HTTP リクエストエラー:', error);
        showErrorMessage('ネットワークエラーが発生しました');
        return null;
    }
}

function createConfettiEffect() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '0px';
        effectsCanvas.appendChild(confetti);
        
        gsap.to(confetti, {
            y: window.innerHeight + 100,
            x: (Math.random() - 0.5) * 200,
            rotation: Math.random() * 360,
            duration: Math.random() * 3 + 2,
            ease: "power2.in",
            onComplete: () => {
                confetti.remove();
            }
        });
    }
}

function createFloatingHearts() {
    const hearts = ['💖', '💕', '💗', '💓', '💝'];
    
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.className = 'particle';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 80 + 10 + '%';
        heart.style.top = '100%';
        effectsCanvas.appendChild(heart);
        
        gsap.to(heart, {
            y: -window.innerHeight - 100,
            x: (Math.random() - 0.5) * 100,
            rotation: Math.random() * 360,
            scale: Math.random() * 0.5 + 0.5,
            duration: Math.random() * 2 + 3,
            ease: "power1.out",
            onComplete: () => {
                heart.remove();
            }
        });
    }
}

function createGiftExplosion() {
    const emojis = ['🎁', '🎉', '🎊', '✨', '🌟', '💫', '🎈', '🎂'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.left = '50%';
        particle.style.top = '50%';
        effectsCanvas.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 20;
        const velocity = Math.random() * 200 + 100;
        
        gsap.to(particle, {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity,
            rotation: Math.random() * 720,
            scale: Math.random() * 1.5 + 0.5,
            duration: 2,
            ease: "power2.out",
            onComplete: () => {
                particle.remove();
            }
        });
        
        gsap.to(particle, {
            opacity: 0,
            duration: 2,
            ease: "power2.in"
        });
    }
}

// スクロール機能は花火形式では不要

// 定期的にメッセージを取得する関数
let lastMessageCount = 0;

function startMessagePolling() {
    async function pollMessages() {
        try {
            let url = `${API_BASE_URL}/GetComments`;
            if (API_KEY) {
                url += `?code=${encodeURIComponent(API_KEY)}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const comments = await response.json();
                
                // メッセージ表示頻度を軽減
                if (comments && Array.isArray(comments) && comments.length > 0) {
                    // ランダム表示数を削減
                    const randomCount = Math.floor(Math.random() * 6) + 3; // 3-8個をランダム表示（5-14から削減）
                    const randomComments = [];
                    for (let i = 0; i < randomCount; i++) {
                        const randomIndex = Math.floor(Math.random() * comments.length);
                        randomComments.push(comments[randomIndex]);
                    }
                    displayNewMessages(randomComments);
                }
            }
        } catch (error) {
            console.error('メッセージ取得エラー:', error);
        } finally {
            // ポーリング間隔を延長（2秒から3秒）
            setTimeout(pollMessages, 3000);
        }
    }
    
    // 初回実行
    pollMessages();
}

// 新しいメッセージを花火形式で表示する関数
function displayNewMessages(newMessages) {
    // 新着メッセージの表示数を適度に調整（軽量化）
    const maxNewMessages = Math.min(newMessages.length, 15); // 最大15件に削減（25件から）
    const selectedMessages = newMessages.slice(0, maxNewMessages);
    
    // 重複表示を軽減
    const enhancedMessages = [...selectedMessages];
    if (selectedMessages.length > 5) {
        enhancedMessages.push(...selectedMessages.slice(0, 5)); // 重複を5件に削減
    }
    
    enhancedMessages.forEach((comment, index) => {
        // 遅延時間を延長（0.8-1.5秒）
        const randomDelay = Math.random() * 700 + 800;
        
        setTimeout(() => {
            createFireworkMessage(comment.message);
            // エフェクトの確率を軽減
            if (Math.random() < 0.55) { // 55%の確率でエフェクト（90%から削減）
                setTimeout(() => {
                    const effects = [createSparkleEffect, createFloatingHearts, createBubbleFloat];
                    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                    randomEffect();
                }, 500); // 遅延も延長
            }
        }, randomDelay);
    });
}

// 既存メッセージを花火形式で表示する関数を修正
function displayExistingMessages(comments) {
    // 表示数を適度に調整（軽量化）
    const maxDisplayCount = Math.min(comments.length, 30); // 最大30件に削減（50件から）
    const selectedComments = comments.slice(0, maxDisplayCount);
    
    // 重複表示を軽減
    const duplicatedComments = [...selectedComments, ...selectedComments.slice(0, 10)]; // 重複を10件に削減
    
    duplicatedComments.forEach((comment, index) => {
        const delay = index * 600; // 0.6秒間隔に延長（0.4秒から）
        setTimeout(() => {
            createFireworkMessage(comment.message);
        }, delay);
    });
    
    // エフェクトの同時実行を減らす
    setTimeout(() => {
        if (Math.random() < 0.6) createConfettiEffect(); // 60%の確率
    }, 1000);
    
    setTimeout(() => {
        if (Math.random() < 0.6) createHeartRain(); // 60%の確率
    }, 3000);
    
    setTimeout(() => {
        if (Math.random() < 0.6) createStarShower(); // 60%の確率
    }, 5000);
}

// ウェルカムメッセージを表示する関数
function displayWelcomeMessage() {
    const welcomeMessages = [
        '🎉 なんでもCopilot一周年おめでとう！',
        '✨ みんなでお祝いしましょう！',
        '💖 素敵なメッセージをお待ちしています',
        '🎊 盛り上がっていきましょう！',
        '🌟 たくさんのメッセージをどうぞ！',
        '🚀 最高の一周年記念！',
        '🎈 みんなありがとう！',
        '🥳 お祝いの時間です！',
        '💫 きらめく瞬間を共に！',
        '🎭 楽しい時間の始まり！'
    ];
    
    // ウェルカムメッセージを重複表示でさらに盛り上げ
    const duplicatedMessages = [...welcomeMessages, ...welcomeMessages.slice(0, 5)];
    
    duplicatedMessages.forEach((message, index) => {
        setTimeout(() => {
            createFireworkMessage(message);
        }, index * 800); // 0.8秒間隔で表示
    });
    
    // ウェルカム後に複数のエフェクトを連続実行
    setTimeout(() => {
        createHeartRain();
        createConfettiEffect();
    }, 2000);
    
    setTimeout(() => {
        createStarShower();
        createBubbleFloat();
    }, 4000);
    
    setTimeout(() => {
        createRainbowEffect();
        createGiftExplosion();
    }, 6000);
}

// タイムスタンプをフォーマットする関数
function formatTimestamp(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) {
        return 'たった今';
    } else if (minutes < 60) {
        return `${minutes}分前`;
    } else if (hours < 24) {
        return `${hours}時間前`;
    } else if (days < 7) {
        return `${days}日前`;
    } else {
        return date.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// スパークル効果を生成する関数
function createSparkleEffect(targetElement) {
    const sparkles = ['✨', '⭐', '💫', '🌟', '💖', '💕'];
    const sparkleCount = Math.floor(Math.random() * 8) + 5;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        sparkle.style.position = 'absolute';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1000';
        sparkle.style.fontSize = Math.random() * 8 + 12 + 'px';
        
        // ターゲット要素の位置を基準にスパークルを配置
        const rect = targetElement.getBoundingClientRect();
        const containerRect = messagesContainer.getBoundingClientRect();
        
        sparkle.style.left = (rect.left - containerRect.left + Math.random() * rect.width) + 'px';
        sparkle.style.top = (rect.top - containerRect.top + Math.random() * rect.height) + 'px';
        
        messagesContainer.appendChild(sparkle);
        
        // ランダムな方向と距離でアニメーション
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 30;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;
          gsap.fromTo(sparkle, 
            { 
                opacity: 0, 
                scale: 0.3,
                rotation: 0
            },
            { 
                opacity: 1, 
                scale: 1.2,
                rotation: 120, // 回転を120度に制限
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {                    // フェードアウトしながら移動
                    gsap.to(sparkle, {
                        x: targetX,
                        y: targetY,
                        opacity: 0,
                        scale: 0.5,
                        rotation: 180, // 回転を180度に制限
                        duration: 0.8,
                        ease: "power2.in",
                        onComplete: () => sparkle.remove()
                    });
                }
            }
        );
    }
}

// 音波効果を生成する関数
function createSoundWaveEffect(targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const containerRect = messagesContainer.getBoundingClientRect();
    
    // 中心点を計算
    const centerX = rect.left - containerRect.left + rect.width / 2;
    const centerY = rect.top - containerRect.top + rect.height / 2;
    
    // 複数の同心円を作成
    for (let i = 0; i < 3; i++) {
        const wave = document.createElement('div');
        wave.style.position = 'absolute';
        wave.style.left = centerX + 'px';
        wave.style.top = centerY + 'px';
        wave.style.width = '0px';
        wave.style.height = '0px';
        wave.style.border = '2px solid rgba(255, 215, 0, 0.6)';
        wave.style.borderRadius = '50%';
        wave.style.pointerEvents = 'none';
        wave.style.transform = 'translate(-50%, -50%)';
        wave.style.zIndex = '999';
        
        messagesContainer.appendChild(wave);
        
        gsap.to(wave, {
            width: '100px',
            height: '100px',
            opacity: 0,
            duration: 1,
            delay: i * 0.2,
            ease: "power2.out",
            onComplete: () => wave.remove()
        });
    }
}

// エフェクト実行制限関数（パフォーマンス向上）
function canRunEffect() {
    return activeEffectsCount < MAX_ACTIVE_EFFECTS;
}

function startEffect() {
    activeEffectsCount++;
    console.log('エフェクト開始 - 実行中:', activeEffectsCount);
}

function endEffect() {
    activeEffectsCount = Math.max(0, activeEffectsCount - 1);
    console.log('エフェクト終了 - 実行中:', activeEffectsCount);
}

// 改良されたエフェクトラッパー関数
function safeRunEffect(effectFunction) {
    if (canRunEffect()) {
        startEffect();
        try {
            effectFunction();
        } catch (error) {
            console.error('エフェクト実行エラー:', error);
        }
        // 効果時間後にカウンターを減らす（大体5秒後）
        setTimeout(() => endEffect(), 5000);
    } else {
        console.log('エフェクト制限により実行をスキップ');
    }
}

// 定期的なお祝いエフェクトを開始する関数
function startPeriodicCelebration() {
    // 8-20秒ごとにランダムでエフェクトを実行（軽量化）
    setInterval(() => {
        if (Math.random() < 0.55) { // 55%の確率でエフェクト実行（90%から削減）
            const effects = [
                createHeartRain,
                createStarShower,
                createBubbleFloat,
                createRainbowEffect,
                createConfettiStorm,
                createGiftExplosion,
                createFloatingHearts,
                createConfettiEffect
            ];
            
            // 複数エフェクトを同時実行する頻度を大幅削減
            if (Math.random() < 0.1) {
                // 10%の確率で2つのエフェクトを同時実行（30%から削減）
                const effect1 = effects[Math.floor(Math.random() * effects.length)];
                const effect2 = effects[Math.floor(Math.random() * effects.length)];
                effect1();
                setTimeout(() => effect2(), 1500); // 間隔を延長
            } else {
                const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                randomEffect();
            }
        }
    }, Math.random() * 12000 + 8000); // 8-20秒のランダム間隔（5-15秒から延長）
}

// ハートの雨エフェクト（軽量化）
function createHeartRain() {
    const hearts = ['💖', '💗', '💕', '💝', '💞', '❤️', '🧡', '💛', '💚', '💙', '💜'];
    const heartCount = Math.floor(Math.random() * 7) + 5; // 5-11個に削減（8-19個から）
    
    for (let i = 0; i < heartCount; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.top = '-50px';
            heart.style.fontSize = Math.random() * 10 + 18 + 'px'; // サイズを削減（15+20から）
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '1000';
            heart.style.filter = 'drop-shadow(0 0 8px rgba(255, 182, 193, 0.7))'; // エフェクトを軽減
            
            document.body.appendChild(heart);
            
            gsap.to(heart, {
                y: window.innerHeight + 100,
                x: (Math.random() - 0.5) * 120, // 横移動を活発に
                rotation: Math.random() * 360, // 回転を激しく
                scale: [1, 1.5, 0.8], // スケール変化を激しく
                duration: Math.random() * 3 + 4,
                ease: "none",
                onComplete: () => heart.remove()
            });
        }, i * 200); // 間隔を短く
    }
}

// 星のシャワーエフェクト
function createStarShower() {
    const stars = ['⭐', '🌟', '✨', '💫', '🌠', '☄️', '🔥'];
    const starCount = Math.floor(Math.random() * 8) + 6; // 6-13個に削減（10-24個から）
    
    for (let i = 0; i < starCount; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.textContent = stars[Math.floor(Math.random() * stars.length)];
            star.style.position = 'fixed';
            star.style.left = Math.random() * window.innerWidth + 'px';
            star.style.top = '-50px';
            star.style.fontSize = Math.random() * 10 + 16 + 'px'; // サイズを削減（15+18から）
            star.style.pointerEvents = 'none';
            star.style.zIndex = '1000';
            star.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))'; // エフェクトを軽減
            
            document.body.appendChild(star);
            
            gsap.to(star, {
                y: window.innerHeight + 100,
                x: (Math.random() - 0.5) * 120, // 横移動を軽減（200から）
                rotation: Math.random() * 360, // 回転を1回転まで（720から）
                scale: [1, 1.5, 0.7], // スケール変化を軽減
                duration: Math.random() * 4 + 3,
                ease: "power2.out",
                onComplete: () => star.remove()
            });
        }, i * 150); // 間隔を延長（100から）
    }
}

// バブル浮遊エフェクト（軽量化）
function createBubbleFloat() {
    const bubbles = ['🫧', '💙', '🩵', '💎', '🔮', '💍', '🌊'];
    const bubbleCount = Math.floor(Math.random() * 5) + 4; // 4-8個に削減（6-13個から）
    
    for (let i = 0; i < bubbleCount; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.textContent = bubbles[Math.floor(Math.random() * bubbles.length)];
            bubble.style.position = 'fixed';
            bubble.style.left = Math.random() * window.innerWidth + 'px';
            bubble.style.bottom = '-50px';
            bubble.style.fontSize = Math.random() * 12 + 18 + 'px'; // サイズを大きく
            bubble.style.pointerEvents = 'none';
            bubble.style.zIndex = '1000';
            bubble.style.filter = 'drop-shadow(0 0 8px rgba(173, 216, 230, 0.8))'; // エフェクトを強化
            
            document.body.appendChild(bubble);
            
            gsap.to(bubble, {
                y: -(window.innerHeight + 100),
                x: (Math.random() - 0.5) * 100, // 横移動を活発に
                rotation: Math.random() * 360, // 回転を激しく
                scale: [0.8, 1.3, 0.6], // スケール変化を激しく
                duration: Math.random() * 4 + 5,
                ease: "sine.inOut",
                onComplete: () => bubble.remove()
            });
        }, i * 300); // 間隔を短く
    }
}

// レインボーエフェクト
function createRainbowEffect() {
    const colors = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🩷'];
    
    colors.forEach((color, index) => {
        setTimeout(() => {
            const rainbow = document.createElement('div');
            rainbow.textContent = color;
            rainbow.style.position = 'fixed';
            rainbow.style.left = '-50px';
            rainbow.style.top = Math.random() * (window.innerHeight - 100) + 50 + 'px';
            rainbow.style.fontSize = '30px';
            rainbow.style.pointerEvents = 'none';
            rainbow.style.zIndex = '1000';
            rainbow.style.filter = 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))';
            
            document.body.appendChild(rainbow);
              gsap.to(rainbow, {
                x: window.innerWidth + 100,
                rotation: 180, // 回転を180度に制限
                scale: [1, 1.5, 1],
                duration: 3,
                ease: "power2.inOut",
                onComplete: () => rainbow.remove()
            });
        }, index * 100);
    });
}

// 紙吹雪の嵐エフェクト
function createConfettiStorm() {
    const confettiColors = ['🎊', '🎉', '🎈', '🎁', '🎂', '🍰', '🥳', '🎭', '🎪', '🎨'];
    const confettiCount = Math.floor(Math.random() * 12) + 10; // 10-21個に削減（20-44個から）
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.textContent = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-50px';
            confetti.style.fontSize = Math.random() * 8 + 18 + 'px'; // サイズを削減（12+22から）
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '1000';
            confetti.style.filter = 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))'; // エフェクトを軽減
            
            document.body.appendChild(confetti);
            
            gsap.to(confetti, {
                y: window.innerHeight + 100,
                x: (Math.random() - 0.5) * 180, // 横移動を軽減（300から）
                rotation: Math.random() * 720, // 回転を2回転まで（1080から）
                scale: [1, 1.5, 0.5], // スケール変化を軽減
                duration: Math.random() * 4 + 2,
                ease: "power1.inOut",
                onComplete: () => confetti.remove()
            });
        }, i * 80); // 間隔を延長（50から）
    }
}

// 改良されたキラキラエフェクト
function createSparkleEffect() {
    const sparkles = ['✨', '⭐', '💫', '🌟', '💖', '💕'];
    const sparkleCount = Math.floor(Math.random() * 8) + 5;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        sparkle.style.position = 'fixed';
        sparkle.style.left = Math.random() * window.innerWidth + 'px';
        sparkle.style.top = Math.random() * window.innerHeight + 'px';
        sparkle.style.fontSize = Math.random() * 10 + 16 + 'px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1000';
        sparkle.style.filter = 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))';
        
        document.body.appendChild(sparkle);
          gsap.fromTo(sparkle, {
            scale: 0,
            rotation: 0,
            opacity: 0
        }, {
            scale: [0.5, 1.2, 0],
            rotation: 180, // 回転を180度に制限
            opacity: [0, 1, 0],
            duration: 1.5,
            ease: "power2.out",
            onComplete: () => sparkle.remove()
        });
    }
}

// 成功メッセージを花火形式で表示
function showSuccessMessage(message) {
    createFireworkMessage(`✅ ${message}`);
    createSparkleEffect();
}

// エラーメッセージを花火形式で表示
function showErrorMessage(message) {
    const errorFirework = createFireworkMessage(`❌ ${message}`);
    // エラーメッセージは赤いグラデーション
    errorFirework.style.background = 'linear-gradient(45deg, #ff6b6b, #ff5252)';
}

// HTTPリクエストの詳細ログを表示（デバッグ用）
function showRequestLog(method, url, headers, body, response) {
    if (window.location.hostname === 'localhost') {
        console.group('🌐 HTTP Request Details');
        console.log('Method:', method);
        console.log('URL:', url);
        console.log('Headers:', headers);
        console.log('Body:', body);
        console.log('Response:', response);
        console.groupEnd();
    }
}

// ステータス表示を更新
function updateStatusDisplay() {
    const environmentStatus = document.getElementById('environmentStatus');
    const apiStatus = document.getElementById('apiStatus');
    
    if (environmentStatus && apiStatus) {
        // 環境情報を表示
        const env = getEnvironment();
        const envEmoji = env === 'development' ? '🔧' : env === 'staticWebApp' ? '☁️' : '🌐';
        environmentStatus.innerHTML = `${envEmoji} 環境: ${env}`;
        
        // API情報を表示
        const apiEmoji = API_KEY ? '🔑' : '🔓';
        const apiUrl = API_BASE_URL.replace(/^https?:\/\//, '');
        apiStatus.innerHTML = `${apiEmoji} API: ${apiUrl}`;
    }
}

// API接続確認
async function checkApiConnection() {
    const apiStatus = document.getElementById('apiStatus');
    if (!apiStatus) return;
    
    try {
        let url = `${API_BASE_URL}/PostComment`;
        if (API_KEY) {
            url += `?code=${encodeURIComponent(API_KEY)}`;
        }
        
        // GETリクエストでAPI接続を確認
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            apiStatus.innerHTML = `✅ API: 接続OK - ${API_BASE_URL.replace(/^https?:\/\//, '')}`;
            apiStatus.style.color = '#4caf50';
        } else {
            apiStatus.innerHTML = `⚠️ API: エラー ${response.status} - ${API_BASE_URL.replace(/^https?:\/\//, '')}`;
            apiStatus.style.color = '#ff9800';
        }
    } catch (error) {
        apiStatus.innerHTML = `❌ API: 接続失敗 - ${API_BASE_URL.replace(/^https?:\/\//, '')}`;
        apiStatus.style.color = '#f44336';
        console.error('API接続確認エラー:', error);
    }
}

// 環境判定関数（config.jsから移動）
function getEnvironment() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    } else if (hostname.includes('azurestaticapps.net')) {
        return 'staticWebApp';
    } else {
        return 'production';
    }
}

// デバッグパネルの制御
function toggleDebugPanel() {
    const debugContent = document.getElementById('debugContent');
    if (debugContent) {
        debugContent.classList.toggle('open');
    }
}

// デバッグ情報を更新
function updateDebugInfo() {
    if (getEnvironment() !== 'development') return;
    
    const debugEnv = document.getElementById('debugEnv');
    const debugApi = document.getElementById('debugApi');
    
    if (debugEnv) {
        debugEnv.textContent = `Environment: ${getEnvironment()}\nHostname: ${window.location.hostname}\nProtocol: ${window.location.protocol}`;
    }
    
    if (debugApi) {
        debugApi.textContent = `Base URL: ${API_BASE_URL}\nHas API Key: ${!!API_KEY}\nKey Length: ${API_KEY ? API_KEY.length : 0}`;
    }
}

// リクエスト/レスポンスをデバッグパネルに記録
function logToDebugPanel(type, data) {
    if (getEnvironment() !== 'development') return;
    
    const debugRequest = document.getElementById('debugRequest');
    const debugResponse = document.getElementById('debugResponse');
    
    if (type === 'request' && debugRequest) {
        debugRequest.textContent = JSON.stringify(data, null, 2);
    } else if (type === 'response' && debugResponse) {
        debugResponse.textContent = JSON.stringify(data, null, 2);
    }
}

// ページ読み込み時にデバッグ情報を初期化
window.addEventListener('load', () => {
    updateDebugInfo();
    
    // デバッグパネルを開発環境でのみ表示
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel && getEnvironment() === 'development') {
        debugPanel.style.display = 'block';
    } else if (debugPanel) {
        debugPanel.style.display = 'none';
    }
});

// 既存のメッセージを取得して表示する関数
async function loadExistingMessages() {
    try {
        // URL構築（APIキーがある場合はクエリパラメータとして追加）
        let url = `${API_BASE_URL}/GetComments`;
        if (API_KEY) {
            url += `?code=${encodeURIComponent(API_KEY)}`;
        }
        
        console.log('既存メッセージ取得中:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
          if (response.ok) {
            const comments = await response.json();
            console.log('取得したメッセージ:', comments);
            
            // メッセージ数を記録（ポーリング用）
            if (comments && Array.isArray(comments)) {
                lastMessageCount = comments.length;
            }
            
            // メッセージがある場合は表示
            if (comments && Array.isArray(comments) && comments.length > 0) {
                // ローディング表示をクリア
                clearLoadingIndicator();
                displayExistingMessages(comments);
            } else {
                // メッセージがない場合はウェルカムメッセージを表示
                clearLoadingIndicator();
                displayWelcomeMessage();
            }
        } else {
            console.error('メッセージ取得エラー:', response.status, response.statusText);
            // エラーの場合はウェルカムメッセージを表示
            clearLoadingIndicator();
            displayWelcomeMessage();
        }
    } catch (error) {
        console.error('メッセージ取得エラー:', error);
        // エラーの場合はウェルカムメッセージを表示
        clearLoadingIndicator();
        displayWelcomeMessage();
    }
}


// メッセージを削除するエフェクト付き関数
function removeMessageWithEffect(element) {
    // 削除エフェクト：爆発のようなアニメーション
    createRemovalExplosion(element);
    
    // 要素を縮小して透明化
    gsap.to(element, {
        scale: 0,
        opacity: 0,
        rotation: Math.random() * 360,
        duration: 0.8,
        ease: "back.in(1.7)",
        onComplete: () => {
            // DOM から削除
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            // activeFireworks 配列からも削除
            const index = activeFireworks.indexOf(element);
            if (index > -1) {
                activeFireworks.splice(index, 1);
            }
        }
    });
    
    // 削除音の代わりにサウンドエフェクト（視覚的）
    createSoundWaveEffect(element);
}

// 削除時の爆発エフェクト
function createRemovalExplosion(element) {
    const explosionEmojis = ['💥', '✨', '🌟', '💫', '⭐', '🎆', '🎇', '💢'];
    const particleCount = 8;
    
    const rect = element.getBoundingClientRect();
    const containerRect = fireworksArea.getBoundingClientRect();
    
    const centerX = rect.left - containerRect.left + rect.width / 2;
    const centerY = rect.top - containerRect.top + rect.height / 2;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.textContent = explosionEmojis[Math.floor(Math.random() * explosionEmojis.length)];
        particle.style.position = 'absolute';
        particle.style.pointerEvents = 'none';
        particle.style.fontSize = '20px';
        particle.style.zIndex = '1500';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.transform = 'translate(-50%, -50%)';
        
        fireworksArea.appendChild(particle);
        
        // 放射状に散らばるアニメーション
        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = Math.random() * 80 + 60;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;
        
        gsap.fromTo(particle, {
            scale: 0,
            opacity: 1
        }, {
            scale: [1.5, 0],
            opacity: [1, 0],
            x: targetX,
            y: targetY,
            rotation: Math.random() * 720,
            duration: 1.2,
            ease: "power2.out",
            onComplete: () => particle.remove()
        });
    }
}

// 削除確認のための視覚的フィードバック強化
function enhanceDraggedMessageAppearance(element) {
    // ドラッグ済みメッセージの外観を変更
    gsap.to(element, {
        borderWidth: '3px',
        borderStyle: 'dashed',
        borderColor: 'rgba(255, 255, 255, 0.8)',
        duration: 0.5,
        ease: "power2.out"
    });
    
    // 削除可能であることを示すアイコンを追加
    const deleteIcon = document.createElement('span');
    deleteIcon.textContent = '❌';
    deleteIcon.style.position = 'absolute';
    deleteIcon.style.top = '-5px';
    deleteIcon.style.right = '-5px';
    deleteIcon.style.fontSize = '14px';
    deleteIcon.style.background = 'rgba(255, 255, 255, 0.9)';
    deleteIcon.style.borderRadius = '50%';
    deleteIcon.style.width = '20px';
    deleteIcon.style.height = '20px';
    deleteIcon.style.display = 'flex';
    deleteIcon.style.alignItems = 'center';
    deleteIcon.style.justifyContent = 'center';
    deleteIcon.style.pointerEvents = 'none';
    deleteIcon.style.zIndex = '1';
    deleteIcon.className = 'delete-indicator';
    
    element.appendChild(deleteIcon);
    
    // アイコンをアニメーション
    gsap.fromTo(deleteIcon, {
        scale: 0,
        opacity: 0
    }, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
    });
}

// ドラッグ機能を追加する関数
function makeDraggable(element) {
    let isDragged = false; // ドラッグされたかどうかを追跡
    let dragDistance = 0; // ドラッグ距離を追跡
    
    // ドラッグ可能にする
    Draggable.create(element, {
        type: "x,y",
        bounds: fireworksArea, // 花火エリア内に制限
        inertia: true, // 慣性を有効にする
        throwProps: true, // 投げる動作を有効にする
        edgeResistance: 0.8, // 境界での抵抗
        onDragStart: function() {
            // ドラッグ開始時
            element.classList.add('dragging');
            gsap.to(element, { scale: 1.1, duration: 0.2 });
            // 自動アニメーションを停止
            gsap.killTweensOf(element);
            dragDistance = 0; // ドラッグ距離をリセット
        },
        onDrag: function() {
            // ドラッグ中のスパークルエフェクト
            if (Math.random() < 0.3) { // 30%の確率でスパークル
                createDragSparkle(element);
            }
            // ドラッグ距離を計算
            dragDistance += Math.abs(this.deltaX) + Math.abs(this.deltaY);
        },
        onDragEnd: function() {
            // ドラッグ終了時
            element.classList.remove('dragging');
            gsap.to(element, { scale: 1, duration: 0.3 });
            
            // 一定距離以上ドラッグされた場合のみ「ドラッグ済み」とマーク
            if (dragDistance > 10) { // 10px以上ドラッグされた場合
                isDragged = true;
                element.setAttribute('data-dragged', 'true');
                // ドラッグ済みの視覚的な表示を強化
                enhanceDraggedMessageAppearance(element);
            }
            
            // バウンス効果
            gsap.to(element, {
                rotation: Math.random() * 20 - 10,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
            
            // スパークルエフェクト
            createSparkleAtPosition(element);
        },
        onClick: function(e) {
            // クリック/タップ時の処理
            e.preventDefault();
            
            // ドラッグ済みの要素がクリックされた場合は削除
            if (isDragged || element.getAttribute('data-dragged') === 'true') {
                removeMessageWithEffect(element);
            } else {
                // 通常のタップエフェクト
                createTapEffect(element);
            }
        }
    });
    
    // タッチデバイス対応
    element.addEventListener('touchstart', function(e) {
        e.preventDefault(); // デフォルトのタッチ動作を防ぐ
    }, { passive: false });
}

// ドラッグ中のスパークルエフェクト
function createDragSparkle(element) {
    const sparkle = document.createElement('div');
    sparkle.textContent = '✨';
    sparkle.style.position = 'absolute';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.fontSize = '12px';
    sparkle.style.zIndex = '999';
    
    const rect = element.getBoundingClientRect();
    const containerRect = fireworksArea.getBoundingClientRect();
    
    sparkle.style.left = (rect.left - containerRect.left + Math.random() * rect.width) + 'px';
    sparkle.style.top = (rect.top - containerRect.top + Math.random() * rect.height) + 'px';
    
    fireworksArea.appendChild(sparkle);
    
    gsap.fromTo(sparkle, {
        scale: 0,
        opacity: 1
    }, {
        scale: 1.5,
        opacity: 0,
        y: -20,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => sparkle.remove()
    });
}

// 指定位置でのスパークルエフェクト
function createSparkleAtPosition(element) {
    const sparkles = ['✨', '⭐', '💫', '🌟'];
    const sparkleCount = 3;
    
    for (let i = 0; i < sparkleCount; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
            sparkle.style.position = 'absolute';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.fontSize = '16px';
            sparkle.style.zIndex = '1000';
            
            const rect = element.getBoundingClientRect();
            const containerRect = fireworksArea.getBoundingClientRect();
            
            sparkle.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
            sparkle.style.top = (rect.top - containerRect.top + rect.height / 2) + 'px';
            
            fireworksArea.appendChild(sparkle);
            
            const angle = (Math.PI * 2 * i) / sparkleCount;
            const distance = 30;
            const targetX = Math.cos(angle) * distance;
            const targetY = Math.sin(angle) * distance;
            
            gsap.fromTo(sparkle, {
                scale: 0,
                opacity: 0
            }, {
                scale: 1.5,
                opacity: 1,
                x: targetX,
                y: targetY,
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(sparkle, {
                        opacity: 0,
                        scale: 0.5,
                        duration: 0.5,
                        onComplete: () => sparkle.remove()
                    });
                }
            });
        }, i * 100);
    }
}

// タップエフェクト
function createTapEffect(element) {
    const tapEffect = document.createElement('div');
    tapEffect.style.position = 'absolute';
    tapEffect.style.pointerEvents = 'none';
    tapEffect.style.border = '2px solid rgba(255, 255, 255, 0.8)';
    tapEffect.style.borderRadius = '50%';
    tapEffect.style.zIndex = '999';
    
    const rect = element.getBoundingClientRect();
    const containerRect = fireworksArea.getBoundingClientRect();
    
    const centerX = rect.left - containerRect.left + rect.width / 2;
    const centerY = rect.top - containerRect.top + rect.height / 2;
    
    tapEffect.style.left = centerX + 'px';
    tapEffect.style.top = centerY + 'px';
    tapEffect.style.transform = 'translate(-50%, -50%)';
    
    fireworksArea.appendChild(tapEffect);
    
    gsap.fromTo(tapEffect, {
        width: '0px',
        height: '0px',
        opacity: 1
    }, {
        width: '50px',
        height: '50px',
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => tapEffect.remove()
    });
    
    // 要素を少し揺らす
    gsap.to(element, {
        rotation: Math.random() * 10 - 5,
        scale: 1.1,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
    });
}

// モバイルデバイス対応の初期設定
function setupMobileOptimizations() {
    // ビューポートメタタグの動的調整
    let viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
    }
    
    // モバイルでのスクロール防止
    document.body.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // モバイルでの拡大防止
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });
    
    // iOS Safariのバウンススクロール防止
    document.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
            return; // 入力要素とボタンは除外
        }
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
}

