// 環境設定
const config = {
    development: {
        apiBaseUrl: 'http://localhost:7028/api',
        apiKey: '' // ローカル開発では不要
    },
    production: {
        apiBaseUrl: 'https://func-nancopa.azurewebsites.net/api',
        apiKey: '' // 本番環境のAPIキー
    },
    // Azure Static Web Appsでの本番環境（APIが同じドメインの場合）
    staticWebApp: {
        apiBaseUrl: '/api',
        apiKey: '' // Azure Static Web Appsでは不要
    }
};

// 現在の環境を判定
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

const environment = getEnvironment();
const API_CONFIG = config[environment];

// エクスポート（グローバル変数として使用）
window.API_BASE_URL = API_CONFIG.apiBaseUrl;
window.API_KEY = API_CONFIG.apiKey;
