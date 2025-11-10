import mongoose from "mongoose";

const uri = "mongodb://localhost:27017/test"; // your DB name
await mongoose.connect(uri);

const threads = await mongoose.connection.db
    .collection("threads")
    .find({}, { projection: { threadId: 1, title: 1, userId: 1, _id: 0 } })
    .toArray();

console.log(threads);
await mongoose.disconnect();
