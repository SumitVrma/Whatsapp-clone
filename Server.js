const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { insertMessage } = require('./Services/messageSevice.js');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const PORT = process.env.PORT || 3000;

// Configure CORS with environment variables
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// Get all conversations from payloads
app.get('/api/conversations', async (req, res) => {
    try {
        const payloadsDir = path.join(__dirname, 'Payloads');
        const files = await fs.readdir(payloadsDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        const conversations = new Map();

        for (const file of jsonFiles) {
            try {
                console.log(`Processing file: ${file}`);
                const content = await fs.readFile(path.join(payloadsDir, file), 'utf-8');
                const payload = JSON.parse(content);
                
                if (!payload.metaData?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]) {
                    console.log(`Skipping file ${file}: No contacts found`);
                    continue;
                }

                if (!payload.metaData?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
                    console.log(`Skipping file ${file}: No messages found`);
                    continue;
                }
                
                // Process each payload
                const entry = payload.metaData.entry[0];
                const change = entry.changes[0];
                const contact = change.value.contacts[0];
                const whatsappMessage = change.value.messages[0];
                
                // Get or create conversation
                let conversation = conversations.get(contact.wa_id) || {
                    wa_id: contact.wa_id,
                    name: contact.profile.name,
                    number: contact.wa_id,
                    lastMessage: "",
                    lastMessageTime: "",
                    unreadCount: 0,
                    messages: []
                };
                
            // Create message
            const message = {
                id: whatsappMessage.id,
                content: whatsappMessage.text.body,
                timestamp: new Date(Number(whatsappMessage.timestamp) * 1000).toISOString(),
                type: whatsappMessage.from === contact.wa_id ? "received" : "sent",
                status: "delivered"
            };
            
            // Update conversation with new message
            conversation.messages.push(message);
            conversation.lastMessage = message.content;
            conversation.lastMessageTime = message.timestamp;
            
            // Store updated conversation
            conversations.set(contact.wa_id, conversation);
            
            } catch (fileError) {
                console.error(`Error processing file ${file}:`, fileError);
                // Continue with next file
                continue;
            }
        }
        
        console.log(`Found ${conversations.size} conversations`);
        const conversationArray = Array.from(conversations.values());
        console.log('Conversations:', conversationArray);
        
        res.json(conversationArray);
    } catch (error) {
        console.error('Error processing conversations:', error);
        res.status(500).json({ error: 'Failed to process conversations' });
    }
});

// Endpoint to send a new message
app.post('/api/messages', async (req, res) => {
    try {
        const message = {
            msg_id: `msg_${Date.now()}`,
            text: req.body.text,
            sender: req.body.sender,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        await insertMessage(message);
        // Emit the message to all connected clients
        io.emit('new-message', message);
        res.status(201).json(message);
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
