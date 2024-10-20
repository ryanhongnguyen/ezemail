chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchEmails') {
    const days = request.days;
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
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

function fetchEmails(token, days) {
  return new Promise((resolve, reject) => {
    const query = `newer_than:${days}d`;
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`;
    console.log("fetchEmails url: " + url);
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
        Promise.all(messageIds.map(id => fetchEmailContent(id, token)))
          .then(emails => {
            resolve(emails);
          })
          .catch(error => reject(error));
      })
      .catch(error => reject(error));
  });
}

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
        const headers = message.payload.headers;
        const subjectHeader = headers.find(h => h.name === 'Subject');
        const fromHeader = headers.find(h => h.name === 'From');
        let body = '';
        if (message.payload.parts && message.payload.parts.length > 0) {
          // Check if the email has multiple parts (multipart emails)
          const part = message.payload.parts.find(p => p.mimeType === 'text/plain'); // Prefer plain text if available
          if (part && part.body && part.body.data) {
            body = decodeURIComponent(atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/')));
          }
        } else if (message.payload.body && message.payload.body.data) {
          // For single-part messages
          body = decodeURIComponent(atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/')));
        }
        const emailData = {
          subject: subjectHeader ? subjectHeader.value : '(No Subject)',
          from: fromHeader ? fromHeader.value : '(Unknown Sender)',
          body: body || '(None)',
        };
        resolve(emailData);
      })
      .catch(error => reject(error));
  });
}
