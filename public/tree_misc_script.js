// Graph edges (adjacency)
const edges = [
  [0,1],[0,2],[1,3],[1,4],[1,5]
];

// Predefined positions (px from top-left of container)
const positions = {
  0: [200, 50],
  1: [80, 170],
  2: [320, 170],
  3: [-40, 350],
  4: [80, 350],
  5: [200, 350]
};

window.addEventListener("DOMContentLoaded", async () => {
  const nodes = Array.from(document.querySelectorAll(".graph-node"));
  const svg = document.getElementById("graph-edges");
  const container = document.getElementById("graphContainer");

  const modal = document.getElementById("confirm-modal");
  const yesBtn = document.getElementById("confirm-yes");
  const noBtn = document.getElementById("confirm-no");

  let pendingNode = null;

  // Build adjacency list
  const adj = {};
  edges.forEach(([u, v]) => {
    if (!adj[u]) adj[u] = [];
    if (!adj[v]) adj[v] = [];
    adj[u].push(v);
    adj[v].push(u);
  });

  // Set SVG size
  svg.setAttribute("width", container.offsetWidth);
  svg.setAttribute("height", container.offsetHeight);

  // Position nodes
  nodes.forEach(node => {
    const idx = +node.dataset.index;
    node.style.left = positions[idx][0] + "px";
    node.style.top = positions[idx][1] + "px";
    node.dataset.state = "locked";
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

  // Update node/edge styles
  function updateStyles() {
    nodes.forEach(node => {
      node.classList.remove("locked","unlocked","solved");
      node.classList.add(node.dataset.state);
    });
    svg.querySelectorAll("line").forEach(line => {
      const u = +line.dataset.u;
      const v = +line.dataset.v;
      const stateU = nodes[u].dataset.state;
      const stateV = nodes[v].dataset.state;

      line.classList.remove("locked","unlocked","solved");
      if (stateU === "solved" && stateV === "solved") {
        line.classList.add("solved");
      } else if (stateU !== "locked" && stateV !== "locked") {
        line.classList.add("unlocked");
      } else {
        line.classList.add("locked");
      }
    });
  }

  // Fetch user progress from backend
  async function fetchProgress() {
  try {
    const res = await fetch("/tree-misc/progress");
    if (!res.ok) throw new Error("Failed to fetch progress");
    const solvedIndices = await res.json(); // array of solved node indices

    // Apply solved state
    solvedIndices.forEach(idx => {
      if (nodes[idx]) {
        nodes[idx].dataset.state = "solved";

        // Sync checkbox
        const cb = nodes[idx].querySelector(".problem-check");
        if (cb) {
          cb.checked = true;
          cb.disabled = true;
        }
      }
    });

    // Unlock neighbors of solved nodes
    solvedIndices.forEach(idx => {
      adj[idx].forEach(neigh => {
        if (nodes[neigh].dataset.state === "locked") {
          nodes[neigh].dataset.state = "unlocked";

          // Unlock checkbox too
          const cb = nodes[neigh].querySelector(".problem-check");
          if (cb) cb.disabled = false;
        }
      });
    });

    // Unlock start node if nothing solved
    if (solvedIndices.length === 0) {
      nodes[0].dataset.state = "unlocked";
      const cb = nodes[0].querySelector(".problem-check");
      if (cb) cb.disabled = false;
    }

    updateStyles();
  } catch (err) {
    console.error("Progress fetch error:", err);
    nodes[0].dataset.state = "unlocked";
    const cb = nodes[0].querySelector(".problem-check");
    if (cb) cb.disabled = false;
    updateStyles();
  }
}


  // Submit solved node to backend
  async function submitSolved(idx) {
    try {
      const res = await fetch("/tree-misc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "tree-misc", problem: idx })
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    }
  }

  // Node click → show modal
  nodes.forEach(node => {
    node.addEventListener("click", () => {
      if (node.dataset.state !== "unlocked") return;
      pendingNode = node;
      modal.classList.remove("hidden");
    });
  });

  // Modal YES → solve node + unlock neighbors
  yesBtn.addEventListener("click", async () => {
    if (!pendingNode) return;
    const idx = +pendingNode.dataset.index;
    pendingNode.dataset.state = "solved";
    const cb = pendingNode.querySelector(".problem-check");
  if (cb) {
    cb.checked = true;
    cb.disabled = true; // makes it grey with tick
  }
    await submitSolved(idx);

    // Unlock neighbors
    adj[idx].forEach(neigh => {
      if (nodes[neigh].dataset.state === "locked") nodes[neigh].dataset.state = "unlocked";
    });

    updateStyles();
    pendingNode = null;
    modal.classList.add("hidden");
  });

  // Modal NO → cancel
  noBtn.addEventListener("click", () => {
    pendingNode = null;
    modal.classList.add("hidden");
  });

  // Initial fetch
  await fetchProgress();
});
