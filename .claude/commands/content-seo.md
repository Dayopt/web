# SEO Review Agent

ブログ記事のSEO品質を10項目で評価し、スコアカードと修正指示を出力する。

## 入力

$ARGUMENTS — 評価対象のMDXファイルパス（例: `content/blog/en/timeboxing-with-dayopt.mdx`）

引数がない場合は、ユーザーにファイルパスを質問する。

## 事前準備

以下のファイルを読み込んで評価基準を把握:

1. 対象MDXファイル（EN版とJA版の両方）
2. `src/lib/content-schemas.ts` — frontmatter バリデーション
3. `src/platform/seo/metadata.ts` — メタデータ生成ロジック
4. `src/components/seo/StructuredData.tsx` — BlogPosting schema
5. `content/CLAUDE.md` — MDX記述ルール

## 評価項目（各0-10点、合計100点満点）

### 1. 検索意図の一貫性 (Search Intent Consistency)

- 記事全体が単一の検索意図（informational / transactional / navigational）に沿っているか
- 意図の混在がないか（例: ガイド記事なのに途中でセールスピッチに変わる）
- タイトル・見出し・本文の意図が一致しているか

### 2. キーワード配置 (Keyword Placement)

- 主要KWが以下に含まれるか: title, H1, description, 最初の100語, 少なくとも2つのH2
- 共起語・関連語が自然に散りばめられているか
- キーワードスタッフィングになっていないか

### 3. キーワード密度 (Keyword Density)

- 主要KWの出現率が 1-2% の範囲内か
- 本文中の自然な使用か、不自然な詰め込みか

### 4. 見出し構造 (Heading Structure)

- H1 = 1つのみ
- H2 = 5-8個（ガイド記事の場合）
- 論理的な階層構造（H2 > H3 > H4）
- 見出しだけ読んで記事の流れが把握できるか

### 5. Meta Description (メタディスクリプション)

- EN: 120-155文字 / JA: 80-120文字
- 主要KWを含む
- CTR（クリック率）を誘引する表現か
- 記事内容を正確に反映しているか

### 6. コンテンツ長 (Content Length)

- ガイド記事: EN 1500-3000 words / JA 3000-6000字
- トピックに対して適切な深さか
- 薄い内容の水増しはないか

### 7. 内部リンク (Internal Links)

- docs や他のブログ記事へのリンクがあるか
- アンカーテキストが説明的か（「こちら」ではなく具体的な説明）
- リンク切れがないか

### 8. 構造化データ対応 (Structured Data)

- frontmatter が `blogFrontMatterSchema` に完全準拠しているか
- BlogPosting schema に正しくマッピングされるか
- 必須フィールド（title, description, publishedAt, author）が適切か

### 9. E-E-A-T シグナル (Experience, Expertise, Authoritativeness, Trustworthiness)

- 具体的な経験や事例が含まれるか
- 数値データや根拠があるか
- 著者情報が適切か
- 主張に裏付けがあるか

### 10. URL/slug 最適化 (URL/Slug Optimization)

- 主要KWを含むか
- 短く読みやすいか（3-5語）
- 不要な単語（the, a, and等）が含まれていないか
- kebab-case で統一されているか

## 出力フォーマット

```markdown
## SEO スコアカード

**対象**: `<ファイルパス>`
**主要キーワード**: <推定した主要KW>
**検索意図**: <informational / transactional / navigational>

| #   | 項目             | スコア | 判定     |
| --- | ---------------- | ------ | -------- |
| 1   | 検索意図の一貫性 | X/10   | ✅/⚠️/❌ |
| 2   | キーワード配置   | X/10   | ✅/⚠️/❌ |
| 3   | キーワード密度   | X/10   | ✅/⚠️/❌ |
| 4   | 見出し構造       | X/10   | ✅/⚠️/❌ |
| 5   | Meta Description | X/10   | ✅/⚠️/❌ |
| 6   | コンテンツ長     | X/10   | ✅/⚠️/❌ |
| 7   | 内部リンク       | X/10   | ✅/⚠️/❌ |
| 8   | 構造化データ対応 | X/10   | ✅/⚠️/❌ |
| 9   | E-E-A-T シグナル | X/10   | ✅/⚠️/❌ |
| 10  | URL/slug 最適化  | X/10   | ✅/⚠️/❌ |

**総合スコア: XX/100**

---

### 問題リスト

#### CRITICAL（スコア 0-3 の項目）

- [CRITICAL] 項目名: 具体的な問題と修正指示

#### WARNING（スコア 4-6 の項目）

- [WARNING] 項目名: 具体的な問題と修正指示

#### INFO（スコア 7-8 の項目で改善余地あり）

- [INFO] 項目名: 改善提案

---

### 修正指示（Creator Agent 向け）

1. <最も影響の大きい修正から順に、具体的なテキストレベルの指示>
2. ...
```

## 判定基準

- ✅ = 8-10点（良好）
- ⚠️ = 4-7点（改善推奨）
- ❌ = 0-3点（要修正）

## 注意事項

- EN版とJA版を別々に評価し、それぞれスコアカードを出力
- 修正指示は具体的に（「descriptionを改善」ではなく「descriptionにキーワード"timeboxing"を含め、120文字以上にする」）
- frontmatter のバリデーションは `blogFrontMatterSchema` の定義に厳密に従う
