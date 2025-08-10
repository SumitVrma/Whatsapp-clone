const { MongoClient } = require('mongodb');
const path = require('path');

require('dotenv').config();

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true, // Only for development
    retryWrites: true,
    maxIdleTimeMS: 270000,
    serverSelectionTimeoutMS: 5000,
    family: 4 // Force IPv4
};

const client = new MongoClient(process.env.MONGODB_URI, options);

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
        if (error.code === 'ECONNREFUSED') {
            console.error("Could not connect to MongoDB. Please check if the connection string is correct and MongoDB is running.");
        } else if (error.name === 'MongoServerSelectionError') {
            console.error("Could not connect to MongoDB Atlas. Please check your network connection and MongoDB Atlas status.");
        }
        throw error; // Rethrow the error so we know if connection fails
    }
}

module.exports = { connectToDatabase };