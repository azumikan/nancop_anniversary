// API設定（config.jsから取得）
let API_BASE_URL = 'http://localhost:7028/api'; // デフォルト値
let API_KEY = ''; // APIキー

// DOM要素の取得
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const effectsCanvas = document.getElementById('effectsCanvas');

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
    
    // ステータス表示を更新
    updateStatusDisplay();
    
    // APIの疎通確認
    checkApiConnection();
      // 既存のメッセージを取得して表示
    loadExistingMessages();
    
    // メッセージの定期取得を開始
    startMessagePolling();
    
    // GSAP初期設定
    gsap.set('.celebration-btn', { scale: 1 });
    gsap.set('.gift-btn', { scale: 1 });
}

function setupEventListeners() {
    // Enter キーでメッセージ送信
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // ボタンのホバーエフェクト
    document.querySelectorAll('.celebration-btn').forEach(btn => {
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

function displayWelcomeMessage() {
    const welcomeMessage = createMessageBubble('🎉 Nancop Anniversary へようこそ！', 'celebration');
    messagesContainer.appendChild(welcomeMessage);
    
    // ウェルカムメッセージのアニメーション
    gsap.fromTo(welcomeMessage, 
        { opacity: 0, y: 50, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
    );
}

function createMessageBubble(message, type = 'user') {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${type}`;
    bubble.textContent = message;
    return bubble;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // メッセージをUIに追加
    const messageBubble = createMessageBubble(message, 'user');
    messagesContainer.appendChild(messageBubble);
    
    // 入力フィールドをクリア
    messageInput.value = '';
      // ランダムなアニメーション効果を選択
    const userAnimations = [
        // 標準の右からスライド
        {
            from: { opacity: 0, x: 50, scale: 0.8 },
            to: { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "power2.out" }
        },
        // バウンス入場
        {
            from: { opacity: 0, scale: 0.5, rotation: 10 },
            to: { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" }
        },
        // 3D回転
        {
            from: { opacity: 0, rotationY: 90, scale: 0.9 },
            to: { opacity: 1, rotationY: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
        }
    ];
    
    const randomUserAnimation = userAnimations[Math.floor(Math.random() * userAnimations.length)];
    
    gsap.fromTo(messageBubble, randomUserAnimation.from, {
        ...randomUserAnimation.to,
        onComplete: () => {
            // 送信成功時にランダムでキラキラ効果
            if (Math.random() < 0.5) {
                createSparkleEffect(messageBubble);
            }
        }
    });
      // スクロールを下に
    scrollToBottom();
    
    // APIにメッセージを送信
    const result = await sendMessageToAPI(message);
    if (result) {
        createFloatingHearts();
    }
}

function sendCelebration(celebrationText) {
    const messageBubble = createMessageBubble(celebrationText, 'celebration');
    messagesContainer.appendChild(messageBubble);
    
    // お祝いメッセージのアニメーション
    gsap.fromTo(messageBubble,
        { opacity: 0, scale: 0.5, rotation: -10 },
        { 
            opacity: 1, 
            scale: 1, 
            rotation: 0, 
            duration: 0.6, 
            ease: "elastic.out(1, 0.5)",
            onComplete: () => {
                // バウンスエフェクト
                gsap.to(messageBubble, {
                    y: -10,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            }
        }
    );
    
    // 紙吹雪エフェクト
    createConfettiEffect();
    
    // スクロールを下に
    scrollToBottom();
    
    // APIに送信
    sendMessageToAPI(celebrationText);
}

function sendGift() {
    const giftMessage = '🎁 ギフトが届きました！';
    const messageBubble = createMessageBubble(giftMessage, 'gift');
    messagesContainer.appendChild(messageBubble);
    
    // ギフトメッセージのアニメーション
    gsap.fromTo(messageBubble,
        { opacity: 0, scale: 0, rotation: 360 },
        { 
            opacity: 1, 
            scale: 1, 
            rotation: 0, 
            duration: 0.8, 
            ease: "back.out(1.7)"
        }
    );
    
    // ギフト爆弾エフェクト
    createGiftExplosion();
    
    // スクロールを下に
    scrollToBottom();
    
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

function scrollToBottom() {
    gsap.to(messagesContainer, {
        scrollTop: messagesContainer.scrollHeight,
        duration: 0.5,
        ease: "power2.out"
    });
}

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

// 新しいメッセージをランダムなタイミングで表示する関数
function displayNewMessages(newMessages) {
    newMessages.forEach((comment, index) => {
        // ランダムな遅延時間（500ms〜2000ms）
        const randomDelay = Math.random() * 1500 + 500;
        
        setTimeout(() => {
            const messageType = comment.message.includes('🎉') || comment.message.includes('🎊') || 
                               comment.message.includes('おめでと') || comment.message.includes('🎁') ? 'celebration' : 'user';
            
            const messageBubble = createMessageBubble(comment.message, messageType);
            
            // タイムスタンプがある場合は表示
            if (comment.timestamp) {
                const timestamp = new Date(comment.timestamp);
                const timeText = document.createElement('div');
                timeText.className = 'message-timestamp';
                timeText.textContent = formatTimestamp(timestamp);
                messageBubble.appendChild(timeText);
            }
            
            messagesContainer.appendChild(messageBubble);
            
            // 新着メッセージ専用のアニメーション（より派手に）
            const newMessageAnimations = [
                {
                    from: { opacity: 0, scale: 0.1, rotation: 180 },
                    to: { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" }
                },
                {
                    from: { opacity: 0, y: -100, scale: 0.5 },
                    to: { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "bounce.out" }
                },
                {
                    from: { opacity: 0, rotationX: 90, z: -100 },
                    to: { opacity: 1, rotationX: 0, z: 0, duration: 0.6, ease: "power3.out" }
                }
            ];
            
            const randomAnimation = newMessageAnimations[Math.floor(Math.random() * newMessageAnimations.length)];
            
            gsap.fromTo(messageBubble, randomAnimation.from, {
                ...randomAnimation.to,
                onComplete: () => {
                    // 新着メッセージには必ずスパークル効果
                    createSparkleEffect(messageBubble);
                    
                    // 音効果のシミュレーション（視覚的な表現）
                    createSoundWaveEffect(messageBubble);
                }
            });
            
            scrollToBottom();
            
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

// 成功メッセージを表示
function showSuccessMessage(message) {
    const successBubble = createMessageBubble(`✅ ${message}`, 'celebration');
    messagesContainer.appendChild(successBubble);
    
    gsap.fromTo(successBubble,
        { opacity: 0, scale: 0.5 },
        { 
            opacity: 1, 
            scale: 1, 
            duration: 0.5, 
            ease: "back.out(1.7)",
            onComplete: () => {
                // 3秒後にフェードアウト
                setTimeout(() => {
                    gsap.to(successBubble, {
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: () => successBubble.remove()
                    });
                }, 3000);
            }
        }
    );
    
    scrollToBottom();
}

// エラーメッセージを表示
function showErrorMessage(message) {
    const errorBubble = createMessageBubble(`❌ ${message}`, 'user');
    errorBubble.style.background = 'linear-gradient(45deg, #ff6b6b, #ff5252)';
    messagesContainer.appendChild(errorBubble);
    
    gsap.fromTo(errorBubble,
        { opacity: 0, x: -50 },
        { 
            opacity: 1, 
            x: 0, 
            duration: 0.4, 
            ease: "power2.out",
            onComplete: () => {
                // シェイクエフェクト
                gsap.to(errorBubble, {
                    x: [-5, 5, -5, 5, 0],
                    duration: 0.5,
                    ease: "power2.inOut"
                });
                
                // 5秒後にフェードアウト
                setTimeout(() => {
                    gsap.to(errorBubble, {
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: () => errorBubble.remove()
                    });
                }, 5000);
            }
        }
    );
    
    scrollToBottom();
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

// 既存メッセージを表示する関数
function displayExistingMessages(comments) {
    // まずウェルカムメッセージを表示
    const welcomeMessage = createMessageBubble('🎉 Nancop Anniversary へようこそ！', 'celebration');
    messagesContainer.appendChild(welcomeMessage);
    
    // ウェルカムメッセージのアニメーション
    gsap.fromTo(welcomeMessage, 
        { opacity: 0, y: 50, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
    );
    
    // ランダムな順序でコメントを表示するためのインデックス配列を作成
    const shuffledIndices = [...Array(comments.length).keys()];
    
    // 既存のコメントをランダムなタイミングで表示
    comments.forEach((comment, index) => {
        // ランダムな遅延時間を生成（300ms〜1500ms）
        const randomDelay = Math.random() * 1200 + 300;
        
        setTimeout(() => {
            const messageType = comment.message.includes('🎉') || comment.message.includes('🎊') || 
                               comment.message.includes('おめでと') || comment.message.includes('🎁') ? 'celebration' : 'user';
            
            const messageBubble = createMessageBubble(comment.message, messageType);
            
            // タイムスタンプがある場合は表示
            if (comment.timestamp) {
                const timestamp = new Date(comment.timestamp);
                const timeText = document.createElement('div');
                timeText.className = 'message-timestamp';
                timeText.textContent = formatTimestamp(timestamp);
                messageBubble.appendChild(timeText);
            }
            
            messagesContainer.appendChild(messageBubble);
            
            // バラエティに富んだアニメーション効果をランダムに選択
            const animationTypes = [
                // 標準のフェードイン
                {
                    from: { opacity: 0, y: 30, scale: 0.9 },
                    to: { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
                },
                // 左からスライドイン
                {
                    from: { opacity: 0, x: -50, rotation: -5 },
                    to: { opacity: 1, x: 0, rotation: 0, duration: 0.6, ease: "back.out(1.2)" }
                },
                // 右からスライドイン
                {
                    from: { opacity: 0, x: 50, rotation: 5 },
                    to: { opacity: 1, x: 0, rotation: 0, duration: 0.6, ease: "back.out(1.2)" }
                },
                // バウンス効果
                {
                    from: { opacity: 0, scale: 0.3, rotation: 10 },
                    to: { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" }
                },
                // 縦回転
                {
                    from: { opacity: 0, rotationX: 90, scale: 0.8 },
                    to: { opacity: 1, rotationX: 0, scale: 1, duration: 0.7, ease: "power3.out" }
                }
            ];
            
            const randomAnimation = animationTypes[Math.floor(Math.random() * animationTypes.length)];
            
            gsap.fromTo(messageBubble, randomAnimation.from, randomAnimation.to);
            
            // ランダムでスパークル効果を追加
            if (Math.random() < 0.3) { // 30%の確率で
                createSparkleEffect(messageBubble);
            }
            
        }, randomDelay);
    });
    
    // 最後のメッセージが表示された後にスクロール
    const maxDelay = Math.max(...comments.map((_, index) => Math.random() * 1200 + 300));
    setTimeout(() => {
        scrollToBottom();
    }, maxDelay + 1000);
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
    const sparkles = ['✨', '⭐', '💫', '🌟', '💖'];
    const sparkleCount = Math.floor(Math.random() * 5) + 3; // 3-7個のスパークル
    
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
                rotation: 360,
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    // フェードアウトしながら移動
                    gsap.to(sparkle, {
                        x: targetX,
                        y: targetY,
                        opacity: 0,
                        scale: 0.5,
                        rotation: 720,
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
