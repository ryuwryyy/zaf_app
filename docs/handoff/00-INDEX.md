# Project handover index (Odza / ZAF)

**目的:** クライアントが求める引き渡し項目と、リポジトリ内のファイル・URL・作業の対応表  
**アプリ:** Odza 瞑想アプリ（`com.odza.app`）  
**Firebase プロジェクト ID:** `odza-1af37`  
**Expo EAS プロジェクト ID:** `f75f4243-74a5-4f6c-a105-cea0c7eb5a2b`  
**Git リモート:** https://github.com/ryuwryyy/zaf_app.git  
**引き継ぎ準備時の最新コミット:** `git log -1` で都度確認

---

## How to use this package

| # | 引き渡し項目 | ドキュメント | 確認（完了したら ☐ を ✓） |
|---|-------------|-------------|---------------------------|
| 1 | 最新ソースコード（Git または Zip） | [01-source-code-and-repository.md](./01-source-code-and-repository.md) | ☐ GitHub アクセス付与 **または** Zip 送付 |
| 2 | アカウント・権限 | [02-accounts-and-permissions.md](./02-accounts-and-permissions.md) | ☐ Owner 追加 / 必要なら移管 |
| 3 | 環境構築 | [03-environment-setup-and-deployment.md](./03-environment-setup-and-deployment.md) | ☐ `.env.example` 共有、秘密情報は別経路 |
| 4 | バックエンド / Firestore / 通知 | [04-firestore-backend-and-notifications.md](./04-firestore-backend-and-notifications.md) | ☐ Firestore データ・ルール確認 |
| 5 | ドキュメント一覧 | [05-documentation-index.md](./05-documentation-index.md) | ☐ `manual.md` と本フォルダを案内 |
| 6 | 既知の問題・未実装・今後の作業 | [06-known-issues-gaps-future-work.md](./06-known-issues-gaps-future-work.md) | ☐ クライアントと事実ベースで共有 |
| 7 | デザイン素材・ライセンス | [07-design-assets-and-licenses.md](./07-design-assets-and-licenses.md) | ☐ 素材の権利関係を確認 |
| 8 | クライアント返信テンプレート（期限対応用） | [08-client-reply-template.md](./08-client-reply-template.md) | ☐ 合意期限までに送付 |

**1枚サマリ:** [`../client-handoff-onepager.md`](../client-handoff-onepager.md)

---

## Secrets — never put in Git or email body

別経路（暗号化 Zip、パスワード管理ツール、対面など）で渡すもの:

- Firebase **サービスアカウント** JSON（`google-service-account-key.json` またはローテーション後の新鍵）
- **`EXPO_ACCESS_TOKEN`**
- Expo / Apple / Google Play などストア関連の認証情報

リポジトリに含まれるのは **`.env.example`**（プレースホルダーのみ）です。

---

## Quick verification

```powershell
cd D:\projects\odza
npm install
npm start
# 別ターミナル:
npm run send-campaigns   # ローカルに .env とサービスアカウント JSON が必要
```

- [ ] クライアントが https://console.firebase.google.com/project/odza-1af37 を開ける  
- [ ] クライアントが https://expo.dev でプロジェクト **odza** を開ける  
- [ ] クライアントが https://github.com/ryuwryyy/zaf_app.git を clone できる（または Zip 受領）  
- [ ] `manual.md` の第5章（キャンペーン）が読める  
