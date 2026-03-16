import { env } from '@/config/env';
import { apiError, apiSuccess, ErrorCode } from '@/lib/api-response';
import { verifyCsrfToken } from '@/lib/csrf-protection';
import { isStrictPrivacyMode, maskEmail } from '@/lib/privacy';
import { contactRateLimit, getClientIp } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  category: z.string().min(1),
  message: z.string().min(10).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    // CSRF トークン検証
    if (!verifyCsrfToken(request)) {
      return apiError('Invalid CSRF token', 403, {
        code: ErrorCode.CSRF_INVALID,
      });
    }

    // レート制限チェック
    const ip = getClientIp(request);
    const { success, limit, remaining, reset } = await contactRateLimit.limit(ip);

    if (!success) {
      return apiError('Too many requests. Please try again later.', 429, {
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        details: {
          limit,
          remaining,
          reset: new Date(reset).toISOString(),
        },
      });
    }

    const body = await request.json();
    const data = contactSchema.parse(body);

    const githubToken = env.GITHUB_TOKEN;
    const githubRepo = env.GITHUB_CONTACT_REPO || 't3-nico/dayopt-web';

    if (!githubToken) {
      return apiError('Server configuration error', 500, { code: ErrorCode.CONFIG_ERROR });
    }

    const categoryLabels: Record<string, string> = {
      bug: 'バグ報告',
      feature: '機能リクエスト',
      question: '質問',
      other: 'その他',
    };

    // プライバシー保護: メールアドレスをマスク
    const displayEmail = isStrictPrivacyMode() ? '***@***' : maskEmail(data.email);

    const issueBody = `## お問い合わせ内容

**送信者:** ${data.name}
**メールアドレス:** ${displayEmail}
**カテゴリ:** ${categoryLabels[data.category] || data.category}

---

${data.message}

---

> [!WARNING]
> **個人情報保護について**
>
> この Issue には個人情報（名前、メールアドレス）が含まれています。
> - リポジトリは **必ず private** に設定してください
> - GDPR/個人情報保護法に準拠した取り扱いが必要です
> - メールアドレス: \`${data.email}\` (実際の返信用)
> - 作成日時: ${new Date().toISOString()}

*このissueはコンタクトフォームから自動作成されました。*
`;

    // タイムアウト設定（10秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`https://api.github.com/repos/${githubRepo}/issues`, {
        method: 'POST',
        headers: {
          Authorization: `token ${githubToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          title: `[Contact] ${categoryLabels[data.category] || data.category} - ${data.name}`,
          body: issueBody,
          labels: ['contact', 'triage'],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return apiError('Failed to submit contact request', 500, {
          code: ErrorCode.EXTERNAL_SERVICE_ERROR,
        });
      }

      const issueData = await response.json();

      return apiSuccess({
        success: true,
        issueNumber: issueData.number,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return apiError('Request timeout. Please try again later.', 504, {
          code: ErrorCode.TIMEOUT,
        });
      }

      return apiError('Failed to submit contact request', 500, {
        code: ErrorCode.EXTERNAL_SERVICE_ERROR,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError('Validation failed', 400, {
        code: ErrorCode.VALIDATION_ERROR,
        details: error.issues,
      });
    }

    return apiError('Internal server error', 500, { code: ErrorCode.INTERNAL_ERROR });
  }
}
