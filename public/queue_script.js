document.addEventListener("DOMContentLoaded", async () => {
  const problemCells = document.querySelectorAll("#problemRow .array-cell");
  const queueRow = document.getElementById("stackRow"); // same container as stackRow
  const modal = document.getElementById("confirm-modal");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");

  let pendingFrontCheckbox = null;

  // === Unlock front queue cell ===
  function unlockFrontQueueCell() {
    const queueCells = queueRow.querySelectorAll(".stack-cell");
    queueCells.forEach((cell, index) => {
      const checkbox = cell.querySelector(".problem-check");
      if (index === 0) {
        cell.classList.remove("locked");
        checkbox.disabled = false;

        // Add click listener for confirmation
        checkbox.addEventListener("change", () => {
          pendingFrontCheckbox = checkbox;
          modal.classList.remove("hidden");
        });
      } else {
        cell.classList.add("locked");
        checkbox.disabled = true;
      }
    });
  }

  // === Add problem to queue ===
  problemCells.forEach(cell => {
    const pushBtn = cell.querySelector(".push-btn");

    pushBtn.addEventListener("click", async () => {
      pushBtn.disabled = true;
      pushBtn.classList.add("disabled-push");

      // Remove placeholder
      const empty = queueRow.querySelector(".stack-empty");
      if (empty) empty.remove();

      // Create queue cell
      const queueCell = document.createElement("div");
      queueCell.classList.add("stack-cell", "array-cell", "locked");
      queueCell.style.marginBottom = "10px";

      // Problem info
      const problemInfo = document.createElement("div");
      problemInfo.classList.add("problem-info");
      const link = cell.querySelector(".problem-info a");
      problemInfo.innerHTML = `<a href="${link.href}" target="_blank">${link.textContent}</a>`;
      queueCell.appendChild(problemInfo);

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("problem-check");
      queueCell.appendChild(checkbox);

      queueRow.appendChild(queueCell);

      unlockFrontQueueCell();

      // Save pushed problem in backend
      try {
        await fetch("/queue/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: "queue", problem: Array.from(problemCells).indexOf(cell) })
        });
      } catch (err) {
        console.error("Queue push API error:", err);
      }
    });
  });

  // === Confirm YES handler ===
  confirmYes.addEventListener("click", async () => {
    if (!pendingFrontCheckbox) return;

    const frontCell = pendingFrontCheckbox.closest(".stack-cell");
    const problemTitle = frontCell.querySelector(".problem-info a").textContent;

    // Find corresponding array cell
    const arrayCell = Array.from(problemCells).find(cell => {
      return cell.querySelector(".problem-info a").textContent === problemTitle;
    });

    if (!arrayCell) return;

    confirmYes.disabled = true;
    const problemIndex = Array.from(problemCells).indexOf(arrayCell);

    try {
      // Submit solved problem to backend
      const res = await fetch("/queue/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "queue", problem: problemIndex })
      });
      if (!res.ok) throw new Error("Submit failed");

      // Mark solved visually
      arrayCell.classList.add("solved");
      const pushBtn = arrayCell.querySelector(".push-btn");
      pushBtn.disabled = true;
      pushBtn.classList.add("disabled-push");

      frontCell.classList.add("solved");
      pendingFrontCheckbox.checked = true;
      pendingFrontCheckbox.disabled = true;

      // Remove front queue cell
      frontCell.remove();
      pendingFrontCheckbox = null;
      modal.classList.add("hidden");

      unlockFrontQueueCell();

      // Show placeholder if queue empty
      if (queueRow.children.length === 0) {
        const empty = document.createElement("div");
        empty.classList.add("stack-empty");
        empty.textContent = "Queue is empty";
        queueRow.appendChild(empty);
      }
    } catch (err) {
      console.error("Queue submit error:", err);
      alert("Failed to submit progress. Please try again.");
    } finally {
      confirmYes.disabled = false;
    }
  });

  // === Confirm NO handler ===
  confirmNo.addEventListener("click", () => {
    if (pendingFrontCheckbox) {
      pendingFrontCheckbox.checked = false;
      pendingFrontCheckbox = null;
    }
    modal.classList.add("hidden");
  });

  // === Restore progress from backend ===
  async function fetchProgress() {
    try {
      const [solvedRes] = await Promise.all([
        fetch("/queue/progress")
      ]);
      if (!solvedRes.ok) throw new Error("Failed to fetch progress");

      const solvedIndices = await solvedRes.json(); // solved problem indices


      // Mark solved problems
      solvedIndices.forEach(idx => {
        if (problemCells[idx]) {
          problemCells[idx].classList.add("solved");
          const pushBtn = problemCells[idx].querySelector(".push-btn");
          pushBtn.disabled = true;
          pushBtn.classList.add("disabled-push");
        }
      });

      // Rebuild queue
      pushedIndices.forEach(idx => {
        const cell = problemCells[idx];
        if (!cell.classList.contains("solved")) {
          const queueCell = document.createElement("div");
          queueCell.classList.add("stack-cell", "array-cell", "locked");
          queueCell.style.marginBottom = "10px";

          const problemInfo = document.createElement("div");
          problemInfo.classList.add("problem-info");
          const link = cell.querySelector(".problem-info a");
          problemInfo.innerHTML = `<a href="${link.href}" target="_blank">${link.textContent}</a>`;
          queueCell.appendChild(problemInfo);

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.classList.add("problem-check");
          queueCell.appendChild(checkbox);

          queueRow.appendChild(queueCell);
        }
      });

      unlockFrontQueueCell();

      // Placeholder if queue empty
      if (queueRow.children.length === 0) {
        const empty = document.createElement("div");
        empty.classList.add("stack-empty");
        empty.textContent = "Queue is empty";
        queueRow.appendChild(empty);
      }
    } catch (err) {
      console.error("Queue fetch progress error:", err);
    }
  }

  // === Init ===
  await fetchProgress();
});
