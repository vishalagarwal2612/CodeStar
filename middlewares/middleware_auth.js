import { RefreshingToken, VerifyToken , CreateRefreshToken , GetSessionById } from "../services/services_auth.js";

export const VerifyAuthentication = async (req, res, next) => {
    const Access_token = req.cookies.Access_Token;
    const Refresh_token = req.cookies.Refresh_Token;
    req.user = null;
    if(!Refresh_token){
        if(Access_token){
            try {
                const DecodedToken = VerifyToken(Access_token);
                req.user = DecodedToken;
                const CurrentSession = await GetSessionById(DecodedToken.sessionId);
                if (!CurrentSession || !CurrentSession.valid) {
                    const NewRefreshToken = CreateRefreshToken(DecodedToken.sessionId);
                    const BaseConfig = { httpOnly: true, secure: true };
                    res.cookie("Refresh_Token", NewRefreshToken, {
                        ...BaseConfig,
                        maxAge: 7 * 24 * 60 * 60 * 1000
                    });
                }
                return next();
            } catch (err) {
                console.log("Access token invalid:", err.message);
            }
        }
        return next();
    }
    else if (Access_token) {
        const DecodedToken = VerifyToken(Access_token);
        req.user = DecodedToken; 
        return next();
    }
    else{
        try {
            const {NewAccessToken , NewRefreshToken} = await RefreshingToken(Refresh_token);
            const DecodedToken = VerifyToken(NewAccessToken);
            req.user = DecodedToken;
            const BaseConfig = {httpOnly : true, secure : true};
            res.cookie("Access_Token", NewAccessToken, {
                ...BaseConfig,
                maxAge: 15 * 60 * 1000
            });
            res.cookie("Refresh_Token", NewRefreshToken, {
                ...BaseConfig,
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            return next();
        } catch (error) {
            console.log(error.message);
        }
    }
    return next();
};
