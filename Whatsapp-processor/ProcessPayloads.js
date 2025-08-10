const fs = require("fs");
const path = require("path");
const{insertMessage, updateMessage} = require("./Services/messageSevice");

// Enable more detailed logging
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

const payloadDir = path.join(__dirname, "Payloads");
console.log('Looking for payloads in:', payloadDir);
// Read all JSON files in the directory
const files = fs.readdirSync(payloadDir);
console.log('Found files:', files);

files.forEach(async (file) => {
  if (file.endsWith(".json")) {
    console.log('Processing file:', file);
    const filePath = path.join(payloadDir, file);
    const rawData = fs.readFileSync(filePath, "utf8");
    try {
      const payload = JSON.parse(rawData);
      console.log('Successfully parsed JSON for:', file);
      await processPayload(payload);
      console.log('Successfully processed payload for:', file);
    } catch (error) {
      console.error('Error processing file:', file, error);
    }
  }
});

async function processPayload(payload) {
  console.log('Processing payload:', payload._id);
  const entries = payload.metaData?.entry || [];
  console.log('Number of entries:', entries.length);
  
  for (const entry of entries) {
    const changes = entry.changes || [];
    console.log('Number of changes:', changes.length);
    
    for (const change of changes) {
      const value = change.value || {};

      // If it's a message payload
      if (value.messages) {
        console.log('Found messages in payload');
        for (const msg of value.messages) {
          console.log('Processing message:', msg.id);
          try {
            await insertMessage({
              msg_id: msg.id,
              from: msg.from,
              text: msg.text?.body || null,
              timestamp: Number(msg.timestamp),
              status: "sent"
            });
            console.log('Successfully inserted message:', msg.id);
          } catch (error) {
            console.error('Error inserting message:', error);
          }
        }
      }

      // If it's a status payload
      if (value.statuses) {
        console.log('Found statuses in payload');
        for (const stat of value.statuses) {
          const msgId = stat.id || stat.meta_msg_id;
          console.log('Processing status update for:', msgId);
          try {
            await updateMessage({
              msg_id: msgId,
              status: stat.status
            });
            console.log('Successfully updated status for:', msgId);
          } catch (error) {
            console.error('Error updating status:', error);
          }
        }
      }
    }
  }
}
