import express from "express"; 

import { GetBFSProgress , GetDFSProgress , GetTopoSortProgress , GetShortestPathProgress , GetDSUProgress , GetBinaryTreeProgress , GetSGTProgress , GetPrefixSumProgress , GetSlidingWindowProgress , GetStackProgress , GetQueueProgress , GetLLProgress , GetDPProgress , GetBitsProgress , GetHashingProgress , GetSortingProgress , GetArrayMiscProgress , GetStringProgress , GetMathsProgress , GetTwoPointerProgress , GetBinarySearchProgress ,GetTreeMiscProgress , GetRecursionProgress} from "../controllers/controller_progress.js";
import { Get404Page } from "../controllers/controller.js";

const router = express.Router();

//Array

router.get("/two-pointer/progress", GetTwoPointerProgress);

router.get("/prefix-sum/progress", GetPrefixSumProgress);

router.get("/sliding-window/progress", GetSlidingWindowProgress);

router.get("/sorting/progress", GetSortingProgress);

router.get("/binary-search/progress", GetBinarySearchProgress);

router.get("/array-misc/progress", GetArrayMiscProgress);

//String

router.get("/string/progress", GetStringProgress);

//Linked List

router.get("/linked-list/progress", GetLLProgress);

//Stack

router.get("/stack/progress", GetStackProgress);

//Queue

router.get("/queue/progress", GetQueueProgress);

//Tree

router.get("/binary-tree/progress", GetBinaryTreeProgress);

router.get("/segment-tree/progress", GetSGTProgress);

router.get("/tree-misc/progress", GetTreeMiscProgress);

//Graph

router.get("/bfs/progress", GetBFSProgress);

router.get("/dfs/progress", GetDFSProgress);

router.get("/topological-sort/progress", GetTopoSortProgress);

router.get("/shortest-path/progress", GetShortestPathProgress);

router.get("/disjoint-set-union/progress", GetDSUProgress);

//Dynamic Programming

router.get("/dynamic-programming/progress", GetDPProgress);

//Bit Manipulation

router.get("/bit-manipulation/progress", GetBitsProgress);

//Mathematics

router.get("/mathematics/progress", GetMathsProgress);

//Hashing

router.get("/hashing/progress", GetHashingProgress);

//Recursion/Backtracking

router.get("/recursion/progress", GetRecursionProgress);

export {router as ProgressRouter};