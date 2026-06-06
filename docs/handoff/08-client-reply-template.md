# 8. Client reply template (handover deadline)

**① 引き渡し可否・予定日** 用。  
**② 返金・減額** は契約・法務判断のため、下記は例文のみ。実際の回答は自社方針に合わせてください。

---

## 8.1 メール例（日本語）— 引き渡し確認

**件名:** 【Odza】引き継ぎ資料のご提供について（①ご回答）

[クライアント名] 様

お世話になっております。ご依頼の引き継ぎ項目について、**すべて対応可能**です。

| 区分 | 提供方法 | 完了予定 |
|------|----------|----------|
| 最新ソースコード | GitHub: https://github.com/ryuwryyy/zaf_app.git | [日時] |
| Firebase / GCP | プロジェクト `odza-1af37`、Owner 権限 | [日時] |
| Expo / EAS | プロジェクト `odza`、メンバー追加 / 移管 | [日時] |
| 環境・ビルド手順 | `.env.example`、`docs/handoff/03-*.md` | リポジトリ同梱 |
| Firestore・通知 | `docs/handoff/04-*.md`、`manual.md` | リポジトリ同梱 |
| 運用マニュアル | `manual.md`、`docs/client-handoff-onepager.md` | リポジトリ同梱 |
| 既知の問題・未実装 | `docs/handoff/06-*.md` | リポジトリ同梱 |

**秘密情報**（サービスアカウント JSON、Expo トークン）は **[安全な経路]** で別送済み / [日時] に送付します。

**入口:** リポジトリ内 `docs/handoff/00-INDEX.md`

**Firebase URL:** https://console.firebase.google.com/project/odza-1af37

GitHub 招待および Firebase 招待の受諾後、同 Google / GitHub アカウントでログインしてご確認ください。

**② 返金・減額について**

[自社方針を記載]

**Compile Co., Ltd. について**

[事実に基づき記載]

以上、よろしくお願いいたします。

[署名]

---

## 8.2 Pre-send checklist (developer)

### ASAP

- [ ] `git push origin main` — 最新コード
- [ ] GitHub: クライアントに `zaf_app` 権限付与
- [ ] Firebase: 3 メールが Owner **有効**
- [ ] Expo: クライアントがプロジェクト **odza** を開ける
- [ ] サービスアカウント鍵・Expo トークンを **安全に** 送付（チャット平文は非推奨）
- [ ] 漏洩鍵のローテーション

### Package review

- [ ] `docs/handoff/00-INDEX.md` の各項目を確認
- [ ] クライアント側で `npm install` + `npm start` 可能

### Do not send

- [ ] Git / 平文メールに `.env` やサービスアカウント JSON を載せない

---

## 8.3 If physical mail is required

- 送付状に URL 一覧と「秘密情報は別送」を明記
- 任意: `node_modules` 等を除いたソース Zip（Git が主）
