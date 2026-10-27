---
name: verificar-numeros
description: Compara os valores calculados pela app com a folha de respostas (verificada contra o simulador da BF) e dá o resultado em números. Usar depois de mexer em leitura de documentos, cálculos, projeções ou no simulador.
---

# Verificar os números

As folhas de respostas (`contexto/folha-de-respostas.md` para a A, `contexto/folha-de-respostas-b.md` para a B) foram calculadas fora da app e verificadas contra o simulador de GC e RO da BF (56/56 e 70/70). É a verificação externa: a app está certa quando bate com ela.

## Quando

Depois de qualquer mudança em: leitura de documentos, cálculo de indicadores, projeção, estados, RO, corte, simulador, ou nas respostas guardadas do chat.

## O que fazes

1. **Testes automáticos.** Mantém um teste (Vitest) por valor da folha de respostas: indicadores por trimestre, situação das metas, caso do simulador. Os valores esperados são copiados da folha tal e qual.
2. **Corre os testes** e conta: `certos / total`.
3. **Reporta assim:**

```
Verificação: 11/12 valores batem com a folha de respostas.
Falha: VA T3 · app 182.340 € · folha 181.900 € · diferença 440 €
Causa provável: <a tua hipótese>
```

4. **Regista** o resultado na secção "Verificação" do `EXPLICACAO.md`.

## Regras

- **Nunca alteres a folha de respostas nem os valores esperados nos testes para fazer bater.** Se não bate, o erro está na app, ou a regra em `regras-calculo.md` está incompleta. Nesse caso pára e pergunta.
- Arredondamentos: compara ao cêntimo nos euros e à centésima nos ETI, salvo se `regras-calculo.md` disser outra coisa.
- Diz sempre o número, mesmo quando é mau. "9/12" com a causa vale mais do que "quase tudo certo".
- Uma meta certa vale mais do que três erradas: se o tempo apertar, propõe esconder a meta que não bate em vez de a mostrar errada.
