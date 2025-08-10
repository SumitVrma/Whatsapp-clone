const {connectToDatabase}=require('../Config/db.js');

async function insertMessage(msg) {
    let collection;
    try {
        collection = await connectToDatabase();
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw new Error('Database connection failed');
    }

    try {
        const existingMessage = await collection.findOne({ msg_id: msg.msg_id });
        if (!existingMessage) {
            await collection.insertOne(msg);
            console.log(`Inserted new message: ${msg.msg_id}`);
            return { success: true, message: 'Message inserted successfully' };
        } else {
            console.log(`Message already exists: ${msg.msg_id}`);
            return { success: true, message: 'Message already exists' };
        }
    } catch (error) {
        console.error('Error inserting message:', error);
        if (error.name === 'MongoNetworkError') {
            throw new Error('Database network error occurred');
        } else if (error.name === 'MongoWriteConcernError') {
            throw new Error('Could not confirm message write to database');
        } else {
            throw new Error('Failed to process message');
        }
    }
}

async function updateMessage(msg) {
    try {
        const collection = await connectToDatabase();
        const result = await collection.updateOne(
            { msg_id: msg.msg_id },
            { $set: { status: msg.status } }
        );
        if (result.modifiedCount > 0) {
            console.log(`Updated ${msg.msg_id} to status: ${msg.status}`);
        } else {
            console.log(`Message ${msg.msg_id} not found for status update`);
        }
    } catch (error) {
        console.error('Error updating message:', error);
        throw error;
    }
}

    module.exports = { insertMessage, updateMessage };
