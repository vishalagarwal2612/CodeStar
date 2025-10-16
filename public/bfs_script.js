// Graph edges (adjacency)
const edges = [
  [0,1],[0,2],[1,2],[1,3],[2,4],[3,5],[4,5]
];

// Predefined positions (px from top-left of container)
const positions = {
  0: [200, 50],
  1: [80, 170],
  2: [320, 170],
  3: [80, 300],
  4: [320, 300],
  5: [200, 430]
};

window.addEventListener("DOMContentLoaded", async () => {
  const nodes = Array.from(document.querySelectorAll(".graph-node"));
  const svg = document.getElementById("graph-edges");
  const container = document.getElementById("graphContainer");

  const modal = document.getElementById("confirm-modal");
  const yesBtn = document.getElementById("confirm-yes");
  const noBtn = document.getElementById("confirm-no");

  let pendingNode = null; // store node awaiting confirmation

  // Build adjacency list
  const adj = {};
  edges.forEach(([u, v]) => {
    if (!adj[u]) adj[u] = [];
    if (!adj[v]) adj[v] = [];
    adj[u].push(v);
    adj[v].push(u);
  });

  // Set SVG size to container
  svg.setAttribute("width", container.offsetWidth);
  svg.setAttribute("height", container.offsetHeight);

  // Position nodes
  nodes.forEach(node => {
    const idx = +node.dataset.index;
    node.style.left = positions[idx][0] + "px";
    node.style.top = positions[idx][1] + "px";
    node.dataset.state = "locked"; // locked | unlocked | solved
  });

  // Draw edges
  edges.forEach(([u, v]) => {
    const [x1, y1] = positions[u];
    const [x2, y2] = positions[v];
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1 + 55);  // center correction
    line.setAttribute("y1", y1 + 55);
    line.setAttribute("x2", x2 + 55);
    line.setAttribute("y2", y2 + 55);
    line.dataset.u = u;
    line.dataset.v = v;
    line.classList.add("locked");
    svg.appendChild(line);
  });

  // Helper: update node/edge styling
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

  // Fetch progress from API
  async function fetchProgress() {
    try {
      const res = await fetch("/bfs/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      const solvedIndices = await res.json(); // expect array of solved problem indices

      // Mark solved nodes
      solvedIndices.forEach(idx => {
        if (nodes[idx]) {
          nodes[idx].dataset.state = "solved";
        }
      });

      // Unlock neighbors of solved nodes
      solvedIndices.forEach(idx => {
        adj[idx].forEach(neigh => {
          if (nodes[neigh].dataset.state === "locked") {
            nodes[neigh].dataset.state = "unlocked";
          }
        });
      });

      // If no nodes solved, unlock start node (0)
      if (solvedIndices.length === 0) nodes[0].dataset.state = "unlocked";

      updateStyles();
    } catch (err) {
      console.error("Progress fetch error:", err);
      // fallback: unlock start node
      nodes[0].dataset.state = "unlocked";
      updateStyles();
    }
  }

  // Initial fetch
  await fetchProgress();

  // Node click → ask confirmation
  nodes.forEach(node => {
    node.addEventListener("click", () => {
      if (node.dataset.state !== "unlocked") return; // only unlocked nodes
      pendingNode = node; // store node waiting confirmation
      modal.classList.remove("hidden");
    });
  });

  // Confirm YES → call API, solve node, unlock neighbors
  yesBtn.addEventListener("click", async () => {
    if (pendingNode) {
      const idx = +pendingNode.dataset.index;
      yesBtn.disabled = true;

      try {
        const res = await fetch("/bfs/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: "bfs", problem: idx })
        });

        if (!res.ok) throw new Error("Failed to submit");

        pendingNode.dataset.state = "solved";
        adj[idx].forEach(neigh => {
          if (nodes[neigh].dataset.state === "locked") {
            nodes[neigh].dataset.state = "unlocked";
          }
        });

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
