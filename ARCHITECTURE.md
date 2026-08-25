# SnapBack — Architecture (minimal production)

## 1. System architecture
```
[ Student laptop browser ] ----\
                                 +--> Firebase Firestore (doc: snapback/{SYNC_CODE})
[ Student phone Capacitor APK ] /
         |
    localStorage (offline cache of same state)
```
- **One web codebase** (`index.html` + assets) runs on GitHub Pages and inside Capacitor WebView.
- **Per-student isolation** = private `SYNC_CODE` document ID (not multi-tenant auth yet).
- **No custom backend server** in v1 — Firebase is the API + DB.

## 2. Component structure
| Layer | Responsibility |
|-------|----------------|
| Views (`viewToday`, `viewTasks`, …) | UI screens |
| State (`state` object) | Single source of truth in memory |
| Persistence (`saveState` / `loadState`) | localStorage |
| Sync (`pushCloudSync` / `startCloudSync`) | Firestore write + listen |
| Native bridge (`scheduleNativeNotification`) | Capacitor Local Notifications |
| Parsers (`parseTimetableText`, …) | Calendar input |

## 3. Data flow
1. User action → mutates `state` → `persistRender()` → `saveState()` + `render()` + `pushCloudSync()`.
2. Cloud `onSnapshot` → `applyCloudPayload` → local state → `render()`.
3. Reminders: state → `scheduleNativeNotification` (APK) or in-app checks (web).

## 4. API design (logical)
| Operation | Mechanism |
|-----------|-----------|
| Upsert student data | `set(snapback/{code}, payload, {merge:true})` |
| Subscribe | `onSnapshot(snapback/{code})` |
| Force pull | `get(snapback/{code})` |

Payload keys: tasks, classes, studyBlocks, journal, journalFiled, profile, wakeAlarm, …

## 5. Database schema (Firestore)
```
snapback/ {SYNC_CODE}
  tasks: Task[]
  classes: Class[]
  studyBlocks: Block[]
  journal: Note[]
  journalFiled: { do, file, drop }
  profile: { name, grade, school, notes }
  wakeAlarm: { enabled, time, days, snoozesMax }
  updatedAt: ISO string
```

## 6. Caching
- **localStorage**: full state (offline-first).
- **Service worker**: network-first for HTML; cache static icons.
- **Firestore**: source of truth across devices when online.

## 7. Performance notes
- Single-file app → one parse; avoid large deps.
- `render()` re-renders active view only (not virtual DOM) — keep lists modest.
- Debounced cloud write (800ms) reduces Firestore chatter.
- Image icons small (192/512).

## 8. Frontend production checklist
- Loading: view-loader on navigate; Pull from cloud button.
- A11y: buttons labeled; time/date inputs native.
- Responsive: sidebar → hamburger on narrow screens.
- Edge: conflict modal, AM/PM prompt, series delete.
