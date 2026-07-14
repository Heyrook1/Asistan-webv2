# Tipografi doktrini (kilitli)

Kaynak kod: `lib/brand/typography.ts` · yükleme: `app/layout.tsx` (`@fontsource/manrope`)

**İlke:** Marka fontu = **ship edilen** stack. OS’ta bulunan SF Pro / Inter’i önde “vaat” etme.

## Canonical

| Rol | Font | Nasıl gelir |
|-----|------|-------------|
| Sans + heading | **Manrope** (400–800) | `@fontsource/manrope` self-host |
| Mono | **JetBrains Mono** | `@fontsource/jetbrains-mono` |
| Fallback | `system-ui`, `-apple-system`, `Segoe UI`, … | Yalnız Manrope yüklenmezse |

CSS: `app/globals.css` (`--font-sans`, `--font-heading`) · Tailwind: `tailwind.config.ts` (`fontFamily.sans` / `display`).

## Kurallar

1. Stack **Manrope ile başlar** — SF Pro / Inter asla lead olmaz.
2. Marketing ve dashboard aynı yüz: `font-sans` / `font-heading` = Manrope.
3. “Apple SF Pro estetiği” kopya veya brand kitte yazılmaz; görsel dil Manrope + `#0071E3`.
4. Mobil native (Expo) sistem tipografisi kullanabilir; web/marketing Manrope’tur.

## Yanlış

- CSS’te `'SF Pro Text', …, 'Manrope'` (macOS’ta farklı yüz, Windows’ta Manrope)
- Dokümanda “Font: SF Pro”, ürününde Manrope
- Google Fonts runtime fetch vaadi (build `@fontsource` kullanır)
