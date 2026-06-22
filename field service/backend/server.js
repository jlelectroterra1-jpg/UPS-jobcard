const axios = require("axios");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin(origin, callback) {
        const allowedOrigin = process.env.FRONTEND_ORIGIN;
        const localNetworkOrigin = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/;

        if (!origin || !allowedOrigin || origin === allowedOrigin || localNetworkOrigin.test(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`Origin not allowed by CORS: ${origin}`));
    }
}));
app.use(express.json({ limit: "50mb" }));


app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

function createTransporter() {
    return nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
            user: requireEnv("BREVO_USER"),
            pass: requireEnv("BREVO_PASS")
        }
    });
}

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

function dataUrlToBuffer(dataUrl) {
    const cleanBase64 = String(dataUrl).replace(/^data:image\/\w+;base64,/, "");
    return Buffer.from(cleanBase64, "base64");
}

function createPdfFromPageImages(pageImages) {
    return new Promise((resolve, reject) => {
        const document = new PDFDocument({
            size: "A4",
            margin: 0,
            autoFirstPage: false
        });
        const chunks = [];

        document.on("data", (chunk) => chunks.push(chunk));
        document.on("end", () => resolve(Buffer.concat(chunks)));
        document.on("error", reject);

        pageImages.forEach((pageImage) => {
            const imageBuffer = dataUrlToBuffer(pageImage);
            document.addPage({ size: "A4", margin: 0 });
            document.image(imageBuffer, 0, 0, {
                fit: [595.28, 841.89],
                align: "center",
                valign: "center"
            });
        });

        document.end();
    });
}

app.post("/send-job-card", async (req, res) => {
    try {
        const {
            recipientEmail,
            subject,
            body,
            pdfBase64,
            pdfFilename,
            pageImages,
            downloadOnly
        } = req.body;

        if (!recipientEmail || !subject || !body || !pdfFilename) {
            return res.status(400).json({
                ok: false,
                error: "recipientEmail, subject, body, and pdfFilename are required."
            });
        }

        const transporter = createTransporter();
        const recipients = Array.isArray(recipientEmail) ? recipientEmail : [recipientEmail];
        const pdfBuffer = Array.isArray(pageImages) && pageImages.length
            ? await createPdfFromPageImages(pageImages)
            : Buffer.from(String(pdfBase64 || "").replace(/^data:application\/pdf;base64,/, ""), "base64");

        if (!pdfBuffer.length) {
            return res.status(400).json({
                ok: false,
                error: "A PDF or page images are required."
            });
        }

        if (downloadOnly) {
            return res.json({
                ok: true,
                pdfBase64: pdfBuffer.toString("base64")
            });
        }

    
        await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
        sender: {
            name: "Electroterra UPS",
            email: requireEnv("GMAIL_USER")
        },
        to: recipients.map((email) => ({ email })),
        subject,
        textContent: body,
        attachment: [
            {
                name: pdfFilename,
                content: pdfBuffer.toString("base64")
            }
        ]
    },
    {
        headers: {
            "api-key": requireEnv("BREVO_API_KEY"),
            "Content-Type": "application/json"
        }
    }
);

        res.json({
            ok: true,
            pdfBase64: pdfBuffer.toString("base64")
        });
    } catch (error) {
        console.error("Email send failed:", error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`UPS job-card email backend running on http://localhost:${port}`);
});
