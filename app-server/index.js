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
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=';

/**
 * 500エラーメッセージ
 */
const SERVER_ERROR_MESSAGE_500 = 'サーバーにてエラーが発生しています。時間を空けてもう一度試してください。';

/**
 * 403エラーメッセージ
 */
const FORBIDDEN_ERROR_MESSAGE_403 = '対象の操作の権限がありません。';

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
    const user = await prisma.user.create({
      data: { name, password: hashedPassword },
    });

    //登録成功レスポンス
    //TODO質問 付属させるデータについて、特にフロント側で必要なければuserIdはいらないよね？
    res.json({ message: "ユーザー登録完了しました。登録内容でログインして下さい。", userId: user.id });
  } catch (error) {
    //TODO質問 500のサーバーエラーの可能性もあるよね？

    //ユーザー名が重複した場合はエラー
    res.status(400).json({ error: 'こちらのユーザー名は既に使用されています。別のユーザー名を入力して下さい。' });
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
    //TODO質問 どんなエラーを想定すればいい？
  }
});

/**
 * 特定の日記取得
 */
app.get('/api/diaries/:id', authenticateToken, async (req, res) => {
  try {
    //取得対象のid
    const id = parseInt(req.params.id);

    //対象の日記を取得
    const diary = await prisma.diary.findUnique({ where: { id } });
    res.json(diary);
  } catch (error) {
    //TODO質問 どんなエラーを想定すればいい？
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
    //TODO質問 どんなエラーを想定すればいい？
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

    //TODO質問 本人が書いた日記かどうかチェック処理、こんな処理でどうかな？
    if (!isDiaryAuthor(id, req.user.userId)) {
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
    //TODO質問 どんなエラーを想定すればいい？
  }
});

/**
 * 特定の日記削除
 */
app.delete('/api/diaries/:id', authenticateToken, async (req, res) => {
  try {
    //削除対象のid
    const id = parseInt(req.params.id);

    //TODO質問 本人が書いた日記かどうかチェック処理、こんな処理でどうかな？
    if (!isDiaryAuthor(id, req.user.userId)) {
      return res.status(403).json({ error: FORBIDDEN_ERROR_MESSAGE_403 });
    }

    //対象の日記削除
    const deletedDiary = await prisma.diary.delete({
      where: { id },
    });
    res.json(deletedDiary);
  } catch (error) {
    //TODO質問 どんなエラーを想定すればいい？
  }
});

/**
 * 日記テキストをGemini APIに渡し、コメントをもらう
 */
app.post('/api/comment', authenticateToken, async (req, res) => {
  try {
    //TODO まだ未実装、これから作成予定です
  } catch (error) {

  }
});

/**
 * 対象の日記がログインユーザーのものかどうか
 * @param {*} diaryId
 * @param {*} authorId
 * @returns
 */
async function isDiaryAuthor(diaryId, authorId) {
  const targetDiary = await prisma.diary.findUnique({ where: { id: diaryId } });
  return targetDiary.authorId === authorId;
}

/**
 * サーバー起動
 */
app.listen(port, () => {
  console.log(`サーバーがポート${port}番で起動しました。`);
});