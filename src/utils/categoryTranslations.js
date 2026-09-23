export const getCategoryTranslationKey = (catName) => {
    if (!catName) return '';
    const mapping = {
        'Σούπερ Μάρκετ': 'cat_supermarket',
        'Φαγητό': 'cat_food',
        'Καφές': 'cat_coffee',
        'Σπίτι': 'cat_home',
        'Λογαριασμοί': 'cat_bills',
        'Διασκέδαση': 'cat_entertainment',
        'Βενζίνη': 'cat_fuel',
        'Υγεία': 'cat_health',
        'Μισθός': 'cat_salary',
        'Δώρο': 'cat_gift',
        'Επενδύσεις': 'cat_investments',
        'Άλλο': 'cat_other',
        'Άλλα Έσοδα': 'cat_other_income'
    };
    return mapping[catName] || ('cat_' + catName.toLowerCase());
};

export const getCategoryTranslation = (catName, t) => {
    if (!catName) return '';
    const key = getCategoryTranslationKey(catName);
    const translated = t(key);
    return translated === key ? catName : translated;
};

export const removeGreekAccents = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const getUppercaseCategoryTranslation = (catName, t) => {
    const translated = getCategoryTranslation(catName, t);
    return removeGreekAccents(translated).toUpperCase();
};
