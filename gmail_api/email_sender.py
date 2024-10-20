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
    body = "<h1>This is a test email sent from Ezemail's email sender.</h1>"

    send_email(gmail, sender, recipient, subject, body)
