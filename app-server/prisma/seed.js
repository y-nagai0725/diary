const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('シード処理を開始します...');

  // 既存のユーザーと日記を削除（毎回まっさらな状態にするため）
  await prisma.diary.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('既存のデータを削除しました。');

  // テスト用のユーザーを作成
  const hashedPassword = await bcrypt.hash('password', 10);
  const user = await prisma.user.create({
    data: {
      name: 'test',
      password: hashedPassword,
    },
  });
  console.log(`ユーザー「${user.name}」を作成しました。 (パスワード: password)`);

  // テスト用の日記データを20件作成
  const diaryPromises = [];
  for (let i = 0; i < 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i); // i日前の日付にするよ

    const diaryPromise = prisma.diary.create({
      data: {
        text: `これは${i + 1}番目のテスト日記です。サンプルテキストです。`,
        // 3件に1件、Geminiコメントをいれる
        geminiComment: (i % 3 === 0) ? `Geminiです。 ${i + 1}番目の日記、ちゃんと読んだよ` : null,
        date: date,
        authorId: user.id,
      },
    });
    diaryPromises.push(diaryPromise);
  }

  await Promise.all(diaryPromises);
  console.log('20件の日記データを作成しました。');

  console.log('シード処理が完了しました！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });