// dynamic_programming_script.js

document.addEventListener("DOMContentLoaded", async () => {
  const cells = document.querySelectorAll(".dp-cell");
  const modal = document.getElementById("confirm-modal");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");

  const gridSize = 3; // adjustable DP grid (3x3)
  let pendingCell = null;

  /* ---------- ASSIGN PROBLEM NUMBER (0-based linear index) ---------- */
  cells.forEach((cell, index) => {
    cell.dataset.problem = index; // 0-based
  });

  /* ---------- HELPERS ---------- */
  function disableCell(cell) {
    const checkbox = cell.querySelector(".problem-check");
    const link = cell.querySelector("a");
    checkbox.disabled = true;
    if (link) {
      link.style.pointerEvents = "none";
      link.style.color = "#9ca3af";
      link.style.cursor = "default";
    }
  }

  function enableCell(cell) {
    const checkbox = cell.querySelector(".problem-check");
    const link = cell.querySelector("a");
    checkbox.disabled = false;
    if (link) {
      link.style.pointerEvents = "auto";
      link.style.color = "#e2e8f0";
      link.style.cursor = "pointer";
    }
  }

  /* ---------- UNLOCK LOGIC (dp[i][j] = dp[i+1][j] + dp[i][j+1]) ---------- */
  function checkUnlocks() {
    cells.forEach((cell, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      if (row === gridSize - 1 || col === gridSize - 1) return; // skip base cells

      const checkbox = cell.querySelector(".problem-check");
      if (checkbox.checked) return; // already solved

      const downIndex = (row + 1) * gridSize + col;
      const rightIndex = row * gridSize + (col + 1);

      const downCell = cells[downIndex];
      const rightCell = cells[rightIndex];

      if (downCell && rightCell) {
        const downSolved = downCell.querySelector(".problem-check").checked;
        const rightSolved = rightCell.querySelector(".problem-check").checked;

        if (downSolved && rightSolved && cell.classList.contains("locked")) {
          cell.classList.remove("locked");
          enableCell(cell);
          cell.classList.add("just-unlocked");
          setTimeout(() => cell.classList.remove("just-unlocked"), 800);
        }
      }
    });
  }

  /* ---------- FETCH USER PROGRESS ---------- */
  async function fetchProgress() {
    try {
      const res = await fetch("/dynamic-programming/progress");
      if (!res.ok) throw new Error("Failed to fetch DP progress");

      const solvedProblems = await res.json(); // expects array of problem numbers (e.g. [0, 1, 5])
      initGrid(solvedProblems);
    } catch (err) {
      console.error("Progress fetch error:", err);
      initGrid([]); // fallback
    }
  }

  /* ---------- SUBMIT PROGRESS ---------- */
  async function submitProgress(problemNumber) {
    try {
      const res = await fetch("/dynamic-programming/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "dynamic-programming", problem: problemNumber }),
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    }
  }

  /* ---------- INITIALIZE GRID ---------- */
  function initGrid(solvedProblems = []) {
    cells.forEach((cell, index) => {
      const checkbox = cell.querySelector(".problem-check");
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      const isSolved = solvedProblems.includes(index);
      const canUnlock = row === gridSize - 1 || col === gridSize - 1;

      if (isSolved) {
        cell.classList.add("solved");
        checkbox.checked = true;
        disableCell(cell);
      } else if (canUnlock) {
        cell.classList.remove("locked");
        enableCell(cell);
      } else {
        cell.classList.add("locked");
        disableCell(cell);
      }
    });

    checkUnlocks(); // unlock next eligible
  }

  /* ---------- MODAL LOGIC ---------- */
  cells.forEach((cell) => {
    const checkbox = cell.querySelector(".problem-check");

    checkbox.addEventListener("change", (e) => {
      e.preventDefault();
      if (cell.classList.contains("locked") || cell.classList.contains("solved")) {
        checkbox.checked = cell.classList.contains("solved");
        return;
      }
      pendingCell = cell;
      modal.classList.remove("hidden");
    });
  });

  confirmYes.addEventListener("click", async () => {
    if (!pendingCell) return;

    const cb = pendingCell.querySelector(".problem-check");
    const problemNumber = parseInt(pendingCell.dataset.problem);

    cb.checked = true;
    disableCell(pendingCell);
    pendingCell.classList.add("solved");

    await submitProgress(problemNumber);
    checkUnlocks();

    modal.classList.add("hidden");
    pendingCell = null;
  });

  confirmNo.addEventListener("click", () => {
    if (pendingCell) {
      const cb = pendingCell.querySelector(".problem-check");
      cb.checked = false;
    }
    modal.classList.add("hidden");
    pendingCell = null;
  });

  /* ---------- INITIAL LOAD ---------- */
  await fetchProgress();
});
