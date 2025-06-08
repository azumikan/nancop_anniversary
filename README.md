# nancop_anniversary

わーい
こんにちは
ごきげんよう
わいわい

```mermaid
flowchart TD
    StaticWebApp["Static Web App"]
    Functions["Functions"]
    CosmosDB["Cosmos DB"]
    
    StaticWebApp -->|HTTP| Functions
    Functions --> StaticWebApp
    Functions --> CosmosDB
    CosmosDB -->|Change Feed| Functions
    Functions -->|SignalR| StaticWebApp
```

```mermaid
flowchart TD
    A[Static Web App]
    B[Functions]
    C[Cosmos DB]
    D[Functions]
    
    A <-- HTTP --> B
    B --> C
    C -- Change Feed --> D
    D -- SignalR --> A
```

- 接続時に過去に投稿されたメッセージがランダムにピックアップされて流れる。
- 新規投稿されたメッセージはリアルタイムで流れる。

## Cosmos DB のデータ構造

```json
{
    "id": "12345",
    "message": "こんにちは、みんな！ by 酒見",
    "timestamp": "2023-10-01T12:00:00Z",
    "year": 2026, // Parition Key
}
```

## 初期バージョンでは入れない機能

- 常連贔屓機能
- 新規贔屓機能
- 初コメに対して弾幕で歓迎する機能
- AOAI によるコメントのサジェストとか
