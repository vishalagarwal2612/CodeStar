document.addEventListener("DOMContentLoaded", async () => {
    const nodes = document.querySelectorAll(".graph-node");
    const modal = document.getElementById("confirm-modal");
    const confirmYes = document.getElementById("confirm-yes");
    const confirmNo = document.getElementById("confirm-no");
    const svg = document.getElementById("graph-edges");

    let pendingNode = null;

    // Graph edges: [from, to, weight]
    const edges = [
        [0, 1, 2],
        [0, 2, 6],
        [1, 2, 3],
        [1, 4, 8],
        [2, 3, 4],
        [3, 5, 7],
        [4, 5, 3],
        [3, 4, 6]
    ];

    const edgeElements = [];

    // Node positions
    const positions = [
        { left: 50, top: 200 },
        { left: 200, top: 80 },
        { left: 200, top: 320 },
        { left: 350, top: 320 },
        { left: 350, top: 80 },
        { left: 500, top: 200 }
    ];

    // Predefined shortest path unlocking sequence
    const shortestPathOrder = [0, 1, 2, 3, 4, 5];
    let currentIndex = 0; // Tracks the index in shortestPathOrder of the next node to solve

    // --------------------------------------------------------
    // SETUP: Place Nodes and Draw Edges
    // --------------------------------------------------------

    // Place nodes
    nodes.forEach((node, i) => {
        node.style.left = positions[i].left + "px";
        node.style.top = positions[i].top + "px";
        node.dataset.state = "locked"; // Initialize state
    });

    // Draw edges and weight labels
    edges.forEach(([from, to, weight]) => {
        const x1 = positions[from].left + 55;
        const y1 = positions[from].top + 55;
        const x2 = positions[to].left + 55;
        const y2 = positions[to].top + 55;

        // Line
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "#64748b");
        line.setAttribute("stroke-width", 3);
        line.dataset.from = from;
        line.dataset.to = to;
        svg.appendChild(line);
        edgeElements.push(line);

        // Weight label
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const offset = 15;
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const offsetX = -dy / len * offset;
        const offsetY = dx / len * offset;
        text.setAttribute("x", midX + offsetX);
        text.setAttribute("y", midY + offsetY);
        text.setAttribute("fill", "#facc15");
        text.setAttribute("font-size", "12");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.textContent = weight;
        svg.appendChild(text);
    });

    // --------------------------------------------------------
    // STYLES: Update Nodes and Edges based on state
    // --------------------------------------------------------

    function updateStyles() {
        // --- Node State Update ---
        nodes.forEach(node => {
            node.classList.remove("locked", "unlocked", "solved");
            node.classList.add(node.dataset.state);

            const cb = node.querySelector(".problem-check");
            if (!cb) return;

            // Set checkbox state and disabled status
            if (node.dataset.state === "solved") {
                cb.checked = true;
                cb.disabled = true;
            } else if (node.dataset.state === "unlocked") {
                cb.checked = false;
                cb.disabled = false;
            } else { // locked
                cb.checked = false;
                cb.disabled = true;
            }
        });

        // --- Path Progression Markers ---
        let lastSolvedNodeIndex = -1;
        let nextUnlockedNodeIndex = -1;
        
        // Find the boundary between the solved and the next unlocked node in the path
        for (let i = 0; i < shortestPathOrder.length; i++) {
            const nodeIndex = shortestPathOrder[i];
            const state = nodes[nodeIndex].dataset.state;

            if (state === "solved") {
                lastSolvedNodeIndex = nodeIndex;
            } else if (state === "unlocked") {
                nextUnlockedNodeIndex = nodeIndex;
                break; 
            }
        }

        // --- Edge State Update (Strict Logic) ---
        edgeElements.forEach(line => {
            const from = +line.dataset.from;
            const to = +line.dataset.to;
            
            line.classList.remove("locked", "unlocked", "solved");

            // Case A: Completed Path (GREEN/SOLVED) - **FIXED LOGIC**
            // An edge is solved ONLY if it is an adjacent pair in the shortestPathOrder
            // AND both connected nodes are solved.
            let isPathSegment = false;
            for (let i = 0; i < shortestPathOrder.length - 1; i++) {
                // Check edge in the forward direction
                if (shortestPathOrder[i] === from && shortestPathOrder[i+1] === to) {
                    isPathSegment = true;
                    break;
                }
                // Check edge in the reverse direction (since SVG lines are undirected)
                if (shortestPathOrder[i] === to && shortestPathOrder[i+1] === from) {
                    isPathSegment = true;
                    break;
                }
            }

            if (isPathSegment && nodes[from].dataset.state === "solved" && nodes[to].dataset.state === "solved") {
                line.classList.add("solved");
            } 
            // Case B: Next Step (BLUE/UNLOCKED)
            // This is the single edge connecting the last solved node to the currently unlocked node.
            else if (from === lastSolvedNodeIndex && to === nextUnlockedNodeIndex) {
                line.classList.add("unlocked");
            }
            // Case C: Default (GRAY/LOCKED)
            else {
                line.classList.add("locked");
            }
        });
    }

    // --------------------------------------------------------
    // API & Data Management
    // --------------------------------------------------------

    async function fetchProgress() {
        try {
            const res = await fetch("/shortest-path/progress");
            if (!res.ok) throw new Error("Failed to fetch progress");
            const solvedIndices = await res.json(); 

            // 1. Mark existing solved nodes
            solvedIndices.forEach(idx => {
                if (nodes[idx]) nodes[idx].dataset.state = "solved";
            });

            // 2. Determine the path progression and unlock the next sequential node
            let lastSolvedPathIndex = -1;
            for (let i = 0; i < shortestPathOrder.length; i++) {
                if (nodes[shortestPathOrder[i]].dataset.state === "solved") {
                    lastSolvedPathIndex = i;
                } else {
                    break; 
                }
            }

            currentIndex = lastSolvedPathIndex + 1; // Set currentIndex for the next expected solve

            // 3. Unlock the next node
            if (currentIndex < shortestPathOrder.length) {
                const nextNodeIndex = shortestPathOrder[currentIndex];
                if (nodes[nextNodeIndex].dataset.state === "locked") {
                    nodes[nextNodeIndex].dataset.state = "unlocked";
                }
            }

            // Fallback: Ensure the very first node is unlocked if nothing is solved
            if (solvedIndices.length === 0 && shortestPathOrder.length > 0) {
                nodes[shortestPathOrder[0]].dataset.state = "unlocked";
            }

            updateStyles();
        } catch (err) {
            console.error(err);
            // Default unlock on fetch failure
            if (shortestPathOrder.length > 0) {
                nodes[shortestPathOrder[0]].dataset.state = "unlocked";
            }
            updateStyles();
        }
    }

    // Initial fetch to set up the graph
    await fetchProgress();

    // --------------------------------------------------------
    // Event Listeners (User Interaction)
    // --------------------------------------------------------

    // Node click handler (opens modal)
    nodes.forEach(node => {
        const cb = node.querySelector(".problem-check");
        if (!cb) return;

        cb.addEventListener("change", (e) => {
            e.preventDefault();
            if (node.dataset.state !== "unlocked") {
                cb.checked = false;
                return;
            }
            pendingNode = node;
            modal.classList.remove("hidden");
        });
    });

    // Modal YES (Submit to API)
    confirmYes.addEventListener("click", async () => {
        if (!pendingNode) return;

        const idx = Array.from(nodes).indexOf(pendingNode);
        confirmYes.disabled = true;

        try {
            const res = await fetch("/shortest-path/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: "shortest-path", problem: idx })
            });

            if (!res.ok) throw new Error("Failed to submit");

            pendingNode.dataset.state = "solved";

            // If the submitted node was the expected next step, unlock the following node
            const expectedNodeIndex = shortestPathOrder[currentIndex];
            if (idx === expectedNodeIndex && currentIndex < shortestPathOrder.length - 1) {
                currentIndex++;
                const nextNodeIndex = shortestPathOrder[currentIndex];
                if (nodes[nextNodeIndex].dataset.state === "locked") {
                    nodes[nextNodeIndex].dataset.state = "unlocked";
                }
            }

            updateStyles(); // Update graph visuals after successful submission
        } catch (err) {
            console.error(err);
            alert("Failed to submit. Try again.");
            const cb = pendingNode.querySelector(".problem-check");
            if (cb) cb.checked = false;
        } finally {
            confirmYes.disabled = false;
            pendingNode = null;
            modal.classList.add("hidden");
        }
    });

    // Modal NO (Cancel)
    confirmNo.addEventListener("click", () => {
        if (pendingNode) {
            const cb = pendingNode.querySelector(".problem-check");
            if (cb) cb.checked = false;
        }
        modal.classList.add("hidden");
        pendingNode = null;
    });
});