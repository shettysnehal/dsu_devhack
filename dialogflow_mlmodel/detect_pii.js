// Import the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');
const dotenv = require("dotenv")
dotenv.config()

// Instantiates a session client with your credentials
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: process.env.DIALOGFLOW_CREDENTIAL// Use path.join for cross-platform compatibility
});

// Function to detect intent
async function detectIntent(projectId, sessionId, query, contexts, languageCode) {
  // The path to identify the agent that owns the created intent
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  // The text query request
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  // Detect intent and return the result
  const [response] = await sessionClient.detectIntent(request);
  return response;
}

// Controller function to handle intent detection
const detect_pii = async (req, res) => {
  try {
    const projectId = process.env.DIALOGFLOW_PROJECT_ID || 'doctrac1-mtpg'; // Use environment variable if available
    const sessionId = req.body.sessionId || '123456'; // Random or provided sessionId
    const query = req.body.query; // User query from the request body
    let context;
    let languageCode = 'en'; // Default to English

    // Validate if the query is provided
    if (!query) {
      return res.status(400).json({ error: 'Query is required in the request body' });
    }

    // Check for non-ASCII characters to determine language
    if (/[^\x00-\x7F]/.test(query)) {
      languageCode = 'hi'; // Hindi language code
    }

    // Call the detectIntent function
    const intentResponse = await detectIntent(projectId, sessionId, query, context, languageCode);

    // Extract the fulfillment text
    const fulfillmentText = intentResponse.queryResult.fulfillmentText;

    // Return the fulfillment text as the response
    return res.status(200).json({ fulfillmentText: fulfillmentText });

  } catch (error) {
    console.error("Error detecting intent:", error);
    return res.status(500).json({ error: 'Failed to detect intent' });
  }
};

module.exports = detect_pii;
