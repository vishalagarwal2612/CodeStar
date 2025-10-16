import express from "express"; 
import { SubmitBFS , SubmitDFS , SubmitTopoSort , SubmitShortestPath , SubmitDSU , SubmitBinaryTree , SubmitSGT , SubmitPrefixSum , SubmitSlidingWindow , SubmitStack , SubmitQueue , SubmitLL , SubmitDP , SubmitBits , SubmitHashing , SubmitSorting , SubmitArrayMisc , SubmitString , SubmitMaths , SubmitBinarySearch , SubmitTreeMisc , SubmitTwoPointer , SubmitRecursion} from "../controllers/controller_submit.js";
import { Get404Page } from "../controllers/controller.js";

const router = express.Router();

//Array

router.post("/two-pointer/submit", SubmitTwoPointer);

router.post("/prefix-sum/submit", SubmitPrefixSum);

router.post("/sliding-window/submit", SubmitSlidingWindow);

router.post("/sorting/submit", SubmitSorting);

router.post("/binary-search/submit", SubmitBinarySearch);

router.post("/array-misc/submit", SubmitArrayMisc);

//String

router.post("/string/submit", SubmitString);

//Linked List

router.post("/linked-list/submit", SubmitLL);

//Stack

router.post("/stack/submit", SubmitStack);

//Queue

router.post("/queue/submit", SubmitQueue);

//Tree

router.post("/binary-tree/submit", SubmitBinaryTree);

router.post("/segment-tree/submit", SubmitSGT);

router.post("/tree-misc/submit", SubmitTreeMisc);

//Graph

router.post("/bfs/submit", SubmitBFS);

router.post("/dfs/submit", SubmitDFS);

router.post("/topological-sort/submit", SubmitTopoSort);

router.post("/shortest-path/submit", SubmitShortestPath);

router.post("/disjoint-set-union/submit", SubmitDSU);

//Dynamic Programming

router.post("/dynamic-programming/submit", SubmitDP);

//Bit Manipulation

router.post("/bit-manipulation/submit", SubmitBits);

//Mathematics

router.post("/mathematics/submit", SubmitMaths);

//Hashing

router.post("/hashing/submit", SubmitHashing);

//Recursion/Backtracking

router.post("/recursion/submit", SubmitRecursion);

export {router as SubmissionRouter};