document.addEventListener("DOMContentLoaded", async () => {
  const problemCells = document.querySelectorAll("#problemRow .array-cell");
  const stackRow = document.getElementById("stackRow");
  const modal = document.getElementById("confirm-modal");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");

  let pendingTopCheckbox = null;

  // === Unlock top stack cell ===
  function unlockTopStackCell() {
    const stackCells = stackRow.querySelectorAll(".stack-cell");
    stackCells.forEach((cell, index) => {
      const checkbox = cell.querySelector(".problem-check");
      if (index === stackCells.length - 1) {
        cell.classList.remove("locked");
        checkbox.disabled = false;

        // Add click listener for confirmation
        checkbox.addEventListener("change", () => {
          pendingTopCheckbox = checkbox;
          modal.classList.remove("hidden");
        });
      } else {
        cell.classList.add("locked");
        checkbox.disabled = true;
      }
    });
  }

  // === Add problem to stack ===
  problemCells.forEach(cell => {
    const pushBtn = cell.querySelector(".push-btn");

    pushBtn.addEventListener("click", async () => {
      // Disable push button
      pushBtn.disabled = true;
      pushBtn.classList.add("disabled-push");

      // Remove stack empty placeholder
      const empty = stackRow.querySelector(".stack-empty");
      if (empty) empty.remove();

      // Create stack cell
      const stackCell = document.createElement("div");
      stackCell.classList.add("stack-cell", "array-cell", "locked");
      stackCell.style.marginBottom = "10px";

      // Problem info
      const problemInfo = document.createElement("div");
      problemInfo.classList.add("problem-info");
      const link = cell.querySelector(".problem-info a");
      problemInfo.innerHTML = `<a href="${link.href}" target="_blank">${link.textContent}</a>`;
      stackCell.appendChild(problemInfo);

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("problem-check");
      stackCell.appendChild(checkbox);

      stackRow.appendChild(stackCell);

      unlockTopStackCell();

      // Save stack push progress to backend
      try {
        await fetch("/stack/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: "stack", problem: Array.from(problemCells).indexOf(cell) })
        });
      } catch (err) {
        console.error("Push API error:", err);
      }
    });
  });

  // === Confirm YES handler ===
  confirmYes.addEventListener("click", async () => {
    if (!pendingTopCheckbox) return;

    const topCell = pendingTopCheckbox.closest(".stack-cell");
    const problemTitle = topCell.querySelector(".problem-info a").textContent;

    // Find corresponding array cell
    const arrayCell = Array.from(problemCells).find(cell => {
      return cell.querySelector(".problem-info a").textContent === problemTitle;
    });

    if (!arrayCell) return;

    confirmYes.disabled = true;
    const problemIndex = Array.from(problemCells).indexOf(arrayCell);

    try {
      // Submit solved problem to backend
      const res = await fetch("/stack/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "stack", problem: problemIndex })
      });
      if (!res.ok) throw new Error("Submit failed");

      // Mark solved visually
      arrayCell.classList.add("solved");
      const pushBtn = arrayCell.querySelector(".push-btn");
      pushBtn.disabled = true;
      pushBtn.classList.add("disabled-push");

      topCell.classList.add("solved");
      pendingTopCheckbox.checked = true;
      pendingTopCheckbox.disabled = true;

      // Remove top stack cell
      topCell.remove();
      pendingTopCheckbox = null;
      modal.classList.add("hidden");

      unlockTopStackCell();

      // Show placeholder if stack empty
      if (stackRow.children.length === 0) {
        const empty = document.createElement("div");
        empty.classList.add("stack-empty");
        empty.textContent = "Stack is empty";
        stackRow.appendChild(empty);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    } finally {
      confirmYes.disabled = false;
    }
  });

  // === Confirm NO handler ===
  confirmNo.addEventListener("click", () => {
    if (pendingTopCheckbox) {
      pendingTopCheckbox.checked = false;
      pendingTopCheckbox = null;
    }
    modal.classList.add("hidden");
  });

  // === Restore progress from backend ===
  async function fetchProgress() {
    try {
      const res = await fetch("/stack/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      const solvedIndices = await res.json(); // array of solved problem indices

      // Mark solved problems in array
      solvedIndices.forEach(idx => {
        if (problemCells[idx]) {
          problemCells[idx].classList.add("solved");
          const pushBtn = problemCells[idx].querySelector(".push-btn");
          pushBtn.disabled = true;
          pushBtn.classList.add("disabled-push");
        }
      });

      // Rebuild stack with pushed problems
      pushedIndices.forEach(idx => {
        const cell = problemCells[idx];
        if (cell.classList.contains("solved")) return;

        // Simulate push to stack
        const stackCell = document.createElement("div");
        stackCell.classList.add("stack-cell", "array-cell", "locked");
        stackCell.style.marginBottom = "10px";

        const problemInfo = document.createElement("div");
        problemInfo.classList.add("problem-info");
        const link = cell.querySelector(".problem-info a");
        problemInfo.innerHTML = `<a href="${link.href}" target="_blank">${link.textContent}</a>`;
        stackCell.appendChild(problemInfo);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("problem-check");
        stackCell.appendChild(checkbox);

        stackRow.appendChild(stackCell);
      });

      unlockTopStackCell();

      // Show placeholder if stack empty
      if (stackRow.children.length === 0) {
        const empty = document.createElement("div");
        empty.classList.add("stack-empty");
        empty.textContent = "Stack is empty";
        stackRow.appendChild(empty);
      }
    } catch (err) {
      console.error("Progress fetch error:", err);
    }
  }

  // === Init ===
  await fetchProgress();
});
