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
- [テーブル定義書](#テーブル定義書)
- [機能テスト](#機能テスト)
- [各画面・機能説明](#各画面機能説明)
  - [ログイン画面](#ログイン画面)
    - [主な機能](#主な機能)
  - [ユーザー登録画面](#ユーザー登録画面)
    - [主な機能](#主な機能-1)
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

## テーブル定義書
[テーブル定義書](https://docs.google.com/spreadsheets/d/1MvpjmFBf0TYdGGZldpBbFiIp7Ro0SINdkb1USx12AEs/edit?usp=sharing)（Googleスプレッドシートへのリンクです。）

## 機能テスト
[機能テスト表](https://docs.google.com/spreadsheets/d/1xSZY4r3QBzMDQ3fCB16fS5FFNCjj_AmNP8zL4zl5Ckg/edit?usp=sharing)（Googleスプレッドシートへのリンクです。）

## 各画面・機能説明
### ログイン画面
アプリの入り口となる画面です。登録済みのユーザー名とパスワードでログインします。

<img width="1920" height="919" alt="Image" src="https://github.com/user-attachments/assets/595b9909-46c6-4e02-9d89-9276cce6cd29" />

#### 主な機能

* ユーザー認証

  ユーザー名とパスワードを入力し、「ログイン」ボタンをクリックすると、バックエンド（Node.js/Express）で認証処理（bcryptjsによるパスワード照合）が行われます。

  認証が成功すると、JWT（JSON Web Token）が発行され、Home画面(/home)へ遷移します。

* お試しログイン機能

  「お試しログイン」ボタンをクリックすると、事前に用意されたテスト用アカウント情報が自動で入力され、すぐにログインできます。ポートフォリオ経由でこのアプリを閲覧する方がすぐにアプリの機能を試せるように実装しました。

* 入力値バリデーション

  ユーザー名（10文字以内）やパスワード（4文字以上）の未入力チェックや文字数チェックを行います。各テキストボックスの下にエラーメッセージが表示されます。

  サーバーからのエラー（「登録されていないユーザー名です。」や「パスワードが間違っています。」）も、ログインボタンの下に表示されます。

  ![Image](https://github.com/user-attachments/assets/40b50610-382a-4657-81ab-ea5937e772b7)

  ![Image](https://github.com/user-attachments/assets/2ac9de6b-3501-4b15-b5a8-07f563fa99cf)

* 通知メッセージ表示

  セッションの有効期限が切れた状態で認証が必要なページにアクセスした場合、自動でログイン画面にリダイレクトされ、「セッションが無効か期限切れです。再度ログインしてください。」というメッセージが表示されます。（axiosインターセプターによる制御）

  <img width="1920" height="919" alt="Image" src="https://github.com/user-attachments/assets/d8811cec-0245-4251-9608-1630e8b0580a" />

* 画面遷移

  「ユーザー登録」ボタンから、ユーザー登録画面(/register)へ遷移できます。

### ユーザー登録画面
新しいユーザーがアカウントを作成するための画面です。ログイン画面と共通のフォームコンポーネントを使用しています。

<img width="1920" height="919" alt="Image" src="https://github.com/user-attachments/assets/211d99b5-7dda-4e25-ac32-9c11d8c9f11c" />

#### 主な機能

* 新規ユーザー登録

  ユーザー名とパスワードを入力し、「ユーザー登録」ボタンをクリックします。

  バックエンド側でパスワードをbcryptjsを用いてハッシュ化してからデータベースに保存します。

  登録が成功すると、そのままログイン時と同様にJWTが発行され、Home画面(/home)へ遷移します。

* 入力値バリデーション

  ログイン画面と共通のバリデーション（未入力チェック、文字数制限）に加え、サーバー側で「既に存在するユーザー名かどうか」もチェックします。

  バリデーションエラーは各テキストボックスの下に、サーバーからのエラー（「こちらのユーザー名は既に使用されています。別のユーザー名を入力して下さい。」）はユーザー登録ボタンの下に表示されます。

  ![Image](https://github.com/user-attachments/assets/bd0b482a-d57d-4bf1-bc1b-b36a8e8fc02b)

* 画面遷移

  既にアカウントを持っている方向けに、「ログイン」ボタンからログイン画面(/login)へ遷移することができます。

### Home画面
### 日記一覧画面
### 日記作成画面（新規作成モード）
### 日記作成画面（更新モード）
### 404 Not Found画面
### ヘッダー
### フッター
