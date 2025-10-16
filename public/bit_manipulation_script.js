document.addEventListener("DOMContentLoaded", async () => {
  const problemCells = document.querySelectorAll(".array-cell");
  const modal = document.getElementById("confirm-modal");
  const yesBtn = document.getElementById("confirm-yes");
  const noBtn = document.getElementById("confirm-no");
  const toggleBtn = document.getElementById("toggle-btn");

  let currentCheckbox = null;

  // ===== Helper: Update locked/unlocked/solved states =====
  function updateProblemStates() {
    problemCells.forEach(cell => {
      const bitValueEl = cell.querySelector(".bit-value");
      const checkbox = cell.querySelector(".problem-check");
      const problemLink = cell.querySelector("a");
      const bit = bitValueEl.textContent.trim();

      bitValueEl.setAttribute("data-bit", bit);

      // Reset all classes before applying
      cell.classList.remove("locked", "solved");
      problemLink.classList.remove("disabled-link");

      if (cell.dataset.state === "solved") {
        // ✅ Solved problems
        cell.classList.add("solved");
        checkbox.classList.remove("hidden");
        checkbox.checked = true;
        checkbox.disabled = true;
        problemLink.classList.add("disabled-link");
      } else if (bit === "0") {
        // Locked
        cell.classList.add("locked");
        checkbox.classList.add("hidden");
        checkbox.checked = false;
        checkbox.disabled = false;
        problemLink.classList.add("disabled-link");
      } else {
        // Unlocked
        cell.classList.remove("locked");
        checkbox.classList.remove("hidden");
        checkbox.classList.add("visible");
        checkbox.checked = false;
        checkbox.disabled = false;
      }
    });
  }

  // ===== Fetch Progress from API =====
  async function fetchProgress() {
    try {
      const res = await fetch("/bit-manipulation/progress");
      if (!res.ok) throw new Error("Failed to fetch bit progress");

      const solvedIndices = await res.json(); // expect array of solved problem indices

      // Mark solved cells
      solvedIndices.forEach(idx => {
        const cell = problemCells[idx];
        if (cell) {
          cell.dataset.state = "solved";
        }
      });

      // If no solved problems, unlock first (0th) problem
      if (solvedIndices.length === 0 && problemCells[0]) {
        problemCells[0].querySelector(".bit-value").textContent = "1";
      }

      updateProblemStates();
    } catch (err) {
      console.error("Progress fetch error:", err);
      // fallback: unlock start problem
      if (problemCells[0]) {
        problemCells[0].querySelector(".bit-value").textContent = "1";
      }
      updateProblemStates();
    }
  }

  // ===== Submit Progress to API =====
  async function submitProgress(index) {
    try {
      const res = await fetch("/bit-manipulation/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "bit-manipulation", problem: index }),
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    }
  }

  // ===== Modal Logic =====
  problemCells.forEach((cell, index) => {
    const checkbox = cell.querySelector(".problem-check");

    checkbox.addEventListener("change", () => {
      if (checkbox.checked && cell.dataset.state !== "solved") {
        currentCheckbox = { checkbox, index, cell };
        modal.classList.remove("hidden"); // show modal
      }
    });
  });

  // Confirm YES → mark solved + submit
  yesBtn.addEventListener("click", async () => {
    if (currentCheckbox) {
      const { checkbox, cell, index } = currentCheckbox;

      // Mark solved visually
      cell.dataset.state = "solved";
      cell.classList.add("solved");
      checkbox.checked = true;
      checkbox.disabled = true;
      modal.classList.add("hidden");
      currentCheckbox = null;

      updateProblemStates();
      await submitProgress(index);
    }
  });

  // Confirm NO → revert
  noBtn.addEventListener("click", () => {
    if (currentCheckbox) {
      currentCheckbox.checkbox.checked = false;
    }
    modal.classList.add("hidden");
    currentCheckbox = null;
  });

  // ===== Toggle Button → flip all bits =====
  toggleBtn.addEventListener("click", () => {
    problemCells.forEach(cell => {
      const bitValueEl = cell.querySelector(".bit-value");
      const currentBit = bitValueEl.textContent.trim();
      bitValueEl.textContent = currentBit === "1" ? "0" : "1";
    });
    updateProblemStates();
  });

  // ===== Initial Load =====
  await fetchProgress();
});
