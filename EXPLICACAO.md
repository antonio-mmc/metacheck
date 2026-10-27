# EXPLICACAO · o que construímos, explicado

> Preenchido pelo agente construtor durante o evento (ver a skill `explicar-ao-juri`, em `.cursor/skills/`).
> É a cábula do António para as perguntas do júri.

## Mapa em 30 segundos

Larga-se a pasta da empresa. O código lê cada ficheiro, tapa os dados pessoais e faz as contas. O painel abre já na Demo Têxtil: resultado, corte, prazo, e o que cada documento confirmou. O "As of" volta a correr o motor no fim do trimestre. O simulador experimenta contratar ou vender. O chat pode perguntar à vontade: o modelo só lê e simula, e uma frase com um número que não venha do motor não aparece. Sem chave, ou se o modelo falhar ou passar de 8 segundos, ficam as três respostas guardadas. Sem internet, o painel abre na mesma.

## Verificação

68/68 valores das secções 3, 4 e 5 da empresa A batem com a folha (casos A–F, T1 58,99% e 75.000 €, T2 73,39% sem corte, caso D a 6.575,63 €). Nesta passagem de ecrã o verificador fechou 18/18 nos números visíveis (64.50%, €37,500.00, 70.75% e corte €0.00 com dois licenciados). Vitest: 36 passaram, 1 ficou de lado (a leitura ao vivo dos avisos, que já correu à parte). Lint e typecheck passam. Playwright offline: 1/1, zero pedidos externos. O auditor desta passagem deu 6/6.

## Papel da IA na construção

O Cursor escreveu a app durante o evento. A equipa decidiu o problema, as regras de cálculo e o que se verifica contra a folha. A app, ao abrir o painel, não chama o modelo. A única porta está em `ai/door.ts` e a única chamada HTTP em `ai/xai.ts`. A leitura ao vivo dos avisos MPR-2024-3 e MPR-2026-6 já correu: o modelo devolveu as metas e o limiar certos, e errou as páginas e o ano pré-projeto. O painel ficou com a ficha gravada.

## Peças

### Motor das metas
- **O que faz:** Calcula, a partir dos ficheiros, a percentagem de cada meta, o resultado da operação, o corte em euros, o prazo e as duas vias para o evitar.
- **Analogia:** É a folha de Excel do consultor, mas corre sozinha e mostra a conta por baixo de cada número.
- **Como funciona por dentro:** `domain/engine.ts` recebe os números já lidos. O corte está em `domain/penalty.ts` e o custo de um licenciado em `domain/cost.ts`. "Hoje" é `domain/clock.ts`, fixo em 27 out 2026. Os pontos T1–T3 são a projeção de fim de ano feita em cada trimestre.
- **Papel da IA:** nenhum: é código determinístico.
- **Verificação:** 54/54 nas secções 2 e 3, incluindo os ficheiros reais da empresa A. No ecrã: 64.50%, €37,500.00, 1 Nov, 22.67 no painel e 22.667 no Verify.
- **Limites honestos:** As duas vias aparecem como sugestão, com a frase "Suggestion · to be confirmed by your BF consultant". Cortar custos e passar de tempo parcial a tempo inteiro não entram: a regra não diz como.
- **Pergunta provável do júri → resposta (EN):** "Does the AI calculate the cut?" → "No. The engine does. The Verify drawer shows the steps, including the sentence that a partial step counts."

### Simulador
- **O que faz:** Experimenta contratar e vender mais, ao mesmo tempo, e diz o resultado, o corte e o custo. As três perguntas do chat já têm a resposta escrita a partir dessas contas.
- **Analogia:** É mudar os ingredientes da receita e ver o prato novo, sem cozinhar duas vezes com regras diferentes.
- **Como funciona por dentro:** `domain/simulate.ts` chama a mesma projeção de `domain/engine.ts`. O salário só entra no custo, em `domain/cost.ts`, somado em cêntimos. Uma data de referência (fim do T1, do T2 ou de hoje) usa só os documentos até esse dia. As perguntas estão em `domain/rehearsed.ts`.
- **Papel da IA:** nenhum nestas contas. Se o chat vier a redigir, os números têm de existir no resultado do motor.
- **Verificação:** 68/68. Caso C mais 0 € de vendas igual a C. Caso D: 6.575,63 €. Um salário de 2.200 € não muda o RO.
- **Limites honestos:** Cortar custos e passar de tempo parcial a tempo inteiro não entram: a regra não diz como. No T2 não há sugestão, porque já não há corte. O salário por defeito é 1.500 € para licenciados e 1.000 € para os outros, e a data de entrada é o dia 1 do mês a seguir ao trimestre escolhido.
- **Pergunta provável do júri → resposta (EN):** "If I change the salary, does the grant result change?" → "No. The salary changes the cost only. The result changes when the hire changes the headcount."

### Painel de metas
- **O que faz:** Mostra, numa página, se a Demo Têxtil está a caminho de perder parte do incentivo, quanto, até quando, e as duas formas de o evitar.
- **Analogia:** É o placar do jogo ao intervalo, com o resultado grande e a conta por baixo de cada número.
- **Como funciona por dentro:** `app/page.tsx` passa os números já lidos a `components/panel/monitor.tsx`. O gráfico é SVG em `components/charts/quarter-chart.tsx` e começa no T1. O Verify abre a conta e a fonte. Documentos e o que a IA vê abrem a partir da barra. O logótipo está em `public/bf-logo.png`, sobre um fundo branco.
- **Papel da IA:** nenhum no painel. A frase âmbar é código. A nota por baixo do título só diz em que campos a leitura do aviso divergiu da ficha gravada.
- **Verificação:** No ecrã, em claro e em escuro, e a 390 px de largura: 64.50%, corte €37,500.00, 22.67 FTE · 24 people, 3.42 FTE · 4 people, gráfico 58.99 / 73.39 / 64.50, sem a palavra Actual. Dois licenciados a 1 de novembro: 64.50% passa a 70.75% e o corte a €0.00. O T1 mostra 58.99% e €75,000.00. O Verify do corte mostra "Conservative reading: partial steps count."
- **Limites honestos:** Em ecrã estreito a página faz scroll e o chat abre numa folha. A meta de volume e de VA mostra-se como percentagem contratada (25.00% e 15.00%), porque o motor guarda a taxa e não o euro absoluto.
- **Pergunta provável do júri → resposta (EN):** "Are those quarter points the real result at the time?" → "No. Each point is the year-end projection made with the information known at that quarter."

### Ficha do aviso
- **O que faz:** Guarda as regras do aviso (metas, limiar, pesos, escalões) para o painel abrir sem internet.
- **Analogia:** É a ficha que o consultor preenche uma vez, e que depois fica na gaveta.
- **Como funciona por dentro:** `domain/rule-card.ts` valida a ficha com Zod. As gravadas estão em `data/rule-cards/`. `ai/extract-call.ts` pede ao modelo a mesma ficha, pela porta única, e `cardDifferences` compara campo a campo.
- **Papel da IA:** ler o aviso público, uma vez. Não tapa o aviso, porque é público. Não inventa a fórmula: devolve os parâmetros, e o código é que conta.
- **Verificação:** A ficha gravada do MPR-2024-3 abre o painel offline. A leitura ao vivo, depois de tirar o `search_parameters` (a xAI responde 410 se ele for enviado), devolveu as duas fichas. Nos dois avisos o modelo acertou indicadores, pesos 0,5 e 0,5, limiar 70 e o escalão da penalização. Divergiu no ano pré-projeto (disse um ano fixo; a ficha gravada diz que vem do termo) e, no MPR-2024-3, nas páginas. O painel manteve a ficha gravada.
- **Limites honestos:** Se a resposta do modelo divergir, o painel mantém a ficha gravada e diz quais os campos. Uma leitura chegou com o código "MPr-2024-3"; o código corrige a caixa a partir do nome do ficheiro.
- **Pergunta provável do júri → resposta (EN):** "What if the model misreads the call?" → "The reply is checked field by field. If it fails, the panel keeps the saved card and says so."

### Tapar antes da IA
- **O que faz:** Troca nomes, NIF, NISS, IBAN, emails, telefones e moradas por etiquetas, e guarda o texto que a IA veria.
- **Analogia:** É um marcador preto por cima dos nomes, com uma lista à parte que fica na gaveta e não vai no envelope.
- **Como funciona por dentro:** Só `ai/door.ts` prepara texto para o modelo. Chama `ingest/mask.ts`. Quem está no mapa, no RU ou na DR fica `[WORKER_n]`. Quem assina de fora fica `[PERSON_n]`. Um ficheiro desconhecido só segue se já houver lista de nomes.
- **Papel da IA:** nenhum a tapar. A IA só vê o texto já tapado.
- **Verificação:** Os 5 certificados não levam nomes de pessoas. O auditor fechou em 6/6. Um telefone em `+351`, `00351` ou `912 000 111` sai como `[PHONE_n]`. Um NIF válido continua `[NIF_n]`.
- **Limites honestos:** Nomes de instituições que não estão nos documentos da empresa, como a universidade do certificado, ficam visíveis. As datas e os valores ficam de propósito.
- **Pergunta provável do júri → resposta (EN):** "Is this anonymised?" → "No. It is masked, which means pseudonymised. The labels can be turned back into names on this laptop, and that list never leaves it."

### Painel sem rede
- **O que faz:** Abre o painel completo mesmo com o Wi-Fi desligado, e com a letra que veio no projeto.
- **Analogia:** É um livro com a fonte impressa nas páginas, que não precisa de ir à biblioteca buscar o tipo de letra.
- **Como funciona por dentro:** Space Grotesk e Inter estão em `app/fonts/`, com a licença OFL ao lado, e entram por `next/font/local`. `e2e/offline.spec.ts` aborta qualquer pedido que não seja ao próprio servidor.
- **Papel da IA:** nenhum. O painel não chama o modelo.
- **Verificação:** 1 teste Playwright passou. Zero pedidos externos. A letra do texto contém "inter". A legenda "Year-end projection as of each quarter" está visível e a palavra Actual não aparece.
- **Limites honestos:** Ler um aviso novo, ou classificar um ficheiro desconhecido, precisa da chave e de rede. O painel da demo não.
- **Pergunta provável do júri → resposta (EN):** "Does the page download the font?" → "No. The font files are in the project. We blocked every external request and the panel still opened in that face."

### Leitura dos documentos
- **O que faz:** Abre a pasta da empresa, percebe o que é cada ficheiro pelo que está escrito lá dentro, e tira as linhas que as contas vão usar.
- **Analogia:** É separar o correio: a fatura vai para o lado, o balancete vai para a contabilidade, e um papel rasgado fica no cimo com um recado.
- **Como funciona por dentro:** `ingest/classify.ts` ignora o nome do ficheiro. Os leitores em `ingest/readers/` devolvem linhas com a origem. A IES, a declaração da segurança social e o termo passam por Zod antes de sair. A folha de cálculo é a SheetJS 0.20.3, vinda do CDN oficial.
- **Papel da IA:** só se nenhuma regra reconhecer o ficheiro, e só com a lista de nomes já feita. Se a lista estiver vazia, o ficheiro fica por ler e não vai ao modelo.
- **Verificação:** 32/32 na secção 1. 46/46 no classificador com nomes aleatórios. Um PDF corrompido e um PNG aparecem no cartão com o motivo.
- **Limites honestos:** O CSV de setembro não traz data; o trimestre vem do nome do ficheiro e o cartão diz isso. A empresa B fica só classificada.
- **Pergunta provável do júri → resposta (EN):** "What if someone renames the files?" → "Classification reads the content. The same 46 files with random names still classify 46 out of 46."

### Cartão de documentos
- **O que faz:** Diz quantos ficheiros foram lidos, o que ainda falta para a conta, o que foi posto de lado, e porquê.
- **Analogia:** É a lista de ingredientes da receita, com o que está na mesa e o que ainda tens de ir buscar.
- **Como funciona por dentro:** `domain/documents.ts` monta o cartão. `components/documents/documents-card.tsx` mostra seis linhas e um "See all", com o motivo por baixo do nome quando existe.
- **Papel da IA:** nenhum. O antes e o depois são o texto que o código já tapou.
- **Verificação:** Com a pasta da empresa A, 16 lidos, 0 em falta, 2 de lado (fatura e apresentação). O certificado mostra `[PERSON_1]` no depois.
- **Limites honestos:** O mapa de pessoal, se faltar, não entra na lista do que falta: a regra trata-o como atalho, e o cartão diz que não foi cruzado. Sem ele, o painel não abre.
- **Pergunta provável do júri → resposta (EN):** "Why was the invoice set aside?" → "It does not change the targets. The card says so, and that file never reaches the model."

### Conferência de cada documento
- **O que faz:** Mostra um cartão por ficheiro: o que se tirou, de onde, e se o requisito passou ou falhou.
- **Analogia:** É a conferência da encomenda, artigo a artigo, com um visto ou uma cruz.
- **Como funciona por dentro:** `ingest/document-checks.ts` monta os cartões a partir da leitura. O certificado está em `ingest/readers/certificate.ts`: o titular é quem vem depois de "que", o nível 6 ou mais conta como qualificado, e um diploma estrangeiro fica para o consultor e não conta.
- **Papel da IA:** nenhum. O código lê o texto do certificado.
- **Verificação:** 18 cartões no ecrã. Cinco certificados, quatro a contar (níveis 7, 6, 6 e 6) e o da Ana Rita Gomes, nível 5, que não conta. Os três balancetes dizem que o débito iguala o crédito. O termo diz "Targets confirmed by the consultant".
- **Limites honestos:** Nenhum dos certificados da demo é estrangeiro, por isso essa cruz não aparece no ecrã. O código marca-a quando o texto fala em reconhecimento ou em diploma estrangeiro.
- **Pergunta provável do júri → resposta (EN):** "Does a foreign degree count?" → "No. The card says it needs consultant review, and it does not count as qualified."

### Chat
- **O que faz:** Responde a uma pergunta sobre estes números. Se a pergunta for uma simulação, o painel passa a mostrar o antes e o depois.
- **Analogia:** É perguntar ao colega que tem a folha de cálculo aberta: ele não inventa a conta, lê a célula.
- **Como funciona por dentro:** `components/chat/chat-bar.tsx` chama `app/ask-action.ts`, que entra por `ai/door.ts` e daí por `ai/chat.ts`. O modelo só pode chamar `read_indicators` e `simulate`. `domain/rehearsed.ts` confirma cada número. Uma data não conta como número. Se não houver ferramenta, ou se um número não existir no motor, mostra-se a resposta guardada. Os três botões respondem logo da cópia guardada, sem chamar o modelo. Os números do painel vão já no pedido (arredondados a 2 casas), por isso uma pergunta simples custa uma só volta ao modelo. O servidor dá 20 s, o cliente 22 s. Se o tempo acabar depois de uma simulação, mostra-se a frase do motor e o simulador mexe na mesma. No modo de desenvolvimento o React monta o ecrã duas vezes; o chat volta a marcar-se como vivo, senão a resposta chegava e o ecrã ficava em "Reading the figures".
- **Papel da IA:** redige a frase. Não faz a conta.
- **Verificação:** Um teste deita fora um corte inventado de €999,999.00 e não deixa sair o nome verdadeiro. Outro teste aceita a simulação e devolve as alavancas. No ecrã, a pergunta do incentivo chegou ao modelo em 7,6 s; a resposta registada usa 64.5%, o corte de €37,500 e os 70.75% dos dois licenciados.
- **Limites honestos:** Se o modelo escrever 64.5 em vez de 64.50, a frase pode ser trocada pela resposta guardada, porque o código exige o número tal como o motor o formatou. Hoje (27 out) o grok-4.7 levou 7 a 13 s por volta; uma simulação ao vivo precisa de duas voltas e pode passar os 20 s. Não há microfone: próximo passo, voz transcrita no portátil para o áudio não sair.
- **Pergunta provável do júri → resposta (EN):** "What if the model invents a cut?" → "The reply is dropped. Every number has to exist in the engine result, or the screen keeps the saved answer."
