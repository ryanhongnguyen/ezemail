from flask import Flask, render_template, request, redirect, url_for
from gmail_api.gmail_service import authenticate_gmail, fetch_emails
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fetch_emails', methods=['POST'])
def fetch_emails_view():
    start_time_str = request.form['start_time']
    end_time_str = request.form['end_time']

    start_time = datetime.strptime(start_time_str, "%Y-%m-%dT%H:%M")
    end_time = datetime.strptime(end_time_str, "%Y-%m-%dT%H:%M")

    gmail = authenticate_gmail()
    emails = fetch_emails(gmail, start_time, end_time)

    for email in emails:
        print(f"Subject: {email['subject']}")
        print(f"Sender: {email['sender']}")
        print(f"Date: {email['date']}")
        print(f"Body: {email['body'][:100]}...")
        print("-" * 50)

    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
