Cal Hacks 11.0 Project. A Google Chrome extension that digests and summarizes Gmail emails you received in a latest time period you specified. This tool helps you to grasp the important points from your most recent emails.

## Prerequisites

### 1. Clone this repository
Clone this repository to your local environment using the following command:
```bash
git clone <repository-url>
```

### 2. Manually Install the Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer Mode** (toggle switch in the top right corner).
3. Click **Load unpacked** and select the folder where you cloned the repository.

### 3. Set Up Gmail API in Google Cloud Console
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Navigate to **API & Services** > **Library** and enable **Gmail API**.
4. Go to **Credentials** and create an OAuth client ID.
5. Set the OAuth item ID to the ID of this extension (you can find it in the Chrome Extensions page).
6. On the OAuth consent screen, include the scope `https://www.googleapis.com/auth/gmail.readonly`.
7. Once completed, you will get a `Client ID`. Use it for the `"client_id"` in `manifest.json`.

### 4. Try the Extension
Open the extension in Google Chrome and start using it to summarize your Gmail emails.
