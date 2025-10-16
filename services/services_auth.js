import { eq , and } from "drizzle-orm";
import {db} from "../database/drizzle.js";
import { UserTable , SessionTable } from "../drizzle/schema.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export const GetUserByEmail = async (email) => {
    const [user] = await db.select().from(UserTable).where(eq(UserTable.email, email));
    return user;
};

export const GetUserByUsername = async (username) => {
    const [user] = await db.select().from(UserTable).where(eq(UserTable.username, username));
    return user;
};

export const GetUserByUsernameAndEmail = async (username, email) => {
    const [user] = await db.select().from(UserTable).where(and(eq(UserTable.username, username), eq(UserTable.email, email)));
    return user;
};

export const CreateUser = async (username, email, password) => {
    const [user] = await db.insert(UserTable).values({username : username , email : email , password : password});
    return user;
};

export const GetUserByID = async (user_id) => {
    const [user] = await db.select().from(UserTable).where(eq(UserTable.id, user_id));
    return user;
};

export const HashPassword = async (password) => {
    return await argon2.hash(password);
};

export const VerifyPassword = async (HashedPassword, password) => {
    return await argon2.verify(HashedPassword, password);
};

export const CreateAccessToken = ({id, username, email, sessionId}) => {
    return jwt.sign({id, username, email, sessionId}, process.env.SECRET_KEY, {expiresIn : "15m"});
};

export const VerifyToken = (Token) => {
    return jwt.verify(Token, process.env.SECRET_KEY);
};

export const CreateSession = async (user_id, {ip, userAgent}) => {
    const session = await db.insert(SessionTable).values({
        user_id : user_id,
        ip : ip,
        userAgent : userAgent
    }).$returningId({ id: SessionTable.id });
    return session;
};

export const CreateRefreshToken = (sessionId) => {
    return jwt.sign({sessionId}, process.env.SECRET_KEY, {
        expiresIn : "1w"
    });
}

export const GetSessionById = async (SessionId) => {
    const [session] = await db.select().from(SessionTable).where(eq(SessionTable.id,SessionId));
    return session;
};

export const RefreshingToken = async (RefreshToken) => {
    try {
        const DecodedToken = VerifyToken(RefreshToken);
        const CurrentSession = await GetSessionById(DecodedToken.sessionId);
        if(!CurrentSession || !CurrentSession.valid){
            throw new error("Invalid Session");
        }
        const user = await GetUserByID(CurrentSession.user_id);
        if(!user) throw new error("Invalid User");
        const UserInfo = {
            id : user.id,
            username : user.username,
            email : user.email,
            sessionId : CurrentSession.id
        };
        const NewAccessToken = CreateAccessToken(UserInfo);
        const NewRefreshToken = CreateRefreshToken(CurrentSession.id);
        return {NewAccessToken, NewRefreshToken};
    } catch (error) {
        console.log(error.message);
        return {NewAccessToken: null, NewRefreshToken: null};
    }
};

export const ClearUserSession = async (sessionId) => {
    return db.delete(SessionTable).where(eq(SessionTable.id, sessionId));
};