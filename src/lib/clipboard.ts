export async function copyToClipboard(value: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (window.navigator?.clipboard?.writeText) {
    try {
      await window.navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall through to DOM fallback
    }
  }

  try {
    const el = document.createElement('textarea');
    el.value = value;
    el.setAttribute('tabindex', '-1');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;pointer-events:none;opacity:0;left:-9999px;top:-9999px;';
    document.body.appendChild(el);
    el.focus();
    el.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(el);
    return successful;
  } catch {
    return false;
  }
}
