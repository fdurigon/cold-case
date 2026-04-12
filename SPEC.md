# COLD CASE — Game Design & Architecture Specification
> Investigation game — Phaser.js + Browser | v0.1 | Author: Fred

---

## 1. Concept

A browser-based investigation game in which the player assumes the role of a detective tasked with solving disguised versions of real, famous criminal cases. Each case is fully playable as a standalone module. The true identity of the real-world crime is only revealed upon case resolution. Atmosphere is dark suspense, bordering on horror.

**Language:** All game UI, dialogs, and narrative text are in **PT-BR**. This spec and code comments remain in English.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Game engine | Phaser.js 3 (CDN) | Strongest Claude competence, rich 2D, browser-native |
| Language | JavaScript (ES Modules) | No build step needed for prototyping |
| Responsive | CSS viewport scaling + Phaser scale manager | Target: 390px–1440px |
| Data format | JSON (one file per case) | Easy to add cases without touching engine code |
| Persistence | localStorage | Save reputation + progress, zero backend |
| Version control | Git + GitHub | Mandatory from day one |
| Assets (images) | AI-generated pixel art (external tool) | Midjourney / DALL-E / Stable Diffusion |
| Audio (optional) | Howler.js | Ambient sound per location |

### 2.1 Canvas & Scaling

| Setting | Value |
|---|---|
| Base resolution | 960 × 540 px (16:9) |
| Phaser scale mode | `Phaser.Scale.FIT` |
| Auto-center | `Phaser.Scale.CENTER_BOTH` |
| Min width | 390 px (mobile portrait not supported — landscape only) |
| Max width | 1440 px |
| HiDPI fix | `render.resolution = fitScale × devicePixelRatio` |

All UI positioning uses the base resolution coordinate system (0–960 × 0–540). Phaser's scale manager handles the physical-to-logical mapping.

**HiDPI / Retina fix:** `render.resolution` is set to `fitScale × window.devicePixelRatio` at startup so the canvas buffer matches the physical pixel count exactly, eliminating blur on Retina displays. This is calculated once in `main.js` before the Phaser game is created.

---

## 3. Repository Structure

```
cold-case/
├── index.html
├── main.js                  # Phaser game config + scene registry
├── assets/
│   ├── ui/                  # Cover image, HUD elements
│   │   └── cover.png
│   ├── portraits/           # Suspect portrait images (one per suspect_id)
│   │   └── suspect_001.png  # e.g. Edmund Harrow — AI-generated photo portrait
│   ├── locations/           # Location background images (loc_001.png … loc_005.png)
│   └── tools/               # Tool icons (not yet implemented)
├── data/
│   └── cases/
│       └── case_001.json    # Full case definition
├── src/
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── MenuScene.js
│   │   ├── CaseSelectScene.js
│   │   ├── CaseBriefScene.js
│   │   ├── MapScene.js
│   │   ├── LocationScene.js
│   │   ├── EvidenceBoardScene.js
│   │   ├── SuspectsScene.js
│   │   ├── InterrogationScene.js
│   │   ├── AccusationScene.js
│   │   └── ResolutionScene.js
│   ├── systems/
│   │   ├── CaseManager.js   # Loads & manages active case state
│   │   ├── SaveManager.js   # localStorage read/write
│   │   ├── ReputationSystem.js
│   │   └── ToolSystem.js
│   └── ui/
│       ├── DialogBox.js     # Atmospheric text renderer
│       ├── HUD.js           # Persistent top/bottom bar
│       ├── PortraitArt.js   # Procedural portrait fallback (Graphics-based)
│       └── LocationArt.js   # Procedural location fallback
└── SPEC.md                  # This file
```

---

## 4. Data Structures

> **Note:** Runtime state fields (`visited`, `found`, `already_searched`) are NOT stored in the case JSON. They are managed by `CaseManager` at runtime and persisted via `SaveManager` in localStorage. The JSON files contain only static case definitions.

### 4.1 Case JSON

```json
{
  "id": "case_001",
  "codename": "The Whitechapel Shadow",
  "real_crime_name": "Jack the Ripper",
  "real_crime_year": "1888",
  "difficulty": 2,
  "locations": [ /* see 4.2 */ ],
  "suspects": [ /* see 4.3 — initial visible suspects */ ],
  "evidence": [ /* see 4.4 */ ],
  "solution": {
    "suspect_id": "suspect_003",
    "required_evidence": ["ev_005", "ev_008"],
    "reputation_base_reward": 100,
    "reveal_text": "This case was inspired by the real Jack the Ripper murders..."
  }
}
```

### 4.2 Location

```json
{
  "id": "loc_001",
  "name": "Butcher's Alley",
  "map_x": 12.5,   // percentage of map width (0–100)
  "map_y": 15.7,   // percentage of map height (0–100)
  "image": "assets/cases/case_001/locations/loc_001.png",
  "atmosphere": {
    "description": "The alley reeks of iron and rot. A single gas lamp flickers at the far end, casting long shadows across the wet cobblestones. Water drips somewhere you cannot see. The fog is thick enough to touch.",
    "sound_loop": "assets/audio/dripping_fog.mp3"
  },
  "searchable_objects": [ /* see 4.5 */ ],
  "max_searches_per_visit": 3
}
```

### 4.3 Suspect

```json
{
  "id": "suspect_001",
  "name": "Edmund Harrow",
  "portrait": "assets/cases/case_001/suspects/suspect_001.png",
  "revealed_by_evidence": null,
  "profile": "A local butcher, known for erratic hours and a temper. Neighbors report he was seen near the alley on the night in question.",
  "is_solution": false,
  "visible_from_start": true,
  "dialogs": [
    {
      "id": "dialog_001",
      "label": "Perguntar sobre a noite do crime",
      "requires_evidence": null,
      "text": "I was closing up the shop around ten. Heard nothing. The fog was thick — you couldn't see past your own hand.",
      "reveals_evidence": null
    },
    {
      "id": "dialog_002",
      "label": "Confrontar com o lenço",
      "requires_evidence": "ev_001",
      "text": "That handkerchief? I lost it weeks ago! Someone must have planted it there. Ask Martha — she saw me lend it to a stranger at the pub.",
      "reveals_evidence": "ev_009"
    }
  ]
}
```

**Suspect dialog rules:**
- Each suspect has an array of `dialogs` — pre-written exchanges the player can trigger.
- A dialog with `requires_evidence: null` is always available.
- A dialog with `requires_evidence: "ev_001"` only appears after the player has found that evidence. This lets the player confront suspects with proof.
- `reveals_evidence`: if non-null, triggering this dialog adds the specified evidence to the player's Evidence Board (e.g. the suspect lets slip a new clue or names another suspect).
- Each dialog can only be triggered **once** per playthrough. Already-used dialogs are greyed out.
- A suspect with `revealed_by_evidence: "ev_003"` only appears on the Suspects List after `ev_003` is found.

### 4.4 Evidence

```json
{
  "id": "ev_001",
  "name": "Monogrammed Handkerchief",
  "description": "A fine linen handkerchief, initialed E.H., stained with what appears to be dried blood on one corner.",
  "image": "assets/ui/evidence_handkerchief.png",
  "reveals_suspect": "suspect_001",
  "weight": 2
}
```

The `weight` field indicates how much this evidence contributes to the persuasion roll during accusation (see section 10).

### 4.5 Searchable Object

```json
{
  "id": "obj_001",
  "label": "Under the bed",
  "required_tool": "flashlight",
  "evidence_id": "ev_001",
  "description_no_tool": "Darkness underneath. You'd need a light source to see anything.",
  "description_wrong_tool": "Your magnifying glass won't help here — you need to see in the dark.",
  "description_found": "Your flashlight sweeps the dusty floor. Behind the leg of the bed, half-wrapped in cloth — a handkerchief. You bag it carefully.",
  "description_empty": "You sweep the light underneath. Nothing but dust and a dead spider."
}
```

If `evidence_id` is `null`, the object can be searched but yields only atmosphere text.

---

## 5. Tool System

The player always carries a fixed kit. Tools are not consumed.

| Tool ID | Name (PT-BR) | Use case |
|---|---|---|
| `flashlight` | Lanterna | Dark spaces, under furniture |
| `uv_light` | Luz negra | Biological traces, invisible ink |
| `fingerprint_kit` | Kit de digitais | Surfaces: doorknobs, glass, counters |
| `magnifier` | Lupa | Small objects, text, fabric |
| `evidence_bag` | Saco de evidencias | Required to collect some items |
| `camera` | Camera | Documents, scenes, notes |

The UI displays the **Name (PT-BR)** column to the player. Tool IDs are internal only. Each case JSON specifies which `required_tool` each object needs. New tools can be added per case without changing engine code.

### 5.1 Tool Selection UX

The HUD displays a **tool belt** — a horizontal strip of tool icons along the bottom of the screen. The player taps a tool to **equip** it (highlighted border). Only one tool can be equipped at a time. Tapping the same tool again de-equips it.

**Interaction flow in LocationScene:**
1. Player taps a searchable object.
2. If no tool is equipped → engine checks `required_tool`:
   - If `required_tool` is `null` → search proceeds (no tool needed).
   - If `required_tool` is set → show `description_no_tool` text and a hint: *"Selecione uma ferramenta primeiro."*
3. If a tool is equipped → engine checks match:
   - Tool matches `required_tool` → show `description_found` (if evidence exists) or `description_empty`.
   - Tool does not match → show `description_wrong_tool`.
4. After a successful search, the tool stays equipped (player can search the next object without re-selecting).

---

## 6. Scene Flow

```
Boot -> Menu -> Case Select -> Case Brief -> Map
                                              |
                                    +---------+---------+
                                    |                   |
                               Location            Suspects
                             (search loop)              |
                                    |             Interrogation
                                    |            (dialog loop)
                                    |                   |
                                    +---------+---------+
                                              |
                                       Evidence Board
                                              |
                                         Accusation
                                              |
                                    Resolution / Reveal
                                              |
                                    Reputation Update -> Menu
```

The Map is the central hub. From the Map the player can visit Locations (to search for evidence) or open the Suspects list (to interrogate or accuse). The Evidence Board is accessible from both Location and Suspects scenes via a persistent HUD button.

---

## 7. Reputation System

Persists in localStorage across all cases.

```
Starting reputation: 50

On CORRECT accusation (with sufficient evidence):
  base_reward = case.solution.reputation_base_reward (e.g. 100)
  evidence_count = number of evidence items found at time of accusation
  total_evidence = total evidence items in case
  thoroughness_bonus = round((evidence_count / total_evidence) * 50)
  gain = base_reward + thoroughness_bonus

On CORRECT accusation (without sufficient evidence — persuasion roll):
  If roll succeeds: gain = base_reward (no thoroughness bonus)
  If roll fails: loss = 20 (case continues, player may investigate more)

On WRONG accusation:
  loss = 40
  Case is LOST — player cannot continue investigating this playthrough.
  Player must restart the case from scratch if they want to try again.

Reputation tiers:
  0-20   -> Renegado
  21-40  -> Suspeito
  41-60  -> Detetive
  61-80  -> Investigador Senior  — persuasion threshold reduced by 1
  81-100 -> Lenda               — persuasion threshold reduced by 2
  101+   -> Inatingivel          — persuasion threshold reduced by 3
```

Tier bonuses are applied **after** the base threshold is calculated (see section 10). Minimum threshold remains 5 even after tier reduction. Tiers below "Investigador Senior" have no mechanical bonus.

---

## 8. Map Scene

Inspired by Scotland Yard. Small, hand-drawn-style pixel map per case. Locations are represented as clickable nodes. No automatic clue delivery upon arrival — the player must search the location manually.

**Mechanics:**
- Locations visible from the start (greyed out if not yet visited)
- A location turns "active" once visited
- A location gets a marker icon if evidence was found there
- Player navigates between locations freely (no movement cost in v1)

---

## 9. Location Scene (Search Loop)

**Layout:** The location pixel art image occupies the left ~65% of the screen. The right ~35% is a **side panel** containing: the atmospheric description (top), the list of searchable objects as text buttons (middle), and the result text area (bottom).

**Flow:**
1. Player arrives → full atmospheric description is displayed in the side panel (DialogBox, typewriter effect).
2. Searchable objects appear as a vertical list of labeled buttons (e.g. "Debaixo da cama", "Bancada da cozinha").
3. Player equips a tool from the HUD tool belt (see 5.1), then taps an object → result text displayed in the side panel.
4. If evidence is found → added to Evidence Board, suspect list may update, object button is marked with a check icon.
5. Already-searched objects that yielded nothing are greyed out and non-interactive.
6. **Search limit:** Each location has a `max_searches_per_visit` value (typically 3). After that many searches in a single visit, a message appears: *"Você precisa sair e voltar outro dia para continuar investigando."* The player must return to the Map and can revisit the location (counts as a new visit). This prevents exhaustive brute-force and creates a sense of passing time.
7. Player can exit to Map at any time via the HUD back button.

**Note:** The search limit counts all search attempts (successful or not) within one visit. Revisiting resets the counter but does NOT reset already-searched objects.

---

## 9.1 Interrogation Scene

Accessed from the Suspects list by tapping a suspect's portrait.

**Layout:** Suspect portrait on the left (~40% of screen). Right side shows suspect name, profile text, and available dialog options as text buttons.

**Flow:**
1. Available dialogs are listed. Dialogs whose `requires_evidence` the player hasn't found yet are **hidden** (not greyed out — the player shouldn't know they exist).
2. Player taps a dialog option → the suspect's response is displayed in the DialogBox with typewriter effect.
3. If `reveals_evidence` is non-null → the new evidence is added to the Evidence Board with a brief flash notification: *"Nova evidência: [name]"*.
4. The used dialog option is greyed out and non-interactive for the rest of the playthrough.
5. Player can return to the Suspects list or Map via HUD.

**Design note:** Interrogations have no search limit — the player can exhaust all available dialogs in one visit. The gating is evidence-based: new dialogs only unlock as the player finds more proof.

---

## 10. Accusation Scene

The player can accuse a suspect at any time, even without sufficient evidence. The outcome depends on how much proof has been gathered.

**Flow:**

1. Player opens Suspects list and selects a suspect to accuse.
2. Confirmation dialog: "Tem certeza? Uma acusacao errada prejudicara sua reputacao."

**If the accused is NOT the culprit:**
- Reputation penalty: -40
- The case is **lost**. The player accused an innocent person and the real criminal escapes.
- Player may restart the case from Case Select, but progress is reset.

**If the accused IS the culprit:**

- **With sufficient evidence** (all items in `solution.required_evidence` found):
  Automatic conviction. Full reputation reward + thoroughness bonus (see section 7).

- **Without sufficient evidence** (missing one or more `required_evidence` items):
  The case goes to trial, but the prosecution is weak. A **persuasion roll** determines the outcome:
  - A d20 die appears on screen and the player clicks/taps to roll it. The die animates (tumbling sprite, ~1.5s) before revealing the result.
  - **Persuasion threshold** = `20 - sum(weight)` of all found evidence items (minimum threshold: 5).
  - If roll >= threshold: conviction succeeds. Reputation gain = base_reward only (no bonus).
  - If roll < threshold: jury acquits. Reputation loss: -20. Case continues — the player can investigate more and try again.

**Re-accusation rule:** After a failed accusation (acquittal or wrong suspect on a restarted case), the player may only accuse again after finding **at least one new piece of evidence**. This prevents brute-force guessing.

---

## 11. Resolution Scene

Triggered after a successful conviction (either by evidence or persuasion roll).

**Flow:**
1. Dramatic reveal text: the real-world crime behind the case is disclosed (`solution.reveal_text`).
2. Summary of player performance: evidence found, accusations made, final reputation change.
3. Reputation update is applied and displayed with tier change animation (if applicable).
4. "Voltar ao Menu" button returns the player to the main menu.

---

## 12. Atmosphere & Visual Guidelines

- **Color palette per scene type:**
  - Map: muted sepia/slate tones
  - Location: dark, desaturated; location-specific accent color (e.g. red for crime scenes, blue-green for docks)
  - Evidence Board: dark cork/felt texture feel
  - UI chrome: near-black with amber/gold accents

- **Typography:** Serif or typewriter font for narrative text. Sans for UI.
- **Location images:** AI-generated atmospheric images stored in `assets/locations/` as `loc_001.png` … `loc_005.png`. Where no image exists, `LocationArt.js` generates a procedural fallback. Images fill the left panel of `LocationScene` (≈65% of screen width).
- **Suspect portraits:** AI-generated photorealistic images (e.g. 1024×1536px). Stored in `assets/portraits/` as `suspect_001.png`, `suspect_002.png`, etc. Loaded by `BootScene` and referenced by suspect ID. Where no image exists, `PortraitArt.js` generates a procedural Graphics-based portrait as fallback. Portraits are displayed **top-anchored** (head prioritized) with a geometry mask clipping the bottom — `setOrigin(0.5, 0)` positioned at the top of the portrait area.
- **Tool icons:** Pixel art, ~48x48px, clean silhouette style, readable at small sizes.
- **Sound (optional v1.1):** Ambient loop per location. No music during investigation — silence amplifies tension.
- **Transitions:** Slow fade to black between scenes. No snappy cuts.

---

## 13. Case Select Scene

Displays all available cases as cards or tiles. Each case card shows:

- **Codename** (e.g. "The Whitechapel Shadow")
- **Difficulty** (star rating or numeric)
- **Status indicator:**
  - "Novo" — never attempted
  - "Em andamento" — saved progress exists
  - "Resolvido" — case completed, with final score/reputation earned displayed

All cases are available from the start (no unlock gating). The player can select any case freely.

**Replay:** A solved case can be replayed. Replaying resets case progress but does **not** affect reputation (no reputation gain or loss on replay).

**Active case rule:** Only one case can be active at a time. If the player selects a new case while another is in progress, a confirmation dialog appears: *"Você já tem um caso em andamento. Abandonar o caso atual?"* Abandoning discards all progress on the current case (no reputation penalty). This simplifies the save state to a single `active_case` slot.

---

## 14. Case Design Guidelines (for future cases)

- Real crime must be famous enough to have cultural recognition upon reveal
- Disguise: change names, city, year by +/-10 years, minor details
- Minimum 4 locations per case
- Minimum 6 evidence items, minimum 3 suspects
- At least one red herring suspect (plausible but not the solution)
- At least one **red herring evidence item** — an item that plausibly incriminates a non-culprit suspect. It should have weight 1-2 so it helps in a persuasion roll against the wrong suspect, tempting the player into a false accusation
- At least one evidence item requiring UV light (atmosphere)
- Each suspect must have at least 2 dialogs: one always-available, one gated by evidence
- At least one suspect dialog should `reveal_evidence` — this makes interrogation mechanically rewarding, not just flavor
- Write atmospheric descriptions FIRST — they drive the pixel art brief
- Assign `weight` values to evidence: key proof = 3-4, supporting = 1-2
- Set `max_searches_per_visit` to 3 for most locations; use 2 for small locations and 4 for large ones

---

## 15. Save State (localStorage)

The `SaveManager` persists the following structure under the key `cold_case_save`:

```json
{
  "version": 1,
  "reputation": 50,
  "reputation_history": [
    { "case_id": "case_001", "delta": 120, "timestamp": 1700000000 }
  ],
  "completed_cases": {
    "case_001": {
      "solved": true,
      "final_reputation_earned": 120,
      "evidence_found": 8,
      "evidence_total": 10,
      "accusations_made": 1
    }
  },
  "active_case": {
    "case_id": "case_001",
    "visited_locations": ["loc_001", "loc_003"],
    "found_evidence": ["ev_001", "ev_004"],
    "revealed_suspects": ["suspect_001", "suspect_002"],
    "searched_objects": ["obj_001", "obj_005"],
    "used_dialogs": ["dialog_001"],
    "current_visit_searches": { "loc_001": 2 },
    "accusations_made": 0,
    "last_evidence_count_at_accusation": 0
  }
}
```

**Field notes:**
- `version`: schema version for future migration support.
- `reputation_history`: audit trail for the reputation timeline display.
- `completed_cases`: keyed by case ID; stores summary for Case Select display.
- `active_case`: current in-progress case state. Set to `null` when no case is active.
- `used_dialogs`: IDs of interrogation dialogs already triggered (cannot be repeated).
- `current_visit_searches`: tracks how many searches have been made in the current visit per location. Reset for a location when the player leaves and re-enters it.
- `last_evidence_count_at_accusation`: tracks evidence count at last failed accusation, used to enforce the "new evidence required" re-accusation rule.

---

## 16. Development Phases

| Phase | Scope |
|---|---|
| **v0.1** | Engine scaffold, one full case (Case 001), all scenes functional (including interrogation), tool belt UX, search limits, d20 roll animation, save/load, no audio |
| **v0.2** | Polish, responsive mobile layout, transition effects (fade to black), reputation tier display with animation |
| **v0.3** | Audio (Howler.js ambient loops), second case |
| **v1.0** | Three cases, full reputation history timeline, visual evidence board with connection hints |

---

## 17. Session Protocol (Claude Code)

At the start of every Claude Code session:
1. Read `SPEC.md` (this file)
2. Read `data/cases/case_001.json` if working on case content
3. Read the relevant `src/scenes/*.js` file before editing it
4. Commit after every complete feature, with a descriptive message

Never edit multiple scenes in the same session without committing between them.
