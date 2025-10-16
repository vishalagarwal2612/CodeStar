import z from "zod";

export const UserSignupSchema = z.object({
    username : z
    .string()
    .min(3, "Username must be atleast 3 characters long!!")
    .max(50, "Username must be atmost 50 characters long!!"),

    email : z
    .string()
    .email("Invalid email address"),

    password : z
    .string()
    .min(3, "Password must be atleast 3 characters long!!")
    .max(255, "Password must be atmost 255 characters long!!")
});