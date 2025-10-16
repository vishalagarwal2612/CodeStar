// string_script.js

document.addEventListener("DOMContentLoaded", async () => {
  const problemChecks = Array.from(document.querySelectorAll(".problem-check"));
  const modal = document.getElementById("confirm-modal");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");
  const modalMessage = document.getElementById("modal-message");

  let pendingIndex = null;

  /* ---------- HELPERS ---------- */
  function disableCell(cell) {
    const checkbox = cell.querySelector(".problem-check");
    const link = cell.querySelector("a");
    checkbox.disabled = true;
    if (link) {
      link.style.pointerEvents = "none";
      link.style.opacity = "0.6";
      link.style.cursor = "default";
    }
  }

  function enableCell(cell) {
    const checkbox = cell.querySelector(".problem-check");
    const link = cell.querySelector("a");
    checkbox.disabled = false;
    if (link) {
      link.style.pointerEvents = "auto";
      link.style.opacity = "1";
      link.style.cursor = "pointer";
    }
  }

  function updateEnabled() {
    let firstUnsolved = problemChecks.findIndex(chk => !chk.checked);
    problemChecks.forEach((chk, i) => {
      const cell = chk.closest(".array-cell");
      if (i === firstUnsolved) {
        chk.disabled = false;
        cell.classList.remove("locked");
        enableCell(cell);
      } else {
        if (!chk.checked) {
          chk.disabled = true;
          cell.classList.add("locked");
          disableCell(cell);
        }
      }
    });
  }

  /* ---------- FETCH USER PROGRESS ---------- */
  async function fetchProgress() {
    try {
      const res = await fetch("/mathematics/progress");
      if (!res.ok) throw new Error("Failed to fetch string progress");
      const solvedIndices = await res.json(); // expects array of 0-based indices
      initGrid(solvedIndices);
    } catch (err) {
      console.error("Progress fetch error:", err);
      initGrid([]);
    }
  }

  /* ---------- SUBMIT PROGRESS ---------- */
  async function submitProgress(index) {
    try {
      const res = await fetch("/mathematics/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "mathematics", problem: index }),
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    }
  }

  /* ---------- INITIALIZE GRID ---------- */
  function initGrid(solvedIndices = []) {
    problemChecks.forEach((chk, i) => {
      const cell = chk.closest(".array-cell");
      const link = cell.querySelector("a");

      if (solvedIndices.includes(i)) {
        cell.classList.add("solved");
        chk.checked = true;
        disableCell(cell);
      } else {
        cell.classList.remove("solved");
      }
    });
    updateEnabled();
  }

  /* ---------- MODAL LOGIC ---------- */
  problemChecks.forEach((chk, i) => {
    chk.dataset.index = i;
    chk.addEventListener("change", (e) => {
      if (!chk.checked) return;
      if (chk.disabled) return;
      pendingIndex = i;
      modalMessage.textContent = "Mark this problem as solved?";
      modal.classList.remove("hidden");
    });
  });

  confirmYes.addEventListener("click", async () => {
    if (pendingIndex === null) return;

    const chk = problemChecks[pendingIndex];
    const cell = chk.closest(".array-cell");

    chk.checked = true;
    disableCell(cell);
    cell.classList.add("solved");

    // submit to backend
    await submitProgress(pendingIndex);

    updateEnabled();
    modal.classList.add("hidden");
    pendingIndex = null;
  });

  confirmNo.addEventListener("click", () => {
    if (pendingIndex !== null) problemChecks[pendingIndex].checked = false;
    modal.classList.add("hidden");
    pendingIndex = null;
  });

  /* ---------- INITIAL LOAD ---------- */
  await fetchProgress();
});
