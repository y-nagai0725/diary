require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors());
app.use(express.json());

/**
 * ポート番号
 */
const port = 3000;

/**
 * Gemini APIキー
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Gemini APIのURL
 */
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';

/**
 * 500エラーメッセージ
 */
const SERVER_ERROR_MESSAGE_500 = 'サーバーにてエラーが発生しています。時間を空けてもう一度試してください。';

/**
 * 403エラーメッセージ
 */
const FORBIDDEN_ERROR_MESSAGE_403 = '対象の操作の権限がありません。';

/**
 * Geminiからもらうコメントの文字数
 */
const GEMINI_RESPONSE_STRING_COUNT = 100;

/**
 * Gemini APIへの設定
 */
const promptSettings = {
  // 性別の設定
  gender: {
    male: '男性',
    female: '女性',
    other: 'その他',
  },
  // 関係性の設定
  relation: {
    lover: '恋人',
    friend: '友人',
    olderSister: '姉',
    youngerSister: '妹',
    olderBrother: '兄',
    youngerBrother: '弟',
    other: 'その他',
  },
  // コメントのスタイルの設定
  commentStyle: {
    //共感
    empathy: 'とにかく優しく共感して、肯定的な言葉をかけるスタイル',
    //アドバイス
    advice: '具体的なアドバイスや次のアクションに繋がるようなヒントを与えるスタイル',
    //激励
    encouragement: '頑張りを褒めて、元気づけて、背中を押してくれるような激励スタイル',
    //提案
    suggestion: '「こんなことをしてみるのはどう？」と新しい視点やアイデアを提案するスタイル',
  }
};

/**
 * リクエストヘッダーのトークン認証
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const authenticateToken = (req, res, next) => {
  //リクエストデータの認証用ヘッダー
  const authHeader = req.headers['authorization'];

  //ヘッダーがない場合、401エラー
  if (!authHeader) {
    return res.sendStatus(401);
  }

  //ヘッダーを分割
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    //2つに分かれていない、または'Bearer'が設定されていない場合、401エラー
    return res.sendStatus(401);
  }

  //トークン部分を取り出し
  const token = parts[1];

  //トークン認証
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    //正規なトークンではない場合、403エラー
    if (err) {
      return res.sendStatus(403);
    }

    //正規なトークンが確認次第、ユーザー情報をリクエストデータに保持する
    req.user = user;

    //認証完了
    next();
  });
};

/**
 * ユーザー登録
 */
app.post('/api/register', async (req, res) => {
  try {
    //ユーザー名、パスワード
    const { name, password } = req.body;

    //パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    //ユーザー登録
    await prisma.user.create({
      data: { name, password: hashedPassword },
    });

    //登録成功レスポンス
    res.json({ message: "ユーザー登録完了しました。登録内容でログインして下さい。" });
  } catch (error) {
    //'P2002':Prismaでユニーク制約に違反した時のエラーコード
    if (error.code === 'P2002') {
      //ユーザー名が重複した場合、400エラー
      res.status(400).json({ error: 'こちらのユーザー名は既に使用されています。別のユーザー名を入力して下さい。' });
    } else {
      //500サーバーエラー
      console.error(error);
      res.status(500).json({ error: SERVER_ERROR_MESSAGE_500 });
    }
  }
});

/**
 * ログイン
 */
app.post('/api/login', async (req, res) => {
  try {
    //ユーザー名、パスワード
    const { name, password } = req.body;

    //ユーザー名で対象ユーザーを取得
    const user = await prisma.user.findUnique({ where: { name } });

    //対象ユーザーが存在しない場合
    if (!user) {
      return res.status(401).json({ error: '登録されていないユーザー名です。' });
    }

    //パスワードのチェック
    const isPasswordValid = await bcrypt.compare(password, user.password);

    //正しいパスワードではない場合
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'パスワードが間違っています。' });
    }

    //JWTを作成（有効期限1時間、ユーザーIDとユーザー名を付与）
    const token = jwt.sign({ userId: user.id, userName: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

    //ログイン成功、作成したJWTを渡す
    res.json({ message: 'ログインしました。', token: token });
  } catch (error) {
    //500サーバーエラー
    console.error(error);
    res.status(500).json({ error: SERVER_ERROR_MESSAGE_500 });
  }
});

/**
 * 日記一覧取得
 */
app.get('/api/diaries', authenticateToken, async (req, res) => {
  try {
    //日記の著者id
    const authorId = req.user.userId;

    //対象の全ての日記取得
    const allDiaries = await prisma.diary.findMany({ where: { authorId } });
    res.json(allDiaries);
  } catch (error) {
    //500サーバーエラー
    console.error(error);
    res.status(500).json({ error: SERVER_ERROR_MESSAGE_500 });
  }
});

/**
 * 特定の日記取得
 */
app.get('/api/diaries/:id', authenticateToken, async (req, res) => {
  try {
    //取得対象のid
    const id = parseInt(req.params.id);

    //対象id且つ本人の著者idの日記を取得
    const diary = await prisma.diary.findUnique({
      where: {
        id: id,
        authorId: req.user.userId,
      },
    });

    //日記がない場合
    if (!diary) {
      return res.status(404).json({ error: '対象の日記が見つかりません。' });
    }

    res.json(diary);
  } catch (error) {
    //500サーバーエラー
    console.error(error);
    res.status(500).json({ error: SERVER_ERROR_MESSAGE_500 });
  }
});

/**
 * 日記登録
 */
app.post('/api/diaries', authenticateToken, async (req, res) => {
  try {
    //日記テキスト、Geminiコメント、日付
    const { text, geminiComment, date } = req.body;

    //日記の著者id
    const authorId = req.user.userId;

    //日記作成
    const newDiary = await prisma.diary.create({
      data: {
        text,
        geminiComment,
        date,
        authorId,
      },
    });
    res.json(newDiary);
  } catch (error) {
    //500サーバーエラー
    console.error(error);
    res.status(500).json({ error: SERVER_ERROR_MESSAGE_500 });
  }
});

/**
 * 特定の日記更新
 */
app.put('/api/diaries/:id', authenticateToken, async (req, res) => {
  try {
    //更新対象のid
    const id = parseInt(req.params.id);

    //日記テキスト、Geminiコメント、日付
    const { text, geminiComment, date } = req.body;

    //対象id且つ本人の著者idの日記を取得
    const diary = await prisma.diary.findUnique({
      where: {
        id,
        authorId: req.user.userId,
      }
    });

    //日記が存在しない or 本人の日記ではない場合
    if (!diary) {
      return res.status(403).json({ error: FORBIDDEN_ERROR_MESSAGE_403 });
    }

    //対象の日記を更新
    const updatedDiary = await prisma.diary.update({
      where: { id },
      data: {
        text,
        geminiComment,
        date,
      },
    });
    res.json(updatedDiary);
  } catch (error) {
    //500サーバーエラー
    console.error(error);
    res.status(500).json({ error: SERVER_ERROR_MESSAGE_500 });
  }
});

/**
 * 特定の日記削除
 */
app.delete('/api/diaries/:id', authenticateToken, async (req, res) => {
  try {
    //削除対象のid
    const id = parseInt(req.params.id);

    //対象id且つ本人の著者idの日記を取得
    const diary = await prisma.diary.findUnique({
      where: {
        id,
        authorId: req.user.userId,
      }
    });

    //日記が存在しない or 本人の日記ではない場合
    if (!diary) {
      return res.status(403).json({ error: FORBIDDEN_ERROR_MESSAGE_403 });
    }

    //対象の日記削除
    const deletedDiary = await prisma.diary.delete({
      where: { id },
    });
    res.json(deletedDiary);
  } catch (error) {
    //500サーバーエラー
    console.error(error);
    res.status(500).json({ error: SERVER_ERROR_MESSAGE_500 });
  }
});

/**
 * 日記テキストをGemini APIに渡し、コメントをもらう
 */
app.post('/api/comment', authenticateToken, async (req, res) => {
  try {
    //日記テキスト、書き手の性別Key、geminiの性別Key、関係性Key、コメントスタイルKey
    const { diaryText, writerGenderKey, geminiGenderKey, relationKey, styleKey } = req.body;

    //日記データが無い場合
    if (!diaryText || diaryText.trim() === "") {
      return res.status(400).json({ error: '日記の内容がありません。' });
    }

    //geminiへ渡す日記テキスト、改行コード統一
    const formattedDiaryText = diaryText.replace(/\r\n/g, '\n');

    //書き手の性別
    const writerGender = promptSettings.gender[writerGenderKey];

    //geminiの性別
    const geminiGender = promptSettings.gender[geminiGenderKey];

    //関係性
    const relation = promptSettings.relation[relationKey];

    //コメントスタイル
    const style = promptSettings.commentStyle[styleKey];

    //設定値チェック
    if (!writerGender || !geminiGender || !relation || !style) {
      return res.status(400).json({ error: '不正な設定値です。' });
    }

    //ユーザープロンプト
    const userPrompt = `【日記】\n${formattedDiaryText}`;

    //指示プロンプト
    const systemPrompt = `
    # 指示
    あなたは日記のコメント生成AIです。以下の設定に従ってコメントを生成してください。
    - あなたの性別は「${geminiGender}」です。
    - 日記の書き手の性別は「${writerGender}」です。
    - あなたと書き手の関係は「${relation}」です。
    - コメントのスタイルは「${style}」でお願いします。
    - これから送られてくる日記に対して、前向きな温かいコメントを日本語で${GEMINI_RESPONSE_STRING_COUNT}文字程度で生成してください。
    `;

    //api呼び出し
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
      }),
    });

    //正常なレスポンスがない場合
    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json();
      console.error('Gemini API Error:', errorBody);
      throw new Error(`APIエラー: ${errorBody.error.message || geminiResponse.statusText}`);
    }

    //結果をjson形式で取得
    const result = await geminiResponse.json();
    let comment;

    if (result.candidates && result.candidates[0].content.parts[0].text) {
      //レスポンスからコメントを取得
      comment = result.candidates[0].content.parts[0].text;
    } else {
      // 候補がない場合や、予期しないレスポンスの時
      throw new Error('有効なレスポンスがありませんでした。');
    }

    // フロント側に、GeminiからのコメントをJSON形式で返す
    res.json({ comment });
  } catch (error) {
    console.error('Error in /api/comment:', error);
    res.status(500).json({ error: error.message || SERVER_ERROR_MESSAGE_500 });
  }
});

/**
 * サーバー起動
 */
app.listen(port, () => {
  console.log(`サーバーがポート${port}番で起動しました。`);
});