# 🎨 Visual Guide - Timeline + Continue + Deep Links

## Component Previews

### 1. Timeline UI Component

```
┌─────────────────────────────────────────────────────────────────────┐
│ Ayah 25 of 78                               Loop: 20-30             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ═══════════════●═══════════════════════════════════════════════════ │
│                ▲                    ▲                ▲               │
│           Green (A)            Blue (▶)        Purple (B)            │
│           marker 20          current 25         marker 30            │
│                                                                      │
│                   [Gradient highlight: A → B]                       │
│                                                                      │
│ [Set A (25)]  [Set B (25)]  [Clear A-B]                            │
└─────────────────────────────────────────────────────────────────────┘

Features:
✓ Click track to jump to any position
✓ Drag any marker to reposition
✓ Visual gradient shows loop range
✓ Real-time position updates
✓ Touch + mouse support
```

### 2. Continue Reading Card

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌────┐                                                              │
│  │ 📖 │  Continue Reading                                        › │
│  └────┘                                                              │
│                                                                      │
│         الرحمن - Ar-Rahman                                           │
│         Ayah 58 of 78 • 74% complete                                │
│         ████████████████████████░░░░░░░░                            │
│                                                                      │
│         Last read: October 8, 2025                                  │
└─────────────────────────────────────────────────────────────────────┘

Features:
✓ Beautiful gradient background
✓ Hover animation (scales up)
✓ Shows progress percentage
✓ Visual progress bar
✓ Click anywhere to continue
✓ Deep link with auto-play
```

### 3. Player Controls

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  [▶ Play]  [🔁 Loop ON]  [1.25x ▼]  [📤 Share]                    │
│   Blue      Purple       Gray         Green                         │
│                                                                      │
│  • Play/Pause toggle                                                │
│  • Loop requires A & B markers set                                  │
│  • Speed: 0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x                     │
│  • Share copies full URL with state                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## User Flow Diagrams

### Flow 1: Continue Reading

```
┌──────────────┐
│   User reads │
│   Surah 2    │
│   Ayah 255   │
└──────┬───────┘
       │ (auto-save progress)
       ↓
┌──────────────┐
│  Progress    │
│  saved to:   │
│  • Backend   │
│  • LocalStor │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ User closes  │
│ app          │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ User returns │
│ Opens home   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Continue     │
│ Card appears │
│ "Al-Baqarah" │
│ "Ayah 255"   │
└──────┬───────┘
       │ (user clicks card)
       ↓
┌──────────────┐
│ Navigate to: │
│ /quran?...   │
│ &play=1      │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Auto-plays   │
│ from Ayah    │
│ 255          │
└──────────────┘
```

### Flow 2: A-B Loop Study

```
┌──────────────┐
│ Open Surah   │
│ 55 (Rahman)  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Drag A       │
│ to Ayah 1    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Drag B       │
│ to Ayah 78   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Enable Loop  │
│ 🔁 turns ON  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Click Play   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Plays:       │
│ 1→2→...→78   │
│ →back to 1   │
│ (infinite)   │
└──────────────┘
```

### Flow 3: Share Link

```
┌──────────────┐
│ User sets up │
│ • Surah: 18  │
│ • A: 9       │
│ • B: 26      │
│ • Loop: ON   │
│ • Speed: 1.25│
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Clicks Share │
│ button (📤)  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ URL copied:  │
│ /quran?...   │
│ &a=9&b=26    │
│ &loop=1      │
│ &speed=1.25  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ User shares  │
│ on WhatsApp  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Friend opens │
│ link         │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Full state   │
│ restored!    │
│ • A=9, B=26  │
│ • Loop ON    │
│ • Speed 1.25x│
│ • Auto-plays │
└──────────────┘
```

---

## Color Scheme

### Timeline Colors
```
Current Position (Blue):
• Thumb: border-blue-500
• Icon: text-blue-600
• Progress bar: from-green-500 to-blue-500

A Marker (Green):
• Thumb: bg-green-500
• Text: text-white
• Label: text-green-600

B Marker (Purple):
• Thumb: bg-purple-500
• Text: text-white
• Label: text-purple-600

Loop Range:
• Highlight: from-blue-400/30 to-purple-400/30
• Creates visual band between A and B
```

### Continue Card Colors
```
Card Background:
• Light: from-blue-50 to-purple-50
• Dark: from-blue-900/20 to-purple-900/20

Icon:
• Background: from-blue-500 to-purple-600
• Icon: text-white

Progress Bar:
• Track: bg-gray-200 / dark:bg-gray-700
• Fill: from-blue-500 to-purple-600
```

### Player Controls
```
Play/Pause: bg-blue-600 hover:bg-blue-700
Loop ON: bg-purple-600 hover:bg-purple-700
Loop OFF: bg-gray-200 dark:bg-gray-700
Speed: bg-gray-200 dark:bg-gray-700
Share: bg-green-600 hover:bg-green-700
```

---

## Interaction States

### Timeline Interactions

#### 1. Idle State
```
─────────●───────────────────────────
         ▲
    Current position
    (no A-B markers)
```

#### 2. A Marker Set
```
─────────●───────A───────────────────
         ▲       ▲
    Current    Green
                marker
```

#### 3. A & B Markers Set
```
─────────●───A═══════B───────────────
         ▲   ▲       ▲
    Current Green   Purple
           └─────────┘
           Loop range
           (gradient)
```

#### 4. Playing with Loop
```
─────────────A═══●═══B───────────────
             ▲   ▲   ▲
          Green Blue Purple
                 │
            Currently
            playing
```

---

## Responsive Breakpoints

### Mobile (< 768px)
```
┌─────────────────┐
│ Ayah 25 of 78   │
│                 │
│ ━━━●━━━━━━━━━━ │
│                 │
│ [A] [B] [Clear] │
│                 │
│ [▶] [🔁] [1x▼] │
│ [📤 Share]      │
└─────────────────┘
```

### Tablet (768px - 1024px)
```
┌───────────────────────────────┐
│ Ayah 25 of 78    Loop: 20-30  │
│                               │
│ ━━━━━━━●━━━━━━━━━━━━━━━━━━━ │
│                               │
│ [A] [B] [Clear]               │
│                               │
│ [▶] [🔁] [1x▼] [📤]          │
└───────────────────────────────┘
```

### Desktop (> 1024px)
```
┌─────────────────────────────────────────────────┐
│ Ayah 25 of 78                  Loop: 20-30      │
│                                                  │
│ ━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                  │
│ [Set A (25)]  [Set B (25)]  [Clear A-B]         │
│                                                  │
│ [▶ Play]  [🔁 Loop ON]  [1.25x ▼]  [📤 Share]  │
└─────────────────────────────────────────────────┘
```

---

## Dark Mode Examples

### Timeline (Dark Mode)
```
┌─────────────────────────────────────────┐
│ ░░░░░░░░░ DARK MODE ░░░░░░░░░░░░░░░░░░ │
├─────────────────────────────────────────┤
│ Ayah 25 of 78      Loop: 20-30          │
│ (gray-400)         (blue-400)           │
│                                          │
│ ━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ (gray-700 track)  (blue thumb)          │
│        └─────────────┘                  │
│        (blue-600/30 - purple-600/30)    │
│                                          │
│ [Set A]  [Set B]  [Clear]               │
│ (green)  (purple)  (gray-600)           │
└─────────────────────────────────────────┘
```

### Continue Card (Dark Mode)
```
┌─────────────────────────────────────────┐
│  📖  Continue Reading               ›   │
│                                          │
│      الرحمن - Ar-Rahman                  │
│      (gray-100)                          │
│                                          │
│      Ayah 58 of 78 • 74%                │
│      (gray-400)                          │
│                                          │
│      ████████░░░░░░░░                   │
│      (bg-gray-700 track)                │
│      (blue-to-purple gradient fill)     │
│                                          │
│      Last read: Oct 8, 2025             │
│      (gray-500)                          │
└─────────────────────────────────────────┘
Background: blue-900/20 to purple-900/20
Border: blue-800
```

---

## Animation Timeline

### Continue Card Hover
```
Time: 0ms → 300ms
Scale: 1.0 → 1.02
Shadow: md → xl
Icon Scale: 1.0 → 1.1
Arrow: translateX(0) → translateX(4px)

All transitions: duration-300 ease-in-out
```

### Timeline Drag
```
State: Idle → Dragging → Released
Cursor: pointer → grab → grabbing
Z-index: 20 → 30 → 20
Shadow: none → lg → none

Visual feedback:
• Thumb changes cursor on hover
• Global mouse tracking when dragging
• Snap to nearest ayah on release
```

### Audio Loading
```
State: Stopped → Loading → Playing
Button: Play → Spinner → Pause
Color: blue-600 → blue-700 → blue-600
Icon: PlayIcon → ... → PauseIcon

Error State:
• Icon: ExclamationIcon
• Color: red-600
• Auto-reset after 3s
```

---

## Accessibility Features

### Timeline
```
ARIA Attributes:
• role="slider"
• aria-label="Current position"
• aria-valuemin="1"
• aria-valuemax="78"
• aria-valuenow="25"
• aria-valuetext="Ayah 25 of 78"

Keyboard Support:
• Tab: Focus next marker
• Arrow Left/Right: Move ±1 ayah
• Home/End: Jump to start/end
• Space: Toggle play/pause
```

### Continue Card
```
ARIA Attributes:
• role="button"
• aria-label="Continue reading Ar-Rahman at Ayah 58"
• tabindex="0"

Keyboard Support:
• Tab: Focus card
• Enter/Space: Navigate to surah
• Focus: Shows outline ring
```

### Player Controls
```
Each Button:
• aria-label: Clear description
• disabled state: aria-disabled="true"
• title attribute: Hover tooltip

Keyboard:
• Tab navigation
• Space/Enter to activate
• Focus visible (ring)
```

---

## Performance Notes

### Timeline Rendering
```
Optimization:
• useRef for DOM access (no re-render)
• Mouse tracking only when dragging
• Cleanup listeners on unmount
• Throttled position updates (100ms)

Expected Performance:
• 60fps on desktop
• 30fps on mobile
• <5ms update latency
```

### Audio Streaming
```
Optimization:
• Server-side caching (immutable)
• CDN-friendly (no auth in headers)
• Accept-Ranges support
• Preload="metadata"

Expected Performance:
• <1s initial load (on fast connection)
• Instant skip (cached metadata)
• No buffering on good network
```

### Progress Sync
```
Strategy:
• Debounced saves (500ms after playback)
• Optimistic UI update
• Background sync to backend
• localStorage for instant access

Expected Performance:
• <50ms UI update
• <200ms backend save
• Sync after 500ms idle
```

---

## Testing Scenarios

### Scenario 1: New User (No Progress)
```
1. User opens home page
   → Continue card does NOT appear ✓
2. User navigates to Quran hub
   → Sees surah list ✓
3. User selects Surah 2
   → Reader opens, no deep link params ✓
4. User plays Ayah 1
   → Progress saved ✓
5. User returns to home
   → Continue card NOW appears ✓
```

### Scenario 2: Returning User (With Progress)
```
1. User opens home page
   → Continue card appears immediately ✓
2. Card shows: "Al-Baqarah - Ayah 255"
   → Correct surah and ayah ✓
3. User clicks card
   → Navigates to /quran?surah=2&ayah=255&play=1 ✓
4. Reader opens and auto-plays
   → Audio starts from Ayah 255 ✓
5. Page scrolls to Ayah 255
   → Ayah is centered and highlighted ✓
```

### Scenario 3: Sharing Study Session
```
1. User opens Surah 55
2. User sets A=1, B=78
3. User enables Loop
4. User sets speed to 0.75x
5. User clicks Share
   → URL copied: /quran?surah=55&a=1&b=78&loop=1&speed=0.75 ✓
6. User sends URL to friend
7. Friend opens URL
   → All settings restored correctly ✓
8. Friend clicks Play
   → Loops through all 78 ayahs at 0.75x speed ✓
```

---

## FAQ

### Q: Can I use A-B loop without setting both markers?
**A**: No, loop requires both A and B markers. The Loop button is disabled until both are set.

### Q: What happens if I set B before A?
**A**: The timeline automatically handles this - the loop range is always from min(A,B) to max(A,B).

### Q: Does the Continue card work without login?
**A**: Yes! It uses localStorage as fallback. But it won't sync across devices without JWT.

### Q: Can I share a link with loop enabled but no auto-play?
**A**: Yes! Just omit `play=1` from the URL. The state will be restored but won't auto-play.

### Q: What happens to progress when I log out?
**A**: Backend progress is cleared, but localStorage persists. Re-login restores backend progress.

### Q: Can I have multiple loop ranges?
**A**: Not currently. Only one A-B range at a time. Future enhancement could add bookmarks as ranges.

---

**For complete documentation, see TIMELINE_CONTINUE_DEEPLINKS.md**
