// This needs to be a CommonJS module for Netlify functions, so we use require.
const fetch = require('node-fetch');

// The main handler function for the serverless endpoint.
exports.handler = async function(event, context) {
    // Get the API key from Netlify's environment variables.
    // IMPORTANT: You must set this in your Netlify project's settings.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API key is not configured.' })
        };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const prompt = `Generate a list of 5 funny, surreal, poetic, or bizarre surnames for the first name 'Dean'. Think alliteration, rhythm, and unexpected combinations. Examples: LaGoon, Marmalade, Halloween. Return ONLY the surnames, separated by newlines.`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Gemini API Error:', errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Gemini API responded with status: ${response.status}` })
            };
        }

        const result = await response.json();
        const surnamesText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!surnamesText) {
             throw new Error("Invalid response structure from API.");
        }

        const surnames = surnamesText.split('\n').filter(name => name.trim() !== '');

        // Return a successful response to the frontend
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ surnames })
        };

    } catch (error) {
        console.error('Error in serverless function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};