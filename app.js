import express from "express";
import path from "path";
import flash from "connect-flash";
import session from "express-session";
import cookieParser from "cookie-parser";
import { VerifyAuthentication } from "./middlewares/middleware_auth.js";
import { Router } from "./routers/router.js";
import { AuthRouter } from "./routers/router_auth.js";
import { SubmissionRouter } from "./routers/router_submit.js";
import { ProgressRouter } from "./routers/router_progress.js";
import { PageNotFound } from "./middlewares/404_middleware.js";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(flash());
app.use(session({secret: "CodeStar@IIIT_Bhopal", resave: false, saveUninitialized: false}));
app.use(cookieParser());
app.use(VerifyAuthentication);

app.use(Router);
app.use(AuthRouter);
app.use(SubmissionRouter);
app.use(ProgressRouter);
app.use(PageNotFound);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("CodeStar is Running!!");
});