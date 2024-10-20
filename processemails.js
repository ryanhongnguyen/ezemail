// processEmails.js

import CONFIG from "./config";

// Function to request emails from the background script
function getEmails(days) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'fetchEmails', days: days }, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
                return;
            }
            if (response.error) {
                reject(response.error);
                return;
            }
            resolve(response.emails);
        });
    });
}

// Use the function to get emails and then summarize them
getEmails(7) // Fetch emails from the last 7 days; adjust as needed
    .then(emails => {
        // Pass the emails to the summarizeEmails function
        summarizeEmails(emails).then(summary => {
            console.log('Summary Email:\n', summary);
            // You can display the summary in your extension's UI here
        }).catch(error => {
            console.error('Error summarizing emails:', error);
        });
    })
    .catch(error => {
        console.error('Error fetching emails:', error);
    });

// Your summarizeEmails function
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function summarizeEmails(emails) {
    const prompt = `
Help me summarize these emails in terms of the senders, important information, and deadlines, like a comprehensive summary. Return it as formatted HTML with bullet points for better presentation.

Here are the emails:
${emails.map(email => `
Subject: ${email.subject}
Sender: ${email.from}
Date: ${email.date}
`).join('\n')}
`;

    const requestBody = {
        model: 'gpt-3.5-turbo', // or 'gpt-4' if available
        messages: [{ role: 'user', content: prompt }],
    };

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const summary = data.choices[0].message.content.trim();

        return summary;
    } catch (error) {
        console.error('Error fetching summary from OpenAI:', error);
        return null;
    }
}