import express from "express"; 

import { GetLoginPage , GetSignupPage , PostSignup , PostLogin , LogoutUser } from "../controllers/controller_auth.js";
import { Get404Page } from "../controllers/controller.js";

const router = express.Router();

router.get("/login", GetLoginPage);

router.get("/signup", GetSignupPage);

router.get("/logout", LogoutUser);

router.post("/signup", PostSignup);

router.post("/login", PostLogin);

export {router as AuthRouter};