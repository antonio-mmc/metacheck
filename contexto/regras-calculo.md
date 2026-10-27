# Regras de cálculo

> Versão de 22 out 2026, revista a 23 out (empresa B, ETI a partir do RU, das DR e da IES). Respostas tiradas das fontes primárias (avisos, regulamento, decreto-lei, portarias, Segurança Social), lidas nos PDFs originais.
> Os agentes só usam o que está aqui. Cada regra tem um selo:
> - **[TEXTO]** está escrito na fonte, com página.
> - **[INTERPRETAÇÃO]** a fonte não diz; escolhemos a leitura indicada, igual à do simulador da BF. Usa-se sem perguntar. Mostra-se no "Verify".
> - **[ESTIMATIVA]** valor de mercado sem fonte primária. Parâmetro editável.
>
> Já não há linhas ABERTO. Se aparecer um caso que nada aqui cobre, o agente pára e pergunta.

## 1. Avisos

| Papel na demo | Aviso | Ficheiro | Regras |
|---|---|---|---|
| **Aviso da empresa A** (Demo Têxtil) | MPR-2024-3 · SICE – Inovação Produtiva · Territórios de Baixa Densidade (republicação de 29 jul 2024) | `dados-demo/avisos/aviso-MPR-2024-3-InovacaoProdutiva-BaixaDensidade.pdf` | Indicadores p. 14–16 · ano de cruzeiro p. 19–20 · GC e RO p. 20–21 |
| **Aviso da empresa B** (Demo Precisão) | MPr-2023-1 · Inovação Produtiva, outros territórios | `dados-demo/avisos/aviso-MPr-2023-1-InovacaoProdutiva.pdf` | Taxa p. 5 · pré-projeto fixo em 2022 p. 7 · indicadores p. 10–13 · GC e RO p. 15–16 |
| Aviso atual, para mostrar que a app lê avisos novos | MPR-2026-6 · Inovação Produtiva (15 jun 2026) | `dados-demo/avisos/aviso-MPR-2026-6-InovacaoProdutiva.pdf` | p. 14–21 |

**Um aviso por empresa.** Cada projeto tem as metas do seu aviso. A flexibilidade mostra-se com duas empresas e regras diferentes (limiar 70% e 85%).

**Porquê o MPR-2024-3 para a empresa A:** o MPR-2026-6 saiu em junho de 2026, por isso nenhum projeto dele pode estar no ano de cruzeiro em 2026. Um projeto do MPR-2024-3 (candidatura em 2024, execução em 2025) tem o cruzeiro em 2026. Os parâmetros do RO são iguais nos dois.

Links: [MPR-2024-3](https://www.compete2030.gov.pt/wp-content/uploads/2024/04/2024-07-29_Rep.Aviso-MPR_2024_3-_InovacaoProdutiva_Baixa-Densidade.pdf) · [MPr-2023-1](https://portugal2030.pt/wp-content/uploads/sites/3/2023/05/Aviso-MPr-2023-1-1.pdf) · [MPR-2026-6](https://compete2030.gov.pt/wp-content/uploads/2026/06/Aviso-MPR_2026_6-InovacaoProdutiva_geral-v.-publicacao_15.06.2026.pdf)

## 2. Outras fontes primárias

| Sigla | Documento | Para quê |
|---|---|---|
| RE ITD | Regulamento Específico Inovação e Transição Digital, Portaria 103-A/2023, republicado pela Portaria 181/2024/1 ([PDF](https://portugal2030.pt/wp-content/uploads/sites/3/2024/09/portaria181_2024_1.pdf)) | Art. 3.º l) (emprego qualificado), art. 14.º-A (metas), art. 24.º (taxa), arts. 25.º e 26.º (obrigações) |
| DL 20-A/2023 | Regras gerais dos fundos 2021-2027 | Art. 33.º (revogação), art. 34.º (restituição) |
| QNQ | Portaria 782/2009, Anexo II ([PDF](https://dge.mec.pt/sites/default/files/Legislacao/port_782_2009.pdf)) | Níveis de qualificação |
| Baixa densidade | Portaria 208/2017 ([PDF](https://files.diariodarepublica.pt/1s/2017/07/13400/0373103734.pdf)) e Deliberação CIC 31/2023 | Covilhã é território de baixa densidade |
| Segurança Social | Código Contributivo, art. 53.º; Guia Prático FGCT de 13 ago 2026 | TSU; FGCT suspenso |
| Simulador da BF | "Simulador de GC e RO" de um colega (fora deste repo; não procurar) | Verificação externa: A 56/56 em 8 cenários, B 70/70 em 10 |

## 3. Indicadores de resultado (MPR-2024-3, p. 14–16)

| Código | Indicador | Unidade | Fórmula | Quando |
|---|---|---|---|---|
| RPR003 | Postos de trabalho criados | ETI | ETI no ano de cruzeiro − ETI no ano pré-projeto | Ano de cruzeiro |
| RCR01 | Postos de trabalho criados | ETI | Igual, medido 1 ano após a conclusão | 1 ano após a conclusão. **Não entra no RO** |
| RSR23 | Empregos qualificados criados | ETI | ETI qualificados no cruzeiro − ETI qualificados no pré-projeto | Ano de cruzeiro |
| RPR001 | Volume de negócios | % | (VN cruzeiro − VN pré) / VN pré × 100 | Ano de cruzeiro |
| RPR031 | Volume de negócios | € | VN cruzeiro − VN pré | Ano de cruzeiro |
| RPR002 | VA por trabalhador | % | (VA/ETI cruzeiro − VA/ETI pré) / (VA/ETI pré) × 100 | Ano de cruzeiro |
| RPR080 | VA por trabalhador | € | VA/ETI cruzeiro − VA/ETI pré | Ano de cruzeiro |

Acompanhamento, sem efeito no corte: RPA001, intensidade exportadora.
Realização, avaliada no encerramento: RPO008, inovações introduzidas.

**Definições [TEXTO]**
- **Volume de negócios:** "totais faturados pela empresa […] vendas no mercado de bens e serviços fornecidos a terceiros, reportados na IES do ano de referência" (p. 15).
- **Valor acrescentado:** "vendas e serviços prestados, acrescido da variação nos inventários da produção e dos trabalhos para a própria empresa, deduzido do custo das mercadorias vendidas e das matérias consumidas e dos fornecimentos e serviços externos" (p. 16). **VA por trabalhador** = VA / ETI anuais do mesmo ano.
- **ETI anual:** "relação entre as horas de trabalho efetivamente trabalhadas durante o ano civil e o número total de horas convencionalmente trabalhadas no mesmo período" (p. 14). Só contam os postos "que decorram das atividades apoiadas no âmbito da operação".
- **Emprego qualificado:** "nível de qualificação igual ou superior a VI" (p. 15), nos termos da Portaria 782/2009 (RE ITD, art. 3.º l)).
- **Ano de cruzeiro:** "exercício económico completo de laboração após o ano de conclusão física e financeira da operação, o qual não pode exceder o segundo exercício económico" (p. 19–20). Lê-se do termo de aceitação. O simulador da BF assume conclusão + 2; a app usa o ano que o termo indicar.

**Que indicadores ficam contratados [TEXTO + INTERPRETAÇÃO]:** o aviso fala em "quatro indicadores de resultado aplicáveis" (p. 21): emprego, emprego qualificado, VN e VA por trabalhador. Na demo, o termo contrata os 4 em % (RPR003, RSR23, RPR001, RPR002). As variantes em € (RPR031, RPR080) existem no catálogo para outros projetos.

**Os dois de emprego contam em separado [TEXTO]:** RPR003 e RSR23 são dois dos quatro. Um licenciado contratado conta nos dois.

## 4. Como se avalia e se corta (MPR-2024-3, p. 20–21)

### 4.1 No encerramento: Grau de Cumprimento (GC) dos indicadores de realização

GC = R / Re. Se GC ≥ 70%, mantém-se a taxa. Abaixo disso, a taxa desce: ]70–65] 0,5 p.p. · ]65–60] 1,0 · ]60–50] 1,5 · <50 2,0. Com GC < 40% pode haver revogação (DL 20-A/2023, art. 33.º, n.º 4, al. b)). **Fora da demo:** na empresa inventada, o RPO008 foi cumprido.

### 4.2 No ano de cruzeiro: Resultado da Operação (RO). É isto que o módulo vigia

- **RO = 0,5 × Ie1/I1 + 0,5 × Ie2/I2** [TEXTO]. Ie é o valor apurado no cruzeiro e I o valor contratado.
- **Entram só os 2 indicadores com melhores resultados** [TEXTO].
- **RO ≥ 70%: mantém-se a taxa.** Abaixo, "a taxa de financiamento é reduzida em meio ponto percentual por cada dois p.p. abaixo do limiar, até ao máximo de 3 p.p." [TEXTO].
- **Sem teto de 100% por rácio** [INTERPRETAÇÃO]. Nenhuma fonte impõe teto, e a fórmula usa o valor apurado tal como dá. No PT2020 o GC podia passar de 100%. O simulador da BF não usa teto. Consequência: um indicador acima da meta compensa outro.
- **Escalão incompleto conta como inteiro** [INTERPRETAÇÃO]: penalização = mín(3; ⌈(70 − RO) / 2⌉ × 0,5) p.p. RO = 69% dá 0,5 p.p. É a leitura prudente e a do simulador da BF. À letra, só escalões completos contariam (69% → 0). Mostrar no "Verify": "Conservative reading: partial steps count."
- **Arredondamento:** calcula-se com todos os decimais e só se arredonda para mostrar (2 casas). Nunca se arredonda o RO antes de tirar o escalão. Euros: contas em cêntimos inteiros; o meio cêntimo arredonda para cima (arredondamento comercial), uma só vez, no total.
- **GC e RO somam-se** [INTERPRETAÇÃO]: são dois momentos distintos e nada o impede. No máximo 2 + 3 = 5 p.p.
- **Revisão de metas** [TEXTO]: a autoridade de gestão pode rever as metas antes do pedido de pagamento final, por circunstâncias supervenientes, imprevistas e não imputáveis ao beneficiário. Depois desse pedido, já não.

Exemplo do aviso aplicado: emprego a 40%, VN a 110%, VA/trabalhador a 80%. Os 2 melhores são 110 e 80, RO = 95%, sem corte.

### 4.3 Corte em euros [INTERPRETAÇÃO]

- A taxa aplica-se às despesas elegíveis (RE ITD, art. 24.º, n.º 1).
- **Corte (€) = penalização (p.p.) / 100 × investimento elegível realizado.** Na demo, o realizado é igual ao contratado: 2.500.000 €.
- Incentivo ajustado = (taxa contratada − penalização) × investimento elegível realizado. É a conta do simulador da BF.
- O cruzeiro vem depois do pagamento final, por isso o corte cobra-se por recuperação: compensação com outros créditos, ou restituição em 30 dias e depois com juros de mora (DL 20-A/2023, art. 34.º).

## 5. ETI: como se calcula e que documento o prova

- **Regra do motor** (derivada da definição em horas, p. 14): cada pessoa conta (meses completos ao serviço no ano / 12) × (horas semanais / horário convencional da empresa). Entradas a dia 1, saídas no último dia do mês. Quem entra a 1 nov conta 2/12 = 0,17 ETI.
- **Projeção para 31 dez:** quem está ao serviço na data do último documento continua até 31 dez, salvo data de cessação conhecida.
- **Ano pré-projeto:** valor do termo de aceitação (vem da IES desse ano).
- **Não há um "documento ETI".** Nenhuma norma fixa a lista [INTERPRETAÇÃO]. Cruzam-se três fontes:
  - **IES, quadro 05291-A** (pessoas ao serviço e **horas trabalhadas**, a tempo completo e parcial). É a definição do aviso em horas: ETI = horas trabalhadas / horas convencionais de um tempo inteiro [TEXTO, p. 14]. **1 ETI = 1.920 h/ano** (40 h × 48 semanas, descontadas 4 semanas de férias) [TEXTO, Guia de apoio ao apuramento de ETI, IDE-RAM, fev 2026, [PDF](https://ide.madeira.gov.pt/files/Guia_Apuramento_ETI.pdf)]. O mesmo guia rateia por meses: 3 meses a tempo inteiro = 0,25 ETI, igual à regra do motor. Serve para o ano pré-projeto e, em 2027, para o cruzeiro.
  - **Relatório Único, Anexo A** (quadro de pessoal de outubro): data de entrada, regime (1 tempo completo, 2 tempo parcial), período normal de trabalho (40,0 ou 20,0 h) e habilitações (coluna 11).
  - **Declarações de Remunerações à Segurança Social** (mensais): quem foi pago em cada mês. Tempo completo declara 30 dias; tempo parcial com menos de 6 h por dia declara 1 dia por cada 6 horas, até 30 [TEXTO, guia da OCC sobre a DR]. Quem trabalha 4 h por dia aparece com 14 ou 15 dias. Quem faz 6 h ou mais por dia em tempo parcial aparece com 30 dias: aí só o RU mostra o horário.
- **Regra do cruzamento** [INTERPRETAÇÃO]: meses ao serviço das DR × horário do RU (40 h se a pessoa não estiver no RU e declarar 30 dias). Quem está na última DR continua até 31 dez.
- **Na demo:** a empresa A tem mapa de pessoal (XLSX) e ainda o RU de 2023, a IES e a DR de setembro, que batem com o mapa. A empresa B não tem mapa: RU de 2022 + DR de janeiro a setembro de 2026.
- **Recolha ideal** (o objetivo é chegar ao mesmo número que o organismo vai apurar) [INTERPRETAÇÃO]. Hoje a BF quase não mede o ETI durante o ano; vê-o na IES, tarde. A app pede, por esta ordem:
  1. **IES do ano pré-projeto**: confirma o ETI pré-projeto do termo (horas do 05291-A / 1.920).
  2. **RU do ano pré-projeto**: quem lá estava, horário e habilitações (base do emprego qualificado).
  3. **DR mensais do ano de cruzeiro**, à medida que saem: entradas, saídas e tempo parcial, mês a mês. É o que dá a projeção durante o ano.
  4. **Certidões** só de quem entrou depois do pré-projeto e conta como qualificado. Grau estrangeiro: com reconhecimento (DL 66/2018) ou fica "a confirmar".
  5. **Mapa de pessoal**, se a empresa o tiver: atalho, nunca prova. Confere-se contra as DR.
  6. **IES do ano de cruzeiro** (entregue no ano seguinte): fecha o número com as horas reais. Se a projeção e a IES diferirem, mostra-se a diferença e porquê.
- O simulador da BF pede o efetivo de cada ano. Mete-se lá o ETI calculado por esta regra; foi assim que deu 56/56.

## 6. Emprego qualificado: níveis do QNQ (Portaria 782/2009, Anexo II) [TEXTO]

| Nível | Habilitação | Qualificado? |
|---|---|---|
| 1–2 | Ensino básico (até ao 9.º ano) | Não |
| 3 | Secundário de prosseguimento de estudos (12.º ano) | Não |
| 4 | Secundário de dupla certificação (curso profissional) | Não |
| 5 | Pós-secundário não superior (CET, hoje CTeSP) | **Não** |
| 6 | Licenciatura (e bacharelato pré-Bolonha) | **Sim** |
| 7 | Mestrado | Sim |
| 8 | Doutoramento | Sim |

- **Prova:** certificado ou certidão de habilitações [INTERPRETAÇÃO; o aviso não fixa]. Para quem já estava no ano pré-projeto, o RU desse ano também serve: coluna 11, habilitações, tabela 14 do RU (1.º dígito 6 = licenciatura, 7 = mestrado, 8 = doutoramento; 4 = pós-secundário não superior) [TEXTO, tabelas auxiliares do RU].
- **A coluna 17 do RU ("nível de qualificação") não é o QNQ.** É a classificação da empresa (1 quadros superiores, 2 quadros médios, 3 encarregados, 4 altamente qualificados, 5 qualificados, 6 semiqualificados, 7 não qualificados, 8 praticantes). Um diretor com o 12.º ano é "quadro superior" e não conta como qualificado.
- **Na demo:** A tem 5 certidões (4 de nível ≥ 6 e 1 CTeSP, nível 5, que **não conta**). B tem 3: licenciatura (conta), CTeSP (não conta) e um grau brasileiro sem reconhecimento.
- **Diploma estrangeiro:** o reconhecimento faz-se pelo DL 66/2018. O aviso não o exige, mas convém tê-lo. A app marca "needs consultant review" e não conta o diploma sem confirmação [INTERPRETAÇÃO]. Na empresa B, é este diploma que decide se há corte.
- **Dados sensíveis num certificado:** nome, n.º do Cartão de Cidadão, NIF, data de nascimento, nacionalidade. Tapam-se todos antes de ir à IA; o nível e o curso ficam.

## 7. Leitura dos documentos da empresa

### 7.1 Contas SNC [TEXTO no aviso, tradução para SNC: INTERPRETAÇÃO]

| Parcela do aviso | Contas SNC | Sinal |
|---|---|---|
| Vendas e serviços prestados (= volume de negócios) | 71 + 72 | saldo credor |
| Variação nos inventários da produção | 73 | credor soma, devedor subtrai |
| Trabalhos para a própria entidade | 74 | soma |
| CMVMC | 61 | subtrai |
| FSE | 62 | subtrai |

**Não entram no VA:** 63 gastos com pessoal, 64 depreciações, 68 outros gastos (incluindo impostos indiretos), 69 juros, 75 subsídios à exploração, 78 outros rendimentos (incluindo a 7883, imputação do próprio incentivo). Contratar não mexe no VA, mas baixa o VA por trabalhador.

O VAB do Referencial de Mérito (inclui rendimentos suplementares e subsídios à exploração; tira impostos indiretos) **só serve para o mérito da candidatura**. Ex-post usa-se a definição do indicador (p. 16).

### 7.2 Formatos de balancete (todos acumulados desde 1 de janeiro)

- Há balancetes com contas de razão (2 dígitos) e subcontas na mesma lista. **Somam-se as contas de razão ou só o último nível, nunca os dois.**
- Conferência obrigatória: total do débito = total do crédito. Se não bater, pede-se revisão.
- Números em formato português (1.234.567,89). O CSV vem com `;` e vírgula decimal (UTF-8 com BOM).

### 7.3 Projeção para o ano de cruzeiro

- **VN e VA projetados = acumulado × 12 / meses decorridos** (ritmo médio) [INTERPRETAÇÃO]. É uma premissa linear e mostra-se como tal ("At the current pace…"). A demo não modela sazonalidade.
- ETI projetado: secção 5.

## 8. Estados

| Onde | Regra |
|---|---|
| Indicador | On track: Ie/I ≥ 100% · At risk: 70% a 100% · Off track: < 70% |
| RO (destaque) | No cut: RO ≥ limiar · Cut expected: RO < limiar, com os p.p. e os € |

## 9. Prazo para agir e caminho mais barato

### 9.1 Prazo para agir

Para 1, 2 e 3 contratações (qualificadas ou não), o motor procura o último mês de entrada que ainda leva o RO ao limiar. Hoje (fim de outubro), a primeira entrada possível é **1 de novembro**. Texto: "1 hire would have been enough by September. Today: 2, starting 1 November."

### 9.2 Alavancas

| Alavanca | O que muda no motor | Custo |
|---|---|---|
| Contratar N pessoas, qualificadas ou não, salário S, a partir do mês M | ETI e, se qualificadas, ETI qualificado. VA igual, por isso o VA/ETI desce | Custo até 31 dez e custo de um ano inteiro |
| Vender mais X € até 31 dez | Só o VN; o VA fica igual (prudente). X arredonda-se por cima aos mil euros, para não calhar em cima do limiar | Sem custo direto; mostra-se o esforço em % do ritmo do T4 |

### 9.3 Custo de contratar

| Componente | Valor | Selo e fonte |
|---|---|---|
| Pagamentos por ano | 14 (12 + subsídio de férias + subsídio de Natal) | [TEXTO] Código do Trabalho, arts. 263.º e 264.º |
| TSU da entidade empregadora | 23,75% | [TEXTO] Código Contributivo, art. 53.º |
| Seguro de acidentes de trabalho | 1,5% da massa salarial | [ESTIMATIVA] mercado têxtil, 1% a 3% |
| FCT / FGCT | 0% | [TEXTO] entregas suspensas desde maio de 2023 (Guia Prático SS, 13 ago 2026) |
| Subsídio de refeição | Fora da demo | Isento até 6,15 €/dia em dinheiro (fonte secundária) |

Custo mensal = salário × 14 / 12 × (1 + 0,2375 + 0,015). Um licenciado a 1.500 €/mês custa 2.191,88 €/mês à empresa.

### 9.4 Obrigações sobre o emprego (correção importante)

- **Não reduzir o número total de trabalhadores durante a execução da operação** [TEXTO, RE ITD art. 26.º a)].
- **A obrigação de manter os postos criados 3 anos (5 nas grandes empresas) não se aplica a estes avisos** [TEXTO]. O art. 26.º a) só a impõe aos postos criados "nos termos previstos no n.º 5 do artigo anterior", ou seja, quando os custos salariais entram como despesa elegível. Isso não acontece no MPR-2024-3 nem no MPR-2026-6.
- Os postos têm de "decorrer das atividades apoiadas" (p. 14–15). Uma contratação feita só para atingir o número pode ser contestada. A sugestão diz-o: "The new role must be linked to the supported project."
- O investimento mantém-se afeto à atividade e na localização durante 3 anos (PME) após o pagamento final (DL 20-A/2023, art. 15.º, n.º 5).

### 9.5 Resultado da sugestão

A IA só redige; os números vêm do motor. O texto termina sempre com "Suggestion · to be confirmed by your BF consultant".

## 10. Taxa de financiamento (para as empresas inventadas)

MPR-2024-3, p. 8 [TEXTO]: nas Beiras e Serra da Estrela, a taxa base para micro e pequenas empresas é de 45 p.p., com teto de 60%. As majorações (Indústria 4.0, transição climática, emprego qualificado, capitalização) podem subi-la até esse teto. É só subvenção não reembolsável. A empresa A tem 45% (base, sem majorações).

MPr-2023-1, p. 5 [TEXTO]: taxa base de 30 p.p. para micro e pequenas empresas (25 p.p. para médias; no Alto Alentejo e nas Beiras e Serra da Estrela, 35 p.p. para micro e pequenas e 30 p.p. para médias), majorações de 5 p.p. por prioridade, máximo 40%. A empresa B (Maia) tem 30% (base, sem majorações).

## 11. Ficha de regras por aviso

O motor é um só; cada aviso vira uma ficha de dados. A IA preenche-a a partir da secção de indicadores e penalizações (procura os títulos "Indicadores de resultado", "Resultado da Operação", "penalização"), e um consultor confirma.

| Campo | MPR-2024-3 | MPr-2023-1 | MPR-2026-6 |
|---|---|---|---|
| Indicadores de resultado | RPR003, RSR23, RPR001/RPR031, RPR002/RPR080 | Os mesmos 4 | Os mesmos |
| Modelo do RO | `best_n`, n = 2, pesos 0,5 + 0,5 | `best_n`, n = 2 | `best_n`, n = 2 |
| Limiar do RO | **70%** | **85%** | 70% |
| Penalização do RO | 0,5 p.p. por cada 2 p.p. abaixo, máx. 3 | Igual | Igual |
| Escalões do GC | ]70–65] 0,5 · ]65–60] 1,0 · ]60–50] 1,5 · <50 2,0 | ]85–75] 0,5 · ]75–65] 1,0 · ]65–50] 1,5 · <50 2,0 | Igual ao de 2024 |
| Ano pré-projeto | O do termo | **2022, fixo** (p. 7) | O do termo |
| Páginas | 14–16, 19–21 | 5, 7, 10–16 | 14–21 |

PT2020 (31/SI/2018): modelo diferente, `weighted` com 3 indicadores (VAB 0,40 · emprego qualificado 0,30 · VN 0,30). **Fora do catálogo da demo:** a app diz "not supported".

**Regra para a IA:** escolhe indicadores do catálogo e copia parâmetros. Nunca escreve fórmulas. Indicador fora do catálogo → marca "not supported" e avisa.

**Verificação externa:** a ficha extraída de cada aviso tem de bater com esta tabela, lida à mão nos PDFs originais.

## 12. Catálogo de indicadores (fórmulas fixas no código)

| Código | Fórmula | Dados de entrada |
|---|---|---|
| RPR003 / RCR01 | ETI cruzeiro − ETI pré-projeto | Mapa de pessoal, ou RU + DR (secção 5) |
| RSR23 | ETI qualificados cruzeiro − ETI qualificados pré-projeto (nível ≥ 6) | Mapa de pessoal ou RU + DR, e certificados (ou RU, coluna 11) |
| RPR001 | (VN cruzeiro − VN pré) / VN pré × 100 | Balancete (71 + 72) |
| RPR031 | VN cruzeiro − VN pré | Balancete |
| RPR002 | (VA/ETI cruzeiro − VA/ETI pré) / (VA/ETI pré) × 100 | Balancete (71 + 72 ± 73 + 74 − 61 − 62) + ETI |
| RPR080 | VA/ETI cruzeiro − VA/ETI pré | Igual |

Os valores pré-projeto e as metas vêm do termo de aceitação. Cada meta é um valor contratado I; o apurado é Ie; a % da meta é Ie/I.

## 13. Respostas às dúvidas que estavam em aberto

| # | Dúvida | Resposta | Selo |
|---|---|---|---|
| 1 | Teto de 100% por rácio? | Não | INTERPRETAÇÃO (nenhuma fonte o impõe; simulador da BF) |
| 2 | RO = 69% já corta 0,5 p.p.? | Sim, o escalão incompleto conta | INTERPRETAÇÃO (prudente; simulador da BF). À letra seria 0 |
| 3 | Meta negativa ou base zero | Fora da demo: "not supported" | — |
| 4 | RPR003 e RSR23 contam como 2? | Sim. O RCR01 não entra no RO | TEXTO (p. 14–15, 21) |
| 5 | De onde vêm as horas para o ETI? | Não há documento único: IES (horas trabalhadas), RU (horário) e DR (meses pagos), cruzados; ou o mapa de pessoal, se existir | TEXTO (definição; dias da DR) + INTERPRETAÇÃO (cruzamento) |
| 6 | Base do corte em € | p.p. × investimento elegível realizado | INTERPRETAÇÃO (RE art. 24.º; simulador da BF) |
| 7 | Que VA se usa ex-post? | O do indicador (p. 16); o VAB do mérito não | TEXTO |
| 8 | Que indicadores ficam contratados? | Os 4 de resultado; o VN em % | TEXTO + termo da demo |
| 9 | Onde estão as metas? | Termo de aceitação (decisão de aprovação) | TEXTO (p. 21: "fixados na decisão de aprovação") |
| 10 | GC e RO somam-se? | Sim, até 5 p.p. | INTERPRETAÇÃO |
| 11 | Postos criados têm de durar 3 anos? | **Não** nestes avisos; só não reduzir o total durante a execução | TEXTO (RE art. 26.º a) remete para o art. 25.º n.º 5) |
| 12 | Nível VI = licenciatura? CTeSP? | Licenciatura 6, mestrado 7, doutoramento 8; CTeSP 5, não conta | TEXTO (Portaria 782/2009) |
| 13 | Diploma estrangeiro | Precisa de confirmação do consultor | INTERPRETAÇÃO |
| 14 | 14 salários e TSU 23,75%? | Sim | TEXTO |
| 15 | Seguro de acidentes de trabalho | 1,5% | ESTIMATIVA |
| 16 | Subsídio de refeição | Fora da demo | — |
| 17 | Ano de cruzeiro | O do termo; nas duas empresas, 2026 (conclusão em 2025) | TEXTO |
| 18 | Coluna 17 do RU serve para o qualificado? | Não. O nível vem das habilitações (coluna 11) ou da certidão | TEXTO (tabelas do RU) |

**Para confirmar com a colega depois (não bloqueia nada):** se a BF lê os escalões como o simulador (dúvida 2) e que documentos o organismo pede para o ETI na prática (dúvida 5).
