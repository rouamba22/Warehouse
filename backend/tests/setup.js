import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.test");
const examplePath = path.join(__dirname, "..", ".env.test.example");

dotenv.config({ path: examplePath });
dotenv.config({ path: envPath, override: true });

process.env.NODE_ENV = "test";
