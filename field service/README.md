# UPS Job Card App

This app has a browser frontend and a small Node.js backend for sending completed job-card PDFs by email.

## 1. Install Backend Packages

Open a terminal in:

```text
C:\Users\User\Documents\Coding projects\UPS-jobcards\field service\backend
```

Run:

```bash
npm install
```

## 2. Create `.env`

In the `backend` folder, copy `.env.example` and rename the copy to:

```text
.env
```

Fill in:

```env
PORT=3000
FRONTEND_ORIGIN=http://127.0.0.1:5501
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your_16_character_gmail_app_password
```

Use a Gmail **App Password**, not your normal Gmail password.

## 3. Run Backend

In the `backend` folder, run:

```bash
npm start
```

You should see:

```text
UPS job-card email backend running on http://localhost:3000
```

## 4. Open Frontend

Open the app with Live Server:

```text
http://127.0.0.1:5501/index.html
```

## Buttons

- **Download PDF** creates the final job-card PDF and downloads it.
- **Download & Send PDF** creates the PDF, downloads it, then sends the same PDF to the backend email endpoint.
- **Open Gmail Email Fallback** opens Gmail compose with the subject and body filled in, so you can manually attach the saved PDF if the backend is not running.

## Security

Gmail credentials are stored only in:

```text
backend\.env
```

Do not put Gmail credentials in `app.js`, `index.html`, or any frontend/browser code.
