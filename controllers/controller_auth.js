import { GetUserByEmail , CreateUser , GetUserByUsername , HashPassword , VerifyPassword , GetUserByUsernameAndEmail , CreateAccessToken , GetUserByID , CreateSession , CreateRefreshToken , ClearUserSession} from "../services/services_auth.js";
import { UserSignupSchema } from "../validators/validator_auth.js";

export const GetLoginPage = (req, res) => {
    if(req.user) return res.redirect("/404");
    res.render("login.ejs", {error : req.flash("errors"), success : req.flash("success"), user : req.user || null});
};
export const GetSignupPage = (req, res) => {
    if(req.user) return res.redirect("/404");
    res.render("register.ejs", {error : req.flash("errors"), success : req.flash("success"), user : req.user || null});
};
export const PostSignup = async (req, res) => {
    const {data, error} = UserSignupSchema.safeParse(req.body);
    if(error){
        req.flash("errors", error.issues[0].message);
        return res.redirect("/signup");
    }
    else{
        const {username, email, password} = data;
        const UsernameExists = await GetUserByUsername(username);
        if(UsernameExists){
            req.flash("errors", "Username Already Exists!!");
            return res.redirect("/signup");
        }
        else{
            const EmailExists = await GetUserByEmail(email);
            if(EmailExists){
                req.flash("errors", "User Already Exists!!");
                return res.redirect("/signup");
            }
            else{
                const HashedPassword = await HashPassword(password);
                const CreatedUser = await CreateUser(username ,email, HashedPassword);
                const NewUser = await GetUserByID(CreatedUser.insertId);
                const session = await CreateSession(NewUser.id, {
                    ip : req.clientIp,
                    userAgent : req.headers["user-agent"]
                });
                const Access_token = CreateAccessToken({
                    id : NewUser.id,
                    username : NewUser.username,
                    email : NewUser.email,
                    sessionId : session[0].id
                });
                const Refresh_token = CreateRefreshToken(session[0].id);
                const BaseConfig = {httpOnly : true, secure : true};
                res.cookie("Access_Token", Access_token, {
                    ...BaseConfig,
                    maxAge : 15 * 60 * 1000
                });
                res.cookie("Refresh_Token", Refresh_token, {
                    ...BaseConfig,
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });
                res.redirect("/");
            }
        }
    }
};
export const PostLogin = async (req, res) => {
    const {data, error} = UserSignupSchema.safeParse(req.body);
    if(error){
        req.flash("errors", error.issues[0].message);
        return res.redirect("/login");
    }
    else{
        const {username, email, password} = data;
        const UserExists = await GetUserByUsernameAndEmail(username, email);
        if(!UserExists){
            req.flash("errors", "Invalid username, email or password!!");
            return res.redirect("/login");
        }
        else{
            const CorrectPassword = await VerifyPassword(UserExists.password, password);
            if(!CorrectPassword){
                req.flash("errors", "Invalid username, email or password!!");
                return res.redirect("/login");
            }
            else{
                const session = await CreateSession(UserExists.id, {
                    ip : req.clientIp,
                    userAgent : req.headers["user-agent"]
                });
                const Access_token = CreateAccessToken({
                    id : UserExists.id,
                    username : UserExists.username,
                    email : UserExists.email,
                    sessionId : session[0].id
                });
                const Refresh_token = CreateRefreshToken(session[0].id);
                const BaseConfig = {httpOnly : true, secure : true};
                res.cookie("Access_Token", Access_token, {
                    ...BaseConfig,
                    maxAge : 15 * 60 * 1000
                });
                res.cookie("Refresh_Token", Refresh_token, {
                    ...BaseConfig,
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });
                res.redirect("/");
            }
        }
    }
};
export const LogoutUser = async (req, res) => {
    if(!req.user) return res.redirect("/404");
    await ClearUserSession(req.user.sessionId);
    res.clearCookie("Access_Token");
    res.clearCookie("Refresh_Token");
    res.redirect("/");
};