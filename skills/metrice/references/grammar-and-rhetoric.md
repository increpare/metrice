# Grammatical annotations and sourced rhetoric

The chat agent or composer supplies the interpretation. The server validates the structure of that input, checks its morphological evidence, and recognizes supported word-order patterns. No model or independent sentence parser runs on the server.

1. Call `prepare_rhetoric {text, meterId?}`. Keep its exact text, token IDs, surfaces, and `textHash`. The hash binds annotations to the exact text, including punctuation and line breaks; prepare again after edits. The result includes dictionary candidates and an `annotations` template; no candidate is automatically selected.
2. Fill in known per-word features and `nounPhrases`. Omit unknown features, or leave `partOfSpeech: "unknown"`. A phrase has an arbitrary unique `id`, a `head` token ID, and `modifiers`: the directly agreeing adjectives/participles attached to that head, however far apart they occur. Put several modifiers of the same head in one group. A genitive dependent belongs in its own phrase; it is not an agreeing modifier of the governing noun. Pronominal or substantival heads may be recorded, though current rhetorical detectors require noun heads.
3. Optionally supply `relations` for `subject` and `object`, with the noun as `dependent` and verb as `head`. These allow corresponding verb–noun pairs to be recognized. `apposition` points from the appositive head (`dependent`) to the explained head (`head`); `preposition-object` points from the governed object head (`dependent`) to its preposition (`head`). Empty arrays are valid.
4. Call `review_rhetoric {text, meterId?, annotations, maxFindings?}`. Use `providedBy: "agent"` for your interpretation and `"human"` for a composer's explicit analysis. Mark an uncertain token, phrase, or relation `certainty: "tentative"`; it cannot establish a rhetorical pattern. Omitted certainty means asserted. Evaluate competing attachments in separate calls.

The exact version-1 shape, using Winbolt's example (p. 220, §192), is:

```json
{
  "text": "Mollia luteola pingit vaccinia calta",
  "meterId": "hexameter",
  "annotations": {
    "version": 1,
    "textHash": "16bfeeb9be231e2639108a29f3f63ce8160c729524df8cb71291ec3267d80056",
    "providedBy": "agent",
    "tokens": [
      {"tokenId": 0, "surface": "Mollia", "partOfSpeech": "adjective", "case": "accusative", "number": "plural", "gender": "neuter"},
      {"tokenId": 1, "surface": "luteola", "partOfSpeech": "adjective", "case": "nominative", "number": "singular", "gender": "feminine"},
      {"tokenId": 2, "surface": "pingit", "partOfSpeech": "verb", "person": "third", "number": "singular", "tense": "present", "mood": "indicative", "voice": "active"},
      {"tokenId": 3, "surface": "vaccinia", "partOfSpeech": "noun", "case": "accusative", "number": "plural", "gender": "neuter"},
      {"tokenId": 4, "surface": "calta", "partOfSpeech": "noun", "case": "nominative", "number": "singular", "gender": "feminine"}
    ],
    "nounPhrases": [
      {"id": "bilberries", "head": 3, "modifiers": [0]},
      {"id": "marigold", "head": 4, "modifiers": [1]}
    ],
    "relations": [
      {"kind": "object", "dependent": 3, "head": 2},
      {"kind": "subject", "dependent": 4, "head": 2}
    ]
  }
}
```

The other optional word fields are `lemma` and `degree`. Use the full feature names shown in the tool schema: for example `proper noun`, `first`, `future-perfect`, `comparative`. A participle is `partOfSpeech: "verb", mood: "participle"`. Enclitics stay part of the written token; annotate the host's morphology. IDs are zero-based across the whole passage. Offsets use UTF-16 units, as JavaScript does. Partial token analysis is allowed; coverage reports which words have any supplied morphological information.

## Clauses and other grammatical groups

The following version-1 additions are optional on input. Preparation includes empty arrays for all four; existing inputs remain valid. Token lists contain unique IDs in surface order. Every referenced word must have a token entry, even if its features are unknown. Group IDs are unique within each group type.

| Field | Contents and meaning |
|---|---|
| `clauses` | `{id, tokens, head?, kind?, parentId?, introducer?, certainty?}`. `kind` is `main`, `subordinate`, `relative`, or `parenthetical`. A parent includes its children's words. Overlapping or interleaved clause spans require explicit ancestry and proper containment. `introducer` explicitly identifies a relative pronoun or conjunction; the server does not infer clause function from spelling. |
| `coordinationGroups` | `{id, members, conjunctions, conjunctionsComplete?, certainty?}`. Each member is `{tokens, head?, clauseId?}`. Members have disjoint token sets in surface order. A linked clause must have exactly the same tokens and a consistent head. `conjunctions` lists the words linking these members, including host tokens for coordinating enclitics. |
| `ablativeAbsolutes` | `{id, tokens, subject, predicate, certainty?}`. Explicitly identify the construction; two ablative endings alone do not establish it. Known contradictory case/agreement features withhold dependent findings. Missing necessary features produce an unverified diagnostic. |
| `parentheses` | `{id, tokens, clauseId?, certainty?}`. Identify the words of a parenthetical phrase or clause. A clause marked `kind: "parenthetical"` also identifies a parenthesis; equivalent annotations produce one finding with combined references. |

Use `conjunctionsComplete: true` only after enumerating **all connectives at that coordination level**. Leaving the array empty without this assertion cannot establish asyndeton. Explicit subordinate introducers and connectives inside nested coordinations belong to those inner structures. Known omitted coordinating conjunctions between or inside the members raise a conflict. An optional per-word `enclitic: "que" | "ve" | "ne"` records a supplied grammatical interpretation, not an inference from final letters. The lexical check compares that assertion against individual candidates and retains missing evidence as inconclusive. `-que` and `-ve` can contradict a claim of no coordinating connectives; interrogative `-ne` does not.

Tentative words or groups cannot establish their dependent patterns. A tentative parent clause also withholds findings based on its child clauses. Anaphora/epiphora require successive supplied units: unaccounted intervening words or tentative clauses break a run. Explicit coordinating connectives may separate successive members. Threefold repetition across two verses requires adjacent logical verses. Unknown word features remain unknown; known incompatible modifier roles or agreement conflicts cannot support government findings.

Each new finding supplies `annotationRefs`, such as `nounPhrases:corn`, `ablativeAbsolutes:changed-season`, or `relations:0`. Follow these references into the returned annotations to inspect and correct the interpretation. Token IDs/spans identify the observed words; source passages explain the handbook basis. These observations do not independently establish grammatical correctness or rhetorical intention.

Two complete, executable calls use the books' own examples:

- [Intervening ablative absolute](examples/ablative-absolute.json): *Aut ibi flava seres, mutato sidere, farra.* Winbolt p. 218, §188 (`winbolt_1903.P1623`).
- [Four parallel infinitive clauses](examples/parallel-clauses.json): *Iussit et extendi campos…* Winbolt p. 229, §202 (`winbolt_1903.P1654`), illustrating Ovid's arrangement.

```sh
node <skill-directory>/scripts/call.mjs review_rhetoric - < <skill-directory>/references/examples/ablative-absolute.json
```

The examples preserve their exact-text hashes and can serve as starting tests. Prepare again before annotating any revision.

## Reading the evidence

- `supported`: at least one individual database candidate supports every supplied feature and optional lemma together. This can be an explicit or generated form; inspect the returned source `basis`, record IDs, and warnings. It is not a claim of literary attestation or proof that the chosen reading fits this sentence.
- `not-found`: no candidate supports the supplied combination. This raises a doubt; the database may be incomplete. A zero candidate count is a lookup gap. A nonzero count includes the conflicting alternatives.
- `inconclusive`: an otherwise compatible candidate omits some needed morphology. The omitted fields are identified. Incomplete dictionary labels cannot establish a precise reading.
- `unchecked`: no features or lemma were supplied.

Only supplied fields are checked. The check examines all candidates even when the displayed list is truncated. It never assembles a reading by combining case from one candidate with number from another. It does not check macrons or other quantity constraints; use `analyze_verse` for those. Dictionary support for the words does not verify their attachment to each other.

Known case/number/gender conflicts withhold dependent modifier patterns. Missing agreement information also withholds them and produces a diagnostic. Tentative annotations cannot establish a pattern. `lexicalDoubts` on each finding links any unconfirmed word readings; preserve those qualifications when discussing it.

## Books and scope

Current detectors cover hexameter line forms, including the hexameter rows of elegiac couplets. Other rows return `source-scope-not-covered`. This review does not establish a metrical scan.

- Golden line: Winbolt p. 219, §192 (`winbolt_1903.P1628`); balance and comparison/contrast, pp. 219–221 (`P1629`); Virgil's selective ornate use, p. 220 (`P1630`); chiastic example, p. 220 (`P1631`). The strict detector requires two agreeing adjective–noun pairs and a finite central verb in five written tokens. It does not label every near-golden arrangement.
- Separated adjective–noun pairs: p. 217, §185 (`P1614`).
- Parallelism: p. 224, §195 (`P1638`, `P1639`).
- Chiasmus: pp. 224–225, §196 (`P1641`, `P1642`).
- Intervening apposition, ablative absolute, vocative, parenthesis, or pronoun: p. 218, §§187–190 (`P1622`–`P1626`).
- Clause continuation over a verse boundary: p. 216, §184 (`P1612`). This observes continuation without claiming that the most important word has been correctly postponed.
- Threefold/fourfold coordinated parallel clauses: p. 229, §202 (`P1654`). Explicit verb heads and matching subject/object role patterns are required on each linked clause; punctuation alone is insufficient.
- Initial/final recurrence (anaphora/epiphora): p. 230, introduction to §204 (`P1659`, whose OCR locator includes the discussion of parallel clause/phrase beginnings and endings). Inflected recurrence (polyptoton): pp. 230–231, §§204–206 (`P1659`, `P1662`, `P1663`). These traditional figure names label the arrangements discussed under repetition; they do not imply that Winbolt uses those names.
- Threefold repetition across adjacent verses: p. 231, §205 (`P1661`).
- Enumerative asyndeton: pp. 231–232, §207 (`P1666`); retain the stated contrast between Lucretian and Virgilian practice.
- Postponed relative introducers, displaced conjunctions, disyllabic preposition postposition and monosyllabic preposition interposition: p. 233, §209 (`P1670`, `P1671`, `P1672`, `P1674`). Government is supplied, not inferred from adjacent words.

This covers the relationship-based extensions; the wider thirty-item catalogue also includes scan-dependent and sound/word-family phenomena requiring separate evidence. Do not present all thirty as implemented.

Every finding returns exact source excerpts, printed/PDF pages, section, OCR lines, local source paths, and the checked ledger reference. Use `get_passage {claim}` to retrieve the complete passage and book examples with their individual locations. Existing metrical principles also carry passage excerpts; the resolver covers Winbolt, Lupton, and Postgate. Never invent a handbook rationale, purpose, rarity threshold, or quality judgment from a detected shape. A balanced arrangement can be deliberate; it need not earn a general recommendation or automatic praise.
