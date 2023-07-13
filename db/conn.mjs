import { MongoClient } from "mongodb";
import {PrismaClient} from "@prisma/client";
const connectionString = process.env.ATLAS_URI || "";

const client = new PrismaClient();

let conn;
try {
    conn = await client.connect();
} catch(e) {
    console.error(e);
}


export default client;
