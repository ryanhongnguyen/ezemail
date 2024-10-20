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
      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`;
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
          const emailData = {
            subject: subjectHeader ? subjectHeader.value : '(No Subject)',
            from: fromHeader ? fromHeader.value : '(Unknown Sender)'
          };
          resolve(emailData);
        })
        .catch(error => reject(error));
    });
  }
  