chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchEmails') {
    const days = request.days;
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError) {
        console.error('Auth Error:', chrome.runtime.lastError.message);
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }
      fetchEmails(token, days)
        .then(emails => {
          sendResponse({ emails: emails });
        })
        .catch(error => {
          console.error('Error:', error);
          sendResponse({ error: error.message });
        });
    });
    return true; // Keep the message channel open for sendResponse
  }
});
function fetchEmailContent(messageId, token) {
return new Promise((resolve, reject) => {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
  fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
    .then(response => response.json())
    .then(message => {
      if (!message.payload) {
        reject(new Error('Message payload is missing'));
        return;
      }
      const headers = message.payload.headers || [];
      const subjectHeader = headers.find(h => h.name === 'Subject');
      const fromHeader = headers.find(h => h.name === 'From');
      const subject = subjectHeader ? subjectHeader.value : '(No Subject)';
      const from = fromHeader ? fromHeader.value : '(Unknown Sender)';
      // Extract the body from the message payload
      const body = getEmailBody(message.payload);
      const emailData = {
        subject: subject,
        from: from,
        body: body
      };
      resolve(emailData);
    })
    .catch(error => reject(error));
});
}
// background.js (add this function)
function getEmailBody(payload) {
let body = '';
if (payload.parts) {
  for (const part of payload.parts) {
    if (part.mimeType === 'text/plain' && part.body && part.body.data) {
      body = part.body.data;
      break;
    } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
      body = part.body.data;
      break;
    } else if (part.parts) {
      body = getEmailBody(part);
      if (body) {
        break;
      }
    }
  }
} else if (payload.body && payload.body.data) {
  body = payload.body.data;
}
if (body) {
  // Decode from Base64URL format
  body = atob(body.replace(/-/g, '+').replace(/_/g, '/'));
}
return body;
}
// background.js
function fetchEmails(token, days) {
return new Promise((resolve, reject) => {
  const query = `newer_than:${days}d`;
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`;
  fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
    .then(response => response.json())
    .then(data => {
      if (!data.messages || data.messages.length === 0) {
        resolve([]); // No messages found
        return;
      }
      const messageIds = data.messages.map(msg => msg.id);
      // Limit to the first 10 messages
      const limitedMessageIds = messageIds.slice(0, 10);
      Promise.all(limitedMessageIds.map(id => fetchEmailContent(id, token)))
        .then(emails => {
          resolve(emails);
        })
        .catch(error => reject(error));
    })
    .catch(error => reject(error));
});
}