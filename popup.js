document.getElementById('fetchEmails').addEventListener('click', () => {
    const days = document.getElementById('days').value;
    chrome.runtime.sendMessage({ action: 'fetchEmails', days: days }, function(response) {
      if (response && response.emails) {
        displayEmails(response.emails);
      } else {
        console.error('Failed to fetch emails.');
      }
    });
  });
  
  function displayEmails(emails) {
    const emailResults = document.getElementById('emailResults');
    emailResults.innerHTML = ''; // Clear previous results
    emails.forEach(email => {
      const emailDiv = document.createElement('div');
      emailDiv.innerHTML = `
        <strong>Subject:</strong> ${email.subject}<br>
        <strong>From:</strong> ${email.from}<br>
        <hr>`;
      emailResults.appendChild(emailDiv);
    });
  }
  