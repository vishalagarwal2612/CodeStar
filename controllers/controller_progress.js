import { GetRecords } from "../services/services.js";

const GetProgress = async (user_id, topic) => {
    const Records = await GetRecords(user_id, topic);
    const arr = [];
    Records.forEach(sub => {
        arr.push(sub.problem_number);
    });
    return arr;
};

//Array

export const GetTwoPointerProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "two-pointer";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

export const GetPrefixSumProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "prefix-sum";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

export const GetSlidingWindowProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "sliding-window";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

export const GetSortingProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "sorting";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

export const GetBinarySearchProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "binary-search";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

export const GetArrayMiscProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "array-misc";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

//String

export const GetStringProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "string";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

//Linked List

export const GetLLProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "linked-list";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

//Stack

export const GetStackProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "stack";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

//Queue

export const GetQueueProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "queue";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

//Tree

export const GetBinaryTreeProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "binary-tree";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

export const GetSGTProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "segment-tree";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

export const GetTreeMiscProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "tree-misc";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

//Graph

export const GetBFSProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "bfs";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

export const GetDFSProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "dfs";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

export const GetTopoSortProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "topological-sort";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

export const GetShortestPathProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "shortest-path";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

export const GetDSUProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "disjoint-set-union";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

//Dynamic Programming

export const GetDPProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "dynamic-programming";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

//Bit Manipulation

export const GetBitsProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "bit-manipulation";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

//Mathematics

export const GetMathsProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "mathematics";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

//Hashing

export const GetHashingProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "hashing";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};

//Recursion/Backtracking

export const GetRecursionProgress = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    const topic = "recursion";
    const Records = await GetProgress(req.user.id, topic);
    return res.json(Records);
};