# 7. Design assets and licenses

## 7.1 In-repository assets

| 場所 | 内容 |
|------|------|
| `assets/images/` | アプリアイコン、商品プレースホルダ（例: `01.png`）、デザイン画像 |
| `assets/images/design1.png` | `app.json` で参照するアイコン / adaptive icon |
| `assets/screenshots/` | `manual.md` 用スクリーンショット |
| `assets/home-padding-mockup.html` | レイアウト検討用（開発参考） |

## 7.2 Sample / operational data

| ファイル | 用途 |
|----------|------|
| `scripts/quotes.sample.csv` | インポートテスト用名言（100件） |
| `scripts/quotes.sample.json` | JSON 形式例 |
| `scripts/zaf-products.sample.csv` | 商品サンプル |
| `scripts/zaf-products.sample.json` | JSON 形式例 |

本番コンテンツの多くは **Firestore**（`quotes`、`zaf_products`）にあり、サンプル CSV のみではありません。

## 7.3 External assets

- **商品画像:** Firestore の `imageUrl`（HTTPS）。ホスティングとライセンスは **URL を設定する側**の責任。
- **フォント / Expo モジュール:** 各 OSS ライセンスに従う（`package-lock.json` 参照）。

## 7.4 License attention (typical mobile app stack)

| コンポーネント | 備考 |
|---------------|------|
| React Native / Expo | MIT 等 |
| Firebase SDK | Google 利用規約 |
| npm パッケージ | 各 `package.json` / `node_modules` |
| クライアント提供のブランド画像 | 商用利用権の確認が必要 |

## 7.5 What to confirm with client

- [ ] **design1.png** およびアプリ内画像の著作権者
- [ ] **名言テキスト**の利用許諾
- [ ] **ZAF 商品写真・説明文**の権利
- [ ] ストックフォoto / フォントの **表示義務**（該当する場合）

不明な場合: *「リポジトリ内素材は本プロジェクト用に提供されたもの。ストア公開前にクライアント側で商用利用権を確認すること。」*
