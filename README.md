# Grant target monitor

One page for one project. Drop the call and the company documents, and the page shows the same figures the managing authority would reach: turnover, value added, employment, the expected cut, and which files were set aside.

The page opens on the panel for MPR-2024-3. The numbers come from the engine. "As of" reruns that engine at the end of Q1, Q2, or today. The simulator prices a hire or extra sales with the same date. The chat can ask a free question: the model may call `read_indicators` and `simulate`, and a reply is shown only when every number in it comes from that result. Without a key, or if the model fails or takes more than 8 seconds, the three saved answers are used. Opening the panel does not call the network.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. The page loads `dados-demo/empresa-a/` and the public call `dados-demo/avisos/aviso-MPR-2024-3-InovacaoProdutiva-BaixaDensidade.pdf`.

```bash
npm run lint
npm run typecheck
npm test
```

The model key lives only in `.env.local` (`XAI_API_KEY`, `XAI_MODEL`). Opening the panel does not call the network. "+ Add document" calls the model only when no rule recognises the file and a name list already exists.

## Layout

| Folder | Role |
|---|---|
| `domain/` | Pure functions: money, value added, average FTE, the operation result, the simulator. No React, no files, no network. |
| `ingest/` | Classify a file by its text, read rows with a source, mask personal data, check each document. |
| `ai/` | The only door that prepares text for the model. It masks company documents first. Chat turns go through the same door. Payloads are written to `data/ai-log/` (gitignored). |
| `app/`, `components/` | The page. It does not calculate. |

Zod checks the rows the readers return. Expected figures are copied into `tests/expected/` with the answer-sheet section in a comment. Tests do not read `contexto/`.

## Decisions

- SheetJS Community Edition 0.20.3, installed from the official CDN tarball. The npm package `xlsx` is not used.
- Account totals use the root of the account tree, in cents. Subtotals and totals in the export are ignored. Value added excludes accounts 75, 78 and 6812.
- Average FTE in a period is the mean of the monthly FTE for the months in that period. The annual figure on the single report uses complete months over 12.
- Qualified employment is read from column 11 of the single report (first digit 6, 7 or 8). Column 17 is the firm's grade and is not stored.
- The September CSV has no date inside the file. The quarter comes from the file name, and the documents card says so. Classification never uses the file name.
- The public call is logged as-is. Company documents are masked. Trial balances, the staff map, the single report, the IES, the social-security extract and the acceptance term are read by code and are not sent. Invoices and presentations never reach the door.
