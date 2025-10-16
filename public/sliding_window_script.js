document.addEventListener("DOMContentLoaded", async () => {
  const problemChecks = document.querySelectorAll(".problem-check");
  const modal = document.getElementById("confirm-modal");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");
  const windowHighlight = document.getElementById("windowHighlight");
  const cells = document.querySelectorAll(".array-cell");

  let pendingIndex = null;
  let windowStart = 0;
  const windowSize = 3;

  // === Fetch progress from API safely ===
  async function fetchProgress() {
    try {
      const res = await fetch("/sliding-window/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      let solvedIndices = await res.json();

      // Normalize response (numbers)
      solvedIndices = solvedIndices.map(x => Number(x)).filter(x => !isNaN(x));

      // Mark solved problems
      solvedIndices.forEach(idx => {
        if (cells[idx]) {
          const cb = cells[idx].querySelector(".problem-check");
          cb.checked = true;
          cb.disabled = true;
          cells[idx].classList.add("solved");
        }
      });

      // If all problems solved → hide window and lock all
      const allSolved = cells.length > 0 && Array.from(cells).every(cell => cell.classList.contains("solved"));
      if (allSolved) {
        windowHighlight.style.display = "none";
        updateLocks(cells.length, 0);
        return;
      }

      // Determine windowStart: slide forward by 1 until a non-fully-solved window is found
      windowStart = 0;
      while (windowStart < cells.length && isWindowSolved(windowStart, windowSize)) {
        windowStart += 1;
      }

      updateLocks(windowStart, windowSize);
      moveWindow(windowStart, windowSize);

    } catch (err) {
      console.error("Progress fetch error:", err);
      windowStart = 0;
      updateLocks(windowStart, windowSize);
      moveWindow(windowStart, windowSize);
    }
  }

  // === Submit progress to API ===
  async function submitProgress(problemIndex) {
    try {
      const res = await fetch("/sliding-window/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "sliding-window", problem: problemIndex })
      });
      if (!res.ok) throw new Error("Failed to submit progress");
      return true;
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
      return false;
    }
  }

  // === Modal Trigger ===
  problemChecks.forEach(cb => {
    cb.addEventListener("change", (e) => {
      e.preventDefault();
      if (cb.disabled) return;
      pendingIndex = parseInt(e.target.dataset.index);
      modal.classList.remove("hidden");
    });
  });

  // === Confirm Yes ===
  confirmYes.addEventListener("click", async () => {
    if (pendingIndex !== null) {
      confirmYes.disabled = true;

      const success = await submitProgress(pendingIndex);
      if (success) {
        const cb = document.querySelector(`.problem-check[data-index="${pendingIndex}"]`);
        cb.checked = true;
        cb.disabled = true;
        cb.closest(".array-cell").classList.add("solved");

        // Check if all solved → hide window
        const allSolved = Array.from(cells).every(cell => cell.classList.contains("solved"));
        if (allSolved) {
          windowHighlight.style.display = "none";
          updateLocks(cells.length, 0);
        } else if (isWindowSolved(windowStart, windowSize)) {
          slideWindow();
        }
      }

      confirmYes.disabled = false;
      pendingIndex = null;
      modal.classList.add("hidden");
    }
  });

  // === Confirm No ===
  confirmNo.addEventListener("click", () => {
    if (pendingIndex !== null) {
      const cb = document.querySelector(`.problem-check[data-index="${pendingIndex}"]`);
      cb.checked = false;
    }
    pendingIndex = null;
    modal.classList.add("hidden");
  });

  // === Sliding window highlight ===
  function moveWindow(startIndex, size = 3) {
    if (startIndex < 0 || startIndex >= cells.length) {
      windowHighlight.style.display = "none";
      return;
    }

    const endIndex = Math.min(startIndex + size - 1, cells.length - 1);
    const startCell = cells[startIndex];
    const endCell = cells[endIndex];
    const row = document.getElementById("problemRow");
    const rowRect = row.getBoundingClientRect();
    const startRect = startCell.getBoundingClientRect();
    const endRect = endCell.getBoundingClientRect();

    windowHighlight.style.display = "block";
    windowHighlight.style.left = (startRect.left - rowRect.left - 4) + "px";
    windowHighlight.style.top = (startRect.top - rowRect.top - 4) + "px";
    windowHighlight.style.width = (endRect.right - startRect.left + 8) + "px";
    windowHighlight.style.height = (startRect.height + 8) + "px";
  }

  // === Lock/unlock logic ===
  function updateLocks(start, size) {
    cells.forEach((cell, i) => {
      const cb = cell.querySelector(".problem-check");
      if (i >= start && i < start + size) {
        cell.classList.remove("locked");
        if (!cell.classList.contains("solved")) cb.disabled = false;
      } else {
        cell.classList.add("locked");
        cb.disabled = true;
      }
    });
  }

  // === Check if window solved ===
  function isWindowSolved(start, size) {
    for (let i = start; i < start + size && i < cells.length; i++) {
      if (!cells[i].classList.contains("solved")) return false;
    }
    return true;
  }

  // === Slide window by 1 step safely ===
  function slideWindow() {
    windowStart += 1;
    if (windowStart >= cells.length) {
      windowHighlight.style.display = "none";
      updateLocks(cells.length, 0);
      return;
    }
    updateLocks(windowStart, windowSize);
    moveWindow(windowStart, windowSize);
  }

  // === Init ===
  await fetchProgress();
});
