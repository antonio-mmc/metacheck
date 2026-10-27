# dados-demo · o que a app recebe

Ficheiros que se largam na app durante a demo. Só dados públicos ou inventados.

| Pasta | O que vai lá | Regras |
|---|---|---|
| `avisos/` | PDFs **originais** de avisos (Compete 2030, Norte 2030, PRR…) | Públicos, não se tapam. Nome: `aviso-<código>-<nome-curto>.pdf`. Empresa A: MPR-2024-3 (limiar 70%). Empresa B: MPr-2023-1 (limiar 85%). O MPR-2026-6 prova que a app lê avisos novos |
| `empresa-a/` | Documentos **inventados** da Demo Têxtil (`contexto/empresa-inventada.md`) | Vários formatos de propósito (PDF com texto, XLSX, CSV, DOCX), no aspeto dos documentos reais (balancete Primavera, RU, IES, DR da Segurança Social, certidões). 2 ficheiros irrelevantes |
| `empresa-b/` | Documentos **inventados** da Demo Precisão (`contexto/empresa-inventada.md`, secção B) | Só PDF. Sem mapa de pessoal: o emprego lê-se do RU de 2022 e das DR mensais de 2026. 2 ficheiros irrelevantes |
| `novo-documento/` | Os documentos que entram depois, para o botão "Add document", um por empresa | A: `mapa pessoal 2026 atualizado.xlsx` · B: `extratoDeclaracaoRemuneracoes_2026_10.pdf` |

## Regras

- **Nunca dados reais.** Nenhum nome, NIF, NISS, IBAN ou valor copiado de um cliente. Um formato copiado de um documento real, sim; o conteúdo, nunca.
- **Nomes de ficheiro como um cliente os mandaria** ("Balancete Setembro.pdf", "scan_0042.pdf", "mapa pessoal 2026.xlsx"). Nada de nomes que digam o tipo à app: o classificador tem de acertar pelo conteúdo.
- **Os tipos certos de cada ficheiro** ficam na folha de respostas (`contexto/folha-de-respostas.md` e `folha-de-respostas-b.md`, secção 1), não aqui. É contra ela que se verifica o classificador.
- **PDFs com texto selecionável.** Digitalizações (imagem) estão fora do âmbito.
