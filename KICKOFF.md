# KICKOFF · primeiro pedido ao construtor (Cursor)

> **Como arrancar no dia 26**
> 1. Copiar `.env.example` para `.env.local` e pôr lá a chave da xAI.
> 2. Chat do construtor: perguntar "que regras tens para este projeto?". Se não falar do `AGENTS.md`, criar uma regra do Cursor que aponte para ele.
> 3. Segundo chat, em Plan Mode: `/agente-apresentacao` + Alt+Enter, e escrever "Começou o hackathon." Se o modo não pegar: "És o agente de apresentação, segue a skill agente-apresentacao. Começou o hackathon."
> 4. Às 11:30, depois dos mentores: colar no chat do construtor, **em Plan Mode**, tudo a partir de "Lê inteiros", com o que os mentores tiverem mudado no fim.

---

Lê inteiros: `AGENTS.md`, `contexto/dossier.md`, `contexto/regras-calculo.md`, `contexto/empresa-inventada.md`, `contexto/folha-de-respostas.md`, `contexto/folha-de-respostas-b.md`. Vê o que há em `dados-demo/`.

Vamos construir, de raiz, o monitor de metas do dossier: entrada de ficheiros → painel completo → chat que transforma o painel em simulador. Cerca de 9 horas. A demo tem de funcionar ao vivo.

A empresa A é a espinha das fases 0 a 3. A B entra na fase 4b. O motor e a ficha de regras nascem genéricos (limiar, escalões e `best_n` são dados), para a B só precisar dos leitores de RU, DR e balancete geral.

## Agora: o plano (não escrevas código)

Responde com:

1. **Perguntas.** Só o que precisas de saber para não adivinhar e que os ficheiros não respondem: casos que `regras-calculo.md` não cobre, campos vazios na empresa ou nas folhas de respostas, escolhas de produto e de design. As regras [INTERPRETAÇÃO] e [ESTIMATIVA] já estão decididas: usa-as sem perguntar. Uma pergunta por linha, com a tua proposta de resposta, para eu só dizer "sim" ou corrigir.
2. **Arquitetura** em 10 linhas no máximo: peças, o que faz cada uma, o que corre sem internet, onde entra a IA.
3. **Estrutura de pastas** e os tipos de dados centrais (ficheiro classificado, dados normalizados, ficha de regras, resultado do motor). São o contrato entre fases e entre subagents.
4. **Plano por fases** (tabela abaixo): para cada fase, o que divides em subagents a trabalhar em paralelo, o que fica contigo, e como provas que está pronta.
5. **Direção visual** em 5 linhas: paleta, tipografia, densidade, movimento. Segue a skill `designer` se a tiveres. Propõe primeiro o ecrã do painel, como protótipo.
6. O bloco "Explicação" do `AGENTS.md`, aplicado à arquitetura.

Espera o meu OK antes de começar.

## Depois: constrói por fases

Cada fase começa em Plan Mode, divide-se em subagents onde as partes não mexem nos mesmos ficheiros, e só fecha quando estiver verificada e explicada. Se o tempo acabar, o que estiver feito funciona sozinho.

| Fase | O que entra | Pronta quando |
|---|---|---|
| **0. Esqueleto** | App Next.js, TypeScript estrito, lint, testes, design base (cores, tipografia, componentes) | Abre no browser do painel; `lint`, `typecheck` e `test` passam |
| **1. Entrada** | Zona de largar ficheiros (PDF com texto, XLSX, CSV, DOCX); classificador por regras com IA como recurso; leitores por formato **da empresa A**; dados normalizados; lista de ignorados e de em falta; tapar com ecrã "Before / After"; registo de envios | Valores lidos batem com a folha da A (secção 1); `auditor-privacidade` sem fugas; classificador acerta no tipo de todos os ficheiros de `dados-demo/` (A e B). Com os ficheiros todos da A, nada em falta; tirando um, o painel pede-o |
| **2. Painel** | Aviso → ficha de regras (IA) → ecrã de confirmação → ficha guardada; motor (indicadores, projeção, ETI proporcional ao mês, RO, corte em €, prazo para agir, caminho mais barato); painel com RO em destaque, % por indicador, estados, "Verify", sugestão | `verificador`: indicadores, RO e corte batem com a folha (secções 2 e 3); ficha do aviso bate com a tabela de avisos de `regras-calculo.md`; painel funciona com o Wi-Fi desligado |
| **3. Simulador e chat** | Modo simulação no painel (antes → depois em cada indicador, animado); controlos diretos; chat por baixo com ferramentas do motor (ler indicadores, simular); respostas guardadas para as 3 perguntas | Casos da folha da A (secção 4) batem; as 3 perguntas da A (secção 5) respondem certo, com fonte; sem internet, o chat usa as respostas guardadas. As 3 da B entram na fase 4b |
| **4. Pormenores** (por esta ordem, só com as anteriores verificadas) | a) certificados → emprego qualificado · b) segunda empresa (outro aviso, limiar 85%, emprego lido do RU e das DR da Segurança Social, grau estrangeiro a confirmar) · c) termo de aceitação → metas · d) "Add document" com o que mudou · e) polimento de transições | Cada uma verificada como as fases acima |

## Fora do âmbito (não fazer, mesmo que pareça rápido)

PDFs digitalizados (imagem), várias empresas ao mesmo tempo (trabalha-se um projeto de cada vez: um aviso + os documentos dessa empresa; separadores com vários painéis e chats abertos ficam para depois), contas de utilizador, base de dados, ligação ao portal, exportações, grau de realização do investimento.

## No fim de cada fase

1. `revisor-tecnico`, `verificador` e `auditor-privacidade` (os que se aplicarem). Mostra-me os resultados tal como vêm e corrige antes de avançar.
2. Bloco "Explicação" + entrada no `EXPLICACAO.md` (skill `explicar-ao-juri`).
3. Commit em inglês, um por peça verificada. O histórico do git é a prova de que tudo foi feito no evento.
4. Diz-me o que falta, quanto tempo estimas para a fase seguinte e o que cortarias se apertar.
