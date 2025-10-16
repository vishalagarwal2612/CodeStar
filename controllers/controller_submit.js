import { WriteRecord } from "../services/services.js";

//Array

export const SubmitTwoPointer = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/arrays/two-pointers");
};

export const SubmitPrefixSum = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/arrays/prefix-sum");
};

export const SubmitSlidingWindow = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/arrays/sliding-window");
};

export const SubmitSorting = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/arrays/sorting-based");
};

export const SubmitBinarySearch = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/arrays/binary-search");
};

export const SubmitArrayMisc = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/arrays/miscellaneous");
};

//String

export const SubmitString = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/strings");
};

//Linked List

export const SubmitLL = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/linked-list");
};

//Stack

export const SubmitStack = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/stacks");
};

//Queue

export const SubmitQueue = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/queues");
};

//Tree

export const SubmitBinaryTree = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/trees/binary-tree");
};

export const SubmitSGT = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/trees/segment-tree");
};

export const SubmitTreeMisc = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/trees/miscellaneous");
};

//Graph

export const SubmitBFS = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/graphs/bfs");
};

export const SubmitDFS = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/graphs/dfs");
};

export const SubmitTopoSort = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/graphs/topological-sort");
};

export const SubmitShortestPath = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/graphs/shortest-path");
};

export const SubmitDSU = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/graphs/disjoint-set-union");
};

//Dynamic Programming

export const SubmitDP = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/dynamic-programming");
};

//Bit Manipulation

export const SubmitBits = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/bit-manipulation");
};

//Mathematics

export const SubmitMaths = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/mathematics");
};

//Hashing

export const SubmitHashing = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/hashing");
};

//Recursion/Backtracking

export const SubmitRecursion = async (req, res) => {
  const NewRecord = await WriteRecord(req.user.id, req.body.topic, req.body.problem);
  return res.redirect("/problems/recursion-/-backtracking");
};