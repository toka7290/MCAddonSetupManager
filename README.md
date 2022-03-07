# TokaTools Manifest Generator

Minecraft Bedrock Edition (Windows, Android, iOS, etc.)のアドオンで使用する manifest.json を生成、編集するアプリケーションです。

## 使い方

manifest.json の仕様については[manifest.json の手引き](https://tokamcwin10.blog.jp/article-38495158)をご覧ください。

### 画面のみかた

お使いの環境によってダークモードで表示される可能性があります
![MCAddonSetupManager](https://user-images.githubusercontent.com/46467578/157014676-3cf1834f-e1f6-44c7-b7f7-415b8aaac120.png)


#### ヘッダーメニュー

スマートフォン,ＰＣおよび特定の機能によって表示が異なります

- Open :ファイルを開く([File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)対応環境のみ)
- Import :ファイルをインポートする(File System Access API 非対応環境)
- Preview :プレビュー切替(スマートフォンのみ)
- Help :ヘルプ(スマートフォンのみ)
- About :関連リンクおよびバージョン情報

#### 編集エディタ

画面左側(PC),主画面(スマホ)
各種入力欄にデータを入力してください。
入力値がエラーの場合は赤く,注意の場合は黄色くハイライトされます。

#### プレビュー画面

画面右側(PC), プレビュー画面
Minecraft の管理画面や JSON のプレビューがあります。

上部メニューは以下の通り

- Copy :生成した json を文字列としてをコピーします
- Download :生成した json を manifest.json としてダウンロードします
- Save :ファイルを保存(上書き)します ファイルに変更があった場合は`Save*`と表示されます

#### エラーパネル

各種設定した項目ごとにエラー、注意項目を検知し表示します

## 脆弱性の報告

詳細は[セキュリティポリシー](https://github.com/toka7290/MCAddonSetupManager/blob/main/SECURITY.md)ページにしたがってください
