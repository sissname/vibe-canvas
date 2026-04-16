/**
 * 预览服务
 * 用于生成代码预览
 */

/**
 * 简化的预览服务（不使用 WebContainer）
 * 使用 Blob URL 直接预览 HTML
 */
export class SimplePreviewService {
  /**
   * 生成 HTML 预览 URL
   */
  static createPreviewUrl(html: string, css?: string, js?: string): string {
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${css || ''}
          </style>
        </head>
        <body>
          ${html}
          <script>
            ${js || ''}
          </script>
        </body>
      </html>
    `;

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
