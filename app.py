from flask import Flask, request, jsonify
import openai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Set your OpenAI API key
openai.api_key = 'YOUR_OPENAI_API_KEY'

@app.route('/generate-digest', methods=['POST'])
def generate_digest():
    data = request.json
    emails = data.get('emails', [])

    # Combine email subjects and bodies
    email_contents = '\n\n'.join([f"Subject: {email['subject']}\n\n{email['body']}" for email in emails])

    # Call OpenAI API
    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=[
            {"role": "system", "content": "You are an assistant that summarizes emails."},
            {"role": "user", "content": email_contents}
        ],
        max_tokens=500,
        n=1,
        stop=None,
        temperature=0.7
    )

    digest = response.choices[0].message.content.strip()

    return jsonify({'digest': digest})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)
