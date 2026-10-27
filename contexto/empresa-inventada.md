# Empresas inventadas da demo

> Duas empresas, dois avisos, regras diferentes: **A · Demo Têxtil** (MPR-2024-3, limiar 70%) e **B · Demo Precisão** (MPr-2023-1, limiar 85%, mais abaixo). Cada projeto tem as metas do seu aviso.

> Tudo fictício. Nenhum valor, nome ou NIF copiado de um cliente real. Instituições, bancos e programas também são inventados ("Demo" no nome).
> Números fechados a 23 out 2026 e verificados contra o simulador de GC e RO da BF (A 56/56, B 70/70). Os documentos estão em `dados-demo/empresa-a/` e `dados-demo/empresa-b/`; os valores certos estão em `folha-de-respostas.md` (A) e `folha-de-respostas-b.md` (B).
> As regras de cada conta estão em `regras-calculo.md`.

## Empresa A · Demo Têxtil

### Identidade

| Campo | Valor |
|---|---|
| Nome | Demo Têxtil, Lda. (pequena empresa) |
| Setor / CAE | Indústria transformadora: 13202, tecelagem de fio do tipo lã |
| Região | Covilhã, NUTS III Beiras e Serra da Estrela (território de baixa densidade) |
| Aviso | **MPR-2024-3**, SICE Inovação Produtiva, Baixa Densidade (`regras-calculo.md`, secção 1) |
| Operação | Nova linha de tecelagem e acabamento de tecidos técnicos de lã |
| Termo de aceitação | Assinado a 21 fev 2025 |
| Ano pré-projeto | 2023 |
| Execução | 3 mar 2025 a 31 dez 2025 |
| Ano de cruzeiro | **2026**, o primeiro exercício completo após a conclusão |
| Investimento elegível realizado | 2.500.000,00 € (total: 2.780.000,00 €) |
| Taxa de financiamento | 45% (taxa base nas Beiras e Serra da Estrela, sem majorações) |
| Incentivo (não reembolsável) | 1.125.000,00 € |
| Dados disponíveis | Até ao **T3 de 2026** (balancetes acumulados a março, junho e setembro). A demo é a 26–27 out: a primeira contratação possível entra a **1 nov** |

### Metas contratadas (termo de aceitação)

| Indicador | Pré-projeto (2023) | Meta (I) |
|---|---|---|
| RPR003 Postos de trabalho criados | 22,00 ETI | +3,00 ETI |
| RSR23 Emprego qualificado criado | 3,00 ETI | +2,00 ETI |
| RPR001 Volume de negócios | 2.400.000,00 € | +25,00% (3.000.000,00 €) |
| RPR002 VA por trabalhador | 32.727,27 €/ETI | +15,00% (37.636,36 €/ETI) |

Também no termo, sem efeito no RO: RCR01 (o mesmo emprego, 1 ano após a conclusão), RPO008 (2 inovações, cumprido no encerramento) e RPA001 (intensidade exportadora, acompanhamento).

### A história que os dados contam

**"Sales beat the target, and the company still loses €37,500."**

| Indicador | Projeção 2026 (a partir do T3) | % da meta | Estado | Porquê |
|---|---|---|---|---|
| Volume de negócios | +26,00% | **104,00%** | On track | Vendas a crescer; agosto fraco (fábrica fecha para férias) |
| VA por trabalhador | +3,75% | 25,00% | Off track | Margens apertadas (energia e subcontratos) e 2 entradas em julho e agosto sem mais VA |
| Emprego | +0,67 ETI | 22,22% | Off track | Saiu um tecelão a 31 mar; entraram 1 operador (1 jul) e 1 licenciado (1 ago) |
| Emprego qualificado | +0,42 ETI | 20,83% | Off track | Só o licenciado de agosto é novo: conta 5/12 |
| **RO projetado** | (104,00 + 25,00) / 2 | **64,50%** | **Cut expected** | 5,5 p.p. abaixo de 70% → 3 escalões → **1,5 p.p. = 37.500 €** |

O RO ficou de propósito a meio de um escalão (64,5%) e não na fronteira dos 64%: com o RO exatamente em 64%, uma diferença de arredondamento no VA/ETI pré-projeto mudava o corte de 1,5 para 2,0 p.p. Foi o simulador da BF que apanhou isto.

**Evolução trimestral** (o que o painel teria dito em cada momento):

| Dados até | RO projetado | Corte | Leitura |
|---|---|---|---|
| T1 (março) | 58,99% | 3,0 p.p. = 75.000 € | Início de ano fraco nas vendas |
| T2 (junho) | 73,39% | 0 € | Parecia tudo bem |
| T3 (setembro) | 64,50% | 1,5 p.p. = 37.500 € | As contratações de julho e agosto baixaram o VA por trabalhador, que deixou de compensar |

É o argumento do produto: a verificação anual (na IES de 2026, em 2027) chegava tarde; a trimestral avisa a tempo.

### Os dois momentos da demo

1. **Prazo:** 1 licenciado bastava se entrasse até 1 de setembro. Hoje (fim de outubro) são precisos **2, a entrar a 1 de novembro**. Com o ETI proporcional ao mês, k pessoas que entram no mês m valem k × (13 − m) / 12.
2. **Perfil:** 1 licenciado sobe o emprego e o emprego qualificado e baixa o VA por trabalhador. Como só contam os 2 melhores, o qualificado passa a ser o segundo melhor. 1 não qualificado quase não mexe.

| Simulação (entrada a 1 nov, salvo indicação) | RO | Corte | Custo até 31 dez | Custo de um ano |
|---|---|---|---|---|
| Nenhuma | 64,50% | 37.500 € | — | — |
| 1 licenciado, 1.500 €/mês | 66,58% | 25.000 € | 4.383,75 € | 26.302,50 € |
| **2 licenciados, 1.500 €/mês** | **70,75%** | **0 €** | **8.767,50 €** | 52.605,00 € |
| 1 não qualificado, 1.000 €/mês | 65,89% | 37.500 € | 2.922,50 € | 17.535,00 € |
| 1 licenciado a 1 out | 68,67% | 12.500 € | 6.575,63 € | 26.302,50 € |
| 1 licenciado a 1 set (já não dá) | 70,75% | 0 € | 8.767,50 € | 26.302,50 € |
| Vender mais 67.000 € até 31 dez (+8,86% sobre o ritmo do T4) | 70,08% | 0 € | sem custo direto | — |

Corrigido a 26 out: 6.575,625 arredonda para 6.575,63 (era erro de vírgula flutuante).

### Compensa contratar?

- **Até 31 dez, sim:** 2 licenciados custam 8.767,50 € e evitam 37.500 €.
- **Não há obrigação legal de os manter 3 anos** neste aviso (`regras-calculo.md`, 9.4). A partir de 2027, cada um custa 26.302,50 €/ano, por isso a decisão é de negócio.
- **A resposta honesta do consultor:** a candidatura já prometia +2 qualificados; contratá-los agora é cumprir o que a empresa disse que fazia, mais cedo. Se não precisa deles, o caminho mais barato é vender mais 67.000 € no T4. As funções têm de estar ligadas ao projeto apoiado.
- As duas respostas servem a demo. O simulador mostra as duas com números e a IA redige: "Suggestion · to be confirmed by your BF consultant".

### "Add document"

`dados-demo/novo-documento/mapa pessoal 2026 atualizado.xlsx`: a empresa contratou 1 licenciado (Rui, engenheiro de processo, 1.500 €) a entrar a 1 nov. O painel atualiza: RO 64,50% → 66,58%, corte 37.500 € → 25.000 €. "1 done, 1 to go: hire one more graduate starting 1 November."

### Pessoas e entidades fictícias (para haver o que tapar)

| Tipo | Quantidade | Onde aparecem |
|---|---|---|
| Trabalhadores (nome, NIF, NISS, n.º do CC, data de nascimento, nacionalidade, salário, habilitações) | 25 no mapa (24 ao serviço a 30 set) + 1 no mapa atualizado + 1 ex-trabalhadora (Marta, licenciada, saiu a 30 jun 2024) | Mapa de pessoal, RU 2023, DR de setembro, certificados, apresentação |
| Clientes (nome, NIF ou VAT italiano) | 5 | Balancetes (contas 211) |
| Fornecedores (nome, NIF) | 6 | Balancetes (contas 221), fatura |
| Conta bancária (IBAN) | 1 da empresa + 1 do fornecedor | Balancetes (conta 1201), fatura |
| Gerente (nome, NIF, email, telefone) | 1 | Termo de aceitação |

NIF, NISS, IBAN e n.º do CC têm dígitos de controlo válidos, para o tapar ser testado a sério. Emails no domínio reservado `.example`; banco com código inexistente (0099).

### Documentos da A

| Ficheiro | Formato | Conteúdo |
|---|---|---|
| `avisos/aviso-MPR-2024-3-InovacaoProdutiva-BaixaDensidade.pdf` | PDF original | Aviso da empresa A (os outros avisos: `regras-calculo.md`, secção 1) |
| `empresa-a/Termo Aceitacao assinado.pdf` | PDF | Metas, valores pré-projeto, investimento, taxa, gerente |
| `empresa-a/Balancete 1T 2026.pdf` | PDF com texto | Formato Primavera "Balancete Razão": contas de razão com asterisco e subcontas por baixo, "Soma Líquida" por classe |
| `empresa-a/balancete junho.xlsx` | XLSX | Balancete analítico, último nível, com subtotais por classe |
| `empresa-a/Balancete_Set2026.csv` | CSV (`;`, vírgula decimal, UTF-8 com BOM) | Último nível, sem totais |
| `empresa-a/mapa pessoal 2026.xlsx` | XLSX | 25 pessoas, datas de admissão e cessação, horário, habilitações |
| `empresa-a/RU 2023 Anexo A.pdf` | PDF (A4 horizontal) | Quadro de pessoal do ano pré-projeto: 23 pessoas, 22,00 ETI, 3 qualificados (coluna 11) |
| `empresa-a/IES 2023.pdf`, `IES_2024_DemoTextil.pdf`, `IES 2025 comprovativo.pdf` | PDF | Rosto, demonstração dos resultados (A5001…) e pessoas ao serviço com horas (05291-A). A de 2023 bate com o termo |
| `empresa-a/extratoDR_092026.pdf` | PDF | Extrato da declaração de remunerações de set 2026 (Segurança Social) |
| `empresa-a/scan_0042.pdf`, `Certificado Ricardo.pdf`, `Ines - certificado habilitacoes.pdf`, `doc Tiago Marques.pdf` | PDF, 2 páginas | Certidões no estilo real (texto corrido, unidades curriculares, selo branco): níveis 6–7 |
| `empresa-a/scan_0057.pdf` | PDF | Certidão de um CTeSP (nível 5): **não conta** como qualificado |
| `empresa-a/FT 2026-0815.pdf` | PDF | Fatura de fornecedor: **irrelevante** |
| `empresa-a/Apresentacao Demo Textil.docx` | DOCX | Apresentação institucional: **irrelevante**, mas tem nomes (não pode ir à IA) |
| `novo-documento/mapa pessoal 2026 atualizado.xlsx` | XLSX | Mapa com a contratação de 1 nov |

Gerados fora deste repo antes do evento, com autorização escrita da organização para os levar. O código que os gerou não está aqui. Os números certos estão nas folhas de respostas.

## Empresa B · Demo Precisão

### Identidade

| Campo | Valor |
|---|---|
| Nome | Demo Precisão Metalomecânica, Lda. (pequena empresa) |
| Setor / CAE | 25620, atividades de mecânica geral (maquinagem CNC e moldes de precisão) |
| Região | Maia, NUTS III Área Metropolitana do Porto, NUTS II Norte (fora da baixa densidade) |
| Aviso | **MPr-2023-1**, SICE Inovação Produtiva, Outros territórios |
| Operação | Célula de maquinagem CNC de 5 eixos e fabrico de moldes de precisão para a indústria automóvel |
| Termo de aceitação | Assinado a 14 fev 2024 (candidatura na fase 3, set 2023) |
| Ano pré-projeto | **2022**, fixo para todo o aviso (p. 7) |
| Execução | 1 mar 2024 a 31 jul 2025 (o aviso admite até 24 meses) |
| Ano de cruzeiro | **2026** |
| Investimento elegível realizado | 1.600.000,00 € (total: 1.750.000,00 €) |
| Taxa de financiamento | 30% (taxa base para pequenas empresas, sem majorações; máximo do aviso 40%, p. 5) |
| Incentivo (não reembolsável) | 480.000,00 €. Cada p.p. de corte = 16.000 € |
| Pessoal | **Sem mapa de pessoal.** O emprego lê-se do RU de 2022 (horário e habilitações) e das DR mensais da Segurança Social de 2026 (meses ao serviço) |

### Metas contratadas

| Indicador | Pré-projeto (2022) | Meta (I) |
|---|---|---|
| RPR003 Postos de trabalho criados | 30,00 ETI | +4,00 ETI |
| RSR23 Emprego qualificado criado | 4,00 ETI | +1,00 ETI |
| RPR001 Volume de negócios | 3.200.000,00 € | +20,00% (3.840.000,00 €) |
| RPR002 VA por trabalhador | 35.000,00 €/ETI | +10,00% (38.500,00 €/ETI) |

### A história: "o certificado vale mais do que três contratações"

- Metalomecânica na Maia, aviso de 2023.
- Aqui o limiar é 85%.
- Prometeu mais 4 empregos e 1 qualificado.
- As vendas cumprem: 102%.
- O emprego fica a meio: 54%.
- O valor por trabalhador fica fraco: 30%.
- Em agosto entrou uma engenheira brasileira.
- O diploma dela não está reconhecido.
- A app não a conta como qualificada.
- O RO fica em 78%.
- Corte de 32.000 €.
- O consultor carrega em "Verificar".
- Reconhecido, o RO sobe para 88,5%.
- Sem corte.
- Sem reconhecimento, só 3 contratações resolvem.
- Um papel vale mais do que três salários.

| Cenário (a partir do T3) | VN | Emprego | Qualif. | VA/ETI | RO | Corte |
|---|---|---|---|---|---|---|
| **Grau estrangeiro por confirmar** (o que a app assume) | 102,00% | 54,17% | 33,33% | 30,00% | **78,08%** | 2,0 p.p. = **32.000 €** |
| **Grau reconhecido** ("Verify") | 102,00% | 54,17% | 75,00% | 30,00% | **88,50%** | **0 €** |
| + 1 licenciado a 1 nov | | | | | 80,17% | 24.000 € |
| + 2 licenciados a 1 nov | | | | | 84,33% | 8.000 € |
| + 3 licenciados a 1 nov | | | | | 92,67% | 0 € |
| + 1 não qualificado a 1 nov | | | | | 80,17% | 24.000 € |
| Vender mais 89.000 € até 31 dez | | | | | 85,04% | 0 € |

Prazo: 1 licenciado bastava se entrasse até 1 ago. Hoje são precisos 3, a 1 nov. Evolução trimestral: T1 45,31% e T2 69,11% (corte máximo, 48.000 €) · T3 78,08% (32.000 €).

Com o limiar da A (70%), estes mesmos números não tinham corte. Mostra que a app tem de ler as regras do aviso.

**"Add document":** `novo-documento/extratoDeclaracaoRemuneracoes_2026_10.pdf`, a DR de outubro com 1 operador CNC novo (1 out, não qualificado, sem certidão). RO 78,08% → 81,21%, corte 32.000 → 16.000 €.

### Armadilhas para a app descobrir

- RU, coluna 17 ("nível de qualificação": quadros superiores, médios…) não é o QNQ. O Diretor Comercial é quadro superior com o 12.º ano. O nível vem da coluna 11 (habilitações).
- DR a tempo parcial: 2 pessoas a 20 h aparecem com 14 ou 15 dias (1 dia por cada 6 horas). Contam 0,50 cada; o horário confirma-se no RU.
- Balancete de setembro com a classe 7 em 4 níveis e devoluções (717) a abater.
- Certidão de um CTeSP (nível 5): conta para o emprego, não para o qualificado.

### Pessoas e entidades fictícias

| Tipo | Quantidade | Onde aparecem |
|---|---|---|
| Trabalhadores (nome, NIF, NISS, n.º do CC, nascimento, habilitações, salário) | 31 no RU de 2022; 35 nas DR de set 2026; +1 na DR de out | RU, DR, certidões |
| Clientes (3 nacionais, 1 alemão, 1 suíço) e fornecedores | 5 + 6 | Balancetes, fatura |
| Gerente, contabilista, IBAN | 1 + 1 + 2 | Termo, IES, balancetes, fatura |

### Documentos da B

| Ficheiro | Formato | Conteúdo |
|---|---|---|
| `empresa-b/Termo de Aceitacao - DemoPrecisao.pdf` | PDF | Metas, pré-projeto 2022, taxa 30%, limiar 85% |
| `empresa-b/Balancete Razao Marco 2026.pdf` | PDF Primavera | Só contas de razão (T1) |
| `empresa-b/balancete_razao_jun26.pdf` | PDF Primavera | Razão + subcontas na mesma lista (T2) |
| `empresa-b/Balancete Geral Setembro 2026.pdf` | PDF Primavera | Balancete geral com a classe 7 desdobrada, "Soma Líquida" e "Soma Saldos" (T3) |
| `empresa-b/Relatorio Unico 2022 - Anexo A.pdf` | PDF (A4 horizontal) | Quadro de pessoal do pré-projeto: 31 pessoas, 30,00 ETI, 4 qualificados, tabelas de códigos |
| `empresa-b/IES_2022.pdf` … `IES_2025.pdf` | PDF | A de 2022 bate com o termo (VN, VA, 57.600 h = 30,00 ETI) |
| `empresa-b/extratoDeclaracaoRemuneracoes_2026_01.pdf` … `_09.pdf` | PDF | DR mensais (Mod. GR0002); junho com subsídio de férias (F) |
| `empresa-b/ENTREGA DR set2026 - extrato resumo.pdf` | PDF | Resumo da entrega de setembro (Mod. GR 33), estado ACEITE |
| `empresa-b/Beatriz - certidao.pdf` | PDF, 2 páginas | Licenciatura em Engenharia Mecânica: nível 6 |
| `empresa-b/scan_DiogoPinto.pdf` | PDF, 2 páginas | CTeSP: nível 5, não conta |
| `empresa-b/Juliana docs.pdf` | PDF | Certificado de conclusão de bacharelado no Brasil, sem reconhecimento em Portugal |
| `empresa-b/Comunicacao de utilizacao.pdf` | PDF | Resposta da câmara à comunicação de utilização: **irrelevante** |
| `empresa-b/FT 2026A-3318 Acos Demo.pdf` | PDF | Fatura de fornecedor: **irrelevante** |
| `novo-documento/extratoDeclaracaoRemuneracoes_2026_10.pdf` | PDF | DR de outubro com 1 operador novo |
