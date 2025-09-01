# Talk to Gmail

AI Agent for managing your Gmail account using natural language.




https://github.com/user-attachments/assets/087e76a7-28a4-47fc-999a-de448dd1f9f7






Built with

- [Cloudflare Workers](https://workers.cloudflare.com)
- [Cloudflare AI SDK](https://agents.cloudflare.com)
- [Gmail API](https://developers.google.com/gmail/api)
- [OpenAI](https://openai.com)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [Streandown](https://streamdown.ai)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vite.dev)

> [!WARNING]  
> Experimental Project: This was an experimental project to learn Cloudflare's AI SDK. It is quite functional but use at your own risk.

## ✨ Features

- Chat with your Gmail using plain English
- Read and search emails by sender, subject, content, or date
- Compose and send new emails with CC/BCC support
- Reply to emails (including reply-all)
- Forward emails to new recipients
- Delete emails (trash or permanent)
- Mark emails as read/unread
- Manage email labels
- Get unread email counts
- Summarize recent emails
- Context-aware email management ("delete that", "reply to the latest")
- Schedule tasks

## 🛠️ Prerequisites

### Required API Keys & Setup

1. **OpenAI API Key**: Get one from [OpenAI Platform](https://platform.openai.com/api-keys)

2. **Google Cloud Console Setup**:
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Gmail API
   - Create OAuth 2.0 credentials:
     - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
     - Application type: "Web application"
     - Add authorized redirect URI, for local development: `http://localhost:5173/oauth/gmail/callback`
   - Note down your **Client ID** and **Client Secret**

3. **Required Gmail API Scopes**: The app requests these scopes:
   - `gmail.readonly` - Read emails
   - `gmail.modify` - Modify emails (mark as read, labels, etc.)
   - `gmail.compose` - Compose emails
   - `gmail.send` - Send emails
   - `userinfo.email` - Get user email for authentication

### Cloudflare Account

- Sign up at [Cloudflare](https://cloudflare.com)
- Install [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## 🚀 Local Development

1. **Clone the repository**:

```bash
git clone https://github.com/fayazara/talk-to-gmail.git
cd talk-to-gmail
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:

Create a `.dev.vars` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/gmail/callback
```

4. **Create KV namespace for token storage**:

```bash
npx wrangler kv:namespace create "GMAIL_TOKENS"
npx wrangler kv:namespace create "GMAIL_TOKENS" --preview
```

Update the `wrangler.jsonc` file with your KV namespace IDs:
- Replace `your_kv_namespace_id_here` with the ID from the first command
- Replace `your_preview_kv_namespace_id_here` with the preview ID from the second command

5. **Run locally**:

```bash
npm run dev
```

6. **Open in browser**: Navigate to `http://localhost:8787`

## 🌐 Deployment

1. **Set production secrets**:

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GOOGLE_REDIRECT_URI
```

## 💬 Usage Examples

Once connected to Gmail, you can use natural language commands:

- **Reading Emails**:
  - "What was my last email?"
  - "Summarize my last 5 emails"
  - "Search emails from work"
  - "How many unread emails do I have?"

- **Managing Emails**:
  - "Reply to my latest email"
  - "Forward that email to john@example.com"
  - "Delete the last email"
  - "Mark all emails from spam@example.com as read"

- **Composing Emails**:
  - "Send an email to test@example.com about the meeting"
  - "Compose an email to the team with subject 'Weekly Update'"

### Environment Variables

| Variable               | Description                | Required |
| ---------------------- | -------------------------- | -------- |
| `OPENAI_API_KEY`       | Your OpenAI API key        | ✅       |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID     | ✅       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | ✅       |
| `GOOGLE_REDIRECT_URI`  | OAuth redirect URI         | ✅       |
