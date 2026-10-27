# DESIGN

Decided 26 Oct 2026, revised the same day. The reference is the four mockups in `docs/mockups/`: `brancoPadrao.png` and `brancoDetalhe.png` (light), `petroPadrao.png` and `pretoDetalhe.png` (dark). They replace `overview-light.png` and `overview-dark.png`.

## Quem usa

A BF consultant, on a laptop and on a projector, during a client review. One project. One page. The question: are we about to lose part of the grant, and what is the cheapest way to avoid it?

## Personalidade

A monitor, not a worksheet. Calm neutral grey ground, near-white cards, one muted navy for the action. Light by default. Dark is a second theme, composed from the dark mockup, never an inversion of the light tokens.

## Página

One page. The navbar is fixed.

- Left: `public/bf-logo-clear.png` (the logo with its white made transparent, cut from `bf-logo.png`), a hairline, then "MetaCheck". No chip. In dark the logo turns light grey with a CSS filter. Then Overview, Simulator, Documents, What the AI sees.
- Documents opens a two-column menu: year, then document type, then only the filename. Pointing at or focusing a file shows its type, status and what was read from it on the right. Set aside files are folded at the end.
- What the AI sees lists each masked value beside its label (`999 999 990 → [NIF_1]`), grouped by type, with the total on top. The pairs stay in the browser; they are never sent to the model.
- Any open menu or the Add document drawer closes on a click outside it.
- The link of the section on screen is marked. A click scrolls there smoothly.
- Right: a sun or moon, then "+ Add document", which opens a drawer with a drop zone.
- `prefers-reduced-motion`: the scroll is instant. No travel on the theme change beyond a short fade.

The page opens on the panel. The call-confirmation screen appears only when a new call is added. "As of" is Q1, Q2 or Q3. The chart starts at Q1. Its legend is "Year-end projection as of each quarter". A simulation moves the result, the cut, the target cards and the year-end point from before to after. The chat sits fixed at the bottom. The microphone is not in this version.

On a phone the page scrolls normally. The navbar links slide sideways. The chat is a sheet from the bottom.

"Ask anything" stays fixed at the bottom right and opens the chat over the page. That control arrives with the chat.

## O que cada fase desenha

- Phase 1: the shell (navbar, theme, Add document) and the Documents and "What the AI sees" cards.
- Phase 2: Overview, the quarter-by-quarter chart, the Targets cards, and Verify.
- Phase 3: Simulator and the chat.

## Ajustes ao mockup

- No mini bar chart beside the cut. It does not stand for a number.
- The cut keeps a sentence, not only a euro figure: the rate cut in percentage points and the euros, as in "1.5 p.p. = €37,500", with the eligible investment beside it.
- Figures in the mockup are a picture. Every number on the page comes from the engine. If the picture and the answer sheet disagree, the answer sheet wins.
- In Verify, FTE is shown to 3 decimals (22.667) or marked "rounded", so the arithmetic can be checked by hand. The panel itself keeps the answer sheet's rounding.
- Explanations say pseudonymised, never anonymised. Values and dates stay visible. The before/after text is whatever the pipeline masked, not the sample line drawn in the mockup.

## Tokens

Revised 27 Oct 2026 (direction A, neutral grey). The 26 Oct mockup colours were too white in light and too blue in dark. Colour now lives only in the action, the selection and the states.

Light:

- Page and navbar `#EEF0F3`, navbar with a hairline under it. Cards `#F9FAFB`. Lines `#E1E4E9`.
- Ink `#1B2430`. Muted `#566170`.
- Action `#2F5A86`, hover `#264B70`. Chart line `#6A93A8`.
- States, muted: dots `#4A9A6D` / `#CF9440` / `#C95D52`; text `#2B6544` / `#845615` / `#8C3A32` on pale washes. The cut amount is `#A9502C`.
- Target cards are neutral. The state lives in the ring, the dot and the word. BEST 2 is a navy hairline ring and a pale chip. No coloured band behind the four targets.
- Chat dock `#E6E9ED` with a hairline on top. No mint.

Dark, composed on its own:

- Page and navbar `#121519` (charcoal, no blue). Cards `#191C21`. Lines `#2A2F36`.
- Ink `#E5E8EC`. Muted `#9AA2AD`. Action `#8FB0D3` with dark type on it.
- Green, red and amber are lighter, softer pairs that still clear 4.5:1 on the card.

Space Grotesk (500–700) for titles and the large figures. Inter (400–700) for text, labels and buttons. Both files live in `app/fonts/` with the SIL Open Font License beside them. Nothing is fetched at runtime. Tabular numbers. Cards use a 16px radius and a hairline border.

## Gesto distintivo

The navbar pill on the section you are reading. One gesture. Gauges and the quarter chart draw the data. They are not decoration.

## Acessibilidade e idioma

WCAG AA. English. The company name keeps its own spelling. Money as in the demo: €37,500.00.

## Decisões de 26 out, ao alinhar com a spec

- Space Grotesk and Inter, self-hosted. The earlier IBM Plex choice was only because the mockup had not named a face.
- No 2025 point and no 2025 option. Data year is Q1, Q2 or Q3.
- The chart legend stays "Year-end projection as of each quarter".
- The simulated sentence is `effectCopy` of the levers that are on. Quarter sentences only restate the engine result and the best two. No August-shutdown story.
- Chat buttons are the three section-5 questions and answer from the saved copy at once. No microphone. Next steps: voice transcribed on the laptop, and photos or files dropped into the chat (masked by the same door). 2026-10-27: the conversation is one card floating above the one-row dock (the dock never grows), title "Ask the panel" with "Personal data pseudonymised" and an X to hide, badges "Live · numbers checked" / "Saved answer" / "Model unavailable", the consultant line apart, sources as small tags, and three pulsing dots with the stage while it waits.
- The cut keeps the percentage-point sentence and the eligible investment.
- Target lines use the engine field: growth as a percent for turnover and value added, extra FTE for jobs. The absolute euro target is not computed in the interface.
- The four cost lines (14/12, 23.75%, 1.5%) are not drawn. The box shows the totals the cost functions already return.
- The amber band at 60% is not used. A point is green at or above the threshold; the current point stays amber when the engine still has a path to no cut.
- Document groups use a year found in the filename. The menu does not say the AI sorted them.
- Sales steps stay €1,000. The people stepper stays 0 to 5. Start dates stay every month the engine offers.

## Decisões de 27 out, navbar e simulador

- Navbar, chat dock and their pop-overs wear the opposite theme (`.surface-alt`): light grey `#D5DAE0` in dark, charcoal `#121519` in light.
- The simulator sits on a calm blue (`.surface-accent`: `#46709B` light, `#33506E` dark). Its content lives on page-theme cards (`.surface-card`) so status colours stay readable.
- Tabs: Suggestions · Sales · Hiring · Combined. Hiring takes graduates and non-graduates together, each with its own count and salary, one start date.
- Each lever tab: a read-only Preview card on top (result and cut, before → after, bar against the target, `effectCopy` one sentence per line) and Adjust cards below, outlined in the action colour.
- Suggestions come from the engine (`paths` with a `plan`): hire, one graduate plus sales, sales. Cards lift on hover and show "Apply →".
