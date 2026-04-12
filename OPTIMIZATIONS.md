### 1) Optimization Summary

* **Summary of current optimization health**: The codebase is functional but relies on brute-force re-rendering and synchronous state saving upon every user interaction. The DOM is fully reconstructed on any score change, and scroll events trigger expensive synchronous layout reads (`getBoundingClientRect`) causing layout thrashing. Due to the small data size, it easily hits 60FPS on modern hardware, but technically it violates multiple performance best practices.
* **Top 3 highest-impact improvements**:
  1. Add `requestAnimationFrame` or throttling to the `scroll` event listener to prevent layout thrashing.
  2. Debounce `localStorage.setItem` so it doesn't synchronously block the main thread on every sequential digit typed.
  3. Pre-query and cache DOM elements rather than running `document.getElementById` or `document.querySelector` inside loops and rapid events.
* **Biggest risk if no changes are made**: The UI could become jittery or slightly unresponsive when users rapidly type double-digit scores or quickly toggle matches, especially on lower-end mobile devices, due to the synchronous `localStorage` writes combined with full DOM `innerHTML` replacements.

---

### 2) Findings (Prioritized)

* **Title**: Scroll Event Layout Thrashing
* **Category**: Frontend / Performance
* **Severity**: High
* **Impact**: Latency, CPU, Frame rate (Jank)
* **Evidence**: `window.addEventListener('scroll', () => { ... getBoundingClientRect() })` in `script.js`.
* **Why it’s inefficient**: Scroll events fire dozens of times per second. Reading `getBoundingClientRect()` inside a scroll handler forces a synchronous layout calculation (Reflow) on the main thread continuously.
* **Recommended fix**: Wrap the callback in `requestAnimationFrame`, or use an `IntersectionObserver` instead.
* **Tradeoffs / Risks**: Minimal. `IntersectionObserver` is highly supported, but requires slight logic restructuring.
* **Expected impact estimate**: Substantial CPU reduction on mobile during scroll.
* **Removal Safety**: Safe
* **Reuse Scope**: Local file

* **Title**: Synchronous & Chatty LocalStorage I/O
* **Category**: I/O / Performance
* **Severity**: Medium
* **Impact**: Latency, CPU
* **Evidence**: `saveState()` running `localStorage.setItem('sampiyonSimulatorState', JSON.stringify(state));` repeatedly inside `updatePoints()`.
* **Why it’s inefficient**: `updatePoints()` runs on every single `onchange` and `onclick` event across all matches. `localStorage` is completely synchronous and blocking. Typing "12" triggers this twice in milliseconds, serializing the entire JSON object twice.
* **Recommended fix**: Debounce `saveState()` by ~300ms using `setTimeout`.
* **Tradeoffs / Risks**: Very low. Only risk is if the user inputs a result and closes the tab within <300ms, data might be lost.
* **Expected impact estimate**: 30% reduction in blocking time on rapid input.
* **Removal Safety**: Safe
* **Reuse Scope**: Local file

* **Title**: Uncached DOM Node Queries
* **Category**: Frontend / Memory
* **Severity**: Medium
* **Impact**: CPU
* **Evidence**: `const miniBoard = document.getElementById('mini-leaderboard');` and `const standingsTable = document.querySelector('.standings-section');` are queried *inside* the scroll listener.
* **Why it’s inefficient**: Querying the DOM tree is relatively expensive. Doing it inside a scroll event loop amplifies the cost.
* **Recommended fix**: Move element queries outside the event listener to the global/module scope so they are cached.
* **Tradeoffs / Risks**: None.
* **Expected impact estimate**: Measurable frame time improvement during scroll.
* **Removal Safety**: Safe
* **Reuse Scope**: Local file

* **Title**: Full DOM Re-render via `innerHTML`
* **Category**: Frontend / Code Reuse
* **Severity**: Medium
* **Impact**: CPU, Memory
* **Evidence**: `renderStandings()` rebuilds the entire table body via `.join('')` and inserts via `.innerHTML`.
* **Why it’s inefficient**: Completely destroying and re-parsing DOM nodes is slower than updating `textContent` on existing nodes. It invalidates internal browser DOM states and forces complete repaints.
* **Recommended fix**: Create the DOM nodes once on initialization, and only update their `textContent` or `className` selectively in `renderStandings()`.
* **Tradeoffs / Risks**: Increased code complexity vs. plain string templates. Given the small number of rows (4), `innerHTML` is acceptable but not optimal.
* **Expected impact estimate**: ~5-10ms faster renders per keystroke.
* **Removal Safety**: Safe
* **Reuse Scope**: Local file

* **Title**: Code Duplication (Team IDs & Array Iteration)
* **Category**: Maintainability / Code Reuse
* **Severity**: Low
* **Impact**: Maintenance overhead
* **Evidence**: `['GS', 'FB', 'TS', 'BJK'].forEach(...)` is hardcoded across 3 different places in `script.js`.
* **Why it’s inefficient**: If a team is added or changed, you must hunt down all arrays.
* **Recommended fix**: Define `const TEAMS = ['GS', 'FB', 'TS', 'BJK'];` at the top of the file.
* **Tradeoffs / Risks**: None.
* **Expected impact estimate**: Code clarity.
* **Removal Safety**: Safe
* **Reuse Scope**: Local file

---

### 3) Quick Wins (Do First)

1. **Extract DOM Selectors**: Pull `document.getElementById('mini-leaderboard')` and the `.standings-section` query out of the scroll event to file scope.
2. **Debounce LocalStorage**: Wrap `saveState()` inner execution in a `setTimeout` to batch rapid changes.
3. **Array Constant**: Replace inline `['GS', 'FB', 'TS', 'BJK']` arrays with a globally defined `TEAMS` constant.

---

### 4) Deeper Optimizations (Do Next)

1. **IntersectionObserver implementation**: Remove the scroll listener completely. Attach an `IntersectionObserver` to an invisible 1px div at the top of `.standings-section`. When it intersects negatively, toggle the `.visible` class on the mini leaderboard. This offloads the layout checking entirely to the browser's native compositing thread.
2. **Virtual DOM / Granular Updates**: Refactor `renderStandings()` to map over existing `tr` and `td` rows, mutating only the text that has explicitly changed, eliminating `.innerHTML` rebuilds on every keyboard stroke.
3. **Data Normalization**: The `state` structure duplicates week numbers and opponents natively. The linked/derby search relies on `.find()` loops in arrays. Using a normalized relational dictionary for fixtures tied to a global match ID would reduce lookup time from `O(N)` to `O(1)`.

---

### 5) Validation Plan

* **Profiling Strategy**: Open Chrome DevTools -> Performance tab -> Record -> Scroll violently up and down. Review "Layout Thrashing" warnings on the "Main" flamechart. Record again while holding down the Up arrow on a score input field.
* **Metrics to compare**: 
   - Scroll event handling time (aim <1ms).
   - `updatePoints()` execution time on input (aim <3ms).
* **Test cases**: 
   - Enter a score rapidly: Ensure LocalStorage retains the absolute final state correctly.
   - Resize window, scroll up/down: Check if `IntersectionObserver` reliably triggers without overlapping or disappearing glitch frames.

---

### 6) Optimized Code / Patch

**Fixing the Scroll Event & DOM Queries (Quick Win)**
```javascript
// At the top level:
const TEAMS = ['GS', 'FB', 'TS', 'BJK'];
const elStandingsTable = document.querySelector('.standings-section');
const elMiniBoard = document.getElementById('mini-leaderboard');
let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      if (elStandingsTable && elMiniBoard) {
        const rect = elStandingsTable.getBoundingClientRect();
        if (rect.top < 0) {
          elMiniBoard.classList.add('visible');
        } else {
          elMiniBoard.classList.remove('visible');
        }
      }
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});
```

**Debouncing LocalStorage**
```javascript
let debounceTimer;
function saveState() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    localStorage.setItem('sampiyonSimulatorState', JSON.stringify(state));
  }, 300);
}
```
