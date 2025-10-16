// segment_tree_script.js — Segment Tree Visualization with API Integration

document.addEventListener("DOMContentLoaded", async () => {
  const nodes = [...document.querySelectorAll(".tree-node")];
  const checks = [...document.querySelectorAll(".problem-check")];
  const modal = document.getElementById("confirm-modal");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");
  const svg = document.getElementById("tree-edges");
  const treeContainer = document.getElementById("treeContainer");

  const n = nodes.length;

  // Build childrenMap and parentMap dynamically
  const childrenMap = {};
  const parentMap = {};
  for (let i = 0; i < n; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    const childs = [];
    if (left < n) {
      childs.push(left);
      parentMap[left] = i;
    }
    if (right < n) {
      childs.push(right);
      parentMap[right] = i;
    }
    if (childs.length > 0) childrenMap[i] = childs;
  }

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
      node.classList.remove("locked", "just-unlocked", "solved");

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

  /* ---------- UNLOCK HELPERS (BOTTOM-UP LOGIC) ---------- */
  function unlockParentIfReady(childIdx) {
    const parent = parentMap[childIdx];
    if (parent === undefined) return;

    const children = childrenMap[parent] || [];
    const allSolved = children.every((c) => nodes[c].dataset.state === "solved");

    if (allSolved && nodes[parent].dataset.state !== "solved") {
      const parentNode = nodes[parent];
      const parentCb = checks[parent];

      parentNode.dataset.state = "unlocked";
      parentNode.classList.add("just-unlocked");
      if (parentCb) parentCb.disabled = false;
      enableAnchor(parentNode);

      setTimeout(() => parentNode.classList.remove("just-unlocked"), 800);

      unlockParentIfReady(parent);
    }
  }

  function unlockLeaves() {
    nodes.forEach((node, idx) => {
      if (!childrenMap[idx] && node.dataset.state !== "solved") {
        node.dataset.state = "unlocked";
        const cb = checks[idx];
        if (cb) cb.disabled = false;
        enableAnchor(node);
      }
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

    Object.entries(childrenMap).forEach(([p, childs]) => {
      childs.forEach((c) => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        const pCenter = centerOf(p), cCenter = centerOf(c);
        line.setAttribute("x1", pCenter.x);
        line.setAttribute("y1", pCenter.y);
        line.setAttribute("x2", cCenter.x);
        line.setAttribute("y2", cCenter.y);
        line.setAttribute("stroke", "rgba(96,165,250,0.6)");
        line.setAttribute("stroke-width", "2.5");
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
      });
    });
  }

  /* ---------- FETCH PROGRESS (API) ---------- */
  async function fetchProgress() {
    try {
      const res = await fetch("/segment-tree/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      const solvedIndices = await res.json(); // array of solved node indices

      // Apply solved state
      solvedIndices.forEach(idx => {
        if (nodes[idx]) nodes[idx].dataset.state = "solved";
      });

      // Unlock leaves first
      unlockLeaves();

      // Unlock parents bottom-up based on solved children
      solvedIndices.forEach(idx => {
        unlockParentIfReady(idx);
      });

      updateStyles();
    } catch (err) {
      console.error("Progress fetch error:", err);
      unlockLeaves(); // fallback
      updateStyles();
    }
  }

  await fetchProgress();
  drawEdges();

  /* ---------- MODAL FLOW ---------- */
  checks.forEach(cb => {
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
      const res = await fetch("/segment-tree/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "segment-tree", problem: idx }),
      });
      if (!res.ok) throw new Error("Submit failed");

      nodes[idx].dataset.state = "solved";
      const cb = checks[idx];
      cb.checked = true;
      cb.disabled = true;

      unlockParentIfReady(idx);
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
    if (pendingIndex !== null) checks[pendingIndex].checked = false;
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
