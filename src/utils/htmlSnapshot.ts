/** Injects a <base href> into captured HTML so relative asset URLs still resolve when the snapshot is reloaded offline via page.setContent(). */
export function injectBaseTag(html: string, originUrl: string): string {
  if (/<base[\s>]/i.test(html)) {
    return html;
  }

  const origin = new URL(originUrl).origin;
  const baseTag = `<base href="${origin}/">`;

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match) => `${match}${baseTag}`);
  }

  return `${baseTag}${html}`;
}
