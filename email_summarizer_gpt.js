const OPENAI_API_KEY = 'Replace with your OpenAI API key'; //Hey, put GPT API here
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function summarizeEmails(emails) {
    const prompt = `
Help me summarize those emails in terms of the senders, some important information, and deadlines, like a comprehensive summary of it. Return it as a formated html stuff so I can present it nicer, like with bullet points stuff.

Here are the emails:
${emails.map(email => `
Subject: ${email.subject}
Sender: ${email.sender}
Date: ${email.date}
Body: ${email.body}
`).join('\n')}
`;

    const requestBody = {
        model: 'gpt-3.5-turbo', // or use 'gpt-4' if you wanna spend hella money
        messages: [{ role: 'user', content: prompt }],
    };

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const summary = data.choices[0].message.content.trim();
        
        return summary;
    } catch (error) {
        console.error('Error fetching summary from OpenAI:', error);
        return null;
    }
}

// const emails = [
//     {
//         subject: "Internship opportunity with Walt Disney Imagineering!",
//         sender: "'Bmc_engineering Departmental' via bmc-mentees-24-25 <bmc-mentees-24-25@lists.berkeley.edu>",
//         date: "2024-10-15 18:16:53-07:00",
//         body: "Hello all,\n\nPlease feel free to share this opportunity with your fellow peers or anyone who you think may be interested!\n\nI'm excited to share with you all the *WDI Imaginations*, a design competition open to all students with a passion for storytelling, innovation, and design. There will be a virtual info session happening on *Thursday (10/17/24)*. This is your opportunity to bring your imaginative ideas to life and win an internship with Walt Disney Imagineering!...",
//     },
//     {
//         subject: "EECS 101: Slight change for CS advising location for drop-in today",
//         sender: "Lydia Raya via Ed <notification@edstem.org>",
//         date: "2024-10-16 08:53:56-07:00",
//         body: "Course: EECS 101\nAuthor: Lydia Raya\nLink: https://edstem.org/us/courses/23247/discussion/5505607\n\nDrop-in hours will remain the same today (11-12PM & 1:30-3:30PM), but they will only be available from 1:30-2PM in 205 Cory...",
//     },
// ];

// summarizeEmails(emails).then(summary => {
//     console.log('Summary Email:\n', summary);
// });
