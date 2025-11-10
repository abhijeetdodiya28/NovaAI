import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected");

    const threads = await mongoose.connection.db.collection("threads")
        .find({}, { projection: { threadId: 1, title: 1, userId: 1, _id: 0 } })
        .toArray();

    console.log(threads);
    await mongoose.disconnect();
};

run();
