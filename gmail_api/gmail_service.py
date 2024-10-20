from simplegmail import Gmail
from datetime import datetime

def authenticate_gmail():
    gmail = Gmail()
    return gmail

def fetch_emails(gmail, start_datetime, end_datetime):
    
    query = f'after:{start_datetime.strftime("%Y/%m/%d")} before:{end_datetime.strftime("%Y/%m/%d")}'
    messages = gmail.get_messages(query=query)
    
    emails = []
    for message in messages:
        email_data = {
            "subject": message.subject,
            "sender": message.sender,
            "date": message.date,
            "body": message.plain or message.html,
        }
        emails.append(email_data)
    
    return emails

if __name__ == '__main__':
    
    gmail = authenticate_gmail()

    start_time = datetime(2024, 10, 16)
    end_time = datetime(2024, 10, 17)

    emails = fetch_emails(gmail, start_time, end_time)

    for email in emails:
        print(f"Subject: {email['subject']}")
        print(f"Sender: {email['sender']}")
        print(f"Date: {email['date']}")
        print(f"Body: {email['body']}")
        print("-" * 50)
