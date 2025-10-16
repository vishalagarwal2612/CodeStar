document.addEventListener("DOMContentLoaded", async () => {
  const key = parseInt(document.getElementById("key").innerText); // key to search
  const arrayContainer = document.getElementById("array-container");
  const arrayCells = document.querySelectorAll(".array-cell");
  const searchSpace = document.getElementById("search-space");

  const problemCells = Array.from(document.querySelectorAll(".problem-cell"));
  const problemChecks = Array.from(document.querySelectorAll(".problem-check"));

  const modal = document.getElementById("confirm-modal");
  const btnYes = document.getElementById("confirm-yes");
  const btnNo = document.getElementById("confirm-no");

  let low = 1;
  let high = 25;
  let currentProblemIndex = 0;
  let pendingIndex = null;

  // === Static Binary Search Steps (deterministic sequence) ===
  // Each step represents what happens after solving that problem.
  // These values assume array = [1..25] and key is constant.
  const steps = [];
  let tempLow = 1, tempHigh = 25;
  for (let i = 0; i < problemCells.length; i++) {
    const mid = Math.floor((tempLow + tempHigh) / 2);
    steps.push({ low: tempLow, high: tempHigh, mid });
    if (key < mid) tempHigh = mid - 1;
    else if (key > mid) tempLow = mid + 1;
    else {
      tempLow = tempHigh = mid;
      break;
    }
  }

  // === Fetch user progress from backend ===
  async function fetchProgress() {
    try {
      const res = await fetch("/binary-search/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      const solvedIndices = await res.json(); // expect array of solved indices

      // Apply solved state visually
      solvedIndices.forEach(idx => {
        if (problemCells[idx]) {
          problemCells[idx].classList.add("solved");
          problemChecks[idx].checked = true;
          problemChecks[idx].disabled = true;
        }
      });

      // Determine current index
      currentProblemIndex = solvedIndices.length;
      if (currentProblemIndex < problemCells.length) {
        problemCells[currentProblemIndex].classList.remove("locked");
        problemChecks[currentProblemIndex].disabled = false;
      }

      // Lock rest
      for (let i = currentProblemIndex + 1; i < problemCells.length; i++) {
        problemCells[i].classList.add("locked");
        problemChecks[i].disabled = true;
      }

      // Reconstruct Binary Search State
      simulateSteps(solvedIndices.length);
      updateSearchSpace();
      highlightMid();
    } catch (err) {
      console.error("Progress fetch error:", err);

      // fallback: unlock first problem
      problemCells.forEach((cell, i) => {
        if (i === 0) {
          cell.classList.remove("locked");
          problemChecks[i].disabled = false;
        } else {
          cell.classList.add("locked");
          problemChecks[i].disabled = true;
        }
      });

      updateSearchSpace();
      highlightMid();
    }
  }

  // === Simulate solved steps to restore search state ===
  function simulateSteps(count) {
    low = 1;
    high = 25;
    arrayCells.forEach(cell => cell.classList.remove("found", "mid"));
    for (let i = 0; i < count; i++) {
      const { mid } = steps[i];
      if (key < mid) high = mid - 1;
      else if (key > mid) low = mid + 1;
      else {
        arrayCells[mid - 1].classList.add("found");
        low = high = mid;
        break;
      }
    }
  }

  // === Submit solved problem to backend ===
  async function submitSolved(idx) {
    try {
      const res = await fetch("/binary-search/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "binary-search", problem: idx })
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    }
  }

  // === Mark a problem as solved ===
  async function solveProblem(i) {
    const cell = problemCells[i];
    const check = problemChecks[i];

    cell.classList.add("solved");
    check.checked = true;
    check.disabled = true;

    await submitSolved(i);

    // Update Binary Search step deterministically
    const { mid } = steps[i];
    if (key < mid) high = mid - 1;
    else if (key > mid) low = mid + 1;
    else {
      arrayCells[mid - 1].classList.add("found");
      low = high = mid;
    }

    updateSearchSpace();
    highlightMid();

    // Unlock next problem if exists
    currentProblemIndex = i + 1;
    if (currentProblemIndex < problemCells.length) {
      problemCells[currentProblemIndex].classList.remove("locked");
      problemChecks[currentProblemIndex].disabled = false;
    }
  }

  // === Checkbox click handler ===
  problemChecks.forEach((check, i) => {
    check.addEventListener("click", (e) => {
      e.preventDefault();
      if (i !== currentProblemIndex) return;
      pendingIndex = i;
      modal.classList.remove("hidden");
    });
  });

  // === Modal YES ===
  btnYes.addEventListener("click", async () => {
    modal.classList.add("hidden");
    if (pendingIndex != null) await solveProblem(pendingIndex);
    pendingIndex = null;
  });

  // === Modal NO ===
  btnNo.addEventListener("click", () => {
    modal.classList.add("hidden");
    if (pendingIndex != null) problemChecks[pendingIndex].checked = false;
    pendingIndex = null;
  });

  // === Visualization ===
  function updateSearchSpace() {
    arrayCells.forEach(cell => cell.classList.remove("mid"));
    if (low > high) {
      searchSpace.style.width = "0";
      return;
    }

    const mid = Math.floor((low + high) / 2);
    arrayCells[mid - 1].classList.add("mid");

    const leftCell = arrayCells[low - 1];
    const rightCell = arrayCells[high - 1];
    const containerRect = arrayContainer.getBoundingClientRect();
    const leftRect = leftCell.getBoundingClientRect();
    const rightRect = rightCell.getBoundingClientRect();

    const offsetLeft = leftRect.left - containerRect.left + arrayContainer.scrollLeft;
    const width = rightRect.right - leftRect.left;

    searchSpace.style.left = offsetLeft + "px";
    searchSpace.style.width = width + "px";
    searchSpace.style.height = leftRect.height + "px";
  }

  function highlightMid() {
    arrayCells.forEach(cell => cell.classList.remove("mid"));
    if (low <= high) {
      const mid = Math.floor((low + high) / 2);
      arrayCells[mid - 1].classList.add("mid");
    }
  }

  // === Initial load ===
  await fetchProgress();
});
