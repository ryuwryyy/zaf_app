# 5. Documentation index

リポジトリルートからの相対パスです。

---

## 5.1 For operators (non-engineers)

| ドキュメント | 言語 | 内容 |
|-------------|------|------|
| **`manual.md`** | 日本語 | 運用マニュアル全文（商品・名言・キャンペーン・インポート） |
| **`docs/client-handoff-onepager.md`** | 日本語 | 1枚サマリ |

**`manual.md` の読む順（推奨）:** 第3章 → 第4章 → 第5章 → 第10章 → 第11章

---

## 5.2 For developers

| ドキュメント | 内容 |
|-------------|------|
| **`README.md`** | 起動、EAS ビルド、プッシュ概要 |
| **`docs/push-notifications.md`** | プッシュ実装メモ（英語） |
| **`docs/campaign-scheduling-windows.md`** | キャンペーン定期実行（Windows） |
| **`docs/firestore.rules.production.example`** | Firestore ルール雛形 |
| **`docs/handoff/`** | 引き継ぎ一式（本フォルダ） |

---

## 5.3 Configuration templates

| ファイル | 内容 |
|----------|------|
| **`.env.example`** | 環境変数の名前と説明 |
| **`eas.json`** | EAS ビルドプロファイル |
| **`app.json`** | アプリ ID、EAS projectId |
| **`scripts/quotes.sample.csv`** | 名言サンプル（100件） |
| **`scripts/zaf-products.sample.csv`** | 商品サンプル |

---

## 5.4 Screenshots / UI reference

| パス | 内容 |
|------|------|
| `assets/screenshots/` | 画面キャプチャ |
| `manual.md` 第2章 | 画面ごとの説明 |

---

## 5.5 Related handover sections

- 既知の問題・未実装: [06-known-issues-gaps-future-work.md](./06-known-issues-gaps-future-work.md)
- 素材・ライセンス: [07-design-assets-and-licenses.md](./07-design-assets-and-licenses.md)
- 全体索引: [00-INDEX.md](./00-INDEX.md)
