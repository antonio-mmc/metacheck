---
name: preparar-pitch
description: Prepara o pitch de 5 minutos em inglês, os slides, as respostas às perguntas do júri, a descrição para a TAIKAI e o documento de arquitetura, em pitch/. Usar pelo agente de apresentação.
---

# Preparar o pitch

## Fontes (por esta ordem de confiança)

1. O que a app faz de facto (lê o código e corre-a se puderes).
2. `EXPLICACAO.md`: peças, verificação, papel da IA.
3. `contexto/folha-de-respostas.md`, `folha-de-respostas-b.md` e `bf-e-problema.md`: os números.
4. `contexto/dossier.md`: guião base, perguntas do júri, critérios.
5. `contexto/guias-taikai.txt` e `contexto/regras-taikai.txt`: como os júris avaliam e o que é obrigatório entregar.

**Só entra no pitch o que existe na demo.** Se uma peça ficou por fazer, sai do guião e passa a "next step".

## O que produzes em `pitch/`

### `guiao.md`: o pitch falado
- Inglês simples, frases curtas, fácil de dizer por quem não é nativo.
- Estrutura: problema → solução → demo → prova → impacto. Tempos do guião do dossier.
- **No máximo 650 palavras** (cerca de 130 por minuto). Conta-as e escreve o total no topo.
- Diz quem fala em cada bloco (colega: abertura e fecho; António: demo).
- O Cursor é o protagonista da construção: "how Cursor helped" numa frase concreta, com horas.
- Termos certos: "pseudonymised" (nunca "anonymised"), "suggestion" (nunca "recommendation you must follow").

### `slides.md` e `slides.pptx`: os slides
- Primeiro `slides.md`: 6 a 8 slides. Por slide: título (uma afirmação, não um tema), no máximo 12 palavras de texto, e o visual sugerido. O António aprova antes de gerares o PowerPoint.
- Depois `slides.pptx`, gerado por um script em `pitch/` (ex.: `pptxgenjs`, porque o Node já está instalado). Capturas reais da app em vez de ícones genéricos. A colega revê e afina no PowerPoint.
- Muito visual, pouco texto: o guia da TAIKAI diz que ganha quem mostra.
- Um slide de arquitetura (o esquema de `contexto/dossier.md`) e um de impacto com 3 números.

### `perguntas.md`: defesa nas perguntas
- As perguntas do dossier mais as que a demo real levantar (limites honestos do `EXPLICACAO.md`).
- Por pergunta: resposta em inglês, no máximo 2 frases, e quem responde (colega: negócio; António: técnica).

### `descricao-taikai.md`: os entregáveis escritos
Tudo o que as regras pedem (`regras-taikai.txt`, secções 5 e 8):
- O que o projeto faz e o que o torna único
- O papel da IA na solução (e na construção)
- Capturas de ecrã ou demo curta (lista do que capturar)
- Link para o código ou demo, se aplicável
- Tecnologias usadas
- Resumo dos resultados alcançados, com os números da verificação

### `arquitetura.md`: entregável obrigatório
- Esquema (mermaid) da arquitetura real, como ficou no código.
- **Sistemas de origem:** balancetes (contabilidade), declarações da Segurança Social, metas do contrato de financiamento.
- **Domínios de dados:** financeiro, recursos humanos, metas contratuais. Que dados são pessoais e como são pseudonimizados.
- O que corre localmente e o que vai ao modelo externo.

## Regras

- Números sempre das fontes acima, nunca arredondados para soar melhor.
- Nada de dados reais de clientes, nem nos exemplos.
- Narrativa clara e honesta acima de slides bonitos.
- Mapeia as fraquezas antes do júri: cada limite tem uma resposta em `perguntas.md`.
