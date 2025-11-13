import { MongoClient } from "mongodb";

async function dbConnect() {
  const db = import.meta.env.VITE_MONGO_URI;
  const client = new MongoClient(db);

  try {
    await client.connect();
  } catch (e) {
    console.error(e);
  }
}

dbConnect();
