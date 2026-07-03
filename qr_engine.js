let qrContainer = document.getElementById("qrcode");
let qrCodeInstance = null;
let qrHistory = JSON.parse(localStorage.getItem("yaashtech_clean_history")) || [];
let editingRecordId = null;

function generateQRCode() {
    const name = document.getElementById('name').value;
    const title = document.getElementById('title').value;
    const company = document.getElementById('company').value;
    const rawPhone1 = document.getElementById('phone1').value;
    const rawPhone2 = document.getElementById('phone2').value;
    const email1 = document.getElementById('email1').value;
    const email2 = document.getElementById('email2').value;
    const website = document.getElementById('website').value;
    const address = document.getElementById('address').value;
    const pincode = document.getElementById('pincode').value;

    const phone1 = formatCountryCode(rawPhone1);
    const phone2 = formatCountryCode(rawPhone2);

    let finalPayload = "";
    if (name || phone1) {
        finalPayload = `BEGIN:VCARD\nVERSION:3.0\nN:${name};;;;\nFN:${name}\nORG:${company}\nTITLE:${title}\nTEL;TYPE=CELL,VOICE:${phone1}\nTEL;TYPE=WORK,FAX:${phone2}\nEMAIL;TYPE=PREF,INTERNET:${email1}\nEMAIL;TYPE=WORK,INTERNET:${email2}\nURL:${website}\nADR;TYPE=WORK:;;${address};;;${pincode};India\nEND:VCARD`;
    }

    document.getElementById('rawPayload').value = finalPayload;
    qrContainer.innerHTML = "";

    qrCodeInstance = new QRCode(qrContainer, {
        text: finalPayload || "Yaashtech Engine Waiting...",
        width: 300,
        height: 300,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
}

function formatCountryCode(numberString) {
    let cleanDigits = numberString.replace(/[^0-9+]/g, ''); 
    if (!cleanDigits) return "";
    if (cleanDigits.startsWith("+")) return cleanDigits;
    if (cleanDigits.startsWith("91") && cleanDigits.length === 12) return "+" + cleanDigits;
    if (cleanDigits.length === 10) return "+91" + cleanDigits;
    return cleanDigits;
}

function saveRecordToHistory() {
    const nameLabel = document.getElementById('name').value || "Blank Profile";
    const companyLabel = document.getElementById('company').value || "vCard Contact File";
    const payloadDataStr = document.getElementById('rawPayload').value;

    if (!payloadDataStr) {
        alert("Please input data details before tracking.");
        return;
    }

    if (editingRecordId !== null) {
        qrHistory = qrHistory.map(record => {
            if (record.id === editingRecordId) {
                return {
                    ...record,
                    title: nameLabel,
                    desc: companyLabel,
                    payload: payloadDataStr,
                    timestamp: "Updated: " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
            }
            return record;
        });
        editingRecordId = null;
        document.getElementById('logRecordBtn').innerText = "💾 Save to History";
    } else {
        const newRecordObj = {
            id: Date.now(),
            title: nameLabel,
            desc: companyLabel,
            payload: payloadDataStr,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        qrHistory.unshift(newRecordObj);
    }

    localStorage.setItem("yaashtech_clean_history", JSON.stringify(qrHistory));
    renderHistoryView();
    clearFormFields();
}

function renderHistoryView() {
    const viewportList = document.getElementById('historyLogList');
    viewportList.innerHTML = "";

    if (qrHistory.length === 0) {
        viewportList.innerHTML = `<div class="text-center py-10 text-zinc-600 text-xs italic">No saved history elements.</div>`;
        return;
    }

    qrHistory.forEach(record => {
        const logCard = document.createElement('div');
        logCard.className = "bg-black border border-zinc-900 rounded-xl p-3.5 flex flex-col justify-between hover:border-[#00dcff] transition-all relative group";
        logCard.innerHTML = `
            <div class="pr-12 cursor-pointer" onclick="loadPayloadBackToForm(${record.id})">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-[#00dcff]">vCard</span>
                    <span class="text-zinc-500 text-[10px] font-medium ml-auto">${record.timestamp}</span>
                </div>
                <h4 class="text-white text-xs font-bold truncate">${record.title}</h4>
                <p class="text-zinc-400 text-[11px] truncate mt-0.5">${record.desc}</p>
                <p class="text-[10px] text-[#00dcff] font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">✏️ Click to Edit/Restore</p>
            </div>
            <button onclick="deleteSingleRecord(${record.id}); event.stopPropagation();" class="absolute top-3.5 right-3 text-zinc-600 hover:text-red-400 text-md transition-colors cursor-pointer">✕</button>
        `;
        viewportList.appendChild(logCard);
    });
}

window.loadPayloadBackToForm = function(recordId) {
    const record = qrHistory.find(item => item.id === recordId);
    if (!record) return;

    editingRecordId = record.id;
    document.getElementById('logRecordBtn').innerText = "🔄 Update Entry";
    
    const payload = record.payload;

    const nameM = payload.match(/FN:(.*?)\n/);
    const orgM = payload.match(/ORG:(.*?)\n/);
    const titleM = payload.match(/TITLE:(.*?)\n/);
    const tel1M = payload.match(/TEL;TYPE=CELL,VOICE:(.*?)\n/);
    const tel2M = payload.match(/TEL;TYPE=WORK,FAX:(.*?)\n/);
    const em1M = payload.match(/EMAIL;TYPE=PREF,INTERNET:(.*?)\n/);
    const em2M = payload.match(/EMAIL;TYPE=WORK,INTERNET:(.*?)\n/);
    const webM = payload.match(/URL:(.*?)\n/);
    const adrM = payload.match(/ADR;TYPE=WORK:;;(.*?);;;(.*?);India/);

    document.getElementById('name').value = nameM ? nameM[1] : "";
    document.getElementById('title').value = titleM ? titleM[1] : "";
    document.getElementById('company').value = orgM ? orgM[1] : "";
    document.getElementById('phone1').value = tel1M ? tel1M[1] : "";
    document.getElementById('phone2').value = tel2M ? tel2M[1] : "";
    document.getElementById('email1').value = em1M ? em1M[1] : "";
    document.getElementById('email2').value = em2M ? em2M[1] : "";
    document.getElementById('website').value = webM ? webM[1] : "";
    if (adrM) {
        document.getElementById('address').value = adrM[1];
        document.getElementById('pincode').value = adrM[2];
    }

    document.getElementById('rawPayload').value = payload;
    qrContainer.innerHTML = "";
    qrCodeInstance = new QRCode(qrContainer, {
        text: payload,
        width: 300,
        height: 300,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
};

window.deleteSingleRecord = function(recordId) {
    qrHistory = qrHistory.filter(item => item.id !== recordId);
    localStorage.setItem("yaashtech_clean_history", JSON.stringify(qrHistory));
    renderHistoryView();
    if (editingRecordId === recordId) clearFormFields();
};

function clearFormFields() {
    editingRecordId = null;
    document.getElementById('name').value = "";
    document.getElementById('title').value = "";
    document.getElementById('company').value = "";
    document.getElementById('phone1').value = "";
    document.getElementById('phone2').value = "";
    document.getElementById('email1').value = "";
    document.getElementById('email2').value = "";
    document.getElementById('website').value = "";
    document.getElementById('address').value = "";
    document.getElementById('pincode').value = "";
    document.getElementById('logRecordBtn').innerText = "💾 Save to History";
    generateQRCode();
}

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm("Permanently wipe your local logs database history?")) {
        qrHistory = [];
        localStorage.removeItem("yaashtech_clean_history");
        renderHistoryView();
        clearFormFields();
    }
});

document.getElementById('exportDatabaseBtn').addEventListener('click', () => {
    if (qrHistory.length === 0) {
        alert("History is empty. Nothing to back up!");
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(qrHistory));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Yaashtech_QR_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

document.getElementById('importDatabaseFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                if (confirm("Merge this dynamic backup log file with your active history memory?")) {
                    const existingIds = new Set(qrHistory.map(item => item.id));
                    const uniqueImported = importedData.filter(item => !existingIds.has(item.id));
                    
                    qrHistory = [...uniqueImported, ...qrHistory];
                    localStorage.setItem("yaashtech_clean_history", JSON.stringify(qrHistory));
                    renderHistoryView();
                    alert("Backup logs successfully restored!");
                }
            }
        } catch (err) {
            alert("Error parsing backup JSON data.");
        }
    };
    reader.readAsText(file);
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    const originalImg = qrContainer.querySelector('img');
    if (originalImg) {
        const tempImage = new Image();
        tempImage.crossOrigin = "anonymous";
        tempImage.src = originalImg.src;
        
        tempImage.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const padding = 30; 
            
            canvas.width = tempImage.width + (padding * 2);
            canvas.height = tempImage.height + (padding * 2);
            
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempImage, padding, padding);
            
            const finalDownloadLink = document.createElement('a');
            finalDownloadLink.download = `Yaashtech_QR_Code.png`;
            finalDownloadLink.href = canvas.toDataURL("image/png");
            finalDownloadLink.click();
        };
    }
});

document.querySelectorAll('.input-trigger').forEach(input => {
    input.addEventListener('input', generateQRCode);
});
document.getElementById('logRecordBtn').addEventListener('click', saveRecordToHistory);
window.addEventListener('DOMContentLoaded', () => {
    generateQRCode();
    renderHistoryView();
});