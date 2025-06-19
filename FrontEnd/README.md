# Nancop Anniversary Frontend

このプロジェクトは、Nancop Anniversaryのお祝いイベント用のWebアプリケーションです。

## 特徴

- 🎉 インタラクティブなお祝いメッセージ機能
- ✨ GSAPを使用した滑らかなアニメーション
- 🎁 ギフト爆弾エフェクト
- 💖 フローティングハートエフェクト
- 📱 レスポンシブデザイン
- 🌟 紙吹雪エフェクト

## 技術スタック

- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript
- GSAP (GreenSock Animation Platform)
- Azure Static Web Apps

## ファイル構成

```
FrontEnd/
├── index.html              # メインHTMLファイル
├── styles.css              # スタイルシート
├── script.js               # JavaScript機能
├── staticwebapp.config.json # Azure Static Web Apps設定
└── README.md               # このファイル
```

## 機能

### メッセージ機能
- テキストメッセージの送信
- Azure Functions APIとの連携

### お祝いボタン
- 「おめでとー」- オレンジグラデーション
- 「おめえと」- イエローグラデーション  
- 「おめでとう！」- レッドオレンジグラデーション

### エフェクト
- **紙吹雪エフェクト**: お祝いメッセージ送信時
- **フローティングハート**: 通常メッセージ送信時
- **ギフト爆弾**: ギフトボタン押下時

## デプロイ

Azure Static Web Appsにデプロイする際は、以下の設定を使用してください：

- **App location**: `/FrontEnd`
- **Api location**: `/Functions`
- **Output location**: `` (空)

## API連携

バックエンドのAzure Functionsと連携します：
- エンドポイント: `/api/PostComment`
- メソッド: POST
- ペイロード: `{ "message": "メッセージ内容" }`

## ブラウザサポート

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 開発者向け

### ローカル開発
1. このディレクトリでライブサーバーを起動
2. Azure Functionsも同時に起動（ポート7028）
3. ブラウザで開発・テスト

### カスタマイズ
- `styles.css`: デザインとアニメーションの調整
- `script.js`: 機能とエフェクトの追加/変更
- `staticwebapp.config.json`: ルーティングとセキュリティ設定
