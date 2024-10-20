  document.getElementById('fetchEmails').addEventListener('click', () => {
      const days = document.getElementById('days').value;
      // runtime.sendMessage() sends the data and runtime.onMessage.addListener() in background.js listens
      // action: 'fetchEmails' triggers fetchEmails() in background.js
      chrome.runtime.sendMessage({ action: 'fetchEmails', days: days }, function(response) {
        if (response && response.emails) {
          console.log(response);
          displayEmails(response.emails);
        } else {
          console.log(response);
          console.error('Failed to fetch emails.');
        }
      });
    });
    
    function displayEmails(emails) {
      console.log("Emails array:", emails);
      const emailResults = document.getElementById('emailResults');
      emailResults.innerHTML = ''; // Clear previous results
      emails.forEach(email => {
        console.log("Email:", email);
        const emailDiv = document.createElement('div');
        emailDiv.innerHTML = `
          <strong>Subject:</strong> ${email.subject}<br>
          <strong>From:</strong> ${email.from}<br>
          <strong>Body: </strong> ${email.body} <br>
          <hr>`;
        emailResults.appendChild(emailDiv);
      });
    }
    