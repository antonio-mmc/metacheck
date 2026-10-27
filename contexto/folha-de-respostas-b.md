# Folha de respostas · empresa B (Demo Precisão)

> **A app está certa quando bate com estes valores.** Nunca se alteram para fazer bater a app; se não batem, procura-se o erro na app.
> Preenchida a 23 out 2026 a partir do modelo que gerou os documentos de `dados-demo/empresa-b/`. Duas verificações externas:
> 1. **Simulador de GC e RO da BF** (Excel de um colega), com o limiar a 85% e os mesmos valores em 10 cenários: **70/70 valores iguais** (rácios, RO, p.p., corte).
> 2. **Leitura dos próprios ficheiros** (PDF) por um leitor independente: **61/61 conferências certas** (VN, VA, débito = crédito, ETI do RU e das DR, níveis das certidões, IES do pré-projeto, metas do termo, texto selecionável).
>
> A colega confirma depois, à mão, as secções 2 e 3 contra o simulador dela.
> Arredondamentos: ao cêntimo nos euros, à centésima nos ETI e nas %. As contas fazem-se com todos os decimais; só se arredonda para mostrar.

## 1. Leitura dos documentos (fase 1)

| Trimestre (acumulado desde 1 jan) | Ficheiro | Volume de negócios (71+72) € | VA € | ETI médio no período |
|---|---|---|---|---|
| T1 2026 | `Balancete Razao Marco 2026.pdf` | 905.000,00 | 271.525,04 | 31,00 |
| T2 2026 | `balancete_razao_jun26.pdf` | 1.890.000,00 | 568.315,03 | 31,00 |
| T3 2026 | `Balancete Geral Setembro 2026.pdf` | 2.889.600,00 | 869.706,29 | 31,56 |

Parcelas do VA no T3: 71 = 2.777.100,00 (já líquido de 11.000,00 de devoluções, conta 717) · 72 = 112.500,00 · 73 = +14.500,00 · 74 = 0 · 61 = 1.195.202,71 · 62 = 839.191,00.
Contas que **não** entram e estão lá de propósito: 78 = 119.700,00 (7883, imputação do incentivo) · 6812 = 10.400,00 (impostos indiretos).
Débito = crédito: T1 10.154.378,69 · T2 14.968.793,33 · T3 19.858.394,63.

**Armadilhas dos balancetes (para descobrir, não para cair):**
- T1 (`razao`): só contas de razão, com asterisco nas que têm subcontas. Lê-se direto.
- T2: contas de razão e subcontas na mesma lista. Quem somar as duas conta o VN a dobrar (3.780.000,00).
- T3 (balancete geral): a classe 7 vem desdobrada em 4 níveis (71 → 712 → 7121 → 71211). Soma-se só o nível de razão. A 717 (devoluções) é devedora e abate às vendas: quem somar só os créditos da 71 fica com mais 11.000,00 de VN.

**Armadilha do RU:** a coluna 17 ("nível de qualificação": 1 quadros superiores, 2 quadros médios…) não é o nível do QNQ. Com a coluna 17 davam 3 (só o nível 1) ou 5 (níveis 1 e 2) qualificados. O certo vem da coluna 11 (habilitações, tabela 14 do RU: 1.º dígito 6 = licenciatura, 7 = mestrado): **4**. O Diretor Comercial é quadro superior com o 12.º ano e não conta.

**Emprego sem mapa de pessoal:** horário e habilitações do RU de 2022; meses ao serviço em 2026 das DR de janeiro a setembro. Quem está na DR de setembro continua até 31 dez. Tempo parcial: o RU diz 20,0 h e a DR declara 14 ou 15 dias (1 dia por cada 6 horas). Cada pessoa a 20 h conta 0,50.

Classificação esperada:

| Ficheiro | Tipo certo | Período / nota |
|---|---|---|
| `avisos/aviso-MPr-2023-1-InovacaoProdutiva.pdf` | aviso | Aviso da empresa B (limiar 85%, pré-projeto 2022) |
| `empresa-b/Termo de Aceitacao - DemoPrecisao.pdf` | termo de aceitação | Assinado a 14 fev 2024 |
| `empresa-b/Balancete Razao Marco 2026.pdf` | balancete | jan–mar 2026 |
| `empresa-b/balancete_razao_jun26.pdf` | balancete | jan–jun 2026 |
| `empresa-b/Balancete Geral Setembro 2026.pdf` | balancete | jan–set 2026 |
| `empresa-b/Relatorio Unico 2022 - Anexo A.pdf` | relatório único (quadro de pessoal) | 2022, ano pré-projeto: 31 pessoas, 30,00 ETI, 4 qualificados |
| `empresa-b/IES_2022.pdf` | IES | 2022, pré-projeto: VN 3.200.000,00 · VA 1.050.000,00 · 57.600 h = 30,00 ETI (1.920 h por ETI) |
| `empresa-b/IES_2023.pdf` · `IES_2024.pdf` · `IES_2025.pdf` | IES | Anos seguintes (contexto; não entram no RO) |
| `empresa-b/extratoDeclaracaoRemuneracoes_2026_01.pdf` … `_09.pdf` | declaração de remunerações (SS) | Um por mês, jan–set 2026 |
| `empresa-b/ENTREGA DR set2026 - extrato resumo.pdf` | declaração de remunerações (resumo) | set 2026, total 45.380,00 = extrato de set |
| `empresa-b/Beatriz - certidao.pdf` | certificado | Beatriz, licenciatura, nível 6 → qualificada (entra a 1 set) |
| `empresa-b/scan_DiogoPinto.pdf` | certificado | Diogo, CTeSP, nível 5 → **não** qualificado (entra a 1 ago) |
| `empresa-b/Juliana docs.pdf` | certificado | Juliana, grau brasileiro sem reconhecimento → **"needs consultant review"**, não conta até confirmação (entra a 1 ago) |
| `empresa-b/Comunicacao de utilizacao.pdf` | **irrelevante** | Licenciamento da câmara |
| `empresa-b/FT 2026A-3318 Acos Demo.pdf` | **irrelevante** | Fatura de fornecedor |
| `novo-documento/extratoDeclaracaoRemuneracoes_2026_10.pdf` | declaração de remunerações (SS) | out 2026: +1 operador CNC a 1 out |

Nada em falta: o painel não deve pedir documentos. Só pede a confirmação do diploma da Juliana.

## 2. Indicadores projetados para o ano de cruzeiro (fase 2, dados até ao T3)

| Indicador | Projeção 2026 | Pré-projeto (2022) | Apurado Ie | Meta I | % da meta (Ie/I) | Estado |
|---|---|---|---|---|---|---|
| RPR003 Emprego | 32,17 ETI | 30,00 ETI | +2,17 ETI | +4,00 | 54,17% | Off track |
| RSR23 Emprego qualificado | 4,33 ETI | 4,00 ETI | +0,33 ETI | +1,00 | 33,33% | Off track |
| RPR001 Volume de negócios | 3.852.800,00 € | 3.200.000,00 € | +20,40% | +20,00% | 102,00% | On track |
| RPR002 VA por trabalhador | 36.050,00 €/ETI (VA 1.159.608,39 €) | 35.000,00 €/ETI | +3,00% | +10,00% | 30,00% | Off track |

ETI 2026: 30 pessoas a tempo completo todo o ano (30,00) + 2 a 20 h (1,00) + Juliana e Diogo a 1 ago (2 × 0,42) + Beatriz a 1 set (0,33) = 32,17.
Qualificados: 4 do RU de 2022 + Beatriz (0,33) = 4,33. Com o grau da Juliana reconhecido: 4,75.

## 3. RO e corte (fase 2)

| Resultado | Valor | Como se calculou |
|---|---|---|
| 2 melhores indicadores | RPR001 (102,00%) e RPR003 (54,17%) | Ordenar os 4 rácios |
| RO projetado | **78,08%** | (102,00 + 54,17) / 2 |
| Penalização | **2,0 p.p.** | 85 − 78,08 = 6,92 p.p. → ⌈6,92 / 2⌉ = 4 escalões × 0,5 |
| Corte previsto | **32.000,00 €** | 2% × 1.600.000,00 € (incentivo de 480.000,00 € passa a 448.000,00 €) |
| **Com o grau da Juliana reconhecido** | RO **88,50%**, **sem corte** | RSR23 passa a 75,00% e é o 2.º melhor: (102,00 + 75,00) / 2 |
| Prazo para agir | 1 licenciado bastava até **1 ago**; hoje são precisos **3 a partir de 1 nov** | Último mês de entrada com RO ≥ 85%: 1 → ago · 2 → out · 3 → nov |
| Caminho mais barato sugerido | Pedir o reconhecimento do grau (DL 66/2018) antes da IES de 2026. Sem isso: 3 licenciados a 1 nov (13.151,25 € até 31 dez) ou +89.000,00 € de vendas até 31 dez | Secção 4 |

Evolução: T1 → RO 45,31%, 3,0 p.p., 48.000,00 € · T2 → RO 69,11%, 3,0 p.p., 48.000,00 € · T3 → RO 78,08%, 2,0 p.p., 32.000,00 €.

Mesmos resultados com o limiar de 70% (o da empresa A): sem corte. É o limiar que decide.

## 4. Simulações (fase 3)

Custo mensal de um licenciado a 1.500 €: 1.500 × 14 / 12 × 1,2525 = 2.191,88 €. Todas sem reconhecimento do grau, salvo a última.

| Caso | Emprego % | Qualif. % | VA/trab % | RO | Corte (€) | Custo até 31 dez (€) | Custo de 1 ano (€) |
|---|---|---|---|---|---|---|---|
| A. 1 licenciado, 1.500 €/mês, a partir de 1 nov | 58,33 | 50,00 | 24,69 | 80,17% | 24.000,00 | 4.383,75 | 26.302,50 |
| B. 1 não qualificado, 1.000 €/mês, a partir de 1 nov | 58,33 | 33,33 | 24,69 | 80,17% | 24.000,00 | 2.922,50 | 17.535,00 |
| C. 2 licenciados, 1.500 €/mês, a partir de 1 nov | 62,50 | 66,67 | 19,44 | 84,33% | 8.000,00 | 8.767,50 | 52.605,00 |
| D. 3 licenciados, 1.500 €/mês, a partir de 1 nov | 66,67 | 83,33 | 14,23 | **92,67%** | **0,00** | 13.151,25 | 78.907,50 |
| E. Caso A, mas a partir de 1 out | 60,42 | 58,33 | 22,06 | 81,21% | 16.000,00 | 6.575,63 | 26.302,50 |
| F. Vender mais 89.000 € até 31 dez (+9,24% sobre o ritmo do T4) | 54,17 | 33,33 | 30,00 | 85,04% | 0,00 | — | — |
| G. "Add document" (DR de outubro, 1 operador a 1 out) | 60,42 | 33,33 | 22,06 | 81,21% | 16.000,00 | — | — |
| H. Grau da Juliana reconhecido | 54,17 | 75,00 | 30,00 | **88,50%** | **0,00** | taxa do reconhecimento | — |

Em F o VN passa a 115,91% da meta (com 88.000 € ficava em 84,96%). Em B, 1 não qualificado vale o mesmo que 1 licenciado: o 2.º melhor é o emprego, não o qualificado. Em C, 2 licenciados ficam a 0,67 p.p. do limiar.

Corrigido a 26 out: 6.575,625 arredonda para 6.575,63 (era erro de vírgula flutuante).

## 5. As 3 perguntas ensaiadas do chat (fase 3)

| Pergunta (EN) | Resposta certa, em números | Fonte que tem de citar |
|---|---|---|
| "Are we going to lose part of the grant?" | Yes, unless Juliana's degree is recognised. Projected RO 78.08% (turnover 102.00% and jobs 54.17% are the two best), 6.92 p.p. below the 85% threshold → 2 p.p. cut = €32,000. With the degree recognised, qualified jobs reach 75.00% and the RO 88.50%: no cut. | Acceptance term, `Balancete Geral Setembro 2026.pdf`, RU 2022 + SS declarations (FTE), Juliana's diploma, call MPr-2023-1 p. 16 |
| "Is it worth hiring graduates instead?" | It takes 3 graduates from 1 Nov (€13,151.25 until 31 Dec, €78,907.50 a year) to clear the cut. 2 leave €8,000. Asking for the degree recognition (DL 66/2018) is cheaper. | SS declarations, call p. 16, cost rules |
| "Why doesn't the CTeSP technician count?" | A CTeSP is level 5 of the QNQ; qualified jobs need level 6 or higher (bachelor's degree). Diogo counts for jobs (+0.42 FTE), not for qualified jobs. | Diogo's certificate, call p. 11, Portaria 782/2009 |

Todas as respostas terminam com "Suggestion · to be confirmed by your BF consultant" quando sugerem uma ação.

## 6. Leitura do aviso

A ficha do MPr-2023-1 tem de bater com a tabela de `regras-calculo.md`, secção 11 (limiar 85%, pré-projeto 2022 fixo). Além disso:

| Campo | MPr-2023-1 (PDF original) |
|---|---|
| Taxa | Base 30 p.p. micro e pequenas, 25 p.p. médias; máximo 40% (p. 5). A B tem 30% |
| Duração da operação | Até 24 meses (a B: 1 mar 2024 a 31 jul 2025, cruzeiro 2026) |
