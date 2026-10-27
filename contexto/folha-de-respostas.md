# Folha de respostas · empresa A (Demo Têxtil)

> A empresa B tem a sua folha: `folha-de-respostas-b.md`.
>
> **A app está certa quando bate com estes valores.** Nunca se alteram para fazer bater a app; se não batem, procura-se o erro na app.
> Preenchida a 22 out 2026 e revista a 23 out (formatos reais, sem mudar números) a partir do modelo que gerou os documentos de `dados-demo/empresa-a/`. Duas verificações externas:
> 1. **Simulador de GC e RO da BF** (Excel de um colega), corrido com os mesmos valores em 8 cenários: **56/56 valores iguais** (rácios, RO, p.p., corte).
> 2. **Leitura dos próprios ficheiros** (PDF, XLSX, CSV) por um leitor independente: **47/47 conferências certas** (VN, VA, débito = crédito, ETI do mapa e do RU de 2023, IES do pré-projeto, DR de setembro, níveis das certidões, texto selecionável, metas do termo).
>
> A colega confirma depois, à mão, as secções 2 e 3 contra o simulador dela.
> Arredondamentos: ao cêntimo nos euros, à centésima nos ETI e nas %. As contas fazem-se com todos os decimais; só se arredonda para mostrar.

## 1. Leitura dos documentos (fase 1)

| Trimestre (acumulado desde 1 jan) | Ficheiro | Volume de negócios (71+72) € | VA € | ETI médio no período |
|---|---|---|---|---|
| T1 2026 | `Balancete 1T 2026.pdf` | 725.000,00 | 187.205,00 | 22,50 |
| T2 2026 | `balancete junho.xlsx` | 1.495.000,00 | 381.777,00 | 22,00 |
| T3 2026 | `Balancete_Set2026.csv` | 2.268.000,00 | 577.227,22 | 22,39 |

Parcelas do VA no T3: 71 = 2.197.800,00 · 72 = 70.200,00 · 73 = +15.000,00 · 74 = 0 · 61 = 1.098.900,00 · 62 = 606.872,78.
Contas que **não** entram e estão lá de propósito: 75 = 3.600,00 · 78 = 84.375,00 (7883, imputação do incentivo) · 6812 = 7.800,00 (impostos indiretos).
Débito = crédito: T1 7.870.042,92 · T2 11.762.174,85 · T3 15.688.938,65.

**Armadilha do PDF do T1** (formato Primavera, "Balancete Razão"): tem contas de razão (2 dígitos, com asterisco quando têm subcontas) e as subcontas por baixo. Quem somar as duas conta o VN a dobrar (1.450.000,00). As linhas "Soma Líquida" fecham cada classe.

**Documentos do pré-projeto (2023), para conferir o termo:** `RU 2023 Anexo A.pdf` dá 23 pessoas, 22,00 ETI (1 a 20 h; a técnica administrativa entrou em jul 2023) e 3 qualificados pela coluna 11 (Joana, Ricardo e Marta, que saiu em 2024). `IES 2023.pdf` dá VN 2.400.000,00 · VA 720.000,00 · 42.240 h trabalhadas = 22,00 ETI (1.920 h por ETI). A coluna 17 do RU (nível de qualificação da empresa) não é o nível do QNQ.

Classificação esperada:

| Ficheiro | Tipo certo | Período / nota |
|---|---|---|
| `avisos/aviso-MPR-2024-3-InovacaoProdutiva-BaixaDensidade.pdf` | aviso | Aviso da empresa |
| `avisos/aviso-MPr-2023-1-InovacaoProdutiva.pdf` | aviso | Aviso da empresa B (limiar 85%) |
| `avisos/aviso-MPR-2026-6-InovacaoProdutiva.pdf` | aviso | Outro aviso (limiar 70%) |
| `empresa-a/Termo Aceitacao assinado.pdf` | termo de aceitação | Assinado a 21 fev 2025 |
| `empresa-a/Balancete 1T 2026.pdf` | balancete | jan–mar 2026 |
| `empresa-a/balancete junho.xlsx` | balancete | jan–jun 2026 |
| `empresa-a/Balancete_Set2026.csv` | balancete | jan–set 2026 |
| `empresa-a/mapa pessoal 2026.xlsx` | mapa de pessoal | 2026, atualizado a 30 set |
| `empresa-a/RU 2023 Anexo A.pdf` | relatório único (quadro de pessoal) | 2023, ano pré-projeto: 22,00 ETI, 3 qualificados |
| `empresa-a/IES 2023.pdf` | IES | 2023, pré-projeto: bate com o termo |
| `empresa-a/IES_2024_DemoTextil.pdf` · `IES 2025 comprovativo.pdf` | IES | Anos seguintes (contexto; não entram no RO) |
| `empresa-a/extratoDR_092026.pdf` | declaração de remunerações (SS) | set 2026: 24 pessoas, as mesmas do mapa |
| `empresa-a/scan_0042.pdf` | certificado | Joana, licenciatura, nível 6 → qualificada |
| `empresa-a/Certificado Ricardo.pdf` | certificado | Ricardo, mestrado, nível 7 → qualificado |
| `empresa-a/Ines - certificado habilitacoes.pdf` | certificado | Inês, licenciatura, nível 6 → qualificada |
| `empresa-a/doc Tiago Marques.pdf` | certificado | Tiago, licenciatura, nível 6 → qualificado |
| `empresa-a/scan_0057.pdf` | certificado | Ana Rita, CTeSP, nível 5 → **não** qualificada |
| `empresa-a/FT 2026-0815.pdf` | **irrelevante** | Fatura de fornecedor |
| `empresa-a/Apresentacao Demo Textil.docx` | **irrelevante** | Apresentação institucional (tem nomes: não vai à IA) |
| `novo-documento/mapa pessoal 2026 atualizado.xlsx` | mapa de pessoal | 2026, atualizado a 26 out (+1 licenciado a 1 nov) |

Nada em falta: o painel não deve pedir documentos.

## 2. Indicadores projetados para o ano de cruzeiro (fase 2, dados até ao T3)

| Indicador | Projeção 2026 | Pré-projeto | Apurado Ie | Meta I | % da meta (Ie/I) | Estado |
|---|---|---|---|---|---|---|
| RPR003 Emprego | 22,67 ETI | 22,00 ETI | +0,67 ETI | +3,00 | 22,22% | Off track |
| RSR23 Emprego qualificado | 3,42 ETI | 3,00 ETI | +0,42 ETI | +2,00 | 20,83% | Off track |
| RPR001 Volume de negócios | 3.024.000,00 € | 2.400.000,00 € | +26,00% | +25,00% | 104,00% | On track |
| RPR002 VA por trabalhador | 33.954,54 €/ETI (VA 769.636,29 €) | 32.727,27 €/ETI | +3,75% | +15,00% | 25,00% | Off track |

ETI 2026: 21 pessoas todo o ano (21,00) + 1 a 20 h (0,50) + saída a 31 mar (0,25) + entrada a 1 jul (0,50) + licenciado a 1 ago (0,42) = 22,67.

## 3. RO e corte (fase 2)

| Resultado | Valor | Como se calculou |
|---|---|---|
| 2 melhores indicadores | RPR001 (104,00%) e RPR002 (25,00%) | Ordenar os 4 rácios |
| RO projetado | **64,50%** | (104,00 + 25,00) / 2 |
| Penalização | **1,5 p.p.** | 70 − 64,50 = 5,5 p.p. → ⌈5,5 / 2⌉ = 3 escalões × 0,5 |
| Corte previsto | **37.500,00 €** | 1,5% × 2.500.000,00 € (incentivo de 1.125.000,00 € passa a 1.087.500,00 €) |
| Prazo para agir | 1 licenciado bastava até **1 set**; hoje são precisos **2 a partir de 1 nov** | Último mês de entrada com RO ≥ 70%: 1 pessoa → set; 2 pessoas → nov |
| Caminho mais barato sugerido | 2 licenciados a 1 nov: 8.767,50 € até 31 dez, evitam 37.500,00 €. Sem contratar: +67.000,00 € de vendas até 31 dez | Secção 4 |

Evolução: T1 → RO 58,99%, 3,0 p.p., 75.000,00 € · T2 → RO 73,39%, sem corte · T3 → RO 64,50%, 1,5 p.p., 37.500,00 €.

## 4. Simulações (fase 3)

Custo mensal de um licenciado a 1.500 €: 1.500 × 14 / 12 × 1,2525 = 2.191,88 €.

| Caso | Emprego % | Qualif. % | VA/trab % | RO | Corte (€) | Custo até 31 dez (€) | Custo de 1 ano (€) |
|---|---|---|---|---|---|---|---|
| A. 1 licenciado, 1.500 €/mês, a partir de 1 nov | 27,78 | 29,17 | 19,95 | 66,58% | 25.000,00 | 4.383,75 | 26.302,50 |
| B. 1 não qualificado, 1.000 €/mês, a partir de 1 nov | 27,78 | 20,83 | 19,95 | 65,89% | 37.500,00 | 2.922,50 | 17.535,00 |
| C. 2 licenciados, 1.500 €/mês, a partir de 1 nov | 33,33 | 37,50 | 14,98 | **70,75%** | **0,00** | 8.767,50 | 52.605,00 |
| D. Caso A, mas a partir de 1 out | 30,56 | 33,33 | 17,45 | 68,67% | 12.500,00 | 6.575,63 | 26.302,50 |
| E. Vender mais 67.000 € até 31 dez | 22,22 | 20,83 | 25,00 | 70,08% | 0,00 | — | — |
| F. "Add document" (mapa atualizado) | 27,78 | 29,17 | 19,95 | 66,58% | 25.000,00 | — | — |

Em E o VN passa a 115,17% da meta.

Corrigido a 26 out: 6.575,625 arredonda para 6.575,63 (era erro de vírgula flutuante).

## 5. As 3 perguntas ensaiadas do chat (fase 3)

| Pergunta (EN) | Resposta certa, em números | Fonte que tem de citar |
|---|---|---|
| "Are we going to lose part of the grant?" | Yes, at the current pace. Projected RO 64.50% (turnover 104.00% and value added per worker 25.00% are the two best), 5.5 p.p. below the 70% threshold → 1.5 p.p. cut = €37,500. | Acceptance term (targets), `Balancete_Set2026.csv` (turnover, VA), staff map (FTE), call MPR-2024-3 p. 21 |
| "Is it worth hiring one graduate at 1,500 a month?" | One alone, from 1 Nov: RO 66.58%, the cut drops to €25,000 (saves €12,500) for €4,383.75 until 31 Dec. Two graduates: RO 70.75%, no cut, €8,767.50 until 31 Dec. After that, €26,302.50 a year each. No legal duty to keep them 3 years under this call; the role must be linked to the project. Without hiring: €67,000 more sales by 31 Dec. | Staff map, call p. 14–15 and 21, cost rules (14 salaries, 23.75% social security) |
| "Why is value added per worker at risk?" | Value added grows only 6.89% (€720,000 → €769,636.29 projected) while FTE rose from 22.00 to 22.67: the July and August hires added people before adding value. Margins also fell (VA / turnover 30.00% → 25.45%, energy and subcontracting in FSE). VA per worker +3.75% against a +15% target = 25.00%. | `Balancete_Set2026.csv` (61, 62), staff map, acceptance term |

Todas as respostas terminam com "Suggestion · to be confirmed by your BF consultant" quando sugerem uma ação.

## 6. Leitura dos avisos (fase 2)

A ficha extraída de cada um dos 3 avisos tem de bater, campo a campo, com a tabela de `regras-calculo.md`, secção 11. Não se repete aqui para não haver duas versões.
