# A BF e o problema

## Quem é a BF Consultores

Consultora portuguesa de incentivos: PT2030, PRR, SI Inovação, I&D, Descarbonização. Acompanha cada cliente desde a candidatura até ao encerramento do projeto e à verificação das metas.

A BF está a construir um **portal de cliente**: o sítio onde cada empresa acompanha os seus processos, carrega documentos e fala com a equipa BF. Este módulo de metas foi pensado para entrar nesse portal, na parte de assistência técnica ("metas contratualizadas").

Princípios do portal que este módulo respeita:

- **Regra de ouro:** a IA acelera, mas nada chega aos organismos nem ao cliente como decisão final sem revisão de um especialista BF. Validações automáticas aparecem como "to be reviewed by BF".
- **Voz da BF:** as mensagens falam em nome da BF ("we validated…"), nunca com nomes de funcionários.
- **Dados de clientes:** ficam na UE, com registo de acessos. No hackathon não se usa nenhum dado real.

## O problema, com os números submetidos

- A BF acompanha **mais de 100 projetos** com metas contratuais.
- Hoje as metas verificam-se **uma vez por ano**, quando sai a IES, à mão em Excel.
- Cada verificação leva **25 a 30 horas por projeto**.
- Caso real (sem nomes): o desvio na meta de **criação de postos de trabalho** só foi identificado no fecho anual da IES, meses depois de ter passado a oportunidade de contratar. Resultado: penalização e **corte do incentivo superior a 30.000 €**.
- Metas típicas: volume de negócios, VAB (valor acrescentado bruto), postos de trabalho criados. Variam com o aviso.
- Os dados para acompanhar chegam normalmente por trimestre.

## Respostas submetidas na candidatura (inglês)

**Key issue.** Companies with incentive-funded projects commit to strict contractual targets such as turnover, gross value added (GVA) and jobs created. Today this monitoring is mostly reactive: targets are typically checked only once a year, when the annual accounts (IES) are filed, through manual processes and Excel spreadsheets, taking 25 to 30 hours per project. When a target is found to be at risk, it is often too late for corrective action, and part of the grant is cut or must be repaid. BF currently follows more than 100 projects with contractual targets. In a recent real case, a shortfall in a job-creation target was only identified at the annual IES closing, months after the hiring window had passed, resulting in a penalty and a grant cut of over €30,000.

**Product snapshot.** A target-monitoring module for BF's client portal: the company's documents and project targets go in, sensitive data (tax IDs, names, bank details) is masked automatically before it reaches the AI, and a dashboard shows whether each target is on track, with suggestions, updated whenever a new document arrives. Below it, a chat powered by SpaceXAI's model answers detailed questions grounded in the company's own documents, such as "is it worth hiring two people at €1,200 a month?", with calculations done by code; it serves BF consultants first and clients later. Stage: our client portal is under development and this module will be part of it; the module itself will be built from scratch at the hackathon, on synthetic data.

**What a win looks like.** A working prototype on a realistic synthetic company: documents in, data masked, a dashboard showing which targets are on track or at risk and why, and a chat that answers a hiring question with real numbers from the documents. We also want to prove to our team that AI can analyse confidential financial documents without exposing client data, and leave with a module ready to integrate into our client portal.

> Nota: a candidatura foi submetida em português a partir desta versão. O texto acima é a tradução de referência.
