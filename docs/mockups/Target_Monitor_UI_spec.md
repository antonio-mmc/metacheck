# Target Monitor · especificação de UI para o Cursor

> **Para que serve:** reproduzir no projeto `hackathon-metas`, tal e qual, o ecrã "Target Monitor — Demo Têxtil" do mockup.
> **Regra do evento:** o código é escrito de raiz no evento. Este documento descreve **o que** construir (medidas, cores, textos, regras, comportamento). Não contém código para copiar.
> Coloca-o em `contexto/ui-spec.md` e junta-o ao contexto do Cursor juntamente com `regras-calculo.md` e `folha-de-respostas.md`.

---

## 0. Prompt para colar no Cursor

```
Lê contexto/ui-spec.md, contexto/regras-calculo.md e contexto/folha-de-respostas.md.
Constrói o ecrã "Target Monitor" exatamente como descrito em ui-spec.md:
mesma ordem de blocos, mesmas medidas, cores (tokens da secção 2), textos em inglês
(secção 9) e comportamento (secção 10). Todos os números vêm do motor de cálculo
(secção 8) — nunca escritos à mão no componente.
Constrói por fases e confirma comigo no fim de cada uma:
1) layout estático com dados fixos; 2) motor de cálculo + testes da secção 11;
3) simulador; 4) gráfico clicável; 5) chat/voz; 6) modo escuro.
No fim, corre os testes da secção 11 e mostra-me a tabela.
```

---

## 1. Princípios visuais

- Tudo em **inglês**. Moeda com vírgula de milhar: `€37,500`, `€8,767.50`. Percentagens com 2 casas: `64.50%`.
- **Sem scroll** em 1280×800 e 1440×900 (desktop). Abaixo de 1100 px de largura, os blocos empilham e a página pode fazer scroll.
- **Fundo claro**, cartões brancos, nada de painéis escuros (exceto a faixa dos 4 indicadores e a barra de navegação, que são azul-escuro BF). Modo escuro é opcional (toggle).
- **Semáforos com texto ao lado**, nunca só cor.
- Voz da BF, nunca nomes de funcionários. Sugestões sempre com `Suggestion · to be confirmed by BF`.
- Tipografia:
  - **Space Grotesk** 500/600/700 → títulos e todos os números grandes.
  - **Inter** 400/500/600/700 → texto corrido, rótulos, botões.
  - Carregar ambas do Google Fonts.
- Cantos: cartões 16–18 px; botões 10–12 px; pílulas 999 px.
- Alvos de toque ≥ 36 px (botões principais 44 px).
- Animações curtas: entrada de valores com fade + 6 px para cima (0,45 s); anéis dos indicadores animam o arco (0,9 s); ponto simulado no gráfico desliza (0,6 s).

---

## 2. Tokens de cor

| Token | Light | Dark | Uso |
|---|---|---|---|
| `bg` | `#EEF4FA` | `#06101F` | fundo da página |
| `nav` | `#0A4174` | `#0E2A4A` | barra de navegação |
| `panel` | `#FFFFFF` | `#0C1A2E` | cartões |
| `panel2` | `#F3F8FC` | `#10223A` | botões secundários, caixas internas |
| `border` | `#D9E5EF` | `#1C3150` | contornos |
| `grid` | `#E6EEF5` | `#16294A` | linhas do gráfico |
| `ink` | `#001D39` | `#EAF2FA` | texto principal |
| `muted` | `#4A6075` | `#93A9C0` | texto secundário |
| `accent` | `#0A4174` | `#7BBDE8` | botões ativos, rótulos |
| `accent2` | `#4E8EA2` | `#4EE2C4` | linha do gráfico, realces de simulação |
| `onAccent` | `#FFFFFF` | `#001D39` | texto sobre `accent` |
| `simBg` | `#E3EFF8` | `#12304F` | fundo de chips de simulação |
| `goodBg` / `goodText` | `#EEF7F1` / `#14532D` | `#0F2A1E` / `#86EFAC` | verde |
| `warnBg` / `warnText` | `#FFF1DF` / `#8A4B00` | `#3A2A10` / `#FCD34D` | âmbar |
| `badBg` / `badText` | `#FDF1F1` / `#7F1D1D` | `#2A1418` / `#FCA5A5` | vermelho |
| `ok` | `#15803D` | `#4ADE80` | texto "sem corte" |
| `dim` | `#C9D3DE` | `#2A3B55` | luzes apagadas do semáforo |
| `indBand` | `#0A4174` | `#1B4F80` | faixa dos 4 indicadores |
| `dock` | `#CFEFE9` | `#7FCFC2` | barra do chat (verde-água suave) |
| `shadow` | `0 6px 20px rgba(10,65,116,.06)` | `0 10px 30px rgba(0,0,0,.35)` | sombra dos cartões |

Cores fixas dos semáforos: verde `#22C55E`, âmbar `#F59E0B`, vermelho `#EF4444`.
Paleta BF: `#001D39 → #0A4174 → #4E8EA2 → #7BBDE8 → #BDD8E9`.

### Regras dos semáforos
- **RO:** verde ≥ 70% · âmbar 60–70% · vermelho < 60% *(limites do âmbar por confirmar)*.
- **Indicador (% da meta):** verde ≥ 100% · âmbar 70–99% · vermelho < 70% · cinzento se não há dados.
- Texto de estado do indicador: `On track` / `At risk` / `Off track` / `Needs staff map`.

---

## 3. Estrutura da página (de cima para baixo)

```
┌ NAV (azul #0A4174, 60px) ── logo │ Overview · Simulator · Documents·18▾ · What the AI sees▾ │ ☀☾ · + Add document ┐
├ TÍTULO (1 linha) ─ Target Monitor · empresa/aviso · [Synthetic data] ············ Data year [2026 ▾] ┤
├ CURRENT POSITION (cartão, 1 linha) ─ semáforo · RO · corte · prazo ┤
├ FAIXA "THE 4 TARGETS" (azul-escuro) ─ 4 cartões numa linha ┤
├ GRÁFICO (7/12 colunas)                         │ SIMULADOR (5/12 colunas)        ┤
└ BARRA DO CHAT (verde-água, fixa em baixo) ─ 🎤 · caixa de texto · ➜ · 2 perguntas sugeridas ┘
```

- Contentor principal: padding 12 px 20 px; gap 12 px; grelha de 12 colunas a partir de 1100 px.
- Linhas da grelha: `auto auto auto minmax(360px, 1fr)`. A última linha (gráfico + simulador) **tem mínimo de 360 px**. Sem este mínimo, o gráfico desaparece (foi o erro no mockup).
- A barra do chat é `sticky` em baixo.

---

## 4. Barra de navegação

- Fundo `nav`, padding 8 px 20 px. Em desktop é uma **grelha de 3 colunas** `1fr auto 1fr`: logo à esquerda, separadores **centrados**, controlos à direita.
- **Logo:** caixa 44 px de altura, contorno tracejado `#BDD8E9`, texto `[BF logo]`, até haver o PNG/SVG.
- **Separadores** (por esta ordem): `Overview` · `Simulator` · `Documents · 18 ▾` · `What the AI sees ▾`.
  - Botão: 44 px de altura, padding 10 px 14 px, raio 10 px, 14 px semibold, ponto de 8 px antes do texto.
  - Ativo: fundo `rgba(255,255,255,.18)`, texto branco, ponto `#7BBDE8`. Inativo: transparente, texto `#BDD8E9`, ponto `#6EA2B3`.
  - O ponto de `What the AI sees` é sempre verde `#22C55E`.
  - `Simulator` faz scroll até ao simulador e acende-lhe um halo `0 0 0 4px accent2` durante 1,6 s.
  - `Documents` e `What the AI sees` abrem um menu para baixo (largura 560 px, raio 16 px, sombra `0 24px 60px rgba(0,29,57,.28)`), com a seta a rodar 180°. Só um aberto de cada vez.
- **Direita:**
  - Interruptor de tema: pílula com 2 botões redondos de 38 px, **☀ sol** e **☾ lua**. O ativo tem fundo branco e ícone `#0A4174`; o inativo é transparente com ícone `#BDD8E9`.
  - Botão `+ Add document`: fundo branco, texto `#0A4174`, 13 px bold.

### Menu "Documents · 18"
Título `18 DOCUMENTS · SORTED BY YEAR BY AI` e subtítulo `0 missing · 2 set aside as irrelevant`. Grupos (etiqueta colorida + linhas `ficheiro ··· tipo`):

| Grupo | Ficheiros → tipo |
|---|---|
| `2026 · target year · 5` | Balancete 1T 2026.pdf → Trial balance · Q1 · balancete junho.xlsx → Trial balance · Q2 · Balancete_Set2026.csv → Trial balance · Q3 · mapa pessoal 2026.xlsx → Staff map · 30 Sep · extratoDR_092026.pdf → Social Security · Sep |
| `2025 · investment year · 2` | IES 2025 comprovativo.pdf → Annual report (IES) · Termo Aceitacao assinado.pdf → Acceptance term · targets |
| `Pre-project and earlier · 3` | IES 2023.pdf → Pre-project 2023 · baseline · RU 2023 Anexo A.pdf → Staff 2023 · baseline · IES_2024_DemoTextil.pdf → Annual report 2024 · context |
| `No year · certificates · 5` | scan_0042.pdf · Certificado Ricardo.pdf · … → Level 6–7 · qualified · scan_0057.pdf → Level 5 · not qualified (âmbar) |
| `Rules and set aside · 3` | aviso-MPR-2024-3….pdf → Notice · rules · FT 2026-0815.pdf · Apresentacao Demo Textil.docx → Irrelevant · set aside |

### Menu "What the AI sees"
- Título verde: `PERSONAL DATA IS MASKED BEFORE IT REACHES THE AI`.
- `BEFORE` (fundo `badBg`, monoespaçado 12 px): `Lã Demo Fios, Lda. · NIF 509 000 001 · IBAN PT50 0000 0000 0000 0000 0000 1 · €48,210.00`
- `AFTER` (fundo `goodBg`): `[COMPANY_2] · NIF [NIF_SUPPLIER_1] · IBAN [IBAN_1] · €48,210.00`
- Rodapé: `Values and dates stay. Every AI call is logged.`

---

## 5. Linha de título

Por esta ordem, numa linha com gap 10 px:
- `Target Monitor` (Space Grotesk 22 px bold).
- `Demo Têxtil, Lda. · Notice MPR-2024-3 · Target year 2026 · Threshold 70%` (13 px, `muted`).
- Pílula `Synthetic data` (fundo `warnBg`, texto `warnText`, 11 px bold).
- Espaço flexível.
- Rótulo `Data year` + **menu simples (select)** com as opções `2026 · up to Q3` (por defeito) e `2025 · IES`. Altura 38 px, raio 10 px, 14 px bold.

---

## 6. Cartão "Current position"

Cartão `panel`, raio 16 px, padding 12 px 16 px, uma linha flexível com gap 16 px:

1. **Semáforo vertical:** caixa `#E9EFF5` com raio 20 px e 3 luzes de 18 px. A luz acesa tem brilho `0 0 0 3px <cor>33, 0 0 12px <cor>`; as apagadas usam `dim`. Ao lado:
   - `CURRENT POSITION · 30 SEP 2026` (11 px, maiúsculas, `accent`)
   - `From 16 documents · latest: Balancete_Set2026.csv` (12 px, `muted`)
   - estado a cor, por exemplo `Amber · cut expected, still fixable`
2. **3 KPIs**, cada um com uma linha separadora à esquerda:

| Título | Valor (Space Grotesk 26 px) | Sub-texto |
|---|---|---|
| `Projected RO for 2026` | `64.50%` (cor do semáforo RO) | `Target ≥ 70% · best 2 indicators` |
| `Cut expected` (ou `No cut expected`) | `€37,500` (`#C2410C`; verde se 0) | `Of the €1,125,000 grant` |
| `Deadline to act` | `1 Nov 2026` | `1 graduate was enough until 1 Sep · now 2` |

- **Com simulação ativa**, o valor atual fica a 50% de opacidade e aparece ao lado uma caixa grande: `→` (26 px) + valor simulado (Space Grotesk **30 px** bold) + `SIMULATED` (10 px). A caixa tem contorno de 2 px e raio 12 px. É verde (`goodBg`/`goodText`) se o RO simulado for ≥ 70, âmbar se 60–70 e vermelha se < 60. Só os dois primeiros KPIs têm simulação.
- **Ano 2025:** os KPIs passam a `RO if measured on 2025` 27.77% · `Cut` = `Not yet` · `Deadline to act` = `1 Jan 2026` (`Hires from 1 Jan count in full · 1.00 FTE each`). O estado fica `Red · 2025 starting point, 2026 still ahead`.

---

## 7. Faixa "The 4 targets" (destaque máximo)

- Faixa com fundo `indBand` (`#0A4174`), raio 18 px e padding 8 px 10px 10 px.
- Cabeçalho a branco: `THE 4 TARGETS OF THE NOTICE` (11 px, maiúsculas) + `RO = average of the best 2 · marked BEST 2` (12 px, opacidade .85).
- 4 cartões numa linha (grelha de 4 colunas iguais, gap 12 px). Cada cartão:
  - **Fundo da cor do estado** (`goodBg` / `warnBg` / `badBg`), contorno de **2 px na cor do semáforo**, raio 16 px, padding 12 px 14 px.
  - **Os 2 que contam** levam um halo `0 0 0 4px #7BBDE8` e a sombra `0 12px 28px rgba(0,0,0,.28)`. Os outros levam só a sombra `0 6px 16px rgba(0,0,0,.18)`.
  - **Anel de 84 px** (traço de 11 px, pista `rgba(0,29,57,.10)`, arco na cor do semáforo, a começar em cima). O arco enche até 100% no máximo. No centro: a % (Space Grotesk 17 px, cor do texto do estado) e por baixo `of target` (9 px).
  - À direita do anel:
    - Nome em maiúsculas (13 px bold): `TURNOVER`, `VA / WORKER`, `JOBS CREATED`, `QUALIFIED JOBS`.
    - Selo: `★ BEST 2 · counts` (fundo `#0A4174`, texto branco, 10 px) **ou** `not counting now` (10 px, `muted`).
    - Valor (Space Grotesk 24 px): `€3.02M` · `€33,955` · `22.67 FTE` · `3.42 FTE`.
    - Linha de estado: ponto de 9 px + `Off track · target €3.00M`, etc. Metas: `target €3.00M`, `target €37,636`, `target 25.00 · 24 people now`, `target 5.00 · 4 people now`.
    - Com simulação, se o valor mudou: o contorno passa a `accent2` e aparece a pílula `Sim 37.50% ↑` (fundo `accent`, texto branco).
- A % no anel mostra 1 casa decimal; a partir de 100% fica sem casas (`104%`).

---

## 8. Motor de cálculo (sempre a mesma função para tudo)

Regras do aviso MPR-2024-3 (confirmar com `regras-calculo.md`):

- **Pré-projeto 2023:** VN 2,400,000 · VA 720,000 · 22.00 ETI · 3.00 ETI qualificados → VA/ETI = 720,000 / 22.
- **Metas:** VN +25% · VA/ETI +15% · emprego +3 ETI · qualificado +2 ETI.
- **Rácio de cada indicador (% da meta):**
  - VN: `(VN / 2,400,000 − 1) / 0.25 × 100`
  - VA/ETI: `((VA / ETI) / (720,000/22) − 1) / 0.15 × 100`
  - Emprego: `(ETI − 22) / 3 × 100`
  - Qualificado: `(ETIq − 3) / 2 × 100` (é nulo se não houver dados; nesse caso o indicador fica fora da escolha dos 2 melhores)
- **RO = média dos 2 rácios mais altos**, sem teto de 100%. Guardar quais foram os 2 (para o selo BEST 2).
- **Corte (€)** = 0 se RO ≥ 70. Caso contrário: `mín(3; ⌈(70 − RO)/2⌉ × 0.5)` % × 2,500,000.
- **Projeção 2026** (dados até ao T3): VN 3,024,000 · VA 769,636.29 · ETI 22 + 2/3 · ETIq 3 + 5/12.
- **2025 (IES):** VN 2,598,000 · VA = 2,598,000 + 5,200 − 1,273,020 − 577,380 · ETI = 42,720 / 1,920 · ETIq nulo.
- **Simulação** (parâmetros: g licenciados a partir do mês gm; u não licenciados a partir do mês um; vendas extra S):
  - fração do ano: `(13 − mês) / 12` (1 nov → 2/12; 1 dez → 1/12)
  - ETI = base + g·fg + u·fu · ETIq = base + g·fg · VN = 3,024,000 + S · **o VA não muda** (contratar baixa o VA/ETI).
- **Custo de uma pessoa para a empresa:**
  - `salário base × 14 ÷ 12` (subsídios de férias e Natal)
  - `+ 23.75%` de Segurança Social da empresa
  - `+ ≈1.5%` de seguro de acidentes de trabalho
  - = `salário × 14/12 × 1.2525` por mês (€1,500 → **€2,191.88/mês**; €1,000 → €1,461.25/mês)
  - Até 31 dez = n.º de pessoas × mensal × `(13 − mês)`. Por ano = n.º de pessoas × mensal × 12.
- **Mínimo para chegar aos 70%:**
  - licenciados ou não licenciados: o menor k entre 1 e 10 com RO ≥ 70;
  - vendas: o menor múltiplo de €1,000 com RO ≥ 70.

---

## 9. Gráfico "RO until the target year" (7/12)

- Cartão `panel`, raio 18 px, padding 14 px 16 px.
- Cabeçalho: `RO until the target year` (Space Grotesk 18 px) + legenda à direita: linha cheia `accent2` **Current** · tracejado `accent` **Simulated** · tracejado vermelho **70% target**.
- Nota (12 px, `muted`): `Click a point or a ▲▼ change to see what moved the RO.`
- **Área do gráfico:** mínimo 240 px de altura. Eixo Y de 20% (em baixo) a 90% (em cima), com rótulos `90%`, `70%` (vermelho, bold), `50%`, `30%` e linhas de grelha. Linha tracejada vermelha nos 70%.
- **Eixo X** (posições horizontais 6% · 30% · 50% · 70% · 94%): `2025 (IES)` · `Q1 '26` · `Q2` · `Q3` · **`Year end 2026`** (bold).
- **Dados:** 2025 = 27.77 · T1 = 58.99 · T2 = 73.39 · T3 = 64.50 · fim de ano = 64.50 (projeção).
- Linha cheia de 3 px `accent2` de 2025 a T3, com área por baixo a 14% de opacidade. Tracejado `accent2` de T3 ao fim do ano. Com simulação, um segundo tracejado (`accent`, 2,5 px) de T3 até ao valor simulado.
- **Linha "Today"** pontilhada vertical em T3, com a pílula `Today` em baixo.
- **Pontos clicáveis** (área de toque 30 px): círculo de 13 px na cor do semáforo RO, que passa a 18 px com halo `accent2` quando está selecionado. Rótulos: `2025: 27.77%`, `58.99%`, `73.39%`, `64.50%`, e no fim do ano `Now 64.50%` numa caixinha com contorno da cor.
- **Etiquetas de variação**, a meio de cada segmento e clicáveis: `▲ +31.22`, `▲ +14.40`, `▼ −8.89`. A subida é verde (`goodBg` + texto `ok`) e a descida vermelha (`badBg` + texto vermelho).
- **Ponto simulado:** círculo de 14 px com contorno tracejado de 3 px e a etiqueta `Sim 70.75%` (fundo `accent`). Desliza na vertical quando o valor muda.
- **Ano 2025:** só aparece o ponto de 2025, e os rótulos X de 2026 ficam esbatidos.

### Painel de explicação (escondido até clicar)
- **Fechado por defeito.** Clicar num ponto ou numa etiqueta ▲▼ abre o painel à direita do gráfico (230–320 px, linha separadora à esquerda). Voltar a clicar no mesmo ponto fecha. Tem um botão **`✕ Close`** (pílula, 30 px).
- Conteúdo:
  - rótulo (10 px, maiúsculas)
  - `RO 64.50%` (Space Grotesk 24 px, cor do semáforo) + pílula `▼ −8.89 p.p. vs before`
  - frase explicativa (12 px)
  - tabela `INDICATOR · % OF TARGET | NOW | CHANGE` com os 4 indicadores (ponto de cor, nome, selo BEST 2, valor com 1 casa, variação com sinal a verde ou vermelho)
  - `Source: …`

| Ponto | Rótulo | Indicadores (VN, VA, Emp, Qual) | Frase | Fonte |
|---|---|---|---|---|
| 2025 | `2025 · measured from the IES` | 33.0, 22.5, 8.3, n/a | Investment year, measured from the annual report. Turnover +8.25% and VA per worker +3.4% over 2023: far from the targets, as expected while the project is still being installed. | IES 2025 comprovativo.pdf |
| T1 | `Q1 2026 · projected to year end` | 92.0, 26.0, 22.2, 20.8 | First quarter of the target year, projected to 31 Dec. The new line is selling, so projected turnover jumps from 33% to 92% of its target. Jobs grew too, but stay outside the best 2, so the RO follows turnover and VA per worker. | Balancete 1T 2026.pdf · mapa pessoal 2026.xlsx |
| T2 | `Q2 2026 · projected to year end` | 118.0, 28.8, 22.2, 20.8 | Best quarter so far. A large spring export order lifts projected turnover to 118% of target and VA per worker rises with it. The RO crosses 70%. | balancete junho.xlsx |
| T3 | `Q3 2026 · projected to year end` | 104.0, 25.0, 22.2, 20.8 | August shutdown and lower invoicing pull projected turnover back to 104%. Fixed costs stayed, so VA per worker drops to 25%. The RO falls back below 70% and a cut appears. | Balancete_Set2026.csv · mapa pessoal 2026.xlsx · extratoDR_092026.pdf |
| Fim de ano | `Year end 2026 · if nothing changes` | = T3 | Q3 is the latest view, so it is the year-end projection: RO 64.50%, cut €37,500 of the grant. Hires from 1 Nov still count. Try the simulator to see what closes the gap. | Notice MPR-2024-3 · 16 documents up to 30 Sep 2026 |
| Sim | `Simulated year end` | do motor | With 2 graduates from 1 Nov: cut €0 instead of €37,500. Hires raise jobs (and qualified jobs, for graduates) but lower VA per worker. | Simulator settings · suggestion to be confirmed by your BF consultant |

⚠️ A divisão por indicador do T1 e do T2, e as razões (encomenda de exportação, paragem de agosto), são **ilustrativas**. Substituir pelos valores reais da `folha-de-respostas.md` / `empresa-inventada.md`.

---

## 10. Simulador (5/12)

- Cartão `panel`, raio 18 px, padding 14 px 16 px, scroll interno se faltar altura.
- Cabeçalho: `Simulator` (Space Grotesk 18 px) + `Suggestion · to be confirmed by BF` (11 px) + botão `Reset all` (pílula).
- **5 separadores** (controlo segmentado, fundo `panel2`, botões de 36 px, o ativo em `accent`): `Suggestions` · `Graduates` · `Non-grads` · `Sales` · `Combined`. Cada separador com valor mostra um badge (`2`, `+67k`).
- **Abre por defeito em `Suggestions`.**

### 10.1 Suggestions (antes de mexer em qualquer variável)
- Título `How to keep the full grant` (14 px bold).
- Texto: `Only the best 2 of the 4 targets count. Today: Turnover 104.0% + VA/worker 25.0% → RO 64.50%, cut €37,500. Each option brings the cut to €0. Cheapest first · tap one to apply it.`
- Lista de opções **calculadas pelo motor**, ordenadas por custo até 31 dez. Cada opção é um botão com: número da ordem num círculo verde, título, linha "Best 2", detalhe, e à direita o custo (Space Grotesk 14 px) com `to 31 Dec` ou `no hiring` por baixo.

| # | Título | Best 2 | Detalhe | Custo |
|---|---|---|---|---|
| 1 | `+€67,000 extra sales by 31 Dec` | `Turnover 115.2% + VA/worker 25.0% → RO 70.08%` | `Cut €0 · needs orders invoiced by 31 Dec` | `€0` |
| 2 | `1 graduate from 1 Nov + €41,000 sales` | `Turnover 110.8% + Qualified 29.2% → RO 70.00%` | `Cut €0 · changes the best 2 · then €26,303/yr · needs orders…` | `€4,383.75` |
| 3 | `2 graduates from 1 Nov` | `Turnover 104.0% + Qualified 37.5% → RO 70.75%` | `Cut €0 · changes the best 2 · then €52,605/yr` | `€8,767.50` |
| 4 | `3 non-graduates from 1 Nov` | `Turnover 104.0% + Jobs 38.9% → RO 71.44%` | `Cut €0 · changes the best 2 · then €52,605/yr` | `€8,767.50` |

- Clicar numa opção aplica-a e salta para `Combined`.
- `changes the best 2` aparece quando os 2 melhores da opção forem diferentes dos atuais.
- Rodapé: `Or pick a variable above to build your own scenario.`

### 10.2 Graduates / Non-grads
- Linha explicativa: `Graduates (level 6+) count in jobs created and in qualified jobs.` / `Non-graduates count in jobs created only.`
- `People` com os botões `−` e `+` (36 px), entre 0 e 10, e `From` com os botões `1 Nov` e `1 Dec`.
- `Base salary`: campo numérico com `€` à esquerda e `/ month` à direita. Por defeito, 1500 para licenciados e 1000 para não licenciados.
- Caixa **`WHAT ONE PERSON COSTS THE COMPANY`**:

| | (exemplo €1,500) |
|---|---|
| Base salary | €1,500.00 /mo |
| × 14 ÷ 12 (holiday and Christmas pay) | €1,750.00 /mo |
| + Employer Social Security 23.75% | €415.63 |
| + Work accident insurance ≈1.5% | €26.25 |
| **= Cost to company** (com linha por cima, bold) | **€2,191.88 /mo** |

- Por baixo: `2 people from 1 Nov: €8,767.50 to 31 Dec (2 months) · €52,605 per full year` (ou `Add people above to see the total cost.`) + `Not included: meal allowance, recruitment, equipment.`
- Pílula tracejada clicável: `Needed for 70% on its own: 2 people from 1 Nov · apply`.

### 10.3 Sales
- `Extra turnover invoiced by 31 Dec · value added kept as projected (rules sheet)`
- `Extra sales by 31 Dec` com os botões `−`/`+` (passos de €10k), o valor `+€67,000` e um cursor de 0 a 150,000 em passos de 1,000. O cursor tem de reagir **enquanto se arrasta**.
- Pílula: `Needed for 70% on its own: +€67,000 · apply`.

### 10.4 Combined
- Tabela `VARIABLE | RO ALONE | COST TO 31 DEC` com 3 linhas: Graduates (`2 × €1,500 base from 1 Nov`), Non-graduates, Extra sales. Cada linha mostra a variação em p.p. que essa variável dá **sozinha**.
- Nota: `The combined RO is not the sum: it always averages the best 2 indicators.`

### 10.5 Caixa de resultado (em todos os separadores menos Suggestions)
- Rótulo: `EFFECT OF GRADUATES ONLY` / `… NON-GRADUATES ONLY` / `… EXTRA SALES ONLY` / `ALL VARIABLES TOGETHER`.
- Título: `RO 70.75% (+6.25 p.p.) · cut €0`, com ponto na cor do semáforo.
- Sub-texto: `Cost to 31 Dec €8,767.50 · then €52,605 a year · avoids €37,500 of cut`.
- Saldo: `Pays off this year: +€28,733 net to 31 Dec` (verde) ou `Costs more than it saves this year: −€X` (vermelho). Nas vendas: `Saves €37,500 if the sales are invoiced by 31 Dec`.
- Sem variável mexida: `Change this variable to see its effect` / `Now: RO 64.50% · cut €37,500 · target 70%`.
- **O topo da página (KPIs, indicadores, ponto Sim) mostra sempre o cenário combinado.**

---

## 11. Barra do chat (fixa em baixo)

- Fundo `dock` (`#CFEFE9`), sombra `0 -6px 18px rgba(0,120,105,.10)`, padding 10 px 20 px.
- **Microfone:** redondo de 48 px, fundo `#001D39`, ícone branco. Enquanto ouve, fica com fundo branco, ícone azul-escuro, um anel a pulsar e 3 barras animadas ao lado.
- Caixa de texto: 46 px, contorno 2 px `#001D39`, fundo branco. Placeholder: `Ask anything about this project… e.g. "Is it worth hiring 2 graduates?"`
- Botão enviar: 46 px, fundo `#001D39`, seta branca.
- Perguntas sugeridas (pílulas brancas a 90% de opacidade): `Is it worth hiring 2 graduates?` · `Why is the RO below 70%?`
- **Conversa:** cartão de 520 px que abre por cima da barra, à esquerda, com contorno de 2 px `dock`, título `CONVERSATION` e botão para esconder. As bolhas do utilizador são `#0A4174` com texto branco, à direita; as do assistente são `panel2`, à esquerda.
- **Fluxo da demo** (por voz ou pela pergunta sugerida):
  1. aparece `You · voice: Is it worth hiring two graduates at €1,500 a month from November?`
  2. `BF assistant: Setting the simulator: 2 graduates from 1 Nov…`
  3. o simulador fica com g = 2 a partir de 1 nov, separador Graduates, e o gráfico seleciona o ponto Sim
  4. resposta: `Yes, until the end of the year. Two graduates from 1 November cost €8,767.50 until 31 Dec and avoid a €37,500 cut. The RO rises from 64.50% to 70.75%. From 2027 each costs €26,302.50 a year, so keeping them is a business decision. Suggestion · to be confirmed by your BF consultant.` + `Sources: mapa pessoal 2026.xlsx · Balancete_Set2026.csv · Notice MPR-2024-3`
- **Voz de resposta** (opcional): Web Speech API (`speechSynthesis`, en-GB) com uma versão curta e arredondada: *"Yes. Two graduates from November cost about nine thousand euros this year and avoid a thirty-seven thousand euro cut."* Precisa de um botão para ligar/desligar a voz.

---

## 12. Estado e comportamento (resumo)

| Estado | Inicial | Quem muda |
|---|---|---|
| tema | light | ☀/☾ |
| ano | 2026 | select do ano (fecha o painel do gráfico) |
| menu aberto | nenhum | Documents / What the AI sees / Overview |
| separador do simulador | Suggestions | separadores, sugestões, Reset all |
| g, gm, u, um, vendas | 0, nov, 0, nov, 0 | simulador, sugestões, chat |
| salários | 1500 / 1000 | campo Base salary |
| ponto selecionado | nenhum | clique num ponto ou etiqueta ▲▼, Close |
| conversa aberta | não | chat |

`Reset all` repõe g, u, vendas e as datas, e volta a `Suggestions`.

---

## 13. Testes de aceitação (têm de bater)

| Cenário | RO | Corte |
|---|---|---|
| Atual | 64.50% | €37,500 |
| 1 licenciado a 1 nov | 66.58% | €25,000 |
| 2 licenciados a 1 nov | 70.75% | €0 |
| 1 não licenciado a 1 nov | 65.89% | €37,500 |
| +€67,000 de vendas | 70.08% | €0 |
| 1 licenciado a 1 out | 68.67% | €12,500 |
| 2025 (IES) | 27.77% | — |

Outros valores que têm de bater:
- Custo de 1 licenciado a €1,500: €2,191.88/mês · 2 licenciados a 1 nov: €8,767.50 até 31 dez · €52,605/ano.
- Mínimos sozinhos: 2 licenciados · 3 não licenciados · +€67,000 · 1 licenciado + €41,000.
- Layout: em 1280×800 e 1440×900 não há scroll, e o gráfico e o simulador ficam visíveis com pelo menos 360 px de altura.

---

## 14. Erros a evitar (aconteceram no mockup)

1. A última linha da grelha sem altura mínima faz o gráfico desaparecer. Usar `minmax(360px, 1fr)`.
2. Cursor das vendas só atualiza ao largar. É preciso ouvir o evento de *input*.
3. Números escritos à mão nos componentes. Tudo tem de vir do motor (secção 8).
4. Painel de explicação sempre aberto. Deve abrir só com clique e ter `Close`.
5. Sugestões que ignoram a regra dos 2 melhores. Mostrar sempre quais os 2 que contam.
