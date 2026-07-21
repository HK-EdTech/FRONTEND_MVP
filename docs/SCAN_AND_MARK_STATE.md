<!-- monitor-state: fe_branch=louis fe_sha=7d9f441 be_branch=louis be_sha=ee6bedc run=2026-07-17 -->
# Scan-and-Mark — State of the Feature

| | |
|---|---|
| **Date** | 2026-07-17 |
| **Frontend** | `FRONTEND_MVP` @ branch `louis`, `7d9f441` |
| **Backend** | `BACKEND` @ branch `louis`, `ee6bedc` |
| **Run type** | **No-op — incremental, nothing landed.** Marker read from line 1 (`fe_sha=7d9f441 be_sha=ee6bedc`, both branch `louis`). Both branches still match, so a `..HEAD` range was valid; both ranges came back **empty**. Findings below are **carried forward as of `7d9f441` / `ee6bedc`** — the same SHAs that verified them, because the tree has not moved since. |
| **Working tree** | Both repos list dozens of modified files, but `git diff --ignore-all-space --stat` is **empty in both**. The dirt is pure CRLF noise — **no uncommitted work**. This doc is not behind its repos. |

## Since last run

**No new commits since `7d9f441` (FE) / `ee6bedc` (BE).** The marker chain held: line 1 parsed, both branches matched `louis`, both ranges ran and returned nothing.

```
git log --oneline 7d9f441..HEAD -- <FE feature paths>   → empty
git -C ../BACKEND log --oneline ee6bedc..HEAD -- <BE paths> → empty
```

**Working tree re-confirmed clean.** Both repos still list dozens of `M` files in `git status` (FE ~130, BE ~55, including every feature path). `git diff --ignore-all-space --stat` is **empty in both, whole-tree** — pure CRLF, no uncommitted work. The alarming `git status` is noise, exactly as before.

Nothing was re-derived from scratch: with zero commits and a whitespace-only working diff, the source is byte-identical to what produced the findings below. Spot-checks confirmed the baseline still matches source (`subStatuses` still `[]` on three groups; `ScanAllDraftsButton` still importer-less; `ai_agents` still 2 B / 0 B). Marker on line 1 re-issued at current `HEAD` — unchanged SHAs, same `run=` date.

## Pipeline status — the headline

| Phase | `onetime` | `class` |
|---|---|---|
| 1 Criteria | **Built** — `scan_and_mark_controller.py:57-59` → `create_onetime_homework` | **Not built** — `ClassCriteria` is `pass  # TODO` (`scan_and_mark_pydantic_model.py:27-28`); `HomeworkCriteria_Class.tsx` imported by nothing |
| 2 Upload | **Built, but unreachable** — `ScanAllDraftsButton` (`submissionlist_component.tsx:30`) imported by nothing | **Not built**, and actively harmful (see §`onetime` vs `class`) |
| 3 OCR | **Not built** — a label with nothing behind it; all three tripwires negative | **Not built** |
| 4 Check scan | **Not built** — `check_scan.subStatuses` is `[]` (`scanAndMark_statusGroups_slice.ts:15`) | **Not built** |
| 5 AI marking | **Not built** — `mark_ai`/`completed` are `[]` (`:16-17`); `src/ai_agents/` still empty | **Not built** |

**No phase moved** — and none could have: zero commits landed in either repo since the last run. Every row below is carried forward *as of `7d9f441` / `ee6bedc`*.

**The single most important fact:** `ScanAllDraftsButton` holds the entire upload pipeline and **nothing imports it** — a repo-wide grep returns only its own definition (`:30`) and props interface (`:26`). In the running app no submission ever leaves `prepare_upload`. Phase 2 is *written, not live*; every status past `prepare_upload` is unreachable code. This outranks every other finding here.

### Phase 3 — the tripwires, checked

All three fired **negative**. `ocr` is a label with nothing behind it; the pipeline stops at "uploaded".

| # | Tripwire | Result |
|---|---|---|
| 1 | An OCR endpoint has appeared | **No.** `scan_and_mark` declares exactly 3 routes, none OCR-related. The only `ocr`-named hits are a class and a method **inside** `src/ocrs/BestOCR.py:23,36` — definitions, not routes. |
| 2 | Anything imports `../BACKEND/src/ocrs/` | **No.** Repo-wide grep for `from .*ocrs` / `import .*ocrs` returns **zero** hits. |
| 3 | Anything writes `homework_sheets` | **No.** `homework_sheets` exists in `prisma/schema.prisma:639-656` and appears in **zero** Python files — not written, not read. |

**Nuance that changes the estimate:** `src/ocrs/` is **not** an empty directory. It holds ~28 KB of complete, working OCR implementations — `BestOCR.py` (8.4 KB), `models/GoogleCloudVisionAPI.py` (9.7 KB), `models/PyTesseract.py` (7.8 KB), `models/EasyOCR.py` (2.0 KB). The capability is **written but unwired**: no endpoint calls it, nothing imports it, and its output has nowhere to land (tripwire 3). "Unwired" and "unwritten" are different findings, and phase 3 is the former. See Scope drift.

Phase 5's sink is modelled and unwritten exactly as predicted: `homework_sheets.extracted_text` (`schema.prisma:644`), `latex_content` (`:645`), `ocr_confidence_score` (`:646`), `formatted_result` (`:647`) all exist and are never written by anything. `src/ai_agents/GoogleADK.py` is **2 bytes** (a lone `#`), `LiteLLM.py` is **0 bytes**. **Phase 5 has not started.**

## Status machines

Five distinct machines. All still untyped `string` — **no union type has appeared on any of them.**

### 1. Submission `status_frontend` — `ScanAndMark_homeworksubmissions_slice.ts`

Untyped `string` (`:11`), documented only by the trailing comment `// prepare_upload -> uploading -> ocr`.

| literal | written at | trigger | vs baseline |
|---|---|---|---|
| `prepare_upload` | `ScanAndMark_homeworksubmissions_slice.ts:32` | submission card created | unchanged |
| `uploading` | `submissionlist_component.tsx:82` | just before requesting signed URLs | unchanged |
| `ocr` | `scanAndMarkHelpers.ts:22` | after the PUT to the signed URL lands | unchanged |

Setter `setStatus_frontend` (`:68-71`) accepts any string — no validation. **No transition out of `ocr`** (terminal in practice). **No error/failed state.**

### 2. Marking-scheme `status_frontend` — `homeworkCriteria_OnetimeUpload_slice.ts`

A separate, parallel machine — easy to conflate with machine 1.

| literal | written at | trigger | vs baseline |
|---|---|---|---|
| `''` | `:21` (initial), `:48` (reset) | slice init / reset | unchanged — **belongs to no group** |
| `prepare_upload` | `:42` | marking-scheme file picked | unchanged |
| `uploading` | `submissionlist_component.tsx:85` | before signed-URL request | unchanged |
| `ocr` | `scanAndMarkHelpers.ts:39` | after marking-scheme PUT lands | unchanged |

Setter `setMarkingSchemeStatus_frontend` (`:50-51`). `homeworkCriteria_Class_slice.ts` still has **no `status_frontend` at all**. No transition out of `ocr`; no error state.

### 3. Submission backend status — `scan_and_mark_service.py`

> **Master-table caveat:** FK-constrained to `master_homework_submssion_status` (`schema.prisma:840-843`; the `submssion` typo is real and was matched exactly). Relations at `:780` and `:803`. **The authoritative permitted set is database rows, not source, and was NOT verified.** Below is only what the service *writes* — **not a complete set.**

| table | literal | written at | trigger | vs baseline |
|---|---|---|---|---|
| `homework_submission_onetime` | `uploading` | `scan_and_mark_service.py:79` | `create_onetime_submissions` — at creation, **never `prepare_upload`** | unchanged |
| `homework_submission_onetime` | `ocr` | `scan_and_mark_service.py:141` | `confirm_submission_upload` | unchanged |
| `homework_submission_class` | — | — | **never written by this module** | unchanged |

**The symmetry is schema-only.** `homework_submission_class` FKs to the same master table (`:803`) but `scan_and_mark` never touches it. Its sole reference repo-wide is a **read** in another module — `class_service.py:410` (`find_many`). Nothing anywhere writes it.

### 4. Homework status — `homework.status`

FK `master_homework_status` (`schema.prisma:830-833`, relation at `:627`). Same master-table caveat.

| literal | written at | trigger | vs baseline |
|---|---|---|---|
| `prepare_upload` | `scan_and_mark_service.py:48` | `create_onetime_homework` | unchanged — **still write-once** |

**The collapsed machine is confirmed still collapsed — no transition was re-added.** `confirm_submission_upload` explicitly refuses to move it: docstring `:120-122` ("The homework status is left unchanged (no coarse phase marker)") and the inline `:130` (`# ownership check only — do NOT change the homework status here`). The endpoint still *returns* `homework_status` (`:147`), but it is always the creation value. This is deliberate as of `ee6bedc`. **The FE was never updated to match** — see Risks 4.

### 5. Marking scheme status — `marking_scheme.status`

FK `master_marking_scheme` (`schema.prisma:851-854`, relation at `:675`). Same caveat.

| literal | written at | trigger | vs baseline |
|---|---|---|---|
| `uploading` | `scan_and_mark_service.py:114` | `create_marking_scheme_record` | unchanged |
| `ocr` | `scan_and_mark_service.py:162,164` | `confirm_marking_scheme_upload` | unchanged |

No transition out of `ocr`; no error state.

### Group keys — `scanAndMark_statusGroups_slice.ts:13-18`

**Lead signal: no group gained a first `subStatuses` entry. No phase came alive.**

| key | label | `subStatuses` | line | phase |
|---|---|---|---|---|
| `draft` | Draft | `['prepare_upload', 'uploading', 'ocr']` | `:14` | 1-3 |
| `check_scan` | Check scan | `[]` | `:15` | 4 — **dead** |
| `mark_ai` | Mark with AI | `[]` | `:16` | 5 — **dead** |
| `completed` | Completed | `[]` | `:17` | done — **dead** |

`groupForStatus` (`:39-41`) and the count selector (`:51`) both key off `subStatuses.includes(...)`, so **three of four chips can never match a card or show a non-zero count.** `StatusGroup.key` is `string` (`:6`), not a union.

**Diff against baseline: nothing new, nothing gone.** Every literal found matches the baseline set exactly, and every baseline literal was found. FE and BE agree on `uploading` and `ocr`; they do not share a start state (Risk 8).

## Animations

One ternary chain assigned to `animationOverlay` (`SubmissionList.tsx:79-98`), rendered at `:125`. Keyframes hand-written in `globals.css` (Tailwind v4 `@theme inline`; there is no `tailwind.config`).

| status | animation | keyframe | verified at |
|---|---|---|---|
| `prepare_upload` | none — static card (by design) | — | falls to the `: null` tail |
| `uploading` | cloud icon + rising arrow | `submissioncloudarrow` | `SubmissionList.tsx:80-91`; keyframe `globals.css:329` |
| `ocr` | scanning sweep gradient | `submissionscan` | `SubmissionList.tsx:92-98`; keyframe `globals.css:335` |

Both are plain CSS `animation:` strings. **framer-motion in this file drives dialogs, not status** — not to be confused. Coverage is complete for every status that exists; **no gap to report.** A card whose status matches no group renders `statusColors.disabled` and no chip — that is what an orphan status (Risk 7) looks like on screen.

## `onetime` vs `class`

No shared type alias — `'onetime' | 'class'` is re-inlined at each site (e.g. `submissionlist_component.tsx:27,44`).

| | `onetime` | `class` |
|---|---|---|
| FE criteria slice | `homeworkCriteria_OnetimeUpload_slice.ts` — full | `homeworkCriteria_Class_slice.ts` — exists, **no `status_frontend`** |
| FE criteria component | `HomeworkCriteria_OnetimeUpload.tsx` — wired | `HomeworkCriteria_Class.tsx` — **imported by nothing** |
| FE route | `src/app/scan-and-mark/page.tsx` — hardcoded onetime | **none exists** |
| FE upload switch | `submissionlist_component.tsx:56-74` — full | `:75-77` — **stub** |
| BE match | `scan_and_mark_controller.py:57-59` — creates homework | `:60-61` — **stub** |
| BE submissions | `create_onetime_submissions` (`service.py:52`) | **none written** |

**FE stub — `submissionlist_component.tsx:75-77`.** `case 'class':` is a `// TODO` with a bare `break`. **This is not a switch fallthrough** — it breaks cleanly. The defect is the missing **early return**: execution continues *past* the switch to `:81` with `submissionPdfs_and_Metadata = []` and `criteria = {}`, then still POSTs at `:88` with empty metadata under `homework_criteria: ['class', {}]`.

Worse — `hasMarkingScheme` is read from the **onetime** slice at `:53`, **before the switch and unconditionally**. So a `class` upload dispatches `setMarkingSchemeStatus_frontend('uploading')` (`:85`), then at `:109-121` uploads and confirms **the onetime marking scheme** against a class homework. A class upload marks and ships onetime state. `ScanAllDraftsButton` reads only `state.Homeworkcriteria_onetimeUpload` (`:35`) — it never touches the class slice.

**BE stub — `scan_and_mark_controller.py:60-61`.** `case "class":` only constructs `ClassCriteria(**raw_criteria)`, a model whose entire body is `pass  # TODO: define class criteria fields` (`scan_and_mark_pydantic_model.py:27-28`) — so it validates nothing and holds nothing. It creates **no homework** (`:59` is onetime-only) and **no submissions** (created after the match block, commented "onetime only", `:68`). **A class upload returns a `homework_id` with nothing behind it.**

## Wiring — reachable vs orphaned

| Symbol | Location | Reachable? |
|---|---|---|
| `src/app/scan-and-mark/page.tsx` | — | Live — the only route, onetime-only |
| **`ScanAllDraftsButton`** | `submissionlist_component.tsx:30` | **ORPHANED — imported by nothing.** Holds the whole upload pipeline |
| `submissionlist_component.tsx` (whole file) | — | Reachable from no route |
| `HomeworkCriteria_Class` | `HomeworkCriteria_Class.tsx:17` | **Orphaned** — only self-references (`:11,:17,:21`) |
| `StatusGroupKey` | `statusColors.ts:18` | **Dead export** — exported, imported nowhere |
| `src/ocrs/*` | `BACKEND/src/ocrs/` | **Orphaned** — ~28 KB of working OCR, zero importers |
| `src/ai_agents/*` | `BACKEND/src/ai_agents/` | Empty files — nothing to wire |

**Stated plainly:** the upload pipeline is **developed but unreachable** — not "not developed". Cards can be created and edited, all at `prepare_upload`. Nothing in the running app dispatches `setStatus_frontend` to anything else, calls the API, or reaches `uploading`/`ocr`. The animations and two of three status literals are dead code in practice. The code exists and looks finished; it simply is not connected.

## Contract — FE calls vs BE routes

Router prefix `/scan-and-mark` (`scan_and_mark_controller.py:14`), registered at `main.py:17,75`. **Both repos on branch `louis` — no branch mismatch, so nothing here is a checkout artifact.**

| FE call | `api.ts` | BE route | BE line | Verdict |
|---|---|---|---|---|
| `POST /scan-and-mark/upload-for-signed-url` | `:505-506` | `@router.post("/upload-for-signed-url")` | `:17` | match |
| `PATCH /scan-and-mark/submissions/{id}/confirm` | `:526-527` | `@router.patch("/submissions/{submission_id}/confirm")` | `:110` | match |
| `PATCH /scan-and-mark/marking-scheme/{id}/confirm` | `:535-536` | `@router.patch("/marking-scheme/{marking_scheme_id}/confirm")` | `:118` | match |

**3 for 3, both directions — no called-but-missing, no declared-but-unused.** The HTTP contract is the healthiest part of this feature.

## Drift and risks — most severe first

1. **The entire pipeline is unreachable.** `ScanAllDraftsButton` has no importer. Everything above about phases 2-3 describes code that never runs. Latent until wired.
2. **A `class` upload corrupts onetime state.** `hasMarkingScheme` read outside the switch (`submissionlist_component.tsx:53`) + no early return ⇒ a class upload confirms the **onetime** marking scheme to `ocr`, and POSTs empty entries. Silent cross-variant contamination, not merely a missing feature. Currently masked by Risk 1 and the absence of a class route.
3. **Failures are swallowed.** `submissionlist_component.tsx:133-135` — a bare `catch {}` with a comment. A submission whose PUT fails is stranded in `uploading` **forever: no error state, no retry, no user signal.** The `Promise.all` (`:123`) cannot reject, so `setUploadError` never fires for a per-submission failure. **No machine has a failed state.**
4. **A stale docstring and function name assert a transition the backend deliberately removed.** `set_frontend_and_backend_status_of_homework_and_hwsubmission_to_ocr` (`scanAndMarkHelpers.ts:13`) and its docstring (`:7-11`, "sets the submission **and its homework** status to 'ocr'") both claim a homework transition. The backend explicitly refuses it (`scan_and_mark_service.py:120-122,130`). Deliberate on the BE side as of `ee6bedc`; the FE never caught up. The name and comment are now false — actively misleading.
5. **Discarded responses.** `scanAndMarkHelpers.ts:19,36` `await` the confirm calls and throw the returned status away, then hardcode `'ocr'` (`:22,39`). The BE returns `{submission_id, homework_id, homework_status}` (`service.py:144-148`) and `{marking_scheme_id, status}` (`:164`) — all unread. The FE **asserts** a status rather than reading the reported one, so the two cannot visibly diverge and a backend change would go unnoticed.
6. **Key-casing split.** Group keys are snake_case (`check_scan`, `mark_ai` — `statusGroups_slice.ts:15,16`); `statusColors.ts` keys are camelCase (`checkScan`, `markAi` — `:12,13`), plus a color-only `disabled` (`:15`) matching no group. Two near-identical sets that must be edited in tandem; **nothing enforces it.**
7. **Orphan status `''`.** The marking scheme's initial/reset `status_frontend` (`homeworkCriteria_OnetimeUpload_slice.ts:21,48`) is in no group's `subStatuses` — `groupForStatus('')` → `null` → `disabled` color, no chip. An orphan by construction. Otherwise **group coverage is clean**: every non-empty literal is in `draft.subStatuses`.
8. **FE and BE do not share a start state.** FE starts a submission at `prepare_upload`; BE creates the row at `uploading` (`service.py:79`). Not a bug today (the FE value is never sent), but the vocabularies are misaligned.
9. **`ClassCriteria` accepts anything.** Its `pass` body (`pydantic_model:27-28`) means `ClassCriteria(**raw_criteria)` never validates and never fails — silent acceptance of any payload.
10. **`StatusGroupKey` is a dead export** (`statusColors.ts:18`).
11. **All five machines remain untyped `string`.** No union type anywhere; typos are unguarded at compile time.

## Scope drift

Where this agent's own baselines no longer match reality. **Per rule 6 I must not edit `.claude/agents/scan-and-mark-monitor.md` myself — naming the changes for a human.**

**The baselines are substantively accurate.** Every status literal, every phase state, every stub location and every subtle mechanism the definition predicted was confirmed against source. Two corrections:

1. **`src/ocrs/` is mischaracterised.** Definition line 45 reads "*`src/ocrs/` existed as a directory but nothing imported it*", which — sitting beside line 43's "*`src/ai_agents/` is empty files*" — invites the reading that `src/ocrs/` is likewise empty. **It is not.** It contains ~28 KB of complete OCR implementations (`BestOCR.py` + `models/{GoogleCloudVisionAPI,PyTesseract,EasyOCR}.py`). The **tripwire itself is correct** and still fires negative; only the prose misleads.
   **Change (line 45):** say "*`src/ocrs/` contains standalone OCR implementations (`BestOCR.py` + `models/`) that **nothing imports***". Phase 3 should read as **unwired**, not **unwritten** — the distinction materially changes the remaining-work estimate.

2. **RESOLVED — the "doc exists but no marker" gap.** The previous run flagged this; the definition has since gained an explicit no-marker branch (line 71) and the marker it wrote was read cleanly this run. **The chain works.** No further change needed.

3. **The no-op instruction contradicts the doc it produces (line 89).** "Rewrite the doc unchanged except the marker's `run=` date" — followed literally, this run would have left the header asserting *"First run — no baseline"* and the Since-last-run section explaining *"No marker → no diff attempted"*, both **now false**. A no-op in the code is not a no-op in the doc: the run-type row, the since-last-run section and the `as of <sha>` tags all must change. I deviated and rewrote them.
   **Change (line 89):** say "rewrite the doc with findings carried forward unchanged; the marker, the run-type row and the Since-last-run section must still be updated to describe *this* run."

4. **The marker cannot distinguish a no-op run from a run that never happened (lines 64, 159).** Its only volatile field is `run=<date>`, and on a same-day no-op **every field is byte-identical** — this run rewrote the exact marker it read (`fe_sha=7d9f441 be_sha=ee6bedc run=2026-07-17`). Nothing in the doc proves the run occurred. Two no-ops a week apart are distinguishable only by date; two the same day, not at all.
   **Change (lines 64, 159):** add a monotonic `runs=<n>` counter (or a timestamp, not a bare date) to the marker, so the chain records that a run happened even when its findings do not move.

5. **`git log <sha>..HEAD` being empty is treated as proof of no change; it is not, on its own (lines 77-78, 89).** The range is path-filtered to the feature paths, so commits landing **outside** them return empty here while still breaking the feature — rule 1 itself warns that "a status can break because a file the diff never touched stopped importing it", yet the no-op test inherits the same blind spot. It cost nothing this run (`HEAD` *is* the marker SHA, so no commit landed anywhere), but the method only escapes it by luck.
   **Change:** have the no-op test compare `git rev-parse --short HEAD` against the marker SHA — an unfiltered, exact check — and use the path-filtered log only to *describe* what landed. Empty-log-plus-moved-HEAD is a different case and should force a wider look.

**Nothing else is stale.** No new status, no renamed slice, no phase came alive, no machine disappeared.

## Open questions — source cannot answer

1. **The permitted values of every backend status — permanently unanswerable from this repo.** `master_homework_status`, `master_homework_submssion_status`, `master_marking_scheme` (and `master_homework_homework_type`) are **database rows**. Everything reported for machines 3-5 is only *what the service writes* and is **not a complete set**. A failing status write should be investigated as a **missing master row first** — the FK rejects it before the code is at fault.
2. **Whether `ocr` is even a legal master row**, i.e. whether `confirm_submission_upload` would FK-fail at runtime. Unknowable from source and untestable while `ScanAllDraftsButton` has no importer — **this code has likely never executed.**
3. **Whether phase 3 is meant to call `src/ocrs/` in-process or via an external OCR service.** `BestOCR.py` implies in-process; the definition's phrase "sent to the OCR endpoint" implies a service. Nothing in either repo settles it.
4. **Whether dropping the homework phase marker (`ee6bedc`) is final**, or whether `master_homework_status` is expected to carry values again. If final, that table has exactly one reachable row and the FE helper name/docstring (Risk 4) should be corrected.
5. **Which sub-statuses `check_scan` / `mark_ai` / `completed` are waiting on** — backend statuses that don't exist yet, or FE sub-statuses not yet written? Nothing in either repo indicates the intended names.
6. **Is `homework_submission_class` intended for the scan-and-mark flow at all**, or does it belong solely to the `class` module (`class_service.py:410` is its only reference, and it is a read)?
7. **Is `homeworkCriteria_Class_slice.ts` having no `status_frontend` deliberate**, or just not reached yet?
