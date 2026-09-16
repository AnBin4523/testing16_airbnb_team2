import { Locator } from '@playwright/test';

export async function highlight(locator: Locator): Promise<void> {
  try {
    await locator.evaluate((element) => {
      const original = element.getAttribute('style') || '';
      element.setAttribute('style', `${original}; border: 3px solid red; background: yellow;`);
      setTimeout(() => element.setAttribute('style', original), 800);
    });
  } catch {
    // Locator may have detached before the highlight could apply; safe to ignore.
  }
}
