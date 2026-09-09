<!-- Kit-managed by ai-workflow-scaffold. Do not hand-edit: upgrades overwrite this file. Repo-specific content belongs in verify-then-converge-playbook.md. -->

# Verify-then-converge — the doctrine core

## 1. What this file is, and the thesis

This is the **kit-managed doctrine core** of the verify-then-converge AI code-review loop. It
ships identically into every repo `ai-workflow-scaffold` installs, across every stack the org
runs. `ai-workflow-scaffold` owns this file's lifecycle — **do not hand-edit it**; an upgrade
overwrites local edits. Repo-specific material — native finding taxonomies, gate commands,
incident logs, reviewer-consent policy — belongs in the sibling, repo-owned
`verify-then-converge-playbook.md` shipped alongside this file, which an upgrade never touches.
Section 10 draws that line precisely.

This core is deliberately **stack-agnostic**: no compiler, no package manager, no test runner,
no language named. Where a detail is genuinely tool-specific (a CLI reviewer's exit-status
handling, a PR-hosting platform's API shape), it is marked as an adapter and kept concrete only
where the concreteness is load-bearing.

**Thesis.** An AI code reviewer is a **hypothesis generator, not an oracle**. Every finding is a
claim about your code, and a claim becomes evidence only once checked against ground truth: the
code at HEAD, the tests, the ADRs and specs, the wire contract, the live system. Reviewers have
been caught confidently wrong — line numbers and prescribed fixes attached — at rates as high as
half a batch in one field run; blind application would have broken a deliberate design, added
dead-weight infrastructure, silently no-op'd an already-applied change, and truncated a data
backfill. The skill here is not "fix what the reviewer says," it is **adjudicating** what the
reviewer says. The reviewer raises; you are judge and jury; the code, tests, and contracts are
the evidence.

**The recall boundary.** Do not lead with "the reviewer supplies recall, you supply precision"
— that framing is falsified by this doctrine's worst misses. The headline bugs in the corpus
this core distills were never things a reviewer flagged wrongly; they were things it **never
saw at all** — a mocked integration boundary that never touched the real wire format, a relaxed
gate whose downstream consumer silently broke, a rendering/z-order bug visible only by driving
the app, a dependency's own internal behavior. Each was caught by live-driving, adversarial
self-review, a compiler/typechecker, or an independently-scoped sweep — never the review pass.
State the boundary precisely:

> A reviewer's recall is trustworthy **only inside the diff-visible, mock-free,
> single-subsystem, statically-analyzable slice.** Inside it you supply *precision* — which
> raised claims are real. **Outside** it — across a mock boundary, across subsystems at
> runtime, into a dependency's internals, into visual/focus/z-order behavior, into any category
> the reviewer never raises — you supply **both recall and precision**, through front-loading
> and live-smoke checks (section 5), never through the review pass alone.

Nobody measures a reviewer's false negatives; every published metric is precision on findings
raised. Consequence: **a clean review pass certifies nothing about categories it never
touched.** Its defensible return is precision-management of its own output; the loop's real
protection against shipped bugs is the front-load and live-smoke layers. Never let "review
clean" stand in for "bug-free" — conflating them is the single most expensive habit this
doctrine exists to break.

---

## 2. The primitive

Every loop this doctrine covers — code review included — is one primitive with a different
claim-generator:

> **Generate claims → give each a structured verdict against an authoritative source → record
> the evidence → converge on "only justified residue."**

Naming the primitive makes the discipline portable everywhere an unverified claim drives an
action:

- **A "gate is green" claim** — a build/lint/test success is a claim about your tree, not a
  fact, until confirmed it ran against the code you think it did.
- **A subagent's "all clean"** — a completion claim from a *scoped* delegate is exactly what an
  unscoped, independent sweep catches missing instances of.
- **A watcher's `exit 0`** — proves the *monitor* completed, not that the watched thing
  succeeded; a piped command's exit status is often the pipe's last stage, not the thing you
  meant to check.
- **A remembered fact** — a `file:line` assertion carried in memory or old notes is a claim
  against *current* code, and code drifts out from under memory.
- **The issue or spec being implemented is itself a hypothesis.** Verification can refute the
  *requirements*, not only the implementation — an adversarial pass can discover the ticket's
  own prescribed formula or acceptance criterion is wrong. When that happens, don't silently
  comply with a broken spec: **ship the correct behavior and flag the deviation at the top of
  the PR**, not buried in a ledger row.

Treat every one the same way: `assert <claim>`, then find the evidence. Action falls out of the
evidence gathered, never out of deference to — or reflexive dismissal of — the source.

---

## 3. The invariant loop

1. **Commit first, on a stable SHA — under the user's explicit ask.** The loop runs on the
   user's request, and that ask (invoking the loop, or asking to attend review comments) is
   what covers its work and per-pass commits under the repo's do-not-commit-unasked rule;
   absent it, run read-only: record each pass without committing, **with the same shape and
   evidence contract as a committed pass** — the base SHA plus the **identity of the exact
   content reviewed**: the head SHA for committed work, or for uncommitted work (the normal
   read-only case) a **content fingerprint that covers tracked, staged, unstaged, AND
   untracked files, without writing anything into the repository's object database** — a
   plain `git add -A` writes blobs (untracked secrets included) into `.git/objects` even
   under a throwaway index, so isolate the object directory too and clean up, in a subshell
   that leaves the caller's environment untouched:

   ```bash
   ( export GIT_INDEX_FILE="$(mktemp)" GIT_OBJECT_DIRECTORY="$(mktemp -d)"
     git add -A >/dev/null && git write-tree
     rm -rf "$GIT_OBJECT_DIRECTORY" "$GIT_INDEX_FILE" )
   ```

   (`git stash create` and `git diff` both omit untracked files, so neither identifies the
   full reviewed content) — plus the worktree status; then the full verdict
   tally and one evidence line per non-Apply verdict. HEAD alone cannot identify staged,
   unstaged, or untracked edits, and a record that doesn't pin its content lets a later
   pass reuse the same SHAs for different code. A count without checkable evidence is not
   a record. It lives **in a durable place the next pass will
   consult**: the PR's verdict ledger when a PR exists, else the run's closing handoff
   message. The scope gate below consumes these records alongside committed passes; a
   read-only pass recorded nowhere durable — or without its range anchors — forces the next
   pass to re-adjudicate blind. Small, scoped, signed where the repo signs. Stage
   **explicit paths only** — never a blanket add; a worktree or scratch directory can hold
   unrelated work a blanket add sweeps in. **Every writing git command asserts both branch and
   directory in the same invocation** — chained
   (`cd <dir> && [ "$(git branch --show-current)" = "<expected>" ] && git commit …`), never
   sequenced. A failed `cd` on its own line leaves the next command running wherever the shell
   sits — this has landed a commit in the wrong repository and pushed it. **Warm signing and
   push credentials before starting**, not at the first commit — a passphrase prompt fired only
   when needed fires after the human has walked away; provoke it once, up front.

2. **Preconditions — gate before spending anything.**
   - **Consent is not optional or a silent default.** An external reviewer sends your diff to a
     third-party service and burns paid quota — the human owns that call. **Standing consent** =
     reviewer config committed on the repo's **base** branch, or the reviewer's bot/app
     demonstrably reviewing every PR already. Absent either, ask once and record the answer.
   - **Consent and reviewer *activation* are orthogonal.** A config file can exist while the
     reviewer is effectively off — a partial config (only path-level overrides, no auto-review
     flag) can silently disable review on any non-default-branch target. Read the config; don't
     just check it exists.
   - **Secrets-scan the payload the reviewer actually receives**, not your mental model of the
     diff — prefer the repo's own scanner, fall back to a grep. Never trust a plain-exclude
     pathspec without verifying the excluded path is actually absent from staged — an exclude
     pathspec has silently included the very file it named, nearly shipping a live credential.
   - **Scope to the unreviewed range.** Find the last review-pass commit (a trailer or a
     recognizable subject) — and check for **recorded read-only passes**, which leave no
     commit: in the PR's verdict ledger, or in a run without a PR, the most recent closing
     handoff. Each read-only record carries its reviewed range (step 1), so the gate scopes
     from the newest reviewed head across both kinds — commit trailer or record alike. A whole-branch re-review
     re-litigates untouched code, drowns real findings in noise, burns quota for nothing.

3. **Adjudicate every finding — the heart of the loop.** Read the flagged lines, then the
   authoritative source the claim is about. Prefer *executing something* — the query, the
   seeded test, `git show <base-sha>:path` — over reading harder; the execution transcript **is**
   the evidence. Five verdicts:
   - **Apply** — verified valid, prescribed fix correct; apply it, minimally.
   - **Modify** — diagnosis right, fix wrong/incomplete/over-broad; fix what the evidence
     supports, say why the applied form changed.
   - **Skip** — invalid, already addressed, out of scope, or costs more than the risk it
     retires — with a checkable, file:line-grounded reason. A skip without evidence is
     indistinguishable from a miss.
   - **Refute** — the underlying *claim* (not just the fix) is demonstrated false against ground
     truth. Different from Skip: a Skip carries a real finding declined; a Refute means the
     claim itself doesn't hold. Refutations are reviewer-calibration data — a reviewer
     repeatedly wrong about one class is telling you about its blind spots.
   - **Escalate** — narrow, rare by design: the *technically correct* fix contradicts a
     canonical spec, an ADR, or an explicit product decision. Don't self-adjudicate a reversal
     of a decision made on purpose — raise options and consequences, record the human's choice.
     "The fix changes behavior" is ordinary Apply/Modify, not Escalate. **Escalate the
     *verified* decision, not the raw question** — confirm the finding, measure real scope, cost
     each option, name what future fact would change the answer. Verifying first has turned
     "hypothetical exposure" into a precisely-scoped, already-costed decision resolved in one
     pass.
   Never batch-accept or batch-reject; severity orders attention, it is not a verdict —
   re-derive it yourself once you have evidence.

4. **Fix the class, not the instance — prove the class is closed.** When a finding names one
   site and your diff owns siblings with the identical defect, fix every sibling in the same
   commit and say so. Before declaring a class closed, **enumerate all its sites across all
   paths** — a fix on one code path and not its mirror is exactly the gap a reviewer finds next
   round, where it reads as a regression instead of an incomplete sweep.

5. **Validate honestly.** A clean build, not an incremental one, on any compiled/type-checked
   stack — **an incremental build silently hides new diagnostics** a clean one would surface.
   Every behavioral-bug fix ships a regression test that **fails on revert** — and a
   revert-test only counts once you've confirmed the revert actually happened; a revert script
   that dies silently leaves the tree unchanged, and the next run prints the same green it
   would print without the fix, which looks like proof and is not. **The apply path gets the
   same gate as everything else** — a "trivial" fix can still fail to build or shift behavior.

6. **Commit per pass** (covered by the same ask that started the loop — see step 1; in
   read-only mode, record the pass instead). One commit per pass; the subject carries the
   full verdict tally — fixed (counting modified applies), skipped, refuted, escalated —
   so history stays greppable; the body carries one evidence line for **every non-Apply
   verdict** (skip, refute, escalate: the decision and who made it), or links the PR's
   complete verdict ledger where one exists. A
   zero-fix pass is still recorded — an **empty commit** with the verified-false adjudication in
   its body. **Amend freely while unpushed, but amend only the message, never the code** — a
   code fix always belongs in its own pass commit. After push, correct the record in the next
   pass's body. **On a squash-merge flow the per-pass trail is destroyed at merge time** —
   mirror the ledger into the PR description before the squash, or it evaporates.

7. **Converge by finding class, never by count.** See section 6.

---

## 4. The adjudication catalog

Named heuristics distilled from the corpus. Each: *what the finding looks like → how to verify
it → the trap.* These recur across reviewers and stacks — treat them as the base layer your
repo's own playbook extends with native entries.

- **A cited guideline is a pointer, not a verdict.** Confirm the rule actually holds here
  **and** the fix doesn't break a different invariant the rule-citer didn't see. Refute
  policy-shaped findings with the repo's own authoritative documents; refute factual claims with
  an executed check, never memory. A well-evidenced refutation is often enough to converge the
  reviewer on its own.
- **The inversion check.** On any "X contradicts Y" finding, never fix X to match Y until the
  code/runtime says which side is authoritative — the reviewer detects the *inconsistency*
  reliably but picks a *direction* close to arbitrarily. **Extension:** when a reviewer
  attributes a requirement to the wrong document, check whether some *other* document actually
  says it — misattribution is often the shadow of a real internal contradiction, not a
  hallucination. A Refute of the misattribution can be correct and still leave a fix owed to the
  contradicting document.
- **Never harden beyond what the finding asks.** Rejecting a wrong prescription and adding your
  own extra guard "as a gift" is how a real deploy broke on real data — every guard beyond scope
  is a new rule that can collide with an untested input. Ask whether the constraint belongs to
  *this* system's invariant or is just a generic instinct.
- **Verify against the complete contract, not the flagged file.** Trace who produces the value,
  who normalizes it, what the deployed environment injects — a syntactically correct
  "hardening" fix has broken startup because a downstream layer, not the flagged line, owned
  normalization.
- **Dedup across rounds against everything *seen*, not everything *applied*.** A skipped finding
  reappears reworded later; recognize it by target and substance, point at the prior verdict.
- **The oscillation brake.** If round N+1 flags the exact fix from round N, stop patching and
  re-derive both positions from ground truth — one of the two rounds is simply wrong.
- **Finding-class symmetry.** One heuristic fired many times over near-identical lines collapses
  to **one** class-level decision; a gnarly edge case you hand-fix yourself gets grepped for
  siblings before the reviewer's next pass does it for you.
- **"Cosmetic", "out-of-scope", and "pre-existing" are the three most dangerous skip words** —
  the cheap outcomes, and cheap outcomes hide real bugs (a "cosmetic" display glitch was
  reversed within hours by a user hitting it). For the first two, ask *would a user ever see
  this and care?* — absent evidence, mark the ledger `UNVERIFIED against real usage`. For
  "pre-existing," apply the test: **did this change materially touch the code hosting the
  finding?** If yes, pre-existence is no defense — a skip invoked over a lifecycle this same
  change rewrote deserves the fix, not the pass.
- **A skip argued from today's data is a snapshot, not an invariant — and this covers what you
  write, not just decline.** "Today there's only one tenant" describes current rows, not a
  guarantee, and a data change silently invalidates it — this pattern has resurfaced as a
  Critical once "today" stopped being true. Mark such skips `PROVISIONAL — depends on current
  data`, naming which change would invalidate them; the same marker belongs on a fix or doc edit
  that bakes today's state into a durable artifact.
- **A skip that defers to another issue must name an issue that exists — filing it is part of
  the skip.** "Later" is how "an issue owns this" degenerates into "nobody owns this." For a
  legitimate finding not fixed now, close with a linked issue that preserves what verification
  learned, not a reply saying "noted." Position every deferral in time: **before the next round**
  or **outside this change** — unpositioned deferrals drift to the end by default.
- **Validate a reviewer's prescribed *form* against the repo's own lint config before applying
  it.** A suggested fix and its obvious alternative have both turned out to be lint errors in
  the target repo, wasting two cycles before the answer was the repo's own neighboring idiom.
  Look for the adjacent pattern first.
- **A spec or planning artifact under review is its own surface, with its own adjudication
  axis.** A reviewer produces *requirements-level* findings against specs too — the question
  shifts from "is this a bug" to **"is this implementable, and does it preserve the artifact's
  purpose?"** A blanket "sanitize everything" suggestion against a diagnostics log meant to stay
  readable is the shape of this trap — Modify means keeping the implementable core and
  discarding the part that guts the artifact.
- **Never quote a PII or secret literal into a planning artifact, even while describing the
  smell.** A design note reproducing a real identifier "to show the problem" becomes the leak it
  describes, and the doc **outlives** the code fix that removes it from source. Describe it in
  words; never reproduce it.
- **If your fix breaks an existing test, update the harness to the new reality — never weaken
  the assertion.** The moment a fixture needs a new field is exactly the moment the temptation
  is to relax the check instead — giving in is how a regression test stops testing anything.

---

## 5. The two review layers

Two review layers exist and are **orthogonal** — never conflate them.

The external reviewer has **imperfect precision** (noise to adjudicate) and **bounded,
unmeasured recall** (only the diff-visible, mock-free, single-subsystem slice — section 1). Two
mechanisms address the two weaknesses:

- **Verifier fan-out, AFTER the reviewer, raises precision** — independent re-verification of
  its own findings, discarding noise with evidence, is what turns raw findings into actionable
  ones.
- **Adversarial front-loading, BEFORE/alongside, raises recall** — it audits what a diff-scoped
  reviewer structurally cannot see. Keep roles **asymmetric**, never the same reviewer twice: a
  *finder* raises falsifiable claims against concrete axes drawn from the repo's own constraints
  (a generic "find bugs" mandate yields little); an *author-verifier* reproduces or refutes each
  claim against the strongest source; a *skeptic*, defaulting every claim to **REFUTED**, tests
  both the finding and its fix. **The skeptic must execute at least one probe per refutable
  claim, or say why it couldn't** — a read-only skeptic confirms claims a single execution would
  refute. When independently-assigned asymmetric reviewers converge on the same finding without
  coordinating, that convergence **upgrades the finding's confidence class** — the verification
  step may be proportionally lighter, but it is never waived: reviewer agreement raises
  confidence in the *claim*, only reading the current code proves it still holds there. Verify
  the flagged lines at HEAD before applying, however many reviewers agree.

**The structural blind spot both layers share.** A file your change did **not** touch, whose
behavior changed because of something upstream (a new field, a relaxed gate, a default that
resolves differently), is invisible to any diff-scoped reviewer by definition — no amount of
in-diff front-loading catches it. The mitigation: **audit by subsystem, not by diff** — when you
loosen a gate or invariant, grep every downstream consumer of the guarantee it used to provide.
Only exercising the running system finds this class, which is why real-device or live-driving
front-loads are the single strongest form available, ahead of any static or in-house pass.

**The rigor gate — scale the machinery to blast radius.** A small, single-subsystem fix earns
the light flow: reviewer plus verification, no front-load. Anything cross-cutting, touching a
public contract, spanning tenants/auth boundaries, or safety-critical earns the full adversarial
front-load before the first commit. One loop, one gate, chosen per change — and the repo's own
playbook (section 10) should **declare its front-load-mandatory subsystems** up front rather
than re-deriving the call under time pressure.

---

## 6. Convergence doctrine

**Judge convergence by finding *class*, never by count.** A rising or falling raw number means
little on its own — a pass going from a handful of findings to a dozen and back can be entirely
healthy if the middle round was the reviewer's first deep read of a genuinely new subsystem. The
count that matters: **does the next pass report zero new *behavioral* bugs in the code the
previous pass touched?** Only a *regression-of-fix* — a new pass flagging something the previous
pass's own fix broke — means the loop is actually failing.

Two shapes of convergence, both legitimate "done" signals — misreading either as divergence
causes both early stops and pointless zero-chasing:

- **By repetition** — rounds shrink while re-raising the same, already-adjudicated declines;
  converged when a round produces no *new* correctness findings, only known declines
  re-surfacing.
- **By layers** — each round uncovers exactly one deeper, narrower finding than the last;
  converged when the scope of what a new round can find has shrunk to nothing.

**Never chase zero.** Re-running after every trivial fix mostly produces churn, over-fits your
changes to the reviewer's own heuristics, and burns quota. Stop when a round yields only
informational items or evidence-backed skips already adjudicated.

**The confirming pass audits your *previous pass*, not the reviewer.** This is the most
consistently confirmed finding across the corpus — across five or more separate,
independently-run loops, the pass that mattered most caught an error the *previous pass itself
introduced*, not one in the original implementation. The apply commit you just made is unreviewed
code written under momentum; treat it with the suspicion you'd give a stranger's diff. Before
declaring convergence, re-read your own diff since the last pass: did every edit you believed
you made actually land (a scripted edit can silently no-op)? Does every new test fail if you
revert the thing it guards? Is every claim in a comment, commit body, or skip rationale still
true — including claims written *while removing* someone else's?

**Run exactly one confirming pass after a substantive one, then stop.** A pass that only
re-runs the reviewer skips the half of the discipline most likely to be wrong. Let a hosted
PR-bot round, where one exists, serve as that confirming pass for free — it re-reads the whole
range and, unlike a stateless CLI re-run, often remembers which threads you already resolved.

**Never self-merge, and never commit again after the reviewer's clean/approved result.** A
commit pushed after approval invalidates the review that produced it and restarts an infinite
confirmation cycle. A genuinely new fix needed after approval is a new pass with its own review
round, not a quiet addendum under an already-spent approval.

---

## 7. The PR-bot round

Where the loop runs against a hosted pull request with an automated reviewer attached, the round
has its own discipline, independent of which reviewer engine is behind it. Concrete mechanics
below assume a GitHub-shaped PR/API surface (`gh`, GraphQL) as the common substrate — the
underlying rule is the portable part; field/command names are the illustration.

**Reviewer liveness comes first — presence is not activity.** Classify the state before
trusting it: **present** (real reviews — walkthrough, comments, approval); **present-but-
skipping** (exists and responds, but every recent round reports something like "review skipped"
for a config reason); or **absent**. "Review skipped" is a **terminal state with a diagnosis**,
not noise — compare the repo's default branch against the PR's base and the reviewer's own
config to find the reason. **A broken reviewer is fixed by a prerequisite config change merged
to the *base* branch first** — the reviewer reads its config from base, so a feature-branch-only
fix never takes effect. Record the required merge order wherever the run's evidence lives.

**Watcher rules, precisely, because the naive version lies:**

- Gate on a review's own `submitted_at` being **newer than your last push** — never review
  *count* (many review objects per round) and never a summary comment's *body text* (it mutates
  in place through processing → skipped → findings, and matching its content has false-fired
  mid-round).
- Read CI through the platform's portable rollup field (e.g. `statusCheckRollup`), not a named
  check — check names change.
- If piping a timestamp into a query-language expression via CLI (e.g. `gh api --jq`), **inline
  the literal value rather than a named parameter** — `gh api --jq` does not forward `jq`'s own
  `--arg`, so a comparison built on it silently compares against empty and never fires.
- **Bound the watcher.** An expired watcher is itself a signal — rate limiting, a draft PR, a
  missing install, or a config-driven skip are all more likely than "still working."

**A round's working set is "new findings since your push" UNION "old threads still
unresolved"** — never just the former. A thread from well before your last push can sit alone
holding the PR's blocking status while every date-scoped fetch excludes it.

**Adjudicated, communicated, and resolved are three separate rungs — climb all three.** A
verdict living only in a commit trailer moves the PR zero millimeters, because reviewers can't
see trailers; because a trailered verdict *looks* like closure it's easy to never return to (one
field audit found most of a PR's unresolved threads had already been fixed and simply never
answered — replying resolved almost all on the spot). So: **reply to every thread individually
with the fixing commit and deciding file:line** — for Modify/Skip, the reply is the evidence.
In-thread replies are typically what resolves a thread and let the reviewer convert an accepted
rationale into a persistent learning; a summary comment resolves nothing on its own. Publishing
is a human act unless a run explicitly delegates it — when delegated, every agent-posted reply
carries an attribution line by default. Responding is not resolved: a thread only goes outdated
once a commit changes its lines — verify real thread state before closing a round, never assume.

**A refutation's citation must resolve, not merely exist somewhere plausible.** The highest-risk
moment for a bad citation is the refutation itself, because the citation *is* the argument for
overriding the reviewer — a refutation citing a path that doesn't exist (right text, wrong file)
has nearly shipped. When a reviewer attributes a requirement to the wrong document, check
whether some *other* document actually says it (the inversion-check extension, section 4).

**Read the review bodies, not only inline threads.** Findings outside the diff's visible range,
and overflow when inline posting fails, live only in a review's body text — a real finding can
hide there a whole round.

**Know the platform's approval mechanics.** A review-decision field typically stays
`CHANGES_REQUESTED` while even one thread is unresolved, and flips to automatic approval on its
own at zero — read open-thread count directly, never assume the reviewer won't approve. A
separate **mergeability field** (e.g. `mergeStateStatus`) is the one that says whether anything
actually blocks — a stale `CHANGES_REQUESTED` from an already-attended round can coexist with a
clean mergeability field; chasing the former is chasing a state that no longer constrains
anything. Never declare convergence if the PR merged before the review finished.

**API mechanics worth getting right the first time:** when only a small placeholder set
auto-substitutes (owner/repo/branch — e.g. `{owner}`/`{repo}`/`{branch}`), write those literally
— invented shorthand passes through unsubstituted and 404s in a way that reads as "wrong
resource," not "syntax mistake." A reply endpoint is frequently **plural** even for one comment
(e.g. `/pulls/{n}/comments/{id}/replies`) — the singular form commonly 404s.

---

## 8. The CLI reviewer adapter

Reviewers increasingly run as a local CLI, in addition to or instead of a hosted PR bot. The
doctrine below is generic, made concrete with CodeRabbit's CLI where a concrete example
clarifies the trap — treat each concrete detail as illustrative of a class, not a hardcoded
recipe.

**Run under a PTY, always.** A backgrounded or redirected, non-interactive run has exited
successfully with zero output and zero stored findings — indistinguishable from a genuinely
clean review unless you know to distrust it. Treat a suspiciously-empty result as a claim to
verify (section 2), not a fact to believe.

**Version instability is the default.** Flags rename across minor versions without warning.
**Preflight the tool's version string and resolve the actual flags from its own help output at
the start of every session** — never carry forward a command line without re-verifying. Any doc
(including this one) showing a flag without a version annotation should be treated as possibly
stale.

**The correct exit-status pattern — capture the status immediately, before any filtering.**

```bash
# script -q /dev/null is the portable PTY wrapper (see "Run under a PTY, always" above)
script -q /dev/null some-reviewer review --agent > raw-output.txt 2>&1
status=$?   # captured immediately after the run, before any post-processing
strip-ansi raw-output.txt > findings.txt
```

Piping the reviewer directly into a filter reports the **filter's** exit status, not the
reviewer's — the same trap as trusting a piped command's tail-stage exit code. Capture status
the instant the run completes, before any ANSI-stripping touches the stream.

**History recovery — the corrected form, and the trap it replaces.**

```bash
git log --regexp-ignore-case --extended-regexp \
  --grep='coderabbit|review pass|fixed.*skipped' <base>..HEAD
```

Use `--regexp-ignore-case` and `--extended-regexp` as their own flags, exactly as above. **Do
not write `--grep -iE '<pattern>'`** — broken: the version control tool consumes `-iE` itself as
the *search pattern*, not flags, so it silently matches nothing and reports empty history as if
no review ever happened. This exact broken form has independently shipped into multiple repo
playbooks before being caught; it appears here **only as the named trap**, never to paste.

**The hang / spinner-file trap.** A reviewer CLI can hang **indefinitely** in its own progress
indicator without emitting a detectable timeout event. Under a PTY-redirect pattern, the
spinner's redraw frames stream to the raw output file **unboundedly** while hung — observed
writing tens of gigabytes of escape-sequence noise before being caught. Guard: monitor the raw
file's growth; past roughly 50 MB with an ANSI-stripped tail showing no real content, treat it
as hung — kill the whole process tree, delete the file, retry once. **Two consecutive hangs**
means stop burning CLI rounds and fall back to a hosted PR-bot round as the review pass instead
— never treat a hang as "done," and never silently skip the review.

**Post-slice sanity is not optional.** After scoping to a subset (a directory slice, a
base-commit pin), confirm the output actually reports what it scoped to. **The absence of a
scope header is a failure, not a clean pass** — a silent fallback to reviewing everything (or
nothing) looks identical to a genuinely narrow clean result otherwise.

**Slice huge diffs by directory rather than accept a timeout.** Splitting a large diff into a
few directory-scoped slices turns an unreliable single pass into several reliable ones.

**A timeout on a small diff is usually transient — retry once** before concluding anything;
only a second consecutive timeout is a real signal (split, or fall back per the hang guidance).

---

## 9. Evidence and honesty

**Maintain a skip ledger, not just scattered commit-body mentions.** Wherever the change's
evidence lives for reviewers to see, record every **non-Apply** verdict — Modify, Skip, Refute,
Escalate, including out-of-scope. **"Received" and "adjudicated" are different units** — the
moment ten near-identical findings collapse into one class-level fix sweeping fifteen files,
declare both numbers ("10 findings → 1 class fix, swept 15 files") rather than reporting only
the collapsed one.

**Honesty rules, non-negotiable:**

- Never claim a test ran, or ran clean, when it didn't — paste real, unfiltered output.
- Report a failure as a failure, then fix it — never insert whatever substring a downstream
  check greps for.
- An undecided finding stays undecided; don't round it to a verdict not yet reached.
- **"Blocked, and here's why" is acceptable for any check you couldn't run — silence is not.**
  A check skipped without saying so is indistinguishable from one that passed.

**The levels-of-done ladder.**

```text
compiles → unit-green → review-clean → adversarial-clean → live-smoke-green → shipped
```

Each rung is a **distinct claim**; earlier rungs share a blind spot the later ones close.
**Author-review-clean is not reviewed-clean** — a change you reviewed yourself has not been
independently adversarially reviewed until something else has actually tried to break it. The
first several rungs also share a **mocked-I/O blind spot** — a build, a typecheck, even a large
green test suite can pass while every one mocks an external dependency that doesn't match what
it actually does on the wire. For any integration outside your own process, **one live call
against the real dependency is a required, non-deferrable gate**, not something "prod will tell
us" defers — run it against an **authorized sandbox or a documented read-only, no-charge
endpoint** — a test identity is an *additional* control on top of one of those, never a safe
target by itself (a test identity pointed at production can still write data, expose PII, or
incur charges). An automated loop must never do any of those to satisfy a gate. When no safe
target exists, record the check as **BLOCKED — with why**, *before* making any call; a
disclosed block is acceptable, an unauthorized live call is not. Classify a live-smoke failure **before** it becomes a finding: product / provider /
credential / TLS / **harness** — a harness-classified failure is fixed in the harness, never by
bending product code around it. Build the probe against what a real user or system actually
exercises, not a convenient synthetic shortcut — a check that doesn't walk the real path can
pass while the real path stays broken.

---

## 10. What belongs in your repo's playbook, not here

This core stays silent on anything that varies by repo. Your repo's own
`verify-then-converge-playbook.md` owns:

- **Native adjudication heuristics and incident history** — this file's catalog (section 4) is
  the base layer yours extends.
- **Per-stack finding taxonomy** — the patterns a reviewer reliably flags in this language and
  platform, and what you verify each time.
- **Reviewer configuration and consent policy** — including a policy-gated external reviewer
  where an in-house pass is the standing default.
- **Front-load-mandatory subsystems** — the specific areas the rigor gate (section 5) routes to
  the full flow by default, named explicitly.
- **Actual gate commands and their known blind spots** — what a clean run does and doesn't
  prove.
- **Commit and PR conventions** — branch naming, message shape, and where the evidence block
  and skip ledger live.
