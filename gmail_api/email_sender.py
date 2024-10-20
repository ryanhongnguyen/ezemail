from simplegmail import Gmail
from simplegmail.message import Attachment
import os

def authenticate_gmail():
    
    gmail = Gmail()
    return gmail

def send_email(gmail, sender, to, subject, body, attachments=None, signature=True):

    params = {
        "to": to,
        "sender": sender,
        "subject": subject,
        "msg_html": body,
        "msg_plain": body,
        "signature": signature,
    }

    # Send the email
    try:
        message = gmail.send_message(**params)
        print(f"Email sent successfully to {to}")
    except Exception as e:
        print(f"Failed to send email to {to}. Error: {str(e)}")

if __name__ == '__main__':
    gmail = authenticate_gmail()

    sender = "ryan_hpnguyen@berkeley.edu"
    recipient = "ryan_hpnguyen@berkeley.edu"
    subject = "Hello from Ezemail!"
    body = """
    <h2>Email Summaries:</h2>
<ul>
<li>
    <strong>Internship opportunity with Walt Disney Imagineering:</strong>
    <ul>
        <li><strong>Sender:</strong> Bmc_engineering Departmental</li>
        <li><strong>Important Information:</strong> *WDI Imaginations* design competition for students passionate about storytelling, innovation, and design. Virtual info session on Thursday (10/17/24).</li>
        <li><strong>Deadline:</strong> Info session on Thursday (10/17/24)</li>
    </ul>
</li>
<li>
    <strong>EECS 101: Slight change for CS advising location for drop-in today:</strong>
    <ul>
        <li><strong>Sender:</strong> Lydia Raya</li>
        <li><strong>Important Information:</strong> Drop-in hours from 1:30-2PM in 205 Cory today.</li>
        <li><strong>Deadline:</strong> Today for drop-in hours</li>
    </ul>
</li>
</ul>"
"""
    send_email(gmail, sender, recipient, subject, body)
