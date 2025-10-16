// Graph edges (directed)
const edges = [
  [0, 2], [1, 2], [2, 3], [3, 4], [2, 4], [3, 4]
];

// Predefined positions (px from top-left of container)
const positions = {
  0: [200, 50],
  1: [80, 170],
  2: [320, 170],
  3: [80, 300],
  4: [420, 300],
};

window.addEventListener("DOMContentLoaded", async () => {
  const nodes = Array.from(document.querySelectorAll(".graph-node"));
  const svg = document.getElementById("graph-edges");
  const container = document.getElementById("graphContainer");

  const modal = document.getElementById("confirm-modal");
  const yesBtn = document.getElementById("confirm-yes");
  const noBtn = document.getElementById("confirm-no");

  let pendingNode = null; // Node awaiting confirmation

  // Build adjacency and incoming edge lists
  const adj = {}, incoming = {};
  nodes.forEach((_, idx) => {
    adj[idx] = [];
    incoming[idx] = [];
  });

  edges.forEach(([u, v]) => {
    adj[u].push(v);
    incoming[v].push(u);
  });

  // Set SVG size
  svg.setAttribute("width", container.offsetWidth);
  svg.setAttribute("height", container.offsetHeight);

  // Add arrow marker (for directed edges)
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "arrow");
  marker.setAttribute("markerWidth", "6");
  marker.setAttribute("markerHeight", "6");
  marker.setAttribute("refX", "5");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M0,0 L0,6 L6,3 Z");
  path.setAttribute("fill", "#60a5fa");
  marker.appendChild(path);
  defs.appendChild(marker);
  svg.appendChild(defs);

  const nodeRadius = 55; // Half node diameter

  // Position nodes
  nodes.forEach(node => {
    const idx = +node.dataset.index;
    node.style.left = positions[idx][0] + "px";
    node.style.top = positions[idx][1] + "px";
    node.dataset.state = "locked";
  });

  // Draw directed edges
  edges.forEach(([u, v]) => {
    const [x1, y1] = positions[u];
    const [x2, y2] = positions[v];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const startX = x1 + nodeRadius;
    const startY = y1 + nodeRadius;
    const endX = x2 + nodeRadius - (dx / dist) * nodeRadius;
    const endY = y2 + nodeRadius - (dy / dist) * nodeRadius;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", startX);
    line.setAttribute("y1", startY);
    line.setAttribute("x2", endX);
    line.setAttribute("y2", endY);
    line.setAttribute("marker-end", "url(#arrow)");
    line.dataset.u = u;
    line.dataset.v = v;
    line.classList.add("locked");
    svg.appendChild(line);
  });

  // Style updater
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

  // Fetch user progress
  async function fetchProgress() {
    try {
      const res = await fetch("/topological-sort/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      const solvedIndices = await res.json(); // expect array of solved indices

      solvedIndices.forEach(idx => {
        if (nodes[idx]) nodes[idx].dataset.state = "solved";
      });

      // Unlock nodes whose all parents are solved
      nodes.forEach((_, i) => {
        if (nodes[i].dataset.state === "locked") {
          const allSolved = incoming[i].every(p => nodes[p].dataset.state === "solved");
          if (allSolved) nodes[i].dataset.state = "unlocked";
        }
      });

      // If no nodes solved, unlock start nodes (no incoming edges)
      if (solvedIndices.length === 0) {
        nodes.forEach((_, i) => {
          if (incoming[i].length === 0) nodes[i].dataset.state = "unlocked";
        });
      }

      updateStyles();
    } catch (err) {
      console.error("Progress fetch error:", err);
      // fallback: unlock source nodes
      nodes.forEach((_, i) => {
        if (incoming[i].length === 0) nodes[i].dataset.state = "unlocked";
      });
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

  // Confirm YES → submit progress + unlock next nodes
  yesBtn.addEventListener("click", async () => {
    if (pendingNode) {
      const idx = +pendingNode.dataset.index;
      yesBtn.disabled = true;

      try {
        const res = await fetch("/topological-sort/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: "topological-sort", problem: idx })
        });
        if (!res.ok) throw new Error("Failed to submit");

        pendingNode.dataset.state = "solved";

        // Check which nodes can now be unlocked
        nodes.forEach((_, i) => {
          if (nodes[i].dataset.state === "locked") {
            const allSolved = incoming[i].every(p => nodes[p].dataset.state === "solved");
            if (allSolved) nodes[i].dataset.state = "unlocked";
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
