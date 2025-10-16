import { GetRecords , DeleteSubmissions, GetAllRecords } from "../services/services.js";

export const GetHomePage = (req, res) => {
    res.render("index.ejs", {user : req.user || null});
};

export const GetProblemPage = (req, res) => {
    if(!req.user) return res.redirect("/404");
    res.render("topics.ejs", {user : req.user || null});
};

export const GetLeaderBoardPage = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const Records = await GetAllRecords();
    console.log(Records);
    res.render("leaderboard.ejs", {user : req.user || null, allUsers : Records});
};

export const GetProfilePage = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topics = [
      {name : "Two Pointers", solved : (await GetRecords(req.user.id, "two-pointer")).length, total : 5, dbname : "two-pointer"},
      {name : "Sliding Window", solved : (await GetRecords(req.user.id, "sliding-window")).length, total : 5, dbname : "sliding-window"},
      {name : "Prefix Sum", solved : (await GetRecords(req.user.id, "prefix-sum")).length, total : 5, dbname : "prefix-sum"},
      {name : "Sorting", solved : (await GetRecords(req.user.id, "sorting")).length, total : 5, dbname : "sorting"},
      {name : "Binary Search", solved : (await GetRecords(req.user.id, "binary-search")).length, total : 5, dbname : "binary-search"},
      {name : "Array Miscellaneous", solved : (await GetRecords(req.user.id, "array-misc")).length, total : 5, dbname : "array-misc"},
      {name : "String", solved : (await GetRecords(req.user.id, "string")).length, total : 5, dbname : "string"},
      {name : "Linked List", solved : (await GetRecords(req.user.id, "linked-list")).length, total : 5, dbname : "linked-list"},
      {name : "Stack", solved : (await GetRecords(req.user.id, "stack")).length, total : 5, dbname : "stack"},
      {name : "Queue", solved : (await GetRecords(req.user.id, "queue")).length, total : 5, dbname : "queue"},
      {name : "Binary Tree", solved : (await GetRecords(req.user.id, "binary-tree")).length, total : 7, dbname : "binary-tree"},
      {name : "Segment Tree", solved : (await GetRecords(req.user.id, "segment-tree")).length, total : 7, dbname : "segment-tree"},
      {name : "Tree Miscellaneous", solved : (await GetRecords(req.user.id, "tree-misc")).length, total : 6, dbname : "tree-misc"},
      {name : "Breadth First Search", solved : (await GetRecords(req.user.id, "bfs")).length, total : 6, dbname : "bfs"},
      {name : "Depth First Search", solved : (await GetRecords(req.user.id, "dfs")).length, total : 6, dbname : "dfs"},
      {name : "Topological Sort", solved : (await GetRecords(req.user.id, "topological-sort")).length, total : 5, dbname : "topological-sort"},
      {name : "Shortest Path", solved : (await GetRecords(req.user.id, "shortest-path")).length, total : 6, dbname : "shortest-path"},
      {name : "Disjoint Set Union", solved : (await GetRecords(req.user.id, "disjoint-set-union")).length, total : 5, dbname : "disjoint-set-union"},
      {name : "Dynamic Programming", solved : (await GetRecords(req.user.id, "dynamic-programming")).length, total : 9, dbname : "dynamic-programming"},
      {name : "Bit Manipulation", solved : (await GetRecords(req.user.id, "bit-manipulation")).length, total : 6, dbname : "bit-manipulation"},
      {name : "Mathematics", solved : (await GetRecords(req.user.id, "mathematics")).length, total : 5, dbname : "mathematics"},
      {name : "Hashing", solved : (await GetRecords(req.user.id, "hashing")).length, total : 5, dbname : "hashing"},
      {name : "Recursion / Backtracking", solved : (await GetRecords(req.user.id, "recursion")).length, total : 7, dbname : "recursion"}
    ];
    res.render("profile.ejs", {user : req.user || null, topics : topics});
};

export const GetArraysPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
    res.render("array.ejs", {user : req.user || null});
};

export const GetTreesPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
    res.render("tree.ejs", {user : req.user || null});
};

export const GetGraphPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
    res.render("graph.ejs", {user : req.user || null});
};

export const GetTwoPointerPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/move-zeroes/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/container-with-most-water/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/3sum/description/" }
  ];

  res.render("two_pointer", { problems, leftIndex: 0, rightIndex: problems.length - 1, user : req.user || null});
};

export const GetSlidingWindowPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/max-consecutive-ones-iii/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/maximize-the-confusion-of-an-exam/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/subarray-product-less-than-k/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/minimum-size-subarray-sum/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/minimum-window-substring/description/" }
  ];

  res.render("sliding_window", { problems, user : req.user || null});
};

export const GetPrefixSumPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/running-sum-of-1d-array/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/find-pivot-index/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/subarray-sum-equals-k/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/subarray-sums-divisible-by-k/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/smallest-missing-integer-greater-than-sequential-prefix-sum/description/" }
  ];

  res.render("prefix_sum", { problems, user : req.user || null});
};

export const GetSortingBasedPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/sort-array-by-parity/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/kth-largest-element-in-an-array/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/top-k-frequent-elements/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/merge-intervals/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/sliding-window-maximum/description/" }
  ];

  res.render("sorting_based", { problems, user : req.user || null});
};

export const GetBSPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/binary-search/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/guess-number-higher-or-lower/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/find-peak-element/description/" }
  ];

  res.render("binary_search", { problems, user : req.user || null});
};

export const GetLLPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/reverse-linked-list/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/linked-list-cycle/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/merge-k-sorted-lists/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/reverse-nodes-in-k-group/" }
  ];

  res.render("linked_list", { problems, user : req.user || null});
};

export const GetBinaryTreePage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/symmetric-tree/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/validate-binary-search-tree/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/description/" },
    { title: "Problem 6", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" },
    { title: "Problem 7", link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/description/" }
  ]

  res.render("binary_tree", { problems, user : req.user || null});
};

export const GetSGTPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/count-of-range-sum/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/range-sum-query-2d-mutable/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/the-skyline-problem/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/range-sum-query-immutable/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/range-sum-query-mutable/" },
    { title: "Problem 6", link: "https://leetcode.com/problems/range-addition/" },
    { title: "Problem 7", link: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/" }
  ]

  res.render("segment_tree", { problems, user : req.user || null});
};

export const GetTreeMiscPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/maximum-depth-of-n-ary-tree/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/implement-trie-prefix-tree/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/design-add-and-search-words-data-structure/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/number-of-nodes-in-the-sub-tree-with-the-same-label/" },
    { title: "Problem 6", link: "https://leetcode.com/problems/height-of-binary-tree-after-subtree-removal-queries/description//" }
  ]

  res.render("tree_misc", { problems, user : req.user || null});
};

export const GetStackPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/valid-parentheses/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/min-stack/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/largest-rectangle-in-histogram/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/trapping-rain-water/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/basic-calculator/" }
  ];

  res.render("stack", { problems, user : req.user || null});
};

export const GetQueuePage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/implement-queue-using-stacks/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/moving-average-from-data-stream/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/design-circular-queue/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/sliding-window-maximum/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/shortest-path-in-binary-matrix/" }
  ];

  res.render("queue", { problems, user : req.user || null});
};

export const GetBitPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/single-number/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/number-of-1-bits/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/power-of-two/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/single-number-ii/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" },
    { title: "Problem 6", link: "https://leetcode.com/problems/reverse-bits/description/" }
  ];
  
  res.render("bit_manipulation", { problems, user : req.user || null});
};

export const GetBFSPage = async (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/minimum-depth-of-binary-tree/"},
    { title: "Problem 2", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/description/"},
    { title: "Problem 3", link: "https://leetcode.com/problems/number-of-islands/description/"},
    { title: "Problem 4", link: "https://leetcode.com/problems/rotting-oranges/description/"},
    { title: "Problem 5", link: "https://leetcode.com/problems/word-ladder/description/"},
    { title: "Problem 6", link: "https://leetcode.com/problems/sliding-puzzle/description/"}
  ];
  res.render("bfs", { problems, user : req.user || null});
};

export const GetDFSPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/path-sum/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/number-of-islands/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/clone-graph/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/word-search/description/" },
    { title: "Problem 6", link: "https://leetcode.com/problems/critical-connections-in-a-network/description/" }
  ];

  res.render("dfs", { problems, user : req.user || null});
};

export const GetTopoSortPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/course-schedule/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/course-schedule-ii/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/alien-dictionary/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/sequence-reconstruction/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/minimum-height-trees/description/" }
  ];

  res.render("toposort", { problems,user : req.user || null });
};

export const GetDSUPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/number-of-provinces/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/redundant-connection/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/redundant-connection-ii/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/accounts-merge/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/connecting-cities-with-minimum-cost/description/" }
  ];

  res.render("dsu", { problems, user : req.user || null});
};

export const GetShortestPathPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/network-delay-time/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/cheapest-flights-within-k-stops/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/01-matrix/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/path-with-minimum-effort/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/minimum-cost-to-reach-destination-in-time/description/" },
    { title: "Problem 6", link: "https://leetcode.com/problems/swim-in-rising-water/description/"}
  ];

  res.render("shortest_path", { problems, user : req.user || null});
};

export const GetArrayMiscPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/find-the-duplicate-number/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/product-of-array-except-self/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/maximum-subarray/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/trapping-rain-water/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/sliding-window-maximum/description/" }
  ];

  res.render("array_misc", { problems, user : req.user || null});
};

export const GetStringPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/valid-palindrome/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/group-anagrams/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/minimum-window-substring/description/" }
  ];

  res.render("string", { problems, user : req.user || null});
};

export const GetMathsPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/fizz-buzz/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/power-of-two/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/count-primes/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/powx-n/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/perfect-squares/description/" }
  ];

  res.render("math", { problems, user : req.user || null});
};

export const GetHashingPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/two-sum/description/" , difficulty:"Easy"},
    { title: "Problem 2", link: "https://leetcode.com/problems/intersection-of-two-arrays-ii/description/", difficulty:"Easy - Medium" },
    { title: "Problem 3", link: "https://leetcode.com/problems/top-k-frequent-elements/description/",difficulty:"Medium" },
    { title: "Problem 4", link: "https://leetcode.com/problems/longest-consecutive-sequence/description/",difficulty:"Medium - Hard" },
    { title: "Problem 5", link: "https://leetcode.com/problems/substring-with-concatenation-of-all-words/description/",difficulty:"Hard" }
  ];

  res.render("hashing", { problems, user : req.user || null});
};

export const GetRecursionPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem 1", link: "https://leetcode.com/problems/factorial-trailing-zeroes/description/" },
    { title: "Problem 2", link: "https://leetcode.com/problems/climbing-stairs/description/" },
    { title: "Problem 3", link: "https://leetcode.com/problems/subsets/description/" },
    { title: "Problem 4", link: "https://leetcode.com/problems/combination-sum/description/" },
    { title: "Problem 5", link: "https://leetcode.com/problems/letter-case-permutation/description/" },
    { title: "Problem 6", link: "https://leetcode.com/problems/word-search/description/" },
    { title: "Problem 7", link: "https://leetcode.com/problems/n-queens/description/" }
  ]

  res.render("recursion", { problems, user : req.user || null});
};

export const GetDPPage = (req, res) => {
  if(!req.user) return res.redirect("/404");
  const problems = [
    { title: "Problem (0,0)", link: "https://leetcode.com/problems/climbing-stairs/description/" },
    { title: "Problem (0,1)", link: "https://leetcode.com/problems/house-robber/description/" },
    { title: "Problem (0,2)", link: "https://leetcode.com/problems/minimum-path-sum/description/" },
    { title: "Problem (1,0)", link: "https://leetcode.com/problems/coin-change/description/" },
    { title: "Problem (1,1)", link: "https://leetcode.com/problems/longest-increasing-subsequence/description/" },
    { title: "Problem (1,2)", link: "https://leetcode.com/problems/unique-paths/description/" },
    { title: "Problem (2,0)", link: "https://leetcode.com/problems/decode-ways/description/" },
    { title: "Problem (2,1)", link: "https://leetcode.com/problems/edit-distance/description/" },
    { title: "Problem (2,2)", link: "https://leetcode.com/problems/regular-expression-matching/description/" }
  ];

  res.render("dp", { problems, user : req.user || null});
};

export const Get404Page = (req, res) => {
  res.render("404.ejs", { user : req.user || null});
};

export const ResetProgress = async (req, res) => {
  const topic = req.params.topic;
  await DeleteSubmissions(req.user.id, topic);
  return res.redirect("/profile");
};

