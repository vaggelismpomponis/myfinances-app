import { describe, it, expect } from 'vitest';
import { getCategoryTranslationKey, getCategoryTranslation, removeGreekAccents, getUppercaseCategoryTranslation } from '../categoryTranslations';
import { translations } from '../translations';

describe('Category Translations Logic', () => {
    const mockT = (key) => translations.el[key] || key;
    const mockTEn = (key) => translations.en[key] || key;

    it('translates shopping / αγορές / αγορες correctly in Greek and English', () => {
        expect(getCategoryTranslationKey('shopping')).toBe('cat_shopping');
        expect(getCategoryTranslationKey('αγορές')).toBe('cat_shopping');
        expect(getCategoryTranslationKey('αγορες')).toBe('cat_shopping');
        expect(getCategoryTranslationKey('Shopping')).toBe('cat_shopping');

        expect(getCategoryTranslation('shopping', mockT)).toBe('Αγορές');
        expect(getCategoryTranslation('αγορές', mockT)).toBe('Αγορές');
        expect(getCategoryTranslation('αγορες', mockT)).toBe('Αγορές');

        expect(getCategoryTranslation('shopping', mockTEn)).toBe('Shopping');
        expect(getCategoryTranslation('αγορές', mockTEn)).toBe('Shopping');
    });

    it('translates transport / μεταφορικά correctly', () => {
        expect(getCategoryTranslationKey('transport')).toBe('cat_transport');
        expect(getCategoryTranslationKey('μεταφορικά')).toBe('cat_transport');
        expect(getCategoryTranslation('transport', mockT)).toBe('Μεταφορικά');
        expect(getCategoryTranslation('transport', mockTEn)).toBe('Transport');
    });

    it('handles empty or unrecognized categories gracefully without errors', () => {
        expect(getCategoryTranslation('', mockT)).toBe('');
        expect(getCategoryTranslation(null, mockT)).toBe('');
        expect(getCategoryTranslation('CustomCategory', mockT)).toBe('CustomCategory');
    });

    it('handles uppercase with Greek accents stripped correctly', () => {
        expect(getUppercaseCategoryTranslation('αγορές', mockT)).toBe('ΑΓΟΡΕΣ');
        expect(removeGreekAccents('Επενδύσεις')).toBe('Επενδυσεις');
    });
});
