# SPECIFICATION.md — LearnVault Product Specification

> This file defines what the product does, how each feature works, and the data models behind them.
> FRONTEND.md governs how things look. This file governs what they do.

---

## 1. Product Overview

**LearnVault** is a personal knowledge management app built for people preparing for high-stakes interviews (starting with Product Manager roles). It has three core modules:

| Module        | Purpose                                              |
|---------------|------------------------------------------------------|
| Answer Bank   | Store, rate, and refine answers to interview questions |
| Session Log   | Record interview sessions and extract lessons learned |
| Flashcards    | Review knowledge through active recall               |

**Core loop:**
```
Learn something → Capture it → Review it → Improve it → Walk in confident
```

---

## 2. Data Models

### 2.1 Entry (Answer Bank)

```ts
type Entry = {
  id:         string;          // uuid
  question:   string;          // the interview question
  answer:     string;          // user's drafted answer (freeform, supports newlines)
  tag:        string;          // domain label e.g. "Product Sense", "Metrics"
  confidence: 'weak' | 'ok' | 'strong';
  created_at: string;          // ISO date
  updated_at: string;          // ISO date
  review_count: number;        // how many times reviewed
  next_review:  string | null; // ISO date, for spaced repetition (V2)
}
```

**Confidence semantics:**
- `weak` — Answer is incomplete, incorrect, or you consistently blank on it
- `ok` — You can answer but lack structure or depth
- `strong` — You can answer fully, with structure, in under 2 minutes

### 2.2 Session Log — Application & Round

A company application contains one or more rounds. Each round captures a specific interaction with a specific stakeholder.

```ts
type Application = {
  id:      string;
  company: string;
  role:    string;
  applied: string;                              // ISO date
  overall: 'active' | 'pass' | 'fail' | 'pending'; // derived from rounds
  rounds:  Round[];
}

type Round = {
  id:               string;
  num:              number;          // auto-incremented (1, 2, 3…)
  type:             RoundType;       // see enum below
  date:             string;          // ISO date
  interviewer:      string;          // name of the person
  interviewer_role: string;          // their title/role e.g. "Hiring Manager"
  outcome:          'pass' | 'fail' | 'pending';
  went_wrong:       string;          // freetext
  lessons:          string;          // freetext — concrete next actions
  tags:             string[];        // topic areas
  questions_asked:  number[];        // Entry IDs from Answer Bank — resolved at render
}

type RoundType =
  | 'Recruiter Screen'
  | 'HM Interview'
  | 'Product Case'
  | 'Technical Screen'
  | 'Peer Interview'
  | 'Executive Round'
  | 'Take-Home'
  | 'Final Round'
  | 'Offer Call';
```

**`overall` derivation logic (auto-computed, not user-set):**
```
if any round is 'fail'       → overall = 'fail'
if all rounds are 'pass'     → overall = 'pass'
if rounds exist but mixed    → overall = 'pending'
if no rounds yet             → overall = 'active'
```

**`questions_asked` reference semantics:**
- Stores Entry `id` values, not copies of question text
- Resolved against the live Answer Bank at render time
- If an entry is deleted from the Answer Bank after being linked to a round, the round displays "Question removed from Answer Bank" — no orphan crash
- If an entry's question text is later edited, the round automatically shows the updated wording

### 2.3 Card (Flashcard)

```ts
type Card = {
  id:       string;
  deck:     string;            // deck name / topic area
  question: string;
  answer:   string;            // freeform, supports newlines
}

type Deck = {
  name:  string;
  cards: Card[];
}
```

### 2.4 Review Session (Flashcards in-progress)

```ts
type ReviewSession = {
  deck:      string;
  total:     number;
  current:   number;           // index of current card
  correct:   number;
  incorrect: number;
  done:      boolean;
}
```

---

## 3. Module Specifications

### 3.1 Answer Bank

> **State note:** `entries[]` is owned by the `App` component and passed down as props (`entries`, `setEntries`). This allows `SessionLog` to read the same list for the question picker without duplication.

#### 3.1.1 View — Entry List

- Shows all entries in a collapsible list, in insertion order (newest last)
- Each collapsed row shows: question text, domain tag, confidence dot
- While a card is in **edit mode**, clicking its header does nothing (collapse is blocked)
- Item count shown in section header

#### 3.1.2 Action — Add Entry

Triggered by "+ Add Q&A" button. Opens an inline form above the list:

| Field      | Type     | Required | Validation              |
|------------|----------|----------|-------------------------|
| question   | textarea | Yes      | Non-empty               |
| answer     | textarea | No       | —                       |
| tag        | text     | No       | Free text, max 40 chars |
| confidence | 3-toggle | Yes      | Default: `ok`           |

On save: entry appended to list, form resets and collapses.

#### 3.1.3 Action — Update Confidence (quick)

Inside an expanded card footer, user can tap Weak / Okay / Strong to update `confidence` in place without opening the edit form. No page reload.

#### 3.1.4 Action — Edit Entry

"Edit" button in expanded card footer. Replaces the answer body with an inline edit form pre-filled with all current values:

| Field      | Type     | Pre-filled | Notes                        |
|------------|----------|------------|------------------------------|
| question   | textarea | Yes        | Required, non-empty          |
| answer     | textarea | Yes        | —                            |
| tag        | text     | Yes        | —                            |
| confidence | 3-toggle | Yes        | Live-updates the header dot  |

**Behaviour rules:**
- Card header shows "Editing…" label and ✎ icon while in edit mode
- Confidence dot in the header reflects the in-progress edit form value (live preview)
- Only one card can be in edit mode at a time; opening a new add form cancels any active edit
- **Save Changes** commits all fields and returns to read view
- **Cancel** discards all changes and returns to read view
- Card border turns `var(--accent)` while editing (matches round edit pattern)

#### 3.1.5 Action — Delete Entry

"Delete" button in expanded card footer. Removes from list immediately.

> Note: Any rounds in Session Log that referenced this entry's ID will display "Question removed from Answer Bank" — no crash.

---

### 3.2 Session Log

Two-level hierarchy: **Application** (company) → **Rounds** (individual interviews).

#### 3.2.1 View — Application List

- Shows all applications, newest first
- Each Application card is **collapsed by default**, showing: company, role, round count, overall outcome badge
- Clicking the header **expands** the card to reveal the rounds timeline and controls
- Section header shows total applications + total rounds across all apps

#### 3.2.2 View — Expanded Application

Inside an open application card:

1. **Stats strip** — applied date, pass/fail/pending round counts
2. **Round timeline** — vertical timeline, one row per round, each with a colored dot and a round card
3. **Add Round bar** — at the bottom, shows next round number hint and "+ Add Round" button

#### 3.2.3 Action — Create Application

Triggered by "+ New Application" button. Opens inline form above the list:

| Field    | Type | Required | Notes                           |
|----------|------|----------|---------------------------------|
| company  | text | Yes      | Non-empty                       |
| role     | text | No       | e.g. "Product Manager, Fintech" |
| applied  | date | No       | Application date                |

On save: Application created with empty rounds[], card opens automatically.

#### 3.2.4 Action — Add Round

Triggered by "+ Add Round" inside an expanded application. Opens inline form:

| Field            | Type          | Required | Notes                                            |
|------------------|---------------|----------|--------------------------------------------------|
| type             | select        | Yes      | From ROUND_TYPES enum                            |
| date             | date          | No       |                                                  |
| interviewer      | text          | No       | Person's name                                    |
| interviewer_role | text          | No       | e.g. "Hiring Manager", "VP Product"              |
| outcome          | select        | Yes      | Pending / Passed / Failed (default Pending)      |
| went_wrong       | textarea      | No       | What felt weak                                   |
| lessons          | textarea      | No       | Concrete next actions                            |
| tags             | text          | No       | Comma-separated → `string[]`                     |
| questions_asked  | multi-select  | No       | Dropdown populated from Answer Bank entries      |

On save: Round appended to application's rounds[], `num` auto-set, `overall` recomputed.

#### 3.2.5 Action — Edit Round

"Edit" button in round card footer. Replaces the round card body with an inline edit form pre-filled with all current values — same fields as Add Round.

**Behaviour rules:**
- Round card border turns `var(--accent)`, timeline dot turns orange while editing
- Only one round can be in edit mode at a time; opening another edit or the Add Round form cancels the active edit
- **Save Changes** commits all fields, recomputes `overall`
- **Cancel** discards all changes

#### 3.2.6 Action — Update Round Outcome (quick)

Inline outcome buttons (Passed / Pending / Failed) in round card footer (read mode only). Updates round `outcome` and triggers `overall` recomputation. Does not open the edit form.

#### 3.2.7 Action — Delete Round

"Delete" in round card footer. Removes round, renumbers remaining rounds, recomputes `overall`.

#### 3.2.8 Action — Delete Application

"Delete App" in expanded application footer. Removes application and all its rounds.

#### 3.2.9 View — Questions Asked (round read view)

When a round has `questions_asked.length > 0`, a "Questions asked in this round" section renders below the went_wrong / lessons columns:

- Each entry rendered as a bulleted line: question text + domain tag
- If an entry ID no longer exists in the Answer Bank: shows "Question removed from Answer Bank" in muted italic
- Not shown when `questions_asked` is empty

#### 3.2.10 Question Picker (inside round form)

The "Questions Asked" field in the round form (add and edit):

- Renders a `<select>` dropdown listing all Answer Bank entries not yet added to this round
- Option label format: `[Tag] Question text…` (truncated at 72 chars)
- Selecting an option immediately adds it to the round's `questions_asked` list and resets the dropdown to default
- Selected questions appear as **chips** below the dropdown, each showing: question text, domain tag, × remove button
- If Answer Bank is empty: shows "No questions in your Answer Bank yet — add some there first." message instead of the dropdown
- When all bank entries are selected: dropdown shows "— All questions added —" disabled option

#### 3.2.11 Outcome Badge Colors

| Outcome     | Color           | Label       |
|-------------|-----------------|-------------|
| active      | `#5580CC` blue  | In Progress |
| pass        | `var(--green)`  | Passed      |
| fail        | `var(--stamp)`  | Failed      |
| pending     | `var(--yellow)` | Pending     |

#### 3.2.12 Timeline Dot Colors

| Round state   | Dot style                                    |
|---------------|----------------------------------------------|
| pass          | Filled `var(--green)`                        |
| fail          | Filled `var(--stamp)`                        |
| pending       | `var(--paper)` fill, `var(--yellow)` border  |
| editing       | Filled `var(--accent)` orange                |

---

### 3.3 Flashcards

#### 3.3.1 View — Deck Selector

- Dropdown at top, lists all available decks
- Changing deck resets session (index → 0, scores → 0)
- Progress bar below dropdown shows `current / total` completion

#### 3.3.2 View — Card Face (Front)

Shows:
- Eyebrow: "Question — [Deck Name]"
- Question text
- Hint: "click to reveal answer"
- Clicking anywhere on card flips it (3D Y-axis flip animation)

#### 3.3.3 View — Card Face (Back)

Shows:
- Eyebrow: "Answer"
- Answer text (pre-wrap, supports newlines)
- Clicking anywhere flips back to front

#### 3.3.4 Action — Grade Card

After flip, two buttons appear below the card:
- **✕ Missed it** — increments `incorrect`, advances to next card
- **✓ Got it** — increments `correct`, advances to next card

On advance: card flips back to front (200ms delay), then index increments.

#### 3.3.5 View — Score Screen

Shown when all cards in deck are graded. Displays:
- Score percentage `(correct / total * 100)%`
- Color: `var(--green)` if ≥70%, `var(--accent)` if <70%
- Tally: Correct / Missed / Total
- If `incorrect > 0`: prompt to add missed questions to Answer Bank
- "Study Again →" button resets session

#### 3.3.6 Action — Restart

"↺ Restart" button always visible in deck bar. Resets `idx`, `score`, `done` to initial state without changing deck.

---

## 4. Navigation

Three tabs only in MVP. Tab order is fixed:

```
[📋 Answer Bank]  [🗒️ Session Log]  [🃏 Flashcards]
```

- Active tab indicated by inverted colors (`--ink` bg, `--bg` text)
- No nested navigation in MVP
- No back button — all content is flat

---

## 5. State Management

MVP uses **local React state only**. No backend, no persistence across sessions.

### State ownership

| State         | Owner component | Passed to            | Initialized from   | Persists?       |
|---------------|-----------------|----------------------|--------------------|-----------------|
| `bankEntries` | `App`           | `AnswerBank`, `SessionLog` | `INIT_QNA`   | Session only    |
| `apps`        | `SessionLog`    | —                    | `INIT_APPS`        | Session only    |
| `decks`       | `Flashcards`    | —                    | `DECKS` (static)   | Always (static) |
| review state  | `Flashcards`    | —                    | Component state    | Session only    |

### Why `bankEntries` is lifted to `App`

`SessionLog` needs read access to Answer Bank entries to power the question picker inside round forms. Rather than duplicating state or adding a global store, `bankEntries` and `setBankEntries` are owned by `App` and passed as props:

```
App
├── AnswerBank  ← receives { entries: bankEntries, setEntries: setBankEntries }
├── SessionLog  ← receives { bankEntries }   (read-only)
└── Flashcards  ← no bankEntries needed
```

### Mutation rules

- Only `AnswerBank` (via `setEntries`) may write to `bankEntries`
- `SessionLog` reads `bankEntries` but never mutates it
- Round `questions_asked` arrays store Entry IDs — they are never updated when entries change; resolution happens at render time

**V2:** Replace `useState` with `localStorage` or `IndexedDB`. The data models are already shaped for serialisation — no structural changes needed.

---

## 6. Content — Sample Data

### Answer Bank seeds (3 entries)
1. "How would you improve Spotify's discovery feature?" — Tag: Product Sense — Confidence: ok
2. "Daily active users dropped 10% WoW. Walk me through your diagnosis." — Tag: Metrics — Confidence: strong
3. "Tell me about a time you made a decision with incomplete data." — Tag: Behavioral — Confidence: weak

### Session Log seeds (2 applications, 3 rounds)
1. **Grab** / PM Fintech / overall: Failed — Round 1: Recruiter Screen → Pass; Round 2: Product Case → Failed (blanked on metric framework)
2. **Sea Limited** / APM Shopee / overall: Pending — Round 1: HM Interview → Pending (ran out of time)

### Flashcard decks (2 decks)
1. **Metrics Fundamentals** — 3 cards (DAU vs MAU, North Star Metric, retention vs acquisition)
2. **Product Sense** — 2 cards (CIRCLES framework, prioritisation)

---

## 7. Validation Rules

| Field            | Rule                                                        |
|------------------|-------------------------------------------------------------|
| question         | Required, non-empty after trim                              |
| answer           | Optional; empty answer saved and shown as "No answer yet." |
| company          | Required, non-empty after trim                              |
| round type       | Required; must be a value from ROUND_TYPES enum             |
| tag              | Optional, free text                                         |
| tags (round)     | Split on comma, trim whitespace, filter empty strings       |
| confidence       | Must be one of: `weak` / `ok` / `strong`                   |
| outcome          | Must be one of: `pass` / `fail` / `pending`                 |
| date             | Optional; no default injected if left blank                 |
| questions_asked  | Optional; array of valid Entry IDs; invalid/stale IDs render gracefully, not as errors |

---

## 8. Out of Scope for MVP

The following are explicitly deferred to V2/V3 and must **not** be built unless the spec is updated first:

- User authentication / accounts
- Data persistence (localStorage, DB)
- AI answer drafting
- Spaced repetition algorithm (SM-2)
- Search or filter across entries / rounds
- Export / share
- Readiness score / analytics dashboard
- Custom deck creation UI (decks are currently static constants)
- Mobile-specific gestures (swipe to flip card, swipe to delete, etc.)
- Undo / redo for delete actions
- Sorting or filtering the Answer Bank by confidence or tag
