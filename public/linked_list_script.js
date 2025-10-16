// linked_list_script.js
document.addEventListener("DOMContentLoaded", async () => {
  const nodes = document.querySelectorAll(".list-node");
  const modal = document.getElementById("confirm-modal");
  const yesBtn = document.getElementById("confirm-yes");
  const noBtn = document.getElementById("confirm-no");
  const svg = document.getElementById("list-edges");

  let currentCheckbox = null;

  // ========== EDGE DRAWING ==========
  function drawEdges() {
    svg.innerHTML = `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7"
          refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
        </marker>
      </defs>
    `;

    const svgRect = svg.getBoundingClientRect();

    nodes.forEach((node, i) => {
      if (i < nodes.length - 1) {
        const rect1 = node.getBoundingClientRect();
        const rect2 = nodes[i + 1].getBoundingClientRect();

        const x1 = rect1.right - svgRect.left;
        const y1 = rect1.top + rect1.height / 2 - svgRect.top;
        const x2 = rect2.left - svgRect.left;
        const y2 = rect2.top + rect2.height / 2 - svgRect.top;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "#64748b");
        line.setAttribute("stroke-width", "2.5");
        line.setAttribute("marker-end", "url(#arrowhead)");

        svg.appendChild(line);
      }
    });
  }

  window.addEventListener("load", drawEdges);
  window.addEventListener("resize", drawEdges);

  // ========== HELPERS ==========
  function disableNode(node) {
    const cb = node.querySelector(".problem-check");
    const link = node.querySelector("a");
    cb.disabled = true;
    if (link) {
      link.style.pointerEvents = "none";
      link.style.color = "#9ca3af";
      link.style.cursor = "default";
    }
  }

  function enableNode(node) {
    const cb = node.querySelector(".problem-check");
    const link = node.querySelector("a");
    cb.disabled = false;
    if (link) {
      link.style.pointerEvents = "auto";
      link.style.color = "#e2e8f0";
      link.style.cursor = "pointer";
    }
  }

  function unlockNext(index) {
    if (index + 1 >= nodes.length) return;
    const nextNode = nodes[index + 1];
    nextNode.classList.remove("locked");
    enableNode(nextNode);
    // subtle highlight animation
    nextNode.classList.add("just-unlocked");
    setTimeout(() => nextNode.classList.remove("just-unlocked"), 800);
  }

  // ========== FETCH PROGRESS ==========
  async function fetchProgress() {
    try {
      const res = await fetch("/linked-list/progress");
      if (!res.ok) throw new Error("Failed to fetch linked list progress");

      const solvedIndices = await res.json(); // expect array of solved node indices
      initNodes(solvedIndices);
    } catch (err) {
      console.error("Progress fetch error:", err);
      initNodes([]); // fallback
    }
  }

  // ========== SUBMIT PROGRESS ==========
  async function submitProgress(index) {
    try {
      const res = await fetch("/linked-list/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "linked-list", problem: index }),
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    }
  }

  // ========== INITIALIZE NODES ==========
  function initNodes(solvedIndices = []) {
    nodes.forEach((node, idx) => {
      const cb = node.querySelector(".problem-check");

      if (solvedIndices.includes(idx)) {
        // already solved
        node.classList.add("solved");
        cb.checked = true;
        disableNode(node);
      } else if (idx === 0 || solvedIndices.includes(idx - 1)) {
        // unlocked (first or next of solved)
        node.classList.remove("locked");
        enableNode(node);
      } else {
        // locked
        node.classList.add("locked");
        disableNode(node);
      }
    });
  }

  // ========== MODAL LOGIC ==========
  nodes.forEach((node, idx) => {
    const cb = node.querySelector(".problem-check");
    cb.dataset.index = idx;

    cb.addEventListener("change", (e) => {
      e.preventDefault();
      if (node.classList.contains("locked") || node.classList.contains("solved")) {
        cb.checked = node.classList.contains("solved");
        return;
      }
      currentCheckbox = cb;
      modal.classList.remove("hidden");
    });
  });

  yesBtn.addEventListener("click", async () => {
    if (!currentCheckbox) return;
    const index = parseInt(currentCheckbox.dataset.index);

    // mark as solved
    nodes[index].classList.add("solved");
    currentCheckbox.checked = true;
    disableNode(nodes[index]);

    // unlock next
    unlockNext(index);

    // update backend
    await submitProgress(index);

    modal.classList.add("hidden");
    currentCheckbox = null;
  });

  noBtn.addEventListener("click", () => {
    if (currentCheckbox) {
      currentCheckbox.checked = false;
      currentCheckbox = null;
    }
    modal.classList.add("hidden");
  });

  // ========== INITIAL LOAD ==========
  await fetchProgress();
});
