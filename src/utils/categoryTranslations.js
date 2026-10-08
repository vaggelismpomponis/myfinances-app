export const getCategoryTranslationKey = (catName) => {
    if (!catName) return '';
    const clean = catName.trim().toLowerCase();
    const mapping = {
        // Greek
        'σούπερ μάρκετ': 'cat_supermarket',
        'φαγητό': 'cat_food',
        'καφές': 'cat_coffee',
        'σπίτι': 'cat_home',
        'μεταφορικά': 'cat_transport',
        'αγορές': 'cat_shopping',
        'αγορες': 'cat_shopping',
        'λογαριασμοί': 'cat_bills',
        'διασκέδαση': 'cat_entertainment',
        'βενζίνη': 'cat_fuel',
        'υγεία': 'cat_health',
        'μισθός': 'cat_salary',
        'δώρο': 'cat_gift',
        'επενδύσεις': 'cat_investments',
        'άλλο': 'cat_other',
        'άλλα έσοδα': 'cat_other_income',
        // English
        'supermarket': 'cat_supermarket',
        'food': 'cat_food',
        'coffee': 'cat_coffee',
        'home': 'cat_home',
        'transport': 'cat_transport',
        'shopping': 'cat_shopping',
        'bills': 'cat_bills',
        'entertainment': 'cat_entertainment',
        'fuel': 'cat_fuel',
        'health': 'cat_health',
        'salary': 'cat_salary',
        'gift': 'cat_gift',
        'investments': 'cat_investments',
        'investment': 'cat_investments',
        'other': 'cat_other',
        'other_income': 'cat_other_income'
    };
    return mapping[clean] || ('cat_' + clean);
};

export const getCategoryTranslation = (catName, t) => {
    if (!catName) return '';
    const key = getCategoryTranslationKey(catName);
    const translated = t ? t(key) : key;
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
