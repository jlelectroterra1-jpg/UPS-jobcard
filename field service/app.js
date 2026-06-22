const steps = document.querySelectorAll(".step");
const tabs = document.querySelectorAll(".tab");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");
const jobDateDisplay = document.getElementById("jobDateDisplay");
const photoCount = document.getElementById("photoCount");
const storeStampPhotoInput = document.getElementById("storeStampPhoto");
const stepIndicator = document.getElementById("stepIndicator");
const appStatus = document.getElementById("appStatus");
const downloadPdfButton = document.getElementById("downloadPdfButton");
const downloadSendPdfButton = document.getElementById("downloadSendPdfButton");
const emailBackendUrl = `${window.location.origin}/send-job-card`;
const requiredPhotoIds = [
    "siteOverview",
    "upsFront",
    "upsSerial",
    "displayDiagram",
    "specificationScreen",
    "dcValues",
    "acValues",
    "insideUpsBefore",
    "insideUpsAfter",
    "workDone",
    "completedWork"
];

const photoLabels = {
    siteOverview: "Site Overview Photo",
    upsFront: "UPS Front View With Door Open And Stickers Visible",
    upsSerial: "UPS Serial Number Of The Label",
    displayDiagram: "UPS Display Diagram Screen",
    specificationScreen: "UPS Specification Screen",
    dcValues: "UPS DC Values Screen",
    acValues: "UPS AC Values Screen",
    insideUpsBefore: "Inside of UPS Before Work / Burnt Part",
    insideUpsAfter: "Inside of UPS After Part Replaced",
    workDone: "Photos of Old and New Parts Replaced",
    completedWork: "Completed Work Photo"
};

const technicians = {
    "John-Luther Norval": {
        name: "John-Luther Norval",
        details: "Technician details not added yet.",
        signature: ".vscode/John-Luther Signature.png"
    },
    "Luther Norval": {
        name: "Luther Norval",
        details: "Technician details not added yet.",
        signature: ".vscode/Luther Signature.png"
    },
    "Rogan Lusted": {
        name: "Rogan Lusted",
        details: "Technician details not added yet.",
        signature: ".vscode/rogan signature.png"
    }
};

const choiceMarkFields = {
    reason: {
        Incident: { x: 1125, y: 994 },
        Investigation: { x: 1580, y: 994 },
        "Request from ITFS": { x: 2038, y: 994 }
    },
    discipline: {
        UPS: { x: 1125, y: 1089 },
        Generator: { x: 1580, y: 1089 },
        Electrics: { x: 2038, y: 1089 }
    },
    descriptionOfWork: {
        "UPS Fault": { x: 1125, y: 1184 },
        Netman: { x: 1580, y: 1184 },
        "Electrics Fault": { x: 2038, y: 1184 },
        "Generator Fault": { x: 1125, y: 1280 },
        "Time & Materials": { x: 1580, y: 1280 },
        Other: { x: 2038, y: 1280 }
    }
};

const templatePixelFields = {
    date: { x: 1612, y: 668, w: 520 },
    storeName: { x: 681, y: 763, w: 520 },
    storeNumber: { x: 1612, y: 763, w: 520 },
    hardwareType: { x: 681, y: 1393, w: 1420 },
    natureIssue: { x: 681, y: 1568, w: 1440, h: 210 },
    actionTaken: { x: 681, y: 1830, w: 1440, h: 520 },
    startingTime: { x: 1100, y: 2441, w: 395 },
    endingTime: { x: 1100, y: 2529, w: 395 },
    technicianName: { x: 762, y: 2735, w: 680 },
    technicianSignature: { x: 762, y: 2820, w: 680, h: 130 },
    managerName: { x: 762, y: 2980, w: 680 },
    managerSignature: { x: 762, y: 3078, w: 680, h: 145 },
    storeStamp: { x: 1590, y: 2708, w: 520, h: 510 }
};

const photoData = {};
const signatures = {
    technician: "",
    manager: ""
};

let storeStampPhoto = "";

let currentStep = 0;
const storeStep = 0;
const technicianStep = 1;
const photoStep = 3;
const managerStep = 5;

function getSystemDate() {
    const today = new Date();
    return today.toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
}

function showStep(stepNumber) {
    currentStep = stepNumber;

    steps.forEach((step, index) => {
        step.classList.toggle("active", index === currentStep);
    });

    tabs.forEach((tab, index) => {
        tab.classList.toggle("active", index === currentStep);
    });

    stepIndicator.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    backButton.disabled = currentStep === 0;
    nextButton.textContent = "Next";
    nextButton.style.display = currentStep === steps.length - 1 ? "none" : "";

    if (currentStep === steps.length - 1) {
        generateJobCard();
    }
}

function nextStep() {
    if (currentStep === storeStep && !document.getElementById("startingTime").value) {
        alert("Please select the starting time before continuing.");
        return;
    }

    if (currentStep === storeStep && !validTime(document.getElementById("startingTime").value)) {
        alert("Please enter the starting time as 4 numbers: hours first, then minutes. Example: 1430.");
        return;
    }

    if (currentStep === technicianStep && !document.getElementById("technicianName").value) {
        alert("Please select the technician before continuing.");
        return;
    }

    if (currentStep === technicianStep && !signatures.technician) {
        alert("Please capture the technician signature before continuing. Saved signatures can be added later.");
        return;
    }

    if (currentStep === 2 && !issueChoicesComplete()) {
        alert("Please select the reason, discipline, and description of work before continuing.");
        return;
    }

    if (currentStep === photoStep && !allRequiredPhotosTaken()) {
        alert("Please take all 11 required photos before continuing.");
        return;
    }

    if (currentStep === photoStep && !document.getElementById("hardwareType").value) {
        alert("Please select the hardware type before continuing.");
        return;
    }

    if (currentStep === managerStep && !managerSignOffComplete()) {
        alert("Please enter the manager name, capture the manager signature, and take the store stamp photo.");
        return;
    }

    if (currentStep === managerStep && !validTime(document.getElementById("endingTime").value)) {
        alert("Please enter the ending time as 4 numbers: hours first, then minutes. Example: 1530.");
        return;
    }

    if (currentStep === managerStep && !endingTimeAfterStartingTime()) {
        alert("Completion time cannot be earlier than the starting time.");
        return;
    }

    if (currentStep < steps.length - 1) {
        showStep(currentStep + 1);
    } else {
        generateJobCard();
    }
}

function backStep() {
    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
}

function generateJobCard() {
    const storeName = document.getElementById("storeName").value;
    const storeNumber = document.getElementById("storeNumber").value;
    const startingTime = document.getElementById("startingTime").value;
    const endingTime = document.getElementById("endingTime").value;
    const technicianName = document.getElementById("technicianName").value;
    const managerName = document.getElementById("managerName").value;
    const hardwareType = document.getElementById("hardwareType").value;
    const reason = document.getElementById("reason").value;
    const discipline = document.getElementById("discipline").value;
    const descriptionOfWork = document.getElementById("descriptionOfWork").value;
    const natureIssue = document.getElementById("natureIssue").value;
    const actionTaken = document.getElementById("actionTaken").value;
    const jobDate = getSystemDate();

    document.getElementById("jobCardPreview").innerHTML = `
        <h2>POPULATED FIELD SERVICES JOB CARD</h2>
        <div class="pdf-template-preview">
            <img class="pdf-template-image" src="field-service-jobcard-template.png" alt="Field services job card template">
            <span class="pdf-field pdf-date">${safeText(jobDate)}</span>
            <span class="pdf-field pdf-store-name">${safeText(storeName)}</span>
            <span class="pdf-field pdf-store-number">${safeText(storeNumber)}</span>
            <span class="pdf-field pdf-starting-time">${safeText(formatTime(startingTime))}</span>
            <span class="pdf-field pdf-ending-time">${safeText(formatTime(endingTime))}</span>
            <span class="pdf-field pdf-technician-name">${safeText(technicianName)}</span>
            <span class="pdf-field pdf-manager-name">${safeText(managerName)}</span>
            <span class="pdf-field pdf-hardware-type">${safeText(hardwareType)}</span>
            ${reason ? `<span class="pdf-choice-mark ${getChoicePreviewClass("reason", reason)}">X</span>` : ""}
            ${discipline ? `<span class="pdf-choice-mark ${getChoicePreviewClass("discipline", discipline)}">X</span>` : ""}
            ${descriptionOfWork ? `<span class="pdf-choice-mark ${getChoicePreviewClass("descriptionOfWork", descriptionOfWork)}">X</span>` : ""}
            <span class="pdf-field pdf-nature">${safeText(natureIssue)}</span>
            <span class="pdf-field pdf-action">${safeText(actionTaken)}</span>
            ${signatures.technician ? `<img class="pdf-signature pdf-technician-signature" src="${signatures.technician}" alt="Technician signature">` : ""}
            ${signatures.manager ? `<img class="pdf-signature pdf-manager-signature" src="${signatures.manager}" alt="Manager signature">` : ""}
            ${storeStampPhoto ? `<img class="pdf-stamp-photo" src="${storeStampPhoto}" alt="Store stamp">` : ""}
        </div>
    `;

    renderPhotoPreview();
}

async function downloadFinalPdf() {
    try {
        setBusyState(true, "Creating PDF...");
        const pdfBlob = await buildPdfFromBackend();
        downloadBlob(pdfBlob, buildPdfFileName());
        setStatus("PDF downloaded.", "success");
    } catch (error) {
        setStatus("PDF download failed.", "error");
        alert(`Could not create PDF: ${error.message}`);
    } finally {
        setBusyState(false);
    }
}

async function downloadAndSendPdf() {
    try {
        const recipientEmail = getSelectedRecipientEmails();

        if (!recipientEmail.length) {
            alert("Please select at least one email recipient.");
            return;
        }

        const invalidEmails = recipientEmail.filter((email) => !validEmail(email));

        if (invalidEmails.length) {
            alert(`These recipient emails are not valid:\n${invalidEmails.join("\n")}`);
            return;
        }

        setBusyState(true, "Creating PDF and sending email...");
        const pageImages = await buildFinalPages();
        const pdfFilename = buildPdfFileName();
        const emailData = buildEmailData();

        const response = await fetch(emailBackendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                recipientEmail,
                subject: emailData.subject,
                body: emailData.body,
                pageImages: pageImages.map((pageImage) => pageImage.dataUrl),
                pdfFilename
            })
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            throw new Error(result.error || "The backend could not send the email.");
        }

        const pdfBlob = base64ToBlob(result.pdfBase64, "application/pdf");
        downloadBlob(pdfBlob, pdfFilename);
        setStatus(`PDF downloaded and sent to ${recipientEmail.length} recipient${recipientEmail.length === 1 ? "" : "s"}.`, "success");
        alert("PDF downloaded and email sent.");
    } catch (error) {
        setStatus("Email send failed.", "error");

        if (error instanceof TypeError && error.message === "Failed to fetch") {
            alert("Could not send PDF: the email backend is not running. Start the backend from the backend folder, then try again.");
            return;
        }

        alert(`Could not send PDF: ${error.message}`);
    } finally {
        setBusyState(false);
    }
}

function getSelectedRecipientEmails() {
    return Array.from(document.querySelectorAll('input[name="emailRecipient"]:checked'))
        .map((input) => input.value)
        .filter(Boolean);
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setBusyState(isBusy, message = "") {
    downloadPdfButton.disabled = isBusy;
    downloadSendPdfButton.disabled = isBusy;
    nextButton.disabled = isBusy || currentStep === 0;
    backButton.disabled = isBusy || currentStep === 0;

    if (isBusy) {
        setStatus(message, "info");
    }
}

function setStatus(message, type = "info") {
    appStatus.textContent = message;
    appStatus.className = `app-status ${message ? "visible" : ""} ${type}`;
}

async function shareFinalPdf() {
    try {
        openGmailCompose();
    } catch (error) {
        alert(`Could not open Gmail: ${error.message}`);
    }
}

function openGmailCompose() {
    const emailData = buildEmailData();
    const gmailUrl = new URL("https://mail.google.com/mail/");
    gmailUrl.searchParams.set("view", "cm");
    gmailUrl.searchParams.set("fs", "1");
    gmailUrl.searchParams.set("su", emailData.subject);
    gmailUrl.searchParams.set("body", emailData.body);

    window.open(gmailUrl.toString(), "_blank");
}

function buildEmailData() {
    const data = getJobData();

    return {
        subject: `UPS Job Card - ${data.storeName || "Store"} - ${getSystemDate()}`,
        body: [
        "Hi,",
        "",
        "Please find the completed UPS job card attached.",
        "",
        `Store Name: ${data.storeName || ""}`,
        `Store Number: ${data.storeNumber || ""}`,
        `Technician: ${data.technicianName || ""}`,
        `Date: ${data.jobDate || ""}`,
        `Reason: ${data.reason || ""}`,
        `Discipline: ${data.discipline || ""}`,
        `Description of Work: ${data.descriptionOfWork || ""}`,
        "",
        "Regards"
        ].join("\n")
    };
}

async function buildFinalPages() {
    generateJobCard();

    const pageImages = [];
    pageImages.push(await createJobCardPageImage());

    const photoPages = await createPhotoEvidencePageImages();
    pageImages.push(...photoPages);

    return pageImages;
}

async function buildFinalPdf() {
    const pageImages = await buildFinalPages();
    return createPdfFromJpegs(pageImages);
}

async function buildPdfFromBackend() {
    const pageImages = await buildFinalPages();
    const response = await fetch(emailBackendUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            recipientEmail: "download-only@local.test",
            subject: "Download only",
            body: "Download only",
            pageImages: pageImages.map((pageImage) => pageImage.dataUrl),
            pdfFilename: buildPdfFileName(),
            downloadOnly: true
        })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
        throw new Error(result.error || "The backend could not create the PDF.");
    }

    return base64ToBlob(result.pdfBase64, "application/pdf");
}

function downloadBlob(blob, fileName) {
    const link = document.createElement("a");
    const fileUrl = URL.createObjectURL(blob);
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
    }, 60000);
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = String(reader.result || "");
            resolve(result.split(",")[1] || result);
        };

        reader.onerror = () => reject(new Error("Could not read PDF for email."));
        reader.readAsDataURL(blob);
    });
}

function base64ToBlob(base64, contentType) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index++) {
        bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: contentType });
}

async function openPrintablePdf() {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Your browser blocked the PDF window. Please allow popups for this site and try again.");
        return;
    }

    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Preparing PDF</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 24px;
                }
            </style>
        </head>
        <body>
            Preparing PDF pages...
        </body>
        </html>
    `);
    printWindow.document.close();

    const pageImages = await buildFinalPages();
    const pagesHtml = pageImages.map((pageImage) => `
        <section class="print-page">
            <img src="${pageImage.dataUrl}" alt="UPS job card page">
        </section>
    `).join("");

    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${safeText(buildPdfFileName())}</title>
            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    background: #fff;
                }

                .print-page {
                    width: 210mm;
                    height: 297mm;
                    page-break-after: always;
                    break-after: page;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fff;
                    overflow: hidden;
                }

                .print-page:last-child {
                    page-break-after: auto;
                    break-after: auto;
                }

                img {
                    width: 210mm;
                    height: 297mm;
                    object-fit: contain;
                    display: block;
                }

                @page {
                    size: A4 portrait;
                    margin: 0;
                }

                @media screen {
                    body {
                        background: #ddd;
                    }

                    .print-page {
                        margin: 16px auto;
                        box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
                    }
                }
            </style>
        </head>
        <body>
            ${pagesHtml}
            <script>
                window.addEventListener("load", () => {
                    setTimeout(() => window.print(), 500);
                });
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function buildPdfFileName() {
    const storeName = document.getElementById("storeName").value.trim() || "UPS-Jobcard";
    const cleanStoreName = storeName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    return `${cleanStoreName}-${getSystemDate().replace(/\//g, "-")}.pdf`;
}

async function createJobCardPageImage() {
    const templateImage = await loadImage("field-service-jobcard-template.png");
    const canvas = document.createElement("canvas");
    canvas.width = templateImage.naturalWidth;
    canvas.height = templateImage.naturalHeight;

    const context = canvas.getContext("2d");
    context.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
    context.fillStyle = "#111";
    context.font = "30px Arial";
    context.textBaseline = "top";

    const data = getJobData();
    drawText(context, data.jobDate, templatePixelFields.date);
    drawText(context, data.storeName, templatePixelFields.storeName);
    drawText(context, data.storeNumber, templatePixelFields.storeNumber);
    drawText(context, data.hardwareType, templatePixelFields.hardwareType);
    drawChoiceMark(context, "reason", data.reason);
    drawChoiceMark(context, "discipline", data.discipline);
    drawChoiceMark(context, "descriptionOfWork", data.descriptionOfWork);
    drawWrappedText(context, data.natureIssue, templatePixelFields.natureIssue);
    drawWrappedText(context, data.actionTaken, templatePixelFields.actionTaken);
    drawText(context, data.startingTime, templatePixelFields.startingTime, { align: "center" });
    drawText(context, data.endingTime, templatePixelFields.endingTime, { align: "center" });
    drawText(context, data.technicianName, templatePixelFields.technicianName);
    drawText(context, data.managerName, templatePixelFields.managerName);

    if (signatures.technician) {
        await drawImageInside(context, signatures.technician, templatePixelFields.technicianSignature, true);
    }

    if (signatures.manager) {
        await drawImageInside(context, signatures.manager, templatePixelFields.managerSignature, true);
    }

    if (storeStampPhoto) {
        await drawImageInside(context, storeStampPhoto, templatePixelFields.storeStamp, false);
    }

    return canvasToJpegPage(canvas);
}

async function createPhotoEvidencePageImages() {
    const pages = [];
    const photos = requiredPhotoIds
        .filter((photoId) => photoData[photoId])
        .map((photoId) => ({
            label: photoLabels[photoId],
            src: photoData[photoId]
        }));

    for (let index = 0; index < photos.length; index += 4) {
        const canvas = document.createElement("canvas");
        canvas.width = 2382;
        canvas.height = 3368;

        const context = canvas.getContext("2d");
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "#111";
        context.font = "bold 76px Arial";
        context.textAlign = "center";
        context.fillText("PHOTO EVIDENCE", canvas.width / 2, 150);

        const slots = [
            { x: 160, y: 300, w: 980, h: 1180 },
            { x: 1240, y: 300, w: 980, h: 1180 },
            { x: 160, y: 1680, w: 980, h: 1180 },
            { x: 1240, y: 1680, w: 980, h: 1180 }
        ];

        const group = photos.slice(index, index + 4);

        for (let slotIndex = 0; slotIndex < group.length; slotIndex++) {
            const slot = slots[slotIndex];
            context.strokeStyle = "#111";
            context.lineWidth = 4;
            context.strokeRect(slot.x, slot.y, slot.w, slot.h);

            await drawImageInside(context, group[slotIndex].src, {
                x: slot.x + 20,
                y: slot.y + 20,
                w: slot.w - 40,
                h: slot.h - 120
            }, false);

            context.fillStyle = "#111";
            context.font = "bold 34px Arial";
            context.textAlign = "left";
            context.fillText(group[slotIndex].label, slot.x + 20, slot.y + slot.h - 55);
        }

        pages.push(canvasToJpegPage(canvas));
    }

    return pages;
}

function getJobData() {
    return {
        storeName: document.getElementById("storeName").value,
        storeNumber: document.getElementById("storeNumber").value,
        startingTime: formatTime(document.getElementById("startingTime").value),
        endingTime: formatTime(document.getElementById("endingTime").value),
        technicianName: document.getElementById("technicianName").value,
        managerName: document.getElementById("managerName").value,
        hardwareType: document.getElementById("hardwareType").value,
        reason: document.getElementById("reason").value,
        discipline: document.getElementById("discipline").value,
        descriptionOfWork: document.getElementById("descriptionOfWork").value,
        natureIssue: document.getElementById("natureIssue").value,
        actionTaken: document.getElementById("actionTaken").value,
        jobDate: getSystemDate()
    };
}

function drawChoiceMark(context, groupName, value) {
    const markPosition = choiceMarkFields[groupName][value];

    if (!markPosition) {
        return;
    }

    context.save();
    context.fillStyle = "#111";
    context.font = "bold 42px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("X", markPosition.x, markPosition.y);
    context.restore();
}

function drawText(context, text, box, options = {}) {
    context.save();
    context.fillStyle = "#111";
    context.font = options.font || "30px Arial";
    context.textBaseline = "top";
    context.textAlign = options.align || "left";

    const x = options.align === "center" ? box.x + box.w / 2 : box.x;
    context.fillText(text || "", x, box.y, box.w);
    context.restore();
}

function drawWrappedText(context, text, box) {
    context.save();
    context.fillStyle = "#111";
    context.font = "30px Arial";
    context.textBaseline = "top";
    context.textAlign = "left";

    const words = String(text || "").split(/\s+/);
    const lineHeight = 38;
    let line = "";
    let y = box.y;

    words.forEach((word) => {
        const testLine = line ? `${line} ${word}` : word;
        if (context.measureText(testLine).width > box.w && line) {
            if (y + lineHeight <= box.y + box.h) {
                context.fillText(line, box.x, y);
            }
            line = word;
            y += lineHeight;
            return;
        }
        line = testLine;
    });

    if (line && y + lineHeight <= box.y + box.h) {
        context.fillText(line, box.x, y);
    }

    context.restore();
}

async function drawImageInside(context, src, box, transparentBackground) {
    const image = await loadImage(src);
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const boxRatio = box.w / box.h;
    let drawWidth = box.w;
    let drawHeight = box.h;

    if (imageRatio > boxRatio) {
        drawHeight = box.w / imageRatio;
    } else {
        drawWidth = box.h * imageRatio;
    }

    const drawX = box.x + (box.w - drawWidth) / 2;
    const drawY = box.y + (box.h - drawHeight) / 2;

    if (!transparentBackground) {
        context.fillStyle = "#fff";
        context.fillRect(box.x, box.y, box.w, box.h);
    }

    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Could not load image: ${src}`));
        image.src = src;
    });
}

function canvasToJpegPage(canvas) {
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    return {
        dataUrl,
        bytes: dataUrlToBytes(dataUrl),
        width: canvas.width,
        height: canvas.height
    };
}

function dataUrlToBytes(dataUrl) {
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index++) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

function createPdfFromJpegs(pageImages) {
    const chunks = [];
    const offsets = [];
    let length = 0;
    const objectCount = 2 + pageImages.length * 3;
    const pageObjectIds = [];

    function appendString(value) {
        const bytes = new TextEncoder().encode(value);
        chunks.push(bytes);
        length += bytes.length;
    }

    function appendBytes(bytes) {
        chunks.push(bytes);
        length += bytes.length;
    }

    function startObject(id) {
        offsets[id] = length;
        appendString(`${id} 0 obj\n`);
    }

    appendString("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

    startObject(1);
    appendString("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

    startObject(2);
    pageImages.forEach((_, index) => {
        pageObjectIds.push(3 + index * 3);
    });
    appendString(`<< /Type /Pages /Count ${pageImages.length} /Kids ${pageObjectIds.map((id) => `${id} 0 R`).join(" ")} >>\nendobj\n`);

    pageImages.forEach((pageImage, index) => {
        const pageId = 3 + index * 3;
        const imageId = pageId + 1;
        const contentId = pageId + 2;
        const jpegBytes = pageImage.bytes;
        const imageWidth = pageImage.width || 2382;
        const imageHeight = pageImage.height || 3368;

        startObject(pageId);
        appendString(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im${index} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`);

        startObject(imageId);
        appendString(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
        appendBytes(jpegBytes);
        appendString("\nendstream\nendobj\n");

        const content = `q\n595.28 0 0 841.89 0 0 cm\n/Im${index} Do\nQ\n`;
        startObject(contentId);
        appendString(`<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
    });

    const xrefOffset = length;
    appendString(`xref\n0 ${objectCount + 1}\n`);
    appendString("0000000000 65535 f \n");

    for (let id = 1; id <= objectCount; id++) {
        appendString(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
    }

    appendString(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

    return new Blob(chunks, { type: "application/pdf" });
}

function formatTime(timeValue) {
    if (!timeValue) {
        return "";
    }

    const digits = timeValue.replace(/\D/g, "");

    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

function validTime(timeValue) {
    const digits = timeValue.replace(/\D/g, "");
    const hours = Number(digits.slice(0, 2));
    const minutes = Number(digits.slice(2, 4));

    return digits.length === 4 && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function timeToMinutes(timeValue) {
    const digits = timeValue.replace(/\D/g, "");
    const hours = Number(digits.slice(0, 2));
    const minutes = Number(digits.slice(2, 4));

    return hours * 60 + minutes;
}

function endingTimeAfterStartingTime() {
    const startingTime = document.getElementById("startingTime").value;
    const endingTime = document.getElementById("endingTime").value;

    if (!validTime(startingTime) || !validTime(endingTime)) {
        return false;
    }

    return timeToMinutes(endingTime) >= timeToMinutes(startingTime);
}

function onlyAllowTimeNumbers() {
    const startingTimeInput = document.getElementById("startingTime");
    const digitsOnly = startingTimeInput.value.replace(/\D/g, "").slice(0, 4);
    startingTimeInput.value = digitsOnly;
}

function allRequiredPhotosTaken() {
    return requiredPhotoIds.every((photoId) => Boolean(photoData[photoId]));
}

function managerSignOffComplete() {
    const managerName = document.getElementById("managerName").value.trim();
    return Boolean(managerName && signatures.manager && storeStampPhoto);
}

function issueChoicesComplete() {
    return Boolean(
        document.getElementById("reason").value &&
        document.getElementById("discipline").value &&
        document.getElementById("descriptionOfWork").value
    );
}

function getChoicePreviewClass(groupName, value) {
    return `pdf-${groupName}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function safeText(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function updatePhotoCount() {
    const totalTaken = requiredPhotoIds.filter((photoId) => Boolean(photoData[photoId])).length;
    photoCount.textContent = totalTaken;
}

function handlePhotoChange(event) {
    const input = event.target;
    const photoId = input.dataset.photoId;
    const file = input.files[0];

    if (!file || !photoId) {
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        photoData[photoId] = reader.result;

        const previewImage = document.getElementById(`preview-${photoId}`);
        previewImage.src = reader.result;
        previewImage.classList.add("has-photo");

        input.closest(".photo-item").classList.add("complete");
        input.closest(".camera-button").firstChild.textContent = "Retake Photo ";
        updatePhotoCount();
    };

    reader.readAsDataURL(file);
}

function handleStoreStampPhotoChange(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        storeStampPhoto = reader.result;

        const previewImage = document.getElementById("preview-storeStamp");
        previewImage.src = reader.result;
        previewImage.classList.add("has-photo");

        event.target.closest(".photo-item").classList.add("complete");
        event.target.closest(".camera-button").firstChild.textContent = "Retake Store Stamp Photo ";
    };

    reader.readAsDataURL(file);
}

function setupSignaturePad(canvas, signatureKey) {
    const context = canvas.getContext("2d");
    let isDrawing = false;

    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#111";

    function getPoint(event) {
        const source = event.touches ? event.touches[0] : event;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (source.clientX - rect.left) * scaleX,
            y: (source.clientY - rect.top) * scaleY
        };
    }

    function startDrawing(event) {
        event.preventDefault();
        const point = getPoint(event);
        isDrawing = true;
        context.beginPath();
        context.moveTo(point.x, point.y);
    }

    function draw(event) {
        if (!isDrawing) {
            return;
        }

        event.preventDefault();
        const point = getPoint(event);
        context.lineTo(point.x, point.y);
        context.stroke();
    }

    function stopDrawing() {
        if (!isDrawing) {
            return;
        }

        isDrawing = false;
        signatures[signatureKey] = canvas.toDataURL("image/png");
    }

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);
}

function clearSignature(signatureKey) {
    const canvas = document.getElementById(`${signatureKey}Signature`);
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    signatures[signatureKey] = "";
}

function handleTechnicianChange() {
    const selectedName = document.getElementById("technicianName").value;
    const detailsBox = document.getElementById("technicianDetails");
    const selectedTechnician = technicians[selectedName];

    if (!selectedTechnician) {
        detailsBox.textContent = "Select a technician to load their details.";
        signatures.technician = "";
        clearSignatureCanvasOnly("technician");
        return;
    }

    detailsBox.innerHTML = `
        <strong>${safeText(selectedTechnician.name)}</strong>
        <span>${safeText(selectedTechnician.details)}</span>
    `;

    if (selectedTechnician.signature) {
        signatures.technician = selectedTechnician.signature;
        drawSignaturePreview("technician", selectedTechnician.signature);
    } else {
        signatures.technician = "";
        clearSignatureCanvasOnly("technician");
    }
}

function clearSignatureCanvasOnly(signatureKey) {
    const canvas = document.getElementById(`${signatureKey}Signature`);
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawSignaturePreview(signatureKey, signatureSrc) {
    const canvas = document.getElementById(`${signatureKey}Signature`);
    const context = canvas.getContext("2d");
    clearSignatureCanvasOnly(signatureKey);

    loadImage(signatureSrc).then((image) => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
    });
}

function renderPhotoPreview() {
    const photoPreview = document.getElementById("photoPreview");

    photoPreview.innerHTML = `
        <h2>PHOTO EVIDENCE</h2>
        <div class="preview-photo-grid">
            ${requiredPhotoIds.map((photoId) => {
                if (!photoData[photoId]) {
                    return "";
                }

                return `
                    <figure>
                        <img src="${photoData[photoId]}" alt="${photoLabels[photoId]}">
                        <figcaption>${photoLabels[photoId]}</figcaption>
                    </figure>
                `;
            }).join("")}
        </div>
    `;
}

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const requestedStep = Number(tab.dataset.step);

        if (requestedStep > storeStep && !document.getElementById("startingTime").value) {
            showStep(storeStep);
            alert("Please select the starting time before continuing.");
            return;
        }

        if (requestedStep > storeStep && !validTime(document.getElementById("startingTime").value)) {
            showStep(storeStep);
            alert("Please enter the starting time as 4 numbers: hours first, then minutes. Example: 1430.");
            return;
        }

        if (requestedStep > technicianStep && !document.getElementById("technicianName").value) {
            showStep(technicianStep);
            alert("Please select the technician before continuing.");
            return;
        }

        if (requestedStep > technicianStep && !signatures.technician) {
            showStep(technicianStep);
            alert("Please capture the technician signature before continuing. Saved signatures can be added later.");
            return;
        }

        if (requestedStep > 2 && !issueChoicesComplete()) {
            showStep(2);
            alert("Please select the reason, discipline, and description of work before continuing.");
            return;
        }

        if (requestedStep > photoStep && !allRequiredPhotosTaken()) {
            showStep(photoStep);
            alert("Please take all 11 required photos before continuing.");
            return;
        }

        if (requestedStep > photoStep && !document.getElementById("hardwareType").value) {
            showStep(photoStep);
            alert("Please select the hardware type before continuing.");
            return;
        }

        if (requestedStep > managerStep && !managerSignOffComplete()) {
            showStep(managerStep);
            alert("Please enter the manager name, capture the manager signature, and take the store stamp photo.");
            return;
        }

        if (requestedStep > managerStep && !validTime(document.getElementById("endingTime").value)) {
            showStep(managerStep);
            alert("Please enter the ending time as 4 numbers: hours first, then minutes. Example: 1530.");
            return;
        }

        if (requestedStep > managerStep && !endingTimeAfterStartingTime()) {
            showStep(managerStep);
            alert("Completion time cannot be earlier than the starting time.");
            return;
        }

        showStep(requestedStep);
    });
});

backButton.addEventListener("click", backStep);
nextButton.addEventListener("click", nextStep);
document.querySelectorAll("[data-photo-id]").forEach((input) => {
    input.addEventListener("change", handlePhotoChange);
});
document.querySelectorAll("[data-clear-signature]").forEach((button) => {
    button.addEventListener("click", () => {
        clearSignature(button.dataset.clearSignature);
    });
});
storeStampPhotoInput.addEventListener("change", handleStoreStampPhotoChange);
document.getElementById("technicianName").addEventListener("change", handleTechnicianChange);
document.getElementById("startingTime").addEventListener("input", onlyAllowTimeNumbers);
document.getElementById("endingTime").addEventListener("input", function () {
    const endingTimeInput = document.getElementById("endingTime");
    endingTimeInput.value = endingTimeInput.value.replace(/\D/g, "").slice(0, 4);
});
setupSignaturePad(document.getElementById("technicianSignature"), "technician");
setupSignaturePad(document.getElementById("managerSignature"), "manager");

jobDateDisplay.textContent = getSystemDate();
updatePhotoCount();
showStep(0);
