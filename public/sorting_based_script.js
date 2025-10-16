// sorting_script.js

document.addEventListener("DOMContentLoaded", async () => {
  const modal = document.getElementById("confirm-modal");
  const yesBtn = document.getElementById("confirm-yes");
  const noBtn  = document.getElementById("confirm-no");

  const cells = Array.from(document.querySelectorAll(".array-cell"));
  const checks = Array.from(document.querySelectorAll(".problem-check"));

  let pendingIndex = null;

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

  function updateEnabled() {
    let firstUnsolved = checks.findIndex(chk => !chk.checked);
    checks.forEach((chk, i) => {
      if (i === firstUnsolved) {
        chk.disabled = false;
        cells[i].classList.remove("locked");
        enableCell(cells[i]);
      } else {
        if (!chk.checked) {
          chk.disabled = true;
          cells[i].classList.add("locked");
          disableCell(cells[i]);
        }
      }
    });
  }

  /* ---------- FETCH USER PROGRESS ---------- */
  async function fetchProgress() {
    try {
      const res = await fetch("/sorting/progress");
      if (!res.ok) throw new Error("Failed to fetch sorting progress");
      const solvedIndices = await res.json(); // expect array of 0-based problem indices
      initGrid(solvedIndices);
    } catch (err) {
      console.error("Progress fetch error:", err);
      initGrid([]); // fallback
    }
  }

  /* ---------- SUBMIT PROGRESS ---------- */
  async function submitProgress(index) {
    try {
      const res = await fetch("/sorting/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "sorting", problem: index }),
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    }
  }

  /* ---------- INITIALIZE GRID ---------- */
  function initGrid(solvedIndices = []) {
    cells.forEach((cell, i) => {
      const checkbox = cell.querySelector(".problem-check");
      if (solvedIndices.includes(i)) {
        cell.classList.add("solved");
        checkbox.checked = true;
        disableCell(cell);
      } else {
        cell.classList.remove("solved");
      }
    });
    updateEnabled();
  }

  /* ---------- MODAL LOGIC ---------- */
  checks.forEach((chk, i) => {
    chk.dataset.index = i;
    chk.addEventListener("change", (e) => {
      if (!chk.checked) return;
      if (chk.disabled) return;
      pendingIndex = i;
      modal.classList.remove("hidden");
    });
  });

  yesBtn.addEventListener("click", async () => {
    if (pendingIndex === null) return;

    const cell = cells[pendingIndex];
    const checkbox = checks[pendingIndex];

    cell.classList.add("solved");
    checkbox.checked = true;
    disableCell(cell);

    // submit to backend
    await submitProgress(pendingIndex);

    updateEnabled();
    modal.classList.add("hidden");
    pendingIndex = null;
  });

  noBtn.addEventListener("click", () => {
    if (pendingIndex !== null) checks[pendingIndex].checked = false;
    modal.classList.add("hidden");
    pendingIndex = null;
  });

  /* ---------- INITIAL LOAD ---------- */
  await fetchProgress();
});
