# UI Iconography Standards

## Policy
All icons throughout the application UI must strictly use Lucide icons (`lucide-react`) to maintain a clean, professional, and corporate aesthetic.

## Rules
1. **Exclusive Icon Library**: Always use `lucide-react` for all visual iconography, indicators, badges, and controls.
2. **Prohibit Emojis as UI Icons**: Do not use raw emojis or Unicode symbols (e.g. ⚠️, 🔥, 🎯, ✈️, 🚗, 🏠) as icons, category indicators, or badge visuals. Emojis render inconsistently across Android, Windows, and iOS, lack SVG scalability, and conflict with high-end dark/light design systems.
3. **Prohibit Gimmicky Icons (`Sparkles` & `Zap`)**: Never use star/sparkle (`Sparkles`) or lightning bolt (`Zap`) icons anywhere in the application. They conflict with a serious, corporate personal finance product. Always use professional, semantic icons instead (e.g., `ShieldCheck`, `CheckCircle2`, `Target`, `RefreshCw`, `TrendingUp`, `Wallet`, `CreditCard`, `Lightbulb`).
4. **Consistency & Sizing**:
   - Small chips / badges / mini cards: `size={12}` to `size={15}` with `shrink-0`.
   - Navigation / buttons: `size={16}` to `size={20}`.
   - Hero / empty states: `size={24}` to `size={44}`.
5. **Color & Theming**: Pair Lucide icons with theme colors (`text-violet-600 dark:text-violet-400`, `fill-*` where appropriate) and subtle background containers rather than unstyled emoji glyphs.
