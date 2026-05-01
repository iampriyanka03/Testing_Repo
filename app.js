// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests — Webhook Verification
app.get('/webhook', (req, res) => {
  const {
    'hub.mode': mode,
    'hub.challenge': challenge,
    'hub.verify_token': token
  } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests — Receive Incoming Webhooks
app.post('/webhook', (req, res) => {
  const body = req.body;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  console.log(`\nWebhook received at ${timestamp}`);
  console.log(JSON.stringify(body, null, 2));

  // Process WhatsApp messages
  if (body.object === 'whatsapp_business_account') {
    body.entry?.forEach((entry) => {
      entry.changes?.forEach((change) => {
        if (change.field === 'messages') {
          const value = change.value;

          // Log incoming messages
          if (value.messages) {
            value.messages.forEach((msg) => {
              console.log(`Message from: ${msg.from}`);
              console.log(`Type: ${msg.type}`);
              console.log(`Body: ${msg.text?.body || '(non-text message)'}`);
            });
          }

          // Log status updates (sent, delivered, read)
          if (value.statuses) {
            value.statuses.forEach((status) => {
              console.log(`Status: ${status.status} for ${status.recipient_id}`);
            });
          }
        }
      });
    });
  }

  res.status(200).end(); // Always return 200 quickly
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
