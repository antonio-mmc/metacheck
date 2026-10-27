---
name: explicar-ao-juri
description: Depois de cada passo concluído, regista a peça no EXPLICACAO.md em linguagem simples, com analogia e frase em inglês para o júri. Usar sempre que uma peça fica feita e verificada.
---

# Explicar ao júri

O júri exige que a equipa saiba explicar cada parte do que construiu e o papel da IA. O António não é programador. O `EXPLICACAO.md` é a cábula dele: tem de lhe permitir responder a qualquer pergunta em 2 frases.

## Quando

No fim de cada passo concluído e verificado. Também quando mudas uma peça já registada (atualiza a entrada, não acrescentes outra).

## O que fazes

1. **Acrescenta uma entrada** em "Peças" no `EXPLICACAO.md`, com este formato exato:

```
### <Nome da peça>
- **O que faz:** 1 frase, sem termos técnicos.
- **Analogia:** 1 frase do dia a dia.
- **Como funciona por dentro:** 2 a 3 frases, com os nomes dos ficheiros principais.
- **Papel da IA:** o que a IA faz aqui, ou "nenhum: é código determinístico".
- **Verificação:** como se provou que está certo, com números.
- **Limites honestos:** o que não faz ou onde pode falhar.
- **Pergunta provável do júri → resposta (EN):** "Q?" → "A."
```

2. **Atualiza o "Mapa em 30 segundos"** no topo: o sistema inteiro em 5 linhas, da entrada dos documentos à resposta do chat. É o que o António diz se lhe pedirem "explain your architecture".

3. **Atualiza "Verificação"**: o resultado mais recente contra a folha de respostas (ex.: "12/12 values match").

4. **Atualiza "Papel da IA na construção"**: o que o agente fez e o que a equipa decidiu (problema, regras, verificação). Isto alimenta o entregável "role of AI" da TAIKAI.

## Regras de escrita

- Curto. O máximo de conhecimento com o mínimo de palavras.
- Português europeu, exceto as frases para o júri, que são em inglês.
- Números concretos, nunca "muito", "bastante" ou "significativamente".
- Uma analogia por peça, que uma pessoa sem formação técnica perceba.
- Sem exageros: se uma peça é simples, diz que é simples.
