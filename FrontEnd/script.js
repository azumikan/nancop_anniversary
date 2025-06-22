// API設定（config.jsから取得）
let API_BASE_URL = 'http://localhost:7028/api'; // デフォルト値
let API_KEY = ''; // APIキー

// DOM要素の取得
const fireworksArea = document.getElementById('fireworksArea');
const messageInput = document.getElementById('messageInput');
const effectsCanvas = document.getElementById('effectsCanvas');

// 花火メッセージの配列
let activeFireworks = [];

// カラフルなグラデーション配列
const gradients = [
    'linear-gradient(45deg, #ff6b6b, #ffa726)',
    'linear-gradient(45deg, #4facfe, #00f2fe)',
    'linear-gradient(45deg, #f093fb, #f5576c)',
    'linear-gradient(45deg, #4facfe, #00f2fe)',
    'linear-gradient(45deg, #a8edea, #fed6e3)',
    'linear-gradient(45deg, #ffecd2, #fcb69f)',
    'linear-gradient(45deg, #667eea, #764ba2)',
    'linear-gradient(45deg, #f093fb, #f5576c)',
    'linear-gradient(45deg, #ffecd2, #fcb69f)',
    'linear-gradient(45deg, #a8edea, #fed6e3)'
];

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
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
    
    // APIの疎通確認
    checkApiConnection();
      
    // 既存のメッセージを取得して表示
    loadExistingMessages();
    
    // メッセージの定期取得を開始
    startMessagePolling();
    
    // 定期的なお祝いエフェクト開始
    startPeriodicCelebration();
    
    // GSAP初期設定
    gsap.set('.quick-btn', { scale: 1 });
    gsap.set('.gift-btn', { scale: 1 });
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
    
    // ボタンのホバーエフェクト
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, { scale: 1.05, duration: 0.2, ease: "power2.out" });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { scale: 1, duration: 0.2, ease: "power2.out" });
        });
    });
    
    document.querySelector('.gift-btn').addEventListener('mouseenter', function() {
        gsap.to(this, { scale: 1.1, duration: 0.3, ease: "elastic.out(1, 0.3)" });
    });
    
    document.querySelector('.gift-btn').addEventListener('mouseleave', function() {
        gsap.to(this, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.3)" });
    });
}

// 花火メッセージを作成する関数
function createFireworkMessage(message) {
    const firework = document.createElement('div');
    firework.className = 'message-firework';
    firework.textContent = message;
    
    // ランダムなグラデーション背景を選択
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    firework.style.background = randomGradient;
    
    // レスポンシブ対応：画面サイズに応じてメッセージ幅を調整
    const screenWidth = window.innerWidth;
    const maxWidth = screenWidth > 768 ? 400 : screenWidth - 60;
    firework.style.maxWidth = maxWidth + 'px';
    
    // 画面の下部からランダムな横位置でスタート（マージンを考慮）
    const margin = screenWidth > 768 ? 100 : 30;
    const startX = Math.random() * (screenWidth - maxWidth - margin * 2) + margin;
    const startY = window.innerHeight;
    
    firework.style.left = startX + 'px';
    firework.style.bottom = '0px';
    
    fireworksArea.appendChild(firework);
    
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
    if (result) {
        // 成功時にキラキラエフェクト
        createSparkleEffect();
    }
}

function sendQuickMessage(message) {
    createFireworkMessage(message);
    sendMessageToAPI(message);
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
    setInterval(async () => {
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
                
                // 新しいメッセージがある場合の処理
                if (comments && Array.isArray(comments) && comments.length > lastMessageCount) {
                    const newMessages = comments.slice(0, comments.length - lastMessageCount);
                    displayNewMessages(newMessages);
                    lastMessageCount = comments.length;
                }
            }
        } catch (error) {
            console.error('メッセージ取得エラー:', error);
        }
    }, 3000); // 3秒ごとに確認
}

// 新しいメッセージを花火形式で表示する関数
function displayNewMessages(newMessages) {
    newMessages.forEach((comment, index) => {
        // ランダムな遅延時間（500ms〜2000ms）
        const randomDelay = Math.random() * 1500 + 500;
        
        setTimeout(() => {
            createFireworkMessage(comment.message);
            // 新着メッセージには特別なエフェクト
            setTimeout(() => {
                createSparkleEffect();
            }, 1000);
        }, randomDelay);
    });
}

// パフォーマンス最適化：画面外のパーティクルを削除
function cleanupParticles() {
    const particles = effectsCanvas.querySelectorAll('.particle, .confetti');
    particles.forEach(particle => {
        const rect = particle.getBoundingClientRect();
        if (rect.top > window.innerHeight + 100 || rect.bottom < -100) {
            particle.remove();
        }
    });
}

// 定期的にパーティクルをクリーンアップ
setInterval(cleanupParticles, 5000);

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
                displayExistingMessages(comments);
            } else {
                // メッセージがない場合はウェルカムメッセージを表示
                displayWelcomeMessage();
            }
        } else {
            console.error('メッセージ取得エラー:', response.status, response.statusText);
            // エラーの場合はウェルカムメッセージを表示
            displayWelcomeMessage();
        }
    } catch (error) {
        console.error('メッセージ取得エラー:', error);
        // エラーの場合はウェルカムメッセージを表示
        displayWelcomeMessage();
    }
}

// 既存メッセージを花火形式で表示する関数を修正
function displayExistingMessages(comments) {
    comments.forEach((comment, index) => {
        setTimeout(() => {
            createFireworkMessage(comment.message);
        }, index * 500); // 0.5秒間隔で順次表示
    });
}

// 新着メッセージも花火形式で表示
function displayNewMessages(newMessages) {
    newMessages.forEach((comment, index) => {
        setTimeout(() => {
            createFireworkMessage(comment.message);
            // 新着メッセージには特別なエフェクト
            setTimeout(() => {
                createSparkleEffect();
            }, 1000);
        }, index * 300);
    });
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

// 定期的なお祝いエフェクトを開始する関数
function startPeriodicCelebration() {
    // 20-40秒ごとにランダムでかわいいエフェクトを実行
    setInterval(() => {
        if (Math.random() < 0.7) { // 70%の確率でエフェクト実行
            const effects = [
                createHeartRain,
                createStarShower,
                createBubbleFloat,
                createRainbowEffect,
                createConfettiStorm
            ];
            
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            randomEffect();
        }
    }, Math.random() * 20000 + 20000); // 20-40秒のランダム間隔
}

// ハートの雨エフェクト
function createHeartRain() {
    const hearts = ['💖', '💗', '💕', '💝', '💞'];
    const heartCount = Math.floor(Math.random() * 8) + 5;
    
    for (let i = 0; i < heartCount; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.top = '-50px';
            heart.style.fontSize = Math.random() * 15 + 20 + 'px';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '1000';
            heart.style.filter = 'drop-shadow(0 0 10px rgba(255, 182, 193, 0.8))';
            
            document.body.appendChild(heart);
            
            gsap.to(heart, {
                y: window.innerHeight + 100,
                x: (Math.random() - 0.5) * 100,
                rotation: Math.random() * 360,
                duration: Math.random() * 3 + 4,
                ease: "none",
                onComplete: () => heart.remove()
            });
        }, i * 200);
    }
}

// 星のシャワーエフェクト
function createStarShower() {
    const stars = ['⭐', '🌟', '✨', '💫', '🌠'];
    const starCount = Math.floor(Math.random() * 10) + 8;
    
    for (let i = 0; i < starCount; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.textContent = stars[Math.floor(Math.random() * stars.length)];
            star.style.position = 'fixed';
            star.style.left = Math.random() * window.innerWidth + 'px';
            star.style.top = '-50px';
            star.style.fontSize = Math.random() * 12 + 16 + 'px';
            star.style.pointerEvents = 'none';
            star.style.zIndex = '1000';
            star.style.filter = 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))';
            
            document.body.appendChild(star);
            
            gsap.to(star, {
                y: window.innerHeight + 100,
                x: (Math.random() - 0.5) * 150,
                rotation: Math.random() * 720,
                scale: [1, 1.5, 0.5],
                duration: Math.random() * 4 + 3,
                ease: "power2.out",
                onComplete: () => star.remove()
            });
        }, i * 150);
    }
}

// バブル浮遊エフェクト
function createBubbleFloat() {
    const bubbles = ['🫧', '💙', '🩵', '💎', '🔮'];
    const bubbleCount = Math.floor(Math.random() * 6) + 4;
    
    for (let i = 0; i < bubbleCount; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.textContent = bubbles[Math.floor(Math.random() * bubbles.length)];
            bubble.style.position = 'fixed';
            bubble.style.left = Math.random() * window.innerWidth + 'px';
            bubble.style.bottom = '-50px';
            bubble.style.fontSize = Math.random() * 10 + 18 + 'px';
            bubble.style.pointerEvents = 'none';
            bubble.style.zIndex = '1000';
            bubble.style.filter = 'drop-shadow(0 0 6px rgba(173, 216, 230, 0.8))';
            
            document.body.appendChild(bubble);
            
            gsap.to(bubble, {
                y: -(window.innerHeight + 100),
                x: (Math.random() - 0.5) * 80,
                rotation: Math.random() * 360,
                scale: [0.8, 1.2, 0.6],
                duration: Math.random() * 5 + 5,
                ease: "sine.inOut",
                onComplete: () => bubble.remove()
            });
        }, i * 300);
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
    const confettiColors = ['🎊', '🎉', '🎈', '🎁', '🎂', '🍰'];
    const confettiCount = Math.floor(Math.random() * 15) + 12;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.textContent = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-50px';
            confetti.style.fontSize = Math.random() * 8 + 20 + 'px';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '1000';
            confetti.style.filter = 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.6))';
            
            document.body.appendChild(confetti);
            
            gsap.to(confetti, {
                y: window.innerHeight + 100,
                x: (Math.random() - 0.5) * 200,
                rotation: Math.random() * 720,
                scale: [1, 0.8, 1.2, 0.6],
                duration: Math.random() * 3 + 3,
                ease: "power1.inOut",
                onComplete: () => confetti.remove()
            });
        }, i * 100);
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
