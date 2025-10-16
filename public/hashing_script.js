document.addEventListener("DOMContentLoaded", async () => {
  const rows = [...document.querySelectorAll(".hashing-row")];
  const modal = document.getElementById("confirm-modal");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");

  let pendingIndex = null;

  /* ---------- DISABLE LINK ---------- */
  function disableLink(link) {
    if (!link) return;
    link.style.pointerEvents = "none";
    link.style.color = "#9ca3af"; // faded
    link.style.cursor = "default";
  }

  /* ---------- ENABLE LINK ---------- */
  function enableLink(link) {
    if (!link) return;
    link.style.pointerEvents = "auto";
    link.style.color = "#e2e8f0";
    link.style.cursor = "pointer";
  }

  /* ---------- UNLOCK NEXT ---------- */
  function unlockNext(idx) {
    const nextRow = rows[idx + 1];
    if (!nextRow) return;
    const nextCell = nextRow.querySelector(".array-cell");
    const nextCheckbox = nextCell.querySelector(".problem-check");
    const nextLink = nextCell.querySelector("a");

    nextCell.classList.remove("locked");
    nextCheckbox.disabled = false;
    enableLink(nextLink);

    // small visual animation
    nextCell.classList.add("just-unlocked");
    setTimeout(() => nextCell.classList.remove("just-unlocked"), 800);
  }

  /* ---------- INITIALIZE STATES ---------- */
  function initRows(solvedIndices = []) {
    rows.forEach((row, idx) => {
      const cell = row.querySelector(".array-cell");
      const checkbox = cell.querySelector(".problem-check");
      const link = cell.querySelector("a");

      if (solvedIndices.includes(idx)) {
        // already solved
        cell.classList.add("solved");
        checkbox.checked = true;
        checkbox.disabled = true;
        disableLink(link);
      } else if (idx === 0 || solvedIndices.includes(idx - 1)) {
        // unlocked (either first or after solved previous)
        cell.classList.remove("locked");
        checkbox.disabled = false;
        enableLink(link);
      } else {
        // locked
        cell.classList.add("locked");
        checkbox.disabled = true;
        disableLink(link);
      }
    });
  }

  /* ---------- FETCH PROGRESS FROM API ---------- */
  async function fetchProgress() {
    try {
      const res = await fetch("/hashing/progress");
      if (!res.ok) throw new Error("Failed to fetch hashing progress");

      const solvedIndices = await res.json(); // expect array of solved problem indices
      initRows(solvedIndices);
    } catch (err) {
      console.error("Progress fetch error:", err);
      initRows([]); // fallback: no solved problems
    }
  }

  /* ---------- SUBMIT SOLUTION TO API ---------- */
  async function submitProgress(index) {
    try {
      const res = await fetch("/hashing/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "hashing", problem: index }),
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    }
  }

  /* ---------- MODAL HANDLING ---------- */
  rows.forEach((row, idx) => {
    const cell = row.querySelector(".array-cell");
    const checkbox = cell.querySelector(".problem-check");

    checkbox.addEventListener("change", (e) => {
      e.preventDefault();

      if (cell.classList.contains("locked") || cell.classList.contains("solved")) {
        checkbox.checked = cell.classList.contains("solved");
        return;
      }

      pendingIndex = idx;
      modal.classList.remove("hidden");
    });
  });

  /* ---------- CONFIRM YES ---------- */
  confirmYes.addEventListener("click", async () => {
    if (pendingIndex === null) return;

    const row = rows[pendingIndex];
    const cell = row.querySelector(".array-cell");
    const checkbox = cell.querySelector(".problem-check");
    const link = cell.querySelector("a");

    // mark solved
    cell.classList.add("solved");
    checkbox.checked = true;
    checkbox.disabled = true;
    disableLink(link);

    // unlock next
    unlockNext(pendingIndex);

    // update backend
    await submitProgress(pendingIndex);

    modal.classList.add("hidden");
    pendingIndex = null;
  });

  /* ---------- CONFIRM NO ---------- */
  confirmNo.addEventListener("click", () => {
    if (pendingIndex !== null) {
      const checkbox = rows[pendingIndex].querySelector(".problem-check");
      checkbox.checked = false;
    }
    modal.classList.add("hidden");
    pendingIndex = null;
  });

  /* ---------- INITIALIZE ON LOAD ---------- */
  await fetchProgress();
});
