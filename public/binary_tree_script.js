// binarytree_script.js — Binary Tree Visualization with API Integration

document.addEventListener("DOMContentLoaded", async () => {
  const nodes = [...document.querySelectorAll(".tree-node")];
  const checks = [...document.querySelectorAll(".problem-check")];
  const modal = document.getElementById("confirm-modal");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");
  const svg = document.getElementById("tree-edges");
  const treeContainer = document.getElementById("treeContainer");

  // parent -> children mapping
  const childrenMap = {
    0: [1, 2],
    1: [3, 4],
    2: [5, 6],
  };

  let pendingIndex = null;

  /* ---------- UTILITIES ---------- */
  function disableAnchor(node) {
    const a = node.querySelector("a");
    if (!a) return;
    a.setAttribute("tabindex", "-1");
    a.addEventListener("click", blockClick, { capture: true });
  }
  function enableAnchor(node) {
    const a = node.querySelector("a");
    if (!a) return;
    a.removeAttribute("tabindex");
    a.removeEventListener("click", blockClick, { capture: true });
  }
  function blockClick(e) {
    const node = e.currentTarget.closest(".tree-node");
    if (node && node.classList.contains("locked")) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  /* ---------- STYLE / STATE HANDLER ---------- */
  function updateStyles() {
    nodes.forEach((node, idx) => {
      const cb = checks[idx];
      node.classList.remove("locked", "unlocked", "solved");

      const state = node.dataset.state || "locked";
      node.classList.add(state);

      if (cb) {
        if (state === "solved") {
          cb.checked = true;
          cb.disabled = true;
          enableAnchor(node);
        } else if (state === "unlocked") {
          cb.checked = false;
          cb.disabled = false;
          enableAnchor(node);
        } else {
          cb.checked = false;
          cb.disabled = true;
          disableAnchor(node);
        }
      }
    });
  }

  /* ---------- UNLOCK HELPERS ---------- */
  function unlockChildrenOf(parentIdx) {
    const children = childrenMap[parentIdx] || [];
    children.forEach((childIdx) => {
      const childNode = nodes[childIdx];
      const childCb = checks[childIdx];
      if (!childNode) return;

      childNode.dataset.state = "unlocked";
      childNode.classList.add("just-unlocked");
      if (childCb) childCb.disabled = false;
      enableAnchor(childNode);

      setTimeout(() => childNode.classList.remove("just-unlocked"), 800);
    });
  }

  function propagateFromSolved() {
    nodes.forEach((node, idx) => {
      if (node.dataset.state === "solved") unlockChildrenOf(idx);
    });
  }

  /* ---------- EDGE DRAWING ---------- */
  function drawEdges() {
    const rect = treeContainer.getBoundingClientRect();
    svg.setAttribute("width", rect.width);
    svg.setAttribute("height", rect.height);
    svg.innerHTML = "";

    function centerOf(idx) {
      const el = nodes[idx];
      if (!el) return { x: 0, y: 0 };
      const rNode = el.getBoundingClientRect();
      return {
        x: rNode.left - rect.left + rNode.width / 2,
        y: rNode.top - rect.top + rNode.height / 2,
      };
    }

    function addLine(p1, p2) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", p1.x);
      line.setAttribute("y1", p1.y);
      line.setAttribute("x2", p2.x);
      line.setAttribute("y2", p2.y);
      line.setAttribute("stroke", "rgba(96,165,250,0.6)");
      line.setAttribute("stroke-width", "2.5");
      line.setAttribute("stroke-linecap", "round");
      svg.appendChild(line);
    }

    const edges = [
      [0, 1], [0, 2],
      [1, 3], [1, 4],
      [2, 5], [2, 6],
    ];
    edges.forEach(([a, b]) => addLine(centerOf(a), centerOf(b)));
  }

  /* ---------- FETCH PROGRESS (API) ---------- */
  async function fetchProgress() {
  try {
    const res = await fetch("/binary-tree/progress");
    if (!res.ok) throw new Error("Failed to fetch progress");
    const solvedIndices = await res.json(); // array of solved indices

    // Step 1: Lock all nodes
    nodes.forEach(node => (node.dataset.state = "locked"));

    // Step 2: If nothing solved yet, unlock root
    if (solvedIndices.length === 0) {
      nodes[0].dataset.state = "unlocked";
      updateStyles();
      return;
    }

    // Step 3: Mark solved nodes
    solvedIndices.forEach(idx => {
      if (nodes[idx]) nodes[idx].dataset.state = "solved";
    });

    // Step 4: Unlock ancestors of solved nodes
    function unlockAncestors(idx) {
      for (const [p, children] of Object.entries(childrenMap)) {
        if (children.includes(idx)) {
          const parentIdx = Number(p);
          const parent = nodes[parentIdx];
          if (parent && parent.dataset.state !== "solved") {
            parent.dataset.state = "unlocked";
            unlockAncestors(parentIdx);
          }
        }
      }
    }

    // Step 5: Unlock *only direct* children of solved nodes
    solvedIndices.forEach(idx => {
      const children = childrenMap[idx] || [];
      children.forEach(childIdx => {
        const child = nodes[childIdx];
        if (child && child.dataset.state !== "solved") {
          child.dataset.state = "unlocked";
        }
      });
      unlockAncestors(idx);
    });

    updateStyles();
  } catch (err) {
    console.error("Progress fetch error:", err);
    nodes.forEach(node => (node.dataset.state = "locked"));
    nodes[0].dataset.state = "unlocked"; // fallback
    updateStyles();
  }
}




  // Initial fetch
  await fetchProgress();
  drawEdges();

  /* ---------- MODAL FLOW ---------- */
  checks.forEach((cb) => {
    cb.addEventListener("change", (e) => {
      e.preventDefault();
      const idx = Number(cb.dataset.index);
      const node = nodes[idx];

      if (node.dataset.state !== "unlocked") {
        cb.checked = false;
        return;
      }

      if (node.dataset.state === "solved") {
        cb.checked = true;
        cb.disabled = true;
        return;
      }

      pendingIndex = idx;
      modal.classList.remove("hidden");
    });
  });

  confirmYes.addEventListener("click", async () => {
    if (pendingIndex === null) return;
    const idx = pendingIndex;
    confirmYes.disabled = true;

    try {
      const res = await fetch("/binary-tree/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "binary-tree", problem: idx }),
      });

      if (!res.ok) throw new Error("Submit failed");

      const node = nodes[idx];
      const cb = checks[idx];
      node.dataset.state = "solved";
      cb.checked = true;
      cb.disabled = true;

      unlockChildrenOf(idx);
      updateStyles();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    } finally {
      confirmYes.disabled = false;
      modal.classList.add("hidden");
      pendingIndex = null;
    }
  });

  confirmNo.addEventListener("click", () => {
    if (pendingIndex !== null) {
      checks[pendingIndex].checked = false;
    }
    modal.classList.add("hidden");
    pendingIndex = null;
  });

  /* ---------- EVENTS ---------- */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawEdges, 120);
  });
  window.addEventListener("load", drawEdges);
});
