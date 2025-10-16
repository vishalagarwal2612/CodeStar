import express from "express"; 
import { GetHomePage , GetProblemPage , GetArraysPage , GetTwoPointerPage , GetSlidingWindowPage , GetSortingBasedPage , GetTreesPage , GetBinaryTreePage , GetTreeMiscPage , GetStackPage , GetBitPage , GetQueuePage , GetLLPage , GetGraphPage , GetBFSPage , GetDFSPage , GetTopoSortPage , GetDSUPage , GetArrayMiscPage , GetStringPage , GetMathsPage , GetSGTPage , GetHashingPage , GetRecursionPage , GetPrefixSumPage , GetDPPage , GetShortestPathPage , GetBSPage , Get404Page , GetProfilePage , ResetProgress , GetLeaderBoardPage } from "../controllers/controller.js";

const router = express.Router();

router.get("/", GetHomePage);

router.get("/problems", GetProblemPage);

router.get("/profile", GetProfilePage);

router.get("/leaderboard", GetLeaderBoardPage);

//Array

router.get("/problems/arrays", GetArraysPage);

router.get("/problems/arrays/two-pointers", GetTwoPointerPage);

router.get("/problems/arrays/sliding-window", GetSlidingWindowPage);

router.get("/problems/arrays/prefix-sum", GetPrefixSumPage);

router.get("/problems/arrays/sorting-based", GetSortingBasedPage);

router.get("/problems/arrays/binary-search", GetBSPage);

router.get("/problems/arrays/miscellaneous", GetArrayMiscPage);

//String

router.get("/problems/strings", GetStringPage);

//Linked List

router.get("/problems/linked-list", GetLLPage);

//Tree

router.get("/problems/trees", GetTreesPage);

router.get("/problems/trees/binary-tree", GetBinaryTreePage);

router.get("/problems/trees/segment-tree", GetSGTPage);

router.get("/problems/trees/miscellaneous", GetTreeMiscPage);

//Stack

router.get("/problems/stacks", GetStackPage);

//Queue

router.get("/problems/queues", GetQueuePage);

//Graph

router.get("/problems/graphs", GetGraphPage);

router.get("/problems/graphs/bfs", GetBFSPage);

router.get("/problems/graphs/dfs", GetDFSPage);

router.get("/problems/graphs/topological-sort", GetTopoSortPage);

router.get("/problems/graphs/disjoint-set-union", GetDSUPage);

router.get("/problems/graphs/shortest-path", GetShortestPathPage);

//Dynamic Programming

router.get("/problems/dynamic-programming", GetDPPage);

//Bit Manipulation

router.get("/problems/bit-manipulation", GetBitPage);

//Mathematics

router.get("/problems/mathematics", GetMathsPage);

//Hashing

router.get("/problems/hashing", GetHashingPage);

//Recursion/Backtracking

router.get("/problems/recursion-/-backtracking", GetRecursionPage);

//Error Pages

router.get("/404", Get404Page);

//Reset Progress 

router.post("/reset/:topic", ResetProgress);

export {router as Router};