import { describe, it, expect } from 'vitest';
import { translations } from '../translations';

describe('Translations Consistency', () => {
  it('has the same keys for English and Greek', () => {
    const elKeys = Object.keys(translations.el).sort();
    const enKeys = Object.keys(translations.en).sort();

    // Check if they have the same number of keys
    expect(elKeys.length).toBe(enKeys.length);

    // Deep check to identify missing keys
    const missingInEn = elKeys.filter(key => !enKeys.includes(key));
    const missingInEl = enKeys.filter(key => !elKeys.includes(key));

    expect(missingInEn, `Keys present in 'el' but missing in 'en': ${missingInEn.join(', ')}`).toEqual([]);
    expect(missingInEl, `Keys present in 'en' but missing in 'el': ${missingInEl.join(', ')}`).toEqual([]);
  });

  it('contains essential keys for navigation', () => {
    const essentialKeys = ['nav_home', 'nav_history', 'nav_stats', 'nav_profile'];
    
    essentialKeys.forEach(key => {
      expect(translations.el).toHaveProperty(key);
      expect(translations.en).toHaveProperty(key);
    });
  });

  it('translations are strings or numbers', () => {
    Object.values(translations.el).forEach(val => {
      expect(typeof val === 'string' || typeof val === 'number').toBe(true);
    });
    Object.values(translations.en).forEach(val => {
      expect(typeof val === 'string' || typeof val === 'number').toBe(true);
    });
  });
});
