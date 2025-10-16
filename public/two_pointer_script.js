document.addEventListener("DOMContentLoaded", async () => {
  const modal = document.getElementById("confirm-modal");
  const yesBtn = document.getElementById("confirm-yes");
  const noBtn  = document.getElementById("confirm-no");

  const cells = Array.from(document.querySelectorAll(".array-cell"));
  const checks = Array.from(document.querySelectorAll(".problem-check"));
  const pointerBoxes = Array.from(document.querySelectorAll(".pointer-box"));

  let left = 0;
  let right = checks.length - 1;
  let pendingIndex = null;

  // --- Fetch progress from backend ---
  async function fetchProgress() {
    try {
      const res = await fetch("/two-pointer/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      const solvedIndices = await res.json(); // array of solved problem indices

      // Mark solved cells
      solvedIndices.forEach(idx => {
        if (cells[idx]) {
          cells[idx].classList.add("solved");
          checks[idx].checked = true;
          checks[idx].disabled = true;
        }
      });

      // Move pointers inward based on solved cells
      while (left < checks.length && cells[left].classList.contains("solved")) left++;
      while (right >= 0 && cells[right].classList.contains("solved")) right--;

      updateEnabled();
      renderPointers();
    } catch (err) {
      console.error("Progress fetch error:", err);
      // fallback → initial render
      updateEnabled();
      renderPointers();
    }
  }

  // --- Helper: update checkboxes and locked state ---
  function updateEnabled() {
    checks.forEach((chk, i) => {
      if (cells[i].classList.contains("solved")) {
        chk.disabled = true;
        cells[i].classList.remove("locked");
        return;
      }
      const isEdge = (i === left || i === right);
      chk.disabled = !isEdge;
      cells[i].classList.toggle("locked", !isEdge);
    });
  }

  // --- Render pointer visuals ---
  function renderPointers() {
    if (left > right) {
      pointerBoxes.forEach(box => (box.innerHTML = ""));
      return;
    }

    pointerBoxes.forEach((box, i) => {
      box.innerHTML = "";
      if (i === left)  box.innerHTML += `<div class="ptr ptr-l">L<span>↓</span></div>`;
      if (i === right) box.innerHTML += `<div class="ptr ptr-r">R<span>↓</span></div>`;
    });
  }

  // --- When a problem is solved ---
  async function solveProblem(idx) {
    cells[idx].classList.add("solved");
    checks[idx].disabled = true;
    checks[idx].checked = true;

    // Move pointers inward
    if (idx === left && left < right) left++;
    else if (idx === right && right > left) right--;
    else if (left === right && idx === left) {
      left++;
      right--;
    }

    // Save progress to backend
    try {
      const res = await fetch("/two-pointer/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "two-pointer", problem: idx })
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    }

    updateEnabled();
    renderPointers();
  }

  // --- Initial load ---
  await fetchProgress();

  // --- Click handlers ---
  checks.forEach((chk, i) => {
    chk.addEventListener("change", (e) => {
      if (!e.target.checked) { e.target.checked = false; return; }
      if (i !== left && i !== right) { e.target.checked = false; return; }
      pendingIndex = i;
      modal.classList.remove("hidden");
    });
  });

  // --- Modal confirm YES ---
  yesBtn.addEventListener("click", async () => {
    modal.classList.add("hidden");
    if (pendingIndex != null) await solveProblem(pendingIndex);
    pendingIndex = null;
  });

  // --- Modal confirm NO ---
  noBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    if (pendingIndex != null) checks[pendingIndex].checked = false;
    pendingIndex = null;
  });
});
