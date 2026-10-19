# Metrice

Compose, scan, and revise Latin verse with a hosted MCP and a reusable composition
skill. Metrice supplies lexical quantities, morphology, aligned scansion, form
search, and checks of alternative wording. It also reviews supplied grammatical
relationships for rhetorical arrangements, with exact pages and passages from
Winbolt, Lupton, and Postgate.

The composing agent supplies the grammar, intended meaning, and literary judgment.
A successful scan does not establish correct grammar or good poetry. Unknown
quantities, incomplete records, and uncertain interpretations stay visible.

## Install in Claude Code

```sh
claude plugin marketplace add increpare/metrice
claude plugin install metrice@increpare-metrice
```

Start a fresh session and invoke `/metrice:metrice`. The plugin connects the hosted
MCP automatically; no repository clone, dictionary build, account, API key, or
OAuth Client ID is needed.

## Install in Codex

```sh
codex plugin marketplace add increpare/metrice
codex plugin add metrice@increpare-metrice
```

Start a fresh session and use the Metrice skill. The package includes the skill,
remote MCP configuration, and compatibility metadata for both clients.

For Claude web, Desktop, or Cowork, add the custom connector
`https://metrice.increpare.com/mcp` with **Authentication: No sign in**. Upload the
standalone skill from the [installation page](https://metrice.increpare.com/agent/)
if you want its composition workflow alongside that connector.

## Try it

> Scan “arma virumque cano Troiae qui primus ab oris” as hexameter and show the
> aligned display. Then review “Aut ibi flava seres, mutato sidere, farra.” Supply
> the grammatical annotations, identify its rhetorical arrangement, and cite
> Winbolt's exact page and passage. Keep database doubts visible.

The second example supports an intervening ablative absolute, citing Winbolt,
printed p. 218, §188. Findings remain conditional on the supplied analysis.

## What runs and connects

The declared remote MCP is `https://metrice.increpare.com/mcp`. It has twelve
public tools: scansion, prose analysis, word lookup, metre discovery, principle
search/retrieval, passage retrieval, grammatical annotation preparation/review,
form search, alternative checks, and explicit feedback submission.

If the client cannot expose MCP tools, the skill includes a readable Node 18+
helper using built-in fetch. It sends the chosen operation and supplied text to
the same endpoint, with no npm packages or install scripts. In an engine checkout
it can use the local engine; an explicit `METRICE_MCP_URL` selects another server.
There are no hooks, background jobs, shell installers, or bundled executables.

## Privacy Policy

Calls transmit the text supplied for analysis to the hosted service. Verse
queries are processed in memory and are not saved as documents. Bounded in-memory
word caches and abuse-prevention counters can retain tokens or IP addresses until
eviction or service restart. The application does not log verse bodies or run an
external language model.

`report_feedback` explicitly sends a report to the operator's private reference
inbox. Reports can include reproduction text and source quotations, and have no
automatic expiry. They are not publicly browsable or automatically incorporated
into dictionaries or training data. Include only material you want to share with
the operator. The full [privacy policy](https://metrice.increpare.com/agent/privacy.html)
covers retention and deletion requests.

The public engine uses Lewis & Short and Wiktionary, without Digital Gaffiot,
LASLA usage ranking, or the local corpus-trained ranker. Its evidence can differ
from a fuller local installation. The service may ask clients to retry after rate
or capacity limits.

## License and support

This plugin's instructions, helper, and bundled assets are MIT licensed; see
[LICENSE](LICENSE). This does not relicense the engine, dictionaries, or cited
books. Dictionary attribution remains in the service's
[source notices](https://metrice.increpare.com/agent/attributions.json).

Published by Stephen Lavelle (increpare). [Support](https://metrice.increpare.com/agent/support.html)
and privacy requests: analytic@gmail.com.

Engine source: [latin_composition_helper](https://github.com/increpare/latin_composition_helper).
