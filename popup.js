// popup.js

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
    } else if (response && response.error) {
      document.getElementById('emailResults').textContent = 'Error: ' + response.error;
    } else {
      document.getElementById('emailResults').textContent = 'Failed to fetch emails.';
    }
  });
});
