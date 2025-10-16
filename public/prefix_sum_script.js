document.addEventListener("DOMContentLoaded", async () => {
  const problemChecks = document.querySelectorAll(".problem-check");
  const modal = document.getElementById("confirm-modal");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");
  const windowHighlight = document.getElementById("windowHighlight");
  const cells = document.querySelectorAll(".array-cell");

  let pendingIndex = null;
  let maxSolvedIndex = -1; // furthest solved problem

  // === Fetch progress from API ===
  async function fetchProgress() {
    try {
      const res = await fetch("/prefix-sum/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      const solvedIndices = await res.json(); // array of solved problem indices

      // Mark solved problems
      solvedIndices.forEach(idx => {
        if (cells[idx]) {
          const cb = cells[idx].querySelector(".problem-check");
          cb.checked = true;
          cb.disabled = true;
          cells[idx].classList.add("solved");
          maxSolvedIndex = Math.max(maxSolvedIndex, idx);
        }
      });

      // If no progress, unlock first problem
      if (solvedIndices.length === 0) maxSolvedIndex = -1;

      updateLocks(maxSolvedIndex);
      expandPrefix(maxSolvedIndex);
    } catch (err) {
      console.error("Progress fetch error:", err);
      // fallback: only first unlocked
      updateLocks(-1);
      expandPrefix(-1);
    }
  }

  // === Submit progress to API ===
  async function submitProgress(problemIndex) {
    try {
      const res = await fetch("/prefix-sum/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "prefix-sum", problem: problemIndex })
      });

      if (!res.ok) throw new Error("Failed to submit progress");
      return true;
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
      return false;
    }
  }

  // === Expand prefix highlight ===
  function expandPrefix(endIndex) {
    if (endIndex < 0) {
      windowHighlight.style.display = "none";
      return;
    }

    const startCell = cells[0];
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
  function updateLocks(maxSolved) {
    cells.forEach((cell, i) => {
      const cb = cell.querySelector(".problem-check");
      if (i <= maxSolved + 1) {
        // unlock next problem
        cell.classList.remove("locked");
        if (!cell.classList.contains("solved")) cb.disabled = false;
      } else {
        // lock remaining problems
        cell.classList.add("locked");
        cb.disabled = true;
      }
    });
  }

  // === Modal Trigger ===
  problemChecks.forEach(cb => {
    cb.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.index);
      if (cb.disabled) return;
      cb.checked = false; // revert UI immediately
      pendingIndex = idx;
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

        if (pendingIndex > maxSolvedIndex) {
          maxSolvedIndex = pendingIndex;
          expandPrefix(maxSolvedIndex);
        }

        updateLocks(maxSolvedIndex);
      }

      confirmYes.disabled = false;
      pendingIndex = null;
      modal.classList.add("hidden");
    }
  });

  // === Confirm No ===
  confirmNo.addEventListener("click", () => {
    pendingIndex = null;
    modal.classList.add("hidden");
  });

  // === Init ===
  await fetchProgress();
});
