const {MongoClient} = require('mongodb');

require('dotenv').config();
const client=new MongoClient(process.env.MONGODB_URI);
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to database");
        // Select the database
        const db = client.db(process.env.DB_NAME);
        // Return the collection reference
        return db.collection(process.env.COLLECTION_NAME);
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw error; // Rethrow the error so we know if connection fails
    }
}

module.exports = { connectToDatabase };