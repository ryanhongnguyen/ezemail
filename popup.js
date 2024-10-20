function displayEmails(emails) {
  const emailResults = document.getElementById('emailResults');
  emailResults.innerHTML = '';
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
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
document.getElementById('fetchEmails').addEventListener('click', () => {
  const days = document.getElementById('days').value || '1';
  document.getElementById('emailResults').textContent = 'Fetching emails...';
  chrome.runtime.sendMessage({ action: 'fetchEmails', days: days }, function(response) {
    if (response && response.emails) {
      displayEmails(response.emails);
      console.log(response);
      summarizeEmails(response.emails).then(summary => {
        console.log('Summary Email:\n', summary);
        const emailSubject = `Summary of your Emails from the last ${days} days`;
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
          if (chrome.runtime.lastError) {
            console.error('Error fetching token:', chrome.runtime.lastError.message);
            return;
          }
          sendEmail(token, emailSubject, summary)
            .then(result => {
              console.log(result);
            })
            .catch(error => {
              console.error('Error sending email:', error);
            });
        });
      });
    } else if (response && response.error) {
      document.getElementById('emailResults').textContent = 'Error: ' + response.error;
    } else {
      document.getElementById('emailResults').textContent = 'Failed to fetch emails.';
    }
  });
});
const OPENAI_API_KEY = "API_KEY";
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
function sendEmail(token, subject, body) {
  return new Promise((resolve, reject) => {
    const email = `
From: "Ryan Nguyen" <ryan_hpnguyen@berkeley.edu>
To: ryan_hpnguyen@berkeley.edu
Subject: ${subject}
Content-Type: text/html; charset="UTF-8"
${body}
`.trim();
    const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)));
    fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: base64EncodedEmail }),
    })
      .then(response => {
        if (response.ok) {
          resolve('Email sent successfully');
        } else {
          reject(new Error(`Failed to send email: ${response.status} ${response.statusText}`));
        }
      })
      .catch(error => reject(error));
  });
}