/**
 * 预览服务
 * 用于生成代码预览
 */

const PREVIEW_CSP = [
  "default-src 'none'",
  "img-src data: blob:",
  "style-src 'unsafe-inline'",
  "font-src data:",
  "script-src 'none'",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join('; ');

/**
 * 简化的预览服务（不使用 WebContainer）
 * 默认禁用脚本，适合本地 Alpha 预览。
 */
export class SimplePreviewService {
  /**
   * 生成带 CSP 的完整 HTML 文档
   */
  static createPreviewDocument(html: string, css?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">
          <style>
            ${css || ''}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }

  /**
   * 生成 HTML 预览 URL
   */
  static createPreviewUrl(html: string, css?: string): string {
    const fullHtml = SimplePreviewService.createPreviewDocument(html, css);

    const blob = new Blob([fullHtml], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  /**
   * 清理 URL
   */
  static revokeUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}
