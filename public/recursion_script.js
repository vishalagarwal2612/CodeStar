document.addEventListener("DOMContentLoaded", async () => {
  const nodes = [...document.querySelectorAll(".tree-node")];
  const checks = [...document.querySelectorAll(".problem-check")];
  const modal = document.getElementById("confirm-modal");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");
  const svg = document.getElementById("tree-edges");
  const treeContainer = document.getElementById("treeContainer");

  // DFS unlocking order
  const dfsOrder = [0, 1, 3, 4, 2, 5, 6];
  let currentIdx = 0;
  let pendingIndex = null;

  /* ---------------- FETCH PROGRESS ---------------- */
  async function fetchProgress() {
    try {
      const res = await fetch("/recursion/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      const solvedIndices = await res.json(); // [0, 1, 3] etc.

      // Mark solved nodes
      solvedIndices.forEach(idx => {
        if (nodes[idx]) {
          nodes[idx].classList.add("solved");
          checks[idx].checked = true;
          checks[idx].disabled = true;
          enableAnchor(nodes[idx]);
        }
      });

      // Move DFS pointer
      propagateFromSolved();

      drawEdges();
    } catch (err) {
      console.error("Progress fetch error:", err);
      // Fallback: unlock the first node only
      nodes.forEach((node, idx) => {
        const cb = checks[idx];
        if (idx === dfsOrder[0]) {
          node.classList.remove("locked");
          cb.disabled = false;
          enableAnchor(node);
        } else {
          node.classList.add("locked");
          cb.disabled = true;
          disableAnchor(node);
        }
      });
      drawEdges();
    }
  }

  /* ---------------- SUBMIT PROGRESS ---------------- */
  async function submitSolved(idx) {
    try {
      const res = await fetch("/recursion/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "recursion", problem: idx }),
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit progress. Please try again.");
    }
  }

  /* ---------------- INIT STATES ---------------- */
  function applyLockedStateFromDOM() {
    nodes.forEach((node, idx) => {
      const cb = checks[idx];
      const isSolved = node.classList.contains("solved") || cb.checked;

      if (isSolved) node.classList.add("solved");

      node.classList.add("locked");
      cb.disabled = true;
      disableAnchor(node);
    });
  }

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

  /* ---------------- MODAL FLOW ---------------- */
  checks.forEach((cb) => {
    cb.addEventListener("change", (e) => {
      e.preventDefault();

      const idx = Number(cb.dataset.index);
      if (nodes[idx].classList.contains("locked")) {
        cb.checked = false;
        return;
      }

      if (nodes[idx].classList.contains("solved")) {
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

    const node = nodes[pendingIndex];
    const cb = checks[pendingIndex];

    node.classList.add("solved");
    cb.checked = true;
    cb.disabled = true;
    await submitSolved(pendingIndex);

    unlockNextDFS();
    modal.classList.add("hidden");
    pendingIndex = null;
  });

  confirmNo.addEventListener("click", () => {
    if (pendingIndex !== null) checks[pendingIndex].checked = false;
    modal.classList.add("hidden");
    pendingIndex = null;
  });

  /* ---------------- DFS LOGIC ---------------- */
  function unlockNextDFS() {
    currentIdx++;
    if (currentIdx >= dfsOrder.length) return;

    const nextNodeIdx = dfsOrder[currentIdx];
    const nextNode = nodes[nextNodeIdx];
    const nextCb = checks[nextNodeIdx];

    nextNode.classList.remove("locked");
    nextNode.classList.add("just-unlocked");
    nextCb.disabled = false;
    enableAnchor(nextNode);

    setTimeout(() => nextNode.classList.remove("just-unlocked"), 800);
  }

  function propagateFromSolved() {
    // Move DFS pointer to next unsolved node
    for (let i = 0; i < dfsOrder.length; i++) {
      const idx = dfsOrder[i];
      if (nodes[idx].classList.contains("solved") || checks[idx].checked) {
        currentIdx = i + 1;
      } else {
        break;
      }
    }

    // Unlock current DFS node if any left
    if (currentIdx < dfsOrder.length) {
      const node = nodes[dfsOrder[currentIdx]];
      const cb = checks[dfsOrder[currentIdx]];
      node.classList.remove("locked");
      cb.disabled = false;
      enableAnchor(node);
    }
  }

  /* ---------------- EDGE DRAWING ---------------- */
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

  /* ---------------- INIT ---------------- */
  applyLockedStateFromDOM();
  await fetchProgress();
  drawEdges();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawEdges, 120);
  });
  window.addEventListener("load", drawEdges);
});
