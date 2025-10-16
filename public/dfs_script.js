// Graph edges (DFS adjacency)
const edges = [
  [0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [3, 5]
];

// Better spaced positions (x, y)
const positions = {
  0: [250, 40],   // root
  1: [120, 160],  // left branch
  2: [120, 300],  // deeper left
  3: [380, 160],  // right branch
  5: [380, 300],  // right deeper
  4: [520, 220]   // last one
};

// DFS unlock sequence
const dfsOrder = [0, 1, 2, 3, 5, 4];

window.addEventListener("DOMContentLoaded", async () => {
  const nodes = Array.from(document.querySelectorAll(".graph-node"));
  const svg = document.getElementById("graph-edges");
  const container = document.getElementById("graphContainer");

  const modal = document.getElementById("confirm-modal");
  const yesBtn = document.getElementById("confirm-yes");
  const noBtn = document.getElementById("confirm-no");

  let pendingNode = null;
  let currentIndex = 0; // track DFS position

  // Set SVG size
  svg.setAttribute("width", container.offsetWidth);
  svg.setAttribute("height", container.offsetHeight);

  // Position nodes
  nodes.forEach(node => {
    const idx = +node.dataset.index;
    const [x, y] = positions[idx];
    node.style.left = x + "px";
    node.style.top = y + "px";
    node.dataset.state = "locked"; // locked | unlocked | solved
  });

  // Draw edges
  edges.forEach(([u, v]) => {
    const [x1, y1] = positions[u];
    const [x2, y2] = positions[v];
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1 + 55);
    line.setAttribute("y1", y1 + 55);
    line.setAttribute("x2", x2 + 55);
    line.setAttribute("y2", y2 + 55);
    line.dataset.u = u;
    line.dataset.v = v;
    line.classList.add("locked");
    svg.appendChild(line);
  });

  // Helper: update node/edge styles
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

  svg.querySelectorAll("line").forEach(line => {
    const u = +line.dataset.u;
    const v = +line.dataset.v;
    const stateU = nodes[u].dataset.state;
    const stateV = nodes[v].dataset.state;

    line.classList.remove("locked", "unlocked", "solved");
    if (stateU === "solved" && stateV === "solved") {
      line.classList.add("solved");
    } else if (stateU !== "locked" && stateV !== "locked") {
      line.classList.add("unlocked");
    } else {
      line.classList.add("locked");
    }
  });
}

  // Fetch user progress (GET /dfs/progress)
  async function fetchProgress() {
    try {
      const res = await fetch("/dfs/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      const solvedIndices = await res.json(); // expect array of solved node indices

      // Mark solved nodes
      solvedIndices.forEach(idx => {
        if (nodes[idx]) nodes[idx].dataset.state = "solved";
      });

      // Determine current position in DFS order
      currentIndex = solvedIndices.length;

      // Unlock next node if any
      if (currentIndex < dfsOrder.length) {
        const nextNode = dfsOrder[currentIndex];
        nodes[nextNode].dataset.state = "unlocked";
      }

      // If no nodes solved yet, unlock first node
      if (solvedIndices.length === 0) {
        nodes[dfsOrder[0]].dataset.state = "unlocked";
      }

      updateStyles();
    } catch (err) {
      console.error("Progress fetch error:", err);
      // fallback: unlock start node
      nodes[dfsOrder[0]].dataset.state = "unlocked";
      updateStyles();
    }
  }

  // Initial fetch
  await fetchProgress();

  // Node click → ask confirmation
  nodes.forEach(node => {
    node.addEventListener("click", () => {
      if (node.dataset.state !== "unlocked") return;
      pendingNode = node;
      modal.classList.remove("hidden");
    });
  });

  // Confirm YES → call API, solve node, unlock next in DFS
  yesBtn.addEventListener("click", async () => {
    if (pendingNode) {
      const idx = +pendingNode.dataset.index;
      yesBtn.disabled = true;

      try {
        const res = await fetch("/dfs/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: "dfs", problem: idx })
        });

        if (!res.ok) throw new Error("Failed to submit progress");

        pendingNode.dataset.state = "solved";

        // Move DFS forward if it matches sequence
        if (idx === dfsOrder[currentIndex] && currentIndex < dfsOrder.length - 1) {
          currentIndex++;
          const nextNode = dfsOrder[currentIndex];
          if (nodes[nextNode].dataset.state === "locked") {
            nodes[nextNode].dataset.state = "unlocked";
          }
        }

        updateStyles();
      } catch (err) {
        console.error("Submit error:", err);
        alert("Failed to submit progress. Please try again.");
      } finally {
        yesBtn.disabled = false;
      }

      pendingNode = null;
    }
    modal.classList.add("hidden");
  });

  // Confirm NO → cancel
  noBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    pendingNode = null;
  });
});
