# Content Pipeline — マルチエージェントオーケストレーター

3つのエージェント（Creator / SEO / Reader）を順次・並列で起動し、品質基準を満たすブログ記事を生成する。

## 入力

$ARGUMENTS の解釈:

- **引数なし** → トピックをユーザーに質問
- **`"トピック名"`** → 新規作成モード
- **`review <filepath>`** → 既存記事レビューモード（Creator は起動せず SEO + Reader のみ）

## モード別フロー

### 新規作成モード

#### Round 0: 初稿作成

Agent ツール（subagent_type: general-purpose）で Creator Agent を起動:

```
プロンプト:
あなたは Content Creator Agent です。
以下の .claude/commands/content-create.md の指示に従い、トピック「<トピック名>」で EN/JA のブログ記事 MDX を作成してください。

事前に以下のファイルを読み込んでください:
- content/CLAUDE.md
- src/lib/content-schemas.ts
- content/blog/en/timeboxing-with-dayopt.mdx（品質ベンチマーク）

出力: 作成したファイルパスと内容の要約
```

#### Round 1-N: レビュー & 修正ループ

1. SEO Agent と Reader Agent を **並列**で Agent ツール起動:

**SEO Agent** (subagent_type: general-purpose):

```
あなたは SEO Review Agent です。
以下の .claude/commands/content-seo.md の指示に従い、以下のファイルを評価してください:
- content/blog/en/<slug>.mdx
- content/blog/ja/<slug>.mdx

事前に以下も読み込んでください:
- src/lib/content-schemas.ts
- src/platform/seo/metadata.ts
- content/CLAUDE.md

出力: EN/JA それぞれのスコアカード + 修正指示
```

**Reader Agent** (subagent_type: general-purpose):

```
あなたは Reader Review Agent です。
以下の .claude/commands/content-reader.md の指示に従い、以下のファイルを評価してください:
- content/blog/en/<slug>.mdx
- content/blog/ja/<slug>.mdx

出力: EN/JA それぞれのペルソナ評価 + 離脱ポイント + 改善提案
```

2. 結果を確認:
   - **SEO 総合スコア >= 70** かつ **Reader 完読率 >= 60%** → 合格、最終出力へ
   - 閾値未満 → Creator Agent にフィードバックを渡して修正を依頼

3. Creator Agent を Agent ツールで起動（リビジョンモード）:

```
あなたは Content Creator Agent です。
以下のフィードバックに基づいて記事を修正してください:

## SEO フィードバック
<SEO Agent の修正指示をここに貼り付け>

## Reader フィードバック
<Reader Agent の改善提案をここに貼り付け>

対象ファイル:
- content/blog/en/<slug>.mdx
- content/blog/ja/<slug>.mdx

CRITICAL > WARNING > INFO の優先度で対応し、修正箇所を報告してください。
```

4. **最大2ラウンド**まで繰り返し。2ラウンド後は閾値未達でも終了

### レビューモード (`review <filepath>`)

1. 指定ファイルのロケール（en/ja）を判定
2. 対応する他ロケール版も特定（例: en → ja のペアファイル）
3. SEO Agent と Reader Agent を並列起動（上記と同じ）
4. 結果をユーザーに提示（Creator Agent は起動しない）

## 最終出力

```markdown
## Content Pipeline — 完了レポート

### 記事情報

- **トピック**: ...
- **ファイル**:
  - EN: `content/blog/en/<slug>.mdx`
  - JA: `content/blog/ja/<slug>.mdx`
- **ステータス**: draft: true（公開前に `draft: false` に変更してください）

### 最終スコア

| 指標                  | EN     | JA     |
| --------------------- | ------ | ------ |
| SEO 総合              | XX/100 | XX/100 |
| Reader 完読率         | XX%    | XX%    |
| Reader アクション確率 | XX%    | XX%    |

### レビューラウンド数: N

### 主な改善点（ラウンド経過）

- Round 1: ...
- Round 2: ...

### 残存課題（閾値未達の場合）

- ...

### 次のステップ

1. 記事を確認: `content/blog/{en,ja}/<slug>.mdx`
2. 必要に応じて手動で微調整
3. `draft: false` に変更して公開
```

## 重要なルール

- Agent ツールの subagent_type は常に `general-purpose` を使用
- SEO Agent と Reader Agent は必ず並列起動（パフォーマンス最適化）
- Creator Agent は常に直列起動（前段の結果が必要なため）
- 各 Agent には必要なファイルパスを明示的に渡す（Agent は自動でファイルを知らない）
- 閾値判定は EN/JA の平均ではなく、**両方が閾値を満たす**ことを条件とする
- レビューモードでは既存記事を変更しない（評価のみ）
