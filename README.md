# Diary 日記帳アプリ<!-- omit in toc -->
![Image](https://github.com/user-attachments/assets/0d779b3c-b6f0-4737-aa45-9423b815b7cc)

## 目次<!-- omit in toc -->
- [概要](#概要)
- [公開URL](#公開url)
- [目的](#目的)
- [こだわったポイント](#こだわったポイント)
- [今後の展望](#今後の展望)
- [使用技術](#使用技術)
- [使用フォント](#使用フォント)
- [デザインカンプ](#デザインカンプ)
- [データベース定義書](#データベース定義書)
- [テスト結果表](#テスト結果表)
- [各画面・機能説明](#各画面機能説明)
  - [ログイン画面](#ログイン画面)
  - [ユーザー登録画面](#ユーザー登録画面)
  - [Home画面](#home画面)
  - [日記一覧画面](#日記一覧画面)
  - [日記作成画面（新規作成モード）](#日記作成画面新規作成モード)
  - [日記作成画面（更新モード）](#日記作成画面更新モード)
  - [404 Not Found画面](#404-not-found画面)
  - [ヘッダー](#ヘッダー)
  - [フッター](#フッター)

## 概要
日々の出来事を記録し、AI (Gemini API) がコメントをくれる機能を持つシンプルなWeb日記帳アプリケーションです。フロントエンドにはVue.js、バックエンドにはNode.js/Expressを使用して構築されています。ユーザー登録・ログイン機能、日記のCRUD操作、検索機能などを備えています。

## 公開URL
[https://diary.mikanbako.jp/](https://diary.mikanbako.jp/)

## 目的
ユーザー認証、CRUD操作、外部API連携（Gemini API）といった、Webアプリケーション開発における基本的な機能の実装経験を積むことを目的に制作しました。

## こだわったポイント
* **Gemini API連携**: ユーザーが記述した日記の内容に基づき、AI (Gemini API) がコメントを生成する機能を実装しました。ユーザーはAIの性別や関係性、コメントスタイルを設定でき、よりパーソナルな体験を得られます。
* **検索機能付き日記一覧**: ページネーション、キーワード検索（デバウンス処理付き）、日付による絞り込み（年月/年月日）、並び替え（昇順/降順）といった、実用的な一覧表示機能を実装しました。
* **状態管理とエラーハンドリング**: ログイン状態やAPI通信中のローディング状態をグローバルに管理し、UIに反映させています。また、axiosインターセプターで認証エラー時の自動ログアウトや、APIエラー発生時のモーダル表示など、堅牢性も意識しました。

## 今後の展望
* TypeScriptの導入による型安全性向上。
* 単体テスト・結合テストの導入による品質向上。

## 使用技術
**フロントエンド**
* Vue.js (v3)
* Vue Router
* Axios
* vue-datepicker（日付入力機能）
* simplebar-vue（スクロールバーカスタム）

**バックエンド**
* Node.js
* Express
* Prisma
* JWT（認証機能）
* bcryptjs（パスワードのハッシュ化）

**データベース**
* MySQL（本番環境）
* SQLite（開発環境）

**API**
* [Gemini API](https://ai.google.dev/api/generate-content?hl=ja#v1beta.models.generateContent)

**インフラ・その他**
* さくらVPS
* Apache（Webサーバー）
* pm2（Node.js Process起動用）

## 使用フォント
[Zen Maru Gothic](https://fonts.google.com/specimen/Zen+Maru+Gothic)

## デザインカンプ
[Figmaページ](https://www.figma.com/design/PM0PUujqI4QhWLHKSYZXlY/Diary-%E6%97%A5%E8%A8%98%E5%B8%B3%E3%82%A2%E3%83%97%E3%83%AA?node-id=0-1&t=YHTBa6kXNgUcqrsM-1)（閲覧のみ可能です）

## データベース定義書
[データベース定義書](https://docs.google.com/spreadsheets/d/1MvpjmFBf0TYdGGZldpBbFiIp7Ro0SINdkb1USx12AEs/edit?usp=sharing)（Googleスプレッドシートへのリンクです。）

## テスト結果表
[テスト結果表](https://docs.google.com/spreadsheets/d/1xSZY4r3QBzMDQ3fCB16fS5FFNCjj_AmNP8zL4zl5Ckg/edit?usp=sharing)（Googleスプレッドシートへのリンクです。）

## 各画面・機能説明
### ログイン画面
### ユーザー登録画面
### Home画面
### 日記一覧画面
### 日記作成画面（新規作成モード）
### 日記作成画面（更新モード）
### 404 Not Found画面
### ヘッダー
### フッター
