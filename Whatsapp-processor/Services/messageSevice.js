const {connectToDatabase}=require('../Config/db.js');

async function insertMessage(msg){
    try {
        const collection = await connectToDatabase();
        const existingMessage = await collection.findOne({msg_id: msg.msg_id });
        if(!existingMessage) {
            await collection.insertOne(msg);
            console.log(`Inserted new message: ${msg.msg_id}`);
        } else {
            console.log(`Message already exists: ${msg.msg_id}`);
        }
    } catch (error) {
        console.error('Error inserting message:', error);
        throw error;
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
