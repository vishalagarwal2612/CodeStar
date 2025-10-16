// dsu_script.js — DSU Visualization with API Integration & Authorization

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("graphContainer");
  const edgesSvg = document.getElementById("graph-edges");
  const nodes = Array.from(document.querySelectorAll(".graph-node"));

  // Predefined scattered positions
  const positions = {
    0: [250, 80],
    1: [100, 200],
    2: [400, 200],
    3: [150, 350],
    4: [350, 350],
    5: [250, 500]
  };

  // DSU parent array
  let parent = Array.from({ length: 6 }, (_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (x, y) => {
    let px = find(x), py = find(y);
    if (px !== py) parent[py] = px;
  };

  // Place nodes
  nodes.forEach((node, i) => {
    const [x, y] = positions[i];
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.dataset.state = "locked"; // locked | unlocked | solved
  });

  // Modal elements
  const modal = document.getElementById("confirm-modal");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");
  let pendingNode = null;

  // Helper: update styles dynamically
  function updateStyles() {
    nodes.forEach(node => {
      node.classList.remove("locked", "unlocked", "solved");
      node.classList.add(node.dataset.state);

      const checkbox = node.querySelector(".problem-check");
      if (checkbox) {
        if (node.dataset.state === "solved") {
          checkbox.checked = true;
          checkbox.disabled = true;
        } else if (node.dataset.state === "unlocked") {
          checkbox.checked = false;
          checkbox.disabled = false;
        } else {
          checkbox.checked = false;
          checkbox.disabled = true;
        }
      }
    });
  }

  // Draw edge between two nodes
  function drawEdge(from, to, color = "#333") {
    const [x1, y1] = positions[from];
    const [x2, y2] = positions[to];
    const nodeFrom = nodes[from];
    const nodeTo = nodes[to];

    const centerX1 = x1 + nodeFrom.offsetWidth / 2;
    const centerY1 = y1 + nodeFrom.offsetHeight / 2;
    const centerX2 = x2 + nodeTo.offsetWidth / 2;
    const centerY2 = y2 + nodeTo.offsetHeight / 2;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", centerX1);
    line.setAttribute("y1", centerY1);
    line.setAttribute("x2", centerX2);
    line.setAttribute("y2", centerY2);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "2");
    edgesSvg.appendChild(line);
  }

  // Fetch progress from API
  async function fetchProgress() {
    try {
      const res = await fetch("/disjoint-set-union/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      const solvedIndices = await res.json(); // expect array of solved problem indices

      solvedIndices.forEach(idx => {
        if (nodes[idx]) nodes[idx].dataset.state = "solved";
      });

      // Unlock next unsolved node in sequence
      for (let i = 0; i < nodes.length - 1; i++) {
        if (nodes[i].dataset.state === "solved" && nodes[i + 1].dataset.state === "locked") {
          nodes[i + 1].dataset.state = "unlocked";
        }
      }

      // If no node solved, unlock first
      if (solvedIndices.length === 0) nodes[0].dataset.state = "unlocked";

      updateStyles();

      // Draw already solved edges
      solvedIndices.forEach(idx => {
        if (idx > 0) {
          union(0, idx);
          drawEdge(0, idx, "#4ade80"); // green for solved
        }
      });

    } catch (err) {
      console.error("Progress fetch error:", err);
      nodes[0].dataset.state = "unlocked"; // fallback
      updateStyles();
    }
  }

  // Initial fetch
  await fetchProgress();

  // Node click — open confirmation modal
  nodes.forEach(node => {
    node.addEventListener("click", () => {
      if (node.dataset.state !== "unlocked") return;
      pendingNode = node;
      modal.classList.remove("hidden");
    });
  });

  // Confirm YES — submit to API and update progress
  confirmYes.addEventListener("click", async () => {
    if (pendingNode) {
      const idx = +pendingNode.dataset.index;
      confirmYes.disabled = true;

      try {
        const res = await fetch("/disjoint-set-union/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: "disjoint-set-union", problem: idx })
        });

        if (!res.ok) throw new Error("Failed to submit");

        pendingNode.dataset.state = "solved";
        if (idx + 1 < nodes.length && nodes[idx + 1].dataset.state === "locked") {
          nodes[idx + 1].dataset.state = "unlocked";
        }

        // DSU union and edge draw
        if (idx > 0) {
          union(0, idx);
          drawEdge(0, idx, "#4ade80"); // green line for solved
        }

        updateStyles();
      } catch (err) {
        console.error("Submit error:", err);
        alert("Failed to submit progress. Please try again.");
      } finally {
        confirmYes.disabled = false;
      }

      pendingNode = null;
      modal.classList.add("hidden");
    }
  });

  // Confirm NO — cancel
  confirmNo.addEventListener("click", () => {
    pendingNode = null;
    modal.classList.add("hidden");
  });
});
