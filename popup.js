function displayEmails(emails) {
  const emailResults = document.getElementById('emailResults');
  emailResults.innerHTML = ''; // Clear previous results
  emails.forEach(email => {
    const emailDiv = document.createElement('div');
    emailDiv.innerHTML = `
      <strong>Subject:</strong> ${email.subject}<br>
      <strong>From:</strong> ${email.from}<br>
      <strong>Body:</strong><br><pre>${escapeHtml(email.body)}</pre>
      <hr>`;
    emailResults.appendChild(emailDiv);
  });
}
// Utility function to escape HTML characters
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
document.getElementById('fetchEmails').addEventListener('click', () => {
  const days = document.getElementById('days').value || '7'; // Default to 7 days
  document.getElementById('emailResults').textContent = 'Fetching emails...';
  chrome.runtime.sendMessage({ action: 'fetchEmails', days: days }, function(response) {
    if (response && response.emails) {
      displayEmails(response.emails);
      summarizeEmails(response.emails).then(summary => {
          console.log('Summary Email:\n', summary);});
      summarizeEmails(response.emails).then(summary => {
          console.log('Summary Email:\n', summary);});
    } else if (response && response.error) {
      document.getElementById('emailResults').textContent = 'Error: ' + response.error;
    } else {
      document.getElementById('emailResults').textContent = 'Failed to fetch emails.';
    }
  });
});

const OPENAI_API_KEY = 'REPLACE';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function summarizeEmails(emails) {
    const prompt = `
Help me summarize those emails in terms of the senders, some important information, and deadlines, like a comprehensive summary of it. Return it as a formated html stuff so I can present it nicer, like with bullet points stuff.

Here are the emails:
${emails.map(email => `
Subject: ${email.subject}
Sender: ${email.from}
Body: ${email.body}
`).join('\n')}
`;

    const requestBody = {
        model: 'gpt-3.5-turbo', // or use 'gpt-4' if you wanna spend hella money
        messages: [{ role: 'user', content: prompt }],
    };

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
