import {defineConfig} from "drizzle-kit";
export default defineConfig({
    out:"./drizzle",
    schema : "./drizzle/schema.js",
    dialect : "mysql",
    dbCredentials : {
        url : "mysql://root:Vishal@2612@Localhost:3306/codestar",
    }
});