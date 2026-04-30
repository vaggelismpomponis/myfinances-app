$path = "c:\Projects\MyFinancesApp\src\utils\translations.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$el_inject = @"
    el: {
        stats_portfolio_overview: 'Επισκόπηση Χαρτοφυλακίου',
        stats_total_spent: 'Συνολικά Έξοδα',
        stats_trend_analysis: 'Ανάλυση Τάσεων',
        net_flow: 'Καθαρή Ροή',
        close: 'Κλείσιμο',
"@

$en_inject = @"
    en: {
        stats_portfolio_overview: 'Portfolio Overview',
        stats_total_spent: 'Total Spent',
        stats_trend_analysis: 'Trend Analysis',
        net_flow: 'Net Flow',
        close: 'Close',
"@

$content = $content -replace "el: \{", $el_inject
$content = $content -replace "en: \{", $en_inject

[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
