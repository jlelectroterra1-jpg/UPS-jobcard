function generateJobCard() {
    const storeName = document.getElementById("storeName").value;
    const storeNumber = document.getElementById("storeNumber").value;
    const technicianName = document.getElementById("technicianName").value;
    const jobDate = document.getElementById("jobDate").value;
    const natureIssue = document.getElementById("natureIssue").value;
    const actionTaken = document.getElementById("actionTaken").value;

    document.getElementById("jobCardPreview").innerHTML = `
        <h2>FIELD SERVICES JOB CARD</h2>
        <p><strong>Client:</strong> Shoprite</p>
        <p><strong>Store Name:</strong> ${storeName}</p>
        <p><strong>Store Number:</strong> ${storeNumber}</p>
        <p><strong>Date:</strong> ${jobDate}</p>
        <p><strong>Service Co:</strong> Intrasource</p>
        <p><strong>Technician:</strong> ${technicianName}</p>
        <p><strong>Nature of Issue:</strong> ${natureIssue}</p>
        <p><strong>Action Taken:</strong> ${actionTaken}</p>
    `;
}

