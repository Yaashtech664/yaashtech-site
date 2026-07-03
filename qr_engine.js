let qrContainer = document.getElementById("qrcode");
let qrCodeInstance = null;
let qrHistory = JSON.parse(localStorage.getItem("yaashtech_qr_history")) || [];
let editingRecordId = null;

// Design elements layout template containing symbols
const fieldTemplates = {
    vcard: [
        { id: 'name', label: '👤 Full Name', value: '', placeholder: 'e.g., Udhayakumar S', fullWidth: true },
        { id: 'title', label: '💼 Job Title / Designation', value: '', placeholder: 'e.g., Technical Specialist' },
        { id: 'company', label: '🏢 Company Name', value: '', placeholder: 'e.g., Yaashtech' },
        { id: 'phone1', label: '📞 Primary Mobile Number', value: '', placeholder: 'e.g., 9080106508 or +91...' },
        { id: 'phone2', label: '📱 Alternative Mobile Number', value: '', placeholder: 'e.g., 7502608869' },
        { id: 'email1', label: '✉️ Primary Email Address', value: '', placeholder: 'e.g., name@domain.com' },
        { id: 'email2', label: '📧 Alternative Email Address', value: '', placeholder: 'e.g., info@domain.com' },
        { id: 'address', label: '📍 Office Address', value: '', placeholder: 'e.g., Kumananchavadi, Chennai', fullWidth: true },
        { id: 'pincode', label: '🧱 Pin Code', value: '', placeholder: 'e.g., 600056', fullWidth: false }
    ],
    whatsapp: [
        { id: 'waPhone', label: '💬 WhatsApp Number', value: '', placeholder: 'e.g., 9080106508', fullWidth: true },
        { id: 'waMessage', label: '📝 Pre-filled Message Text', value: '', placeholder: 'Type custom message text configuration details here...', fullWidth: true }
    ]
};

// Generates structural grid inputs columns dynamically
function buildForm() {
    const type = document.getElementById('qrType').value;
    const container = document.getElementById('formFields');
    container.innerHTML = '';
    editingRecordId = null;
    document.getElementById('logRecordBtn').innerText = "💾 Save to History";

    fieldTemplates[type].forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.className = field.fullWidth ? 'flex flex-col md:col-span-2' : 'flex flex-col';
        wrapper.innerHTML = `
            <label class="text-xs font-semibold text-zinc-400 mb-1">${field.label}</label>
            <input type="text" id="${field.id}" value="${field.value}" placeholder="${field.placeholder}" 
                   class="w-full bg-black text-white border border-zinc-800 rounded-lg p-2 text-sm focus:outline-none transition-all focus:border-[#00dcff] input-trigger focus-cyan">
        `;
        container.appendChild(wrapper);
    });

    document.querySelectorAll('.input-trigger').forEach(input => {
        input.addEventListener('input', generateQRCode);
    });

    generateQRCode();
}

// Automatically inserts international country symbols (+91)
function formatCountryCode(numberString) {
    let cleanDigits = numberString.replace(/[^0-9+]/g, ''); 
    if (!cleanDigits) return "";
    if (cleanDigits.startsWith("+")) return cleanDigits;
    if (cleanDigits.startsWith("91") && cleanDigits.length === 12) return "+" + cleanDigits;
    if (cleanDigits.length === 10) return "+91" + cleanDigits;
    return cleanDigits;
}

// High-capacity compilation script engine
function generateQRCode() {
    const type = document.getElementById('qrType').value;
    let finalPayload = "";

    if (type === 'vcard') {
        const name = document.getElementById('name').value;
        const title = document.getElementById('title').value;
        const company = document.getElementById('company').value;
        const rawPhone1 = document.getElementById('phone1').value;
        const rawPhone2 = document.getElementById('phone2').value;
        const email1 = document.getElementById('email1').value;
        const email2 = document.getElementById('email2').value;
        const address = document.getElementById('address').value;
        const pincode = document.getElementById('pincode').value;

        const phone1 = formatCountryCode(rawPhone1);
        const phone2 = formatCountryCode(rawPhone2);

        if(name || phone1) {
            finalPayload = `BEGIN:VCARD\nVERSION:3.0\nN:${name};;;;\nFN:${name}\nORG:${company}\nTITLE:${title}\nTEL;TYPE=CELL,VOICE:${phone1}\nTEL;TYPE=WORK,FAX:${phone2}\nEMAIL;TYPE=PREF,INTERNET:${email1}\nEMAIL;TYPE=WORK,INTERNET:${email2}\nADR;TYPE=WORK:;;${address};;;${pincode};India\nEND:VCARD`;
        }
        document.getElementById('qrStatusLabel').innerText = "Raw vCard Contact Payload:";
    } else {
        let rawWaPhone = document.getElementById('waPhone').value.replace(/[^0-9]/g, '');
        if (rawWaPhone.length === 10) rawWaPhone = "91" + rawWaPhone;
        const waMessage = encodeURIComponent(document.getElementById('waMessage').value);
        if(rawWaPhone) finalPayload = `https://wa.me/${rawWaPhone}?text=${waMessage}`;
        document.getElementById('qrStatusLabel').innerText = "Direct WhatsApp Target URL:";
    }

    document.getElementById('rawPayload').value = finalPayload;
    qrContainer.innerHTML = "";

    // 300x300 structural dimension layout combined with Level M allows long strings to scan instantly
    qrCodeInstance = new QRCode(qrContainer, {
        text: finalPayload || "Yaashtech Engine Waiting...",
        width: 300,
        height: 300,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
}

// Saves data sets or applies edits back to active indexes
function saveRecordToHistory() {
    const type = document.getElementById('qrType').value;
    let titleIdentifier = "";
    let descriptionMetadata = "";

    if (type === 'vcard') {
        titleIdentifier = document.getElementById('name').value || "Blank Profile";
        descriptionMetadata = document.getElementById('company').value || "vCard Contact File";
    } else {
        titleIdentifier = "+" + document.getElementById('waPhone').value.replace(/[^0-9]/g, '') || "WhatsApp Link";
        descriptionMetadata = "Direct Chat Trigger Link";
    }

    const payloadDataStr = document.getElementById('rawPayload').value;
    if(!payloadDataStr) {
        alert("Please fill in text forms before logging records.");
        return;
    }

    if (editingRecordId !== null) {
        // Edit and update an existing log index row
        qrHistory = qrHistory.map(record => {
            if (record.id === editingRecordId) {
                return {
                    ...record,
                    type: type,
                    title: titleIdentifier,
                    desc: descriptionMetadata,
                    payload: payloadDataStr,
                    timestamp: "Updated: " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
            }
            return record;
        });
        editingRecordId = null;
        document.getElementById('logRecordBtn').innerText = "💾 Save to History";
    } else {
        // Capture new dataset entry
        const newRecordObj = {
            id: Date.now(),
            type: type,
            title: titleIdentifier,
            desc: descriptionMetadata,
            payload: payloadDataStr,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        qrHistory.unshift(newRecordObj);
    }

    localStorage.setItem("yaashtech_qr_history", JSON.stringify(qrHistory));
    renderHistoryView();
    buildForm();
}

// Re-renders list panels nodes matching active internal datasets
function renderHistoryView() {
    const viewportList = document.getElementById('historyLogList');
    viewportList.innerHTML = "";

    if (qrHistory.length === 0) {
        viewportList.innerHTML = `<div class="text-center py-10 text-zinc-600 text-sm italic">No history data logs saved.</div>`;
        return;
    }

    qrHistory.forEach(record => {
        const logCard = document.createElement('div');
        logCard.className = "bg-black border border-zinc-900 rounded-xl p-3.5 flex flex-col justify-between hover:border-[#00dcff] transition-all relative group";
        logCard.innerHTML = `
            <div class="pr-12 cursor-pointer" onclick="loadPayloadBackToForm(${record.id})">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-[#00dcff]">${record.type}</span>
                    <span class="text-zinc-500 text-[11px] font-medium ml-auto">${record.timestamp}</span>
                </div>
                <h4 class="text-white text-sm font-bold truncate">${record.title}</h4>
                <p class="text-zinc-400 text-xs truncate mt-0.5">${record.desc}</p>
                <p class="text-[11px] text-[#00dcff] font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">✏️ Click to Edit / Re-use</p>
            </div>
            <button onclick="deleteSingleRecord(${record.id}); event.stopPropagation();" class="absolute top-3.5 right-3 text-zinc-600 hover:text-red-400 text-md transition-colors cursor-pointer">✕</button>
        `;
        viewportList.appendChild(logCard);
    });
}

// Pulls selected historic data arrays directly back into active field column blocks
window.loadPayloadBackToForm = function(recordId) {
    const record = qrHistory.find(item => item.id === recordId);
    if(!record) return;

    editingRecordId = record.id;
    document.getElementById('qrType').value = record.type;
    document.getElementById('logRecordBtn').innerText = "🔄 Update Record";
    
    buildForm(); 

    const payload = record.payload;
    if (record.type === 'vcard') {
        const nameM = payload.match(/FN:(.*?)\n/);
        const orgM = payload.match(/ORG:(.*?)\n/);
        const titleM = payload.match(/TITLE:(.*?)\n/);
        const tel1M = payload.match(/TEL;TYPE=CELL,VOICE:(.*?)\n/);
        const tel2M = payload.match(/TEL;TYPE=WORK,FAX:(.*?)\n/);
        const em1M = payload.match(/EMAIL;TYPE=PREF,INTERNET:(.*?)\n/);
        const em2M = payload.match(/EMAIL;TYPE=WORK,INTERNET:(.*?)\n/);
        const adrM = payload.match(/ADR;TYPE=WORK:;;(.*?);;;(.*?);India/);

        if(nameM) document.getElementById('name').value = nameM[1];
        if(titleM) document.getElementById('title').value = titleM[1];
        if(orgM) document.getElementById('company').value = orgM[1];
        if(tel1M) document.getElementById('phone1').value = tel1M[1];
        if(tel2M) document.getElementById('phone2').value = tel2M[1];
        if(em1M) document.getElementById('email1').value = em1M[1];
        if(em2M) document.getElementById('email2').value = em2M[1];
        if(adrM) {
            document.getElementById('address').value = adrM[1];
            document.getElementById('pincode').value = adrM[2];
        }
    } else {
        const phoneM = payload.match(/wa\.me\/(.*?)\?/);
        const msgM = payload.match(/\?text=(.*)/);
        if(phoneM) document.getElementById('waPhone').value = phoneM[1];
        if(msgM) document.getElementById('waMessage').value = decodeURIComponent(msgM[1]);
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
    localStorage.setItem("yaashtech_qr_history", JSON.stringify(qrHistory));
    renderHistoryView();
    if(editingRecordId === recordId) buildForm();
};

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm("Wipe entire internal memory history?")) {
        qrHistory = [];
        localStorage.removeItem("yaashtech_qr_history");
        renderHistoryView();
        buildForm();
    }
});

// 📤 BACKUP LOGS ENGINE: Compiles database array maps into a downloadable separate JSON tracker file
document.getElementById('exportDatabaseBtn').addEventListener('click', () => {
    if (qrHistory.length === 0) {
        alert("History database is completely empty. Nothing to log!");
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(qrHistory));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Yaashtech_Backup_Log_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

// 📥 RESTORE LOGS ENGINE: Re-uploads saved backup data files directly back into memory structures
document.getElementById('importDatabaseFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                if (confirm("Merge this backup log file directly into your active display history memory?")) {
                    const existingIds = new Set(qrHistory.map(item => item.id));
                    const uniqueImported = importedData.filter(item => !existingIds.has(item.id));
                    
                    qrHistory = [...uniqueImported, ...qrHistory];
                    localStorage.setItem("yaashtech_qr_history", JSON.stringify(qrHistory));
                    renderHistoryView();
                    alert("Backup logs successfully restored into memory!");
                }
            } else {
                alert("Invalid file structure mapping profile detected.");
            }
        } catch (err) {
            alert("Failed to parse the uploaded backup log document.");
        }
    };
    reader.readAsText(file);
});

// Advanced capture handling: Draws a 30px white safety border frame for superior decoding scans
document.getElementById('downloadBtn').addEventListener('click', () => {
    const originalImg = qrContainer.querySelector('img');
    if (originalImg) {
        const tempImage = new Image();
        tempImage.crossOrigin = "anonymous";
        tempImage.src = originalImg.src;
        
        tempImage.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const padding = 30; // 30px crisp white border injection margin
            
            canvas.width = tempImage.width + (padding * 2);
            canvas.height = tempImage.height + (padding * 2);
            
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempImage, padding, padding);
            
            const finalDownloadLink = document.createElement('a');
            finalDownloadLink.download = `Yaashtech_QR_${document.getElementById('qrType').value}.png`;
            finalDownloadLink.href = canvas.toDataURL("image/png");
            finalDownloadLink.click();
        };
    } else {
        alert("Please map text parameter strings before attempting compilation downloads.");
    }
});

document.getElementById('logRecordBtn').addEventListener('click', saveRecordToHistory);
document.getElementById('qrType').addEventListener('change', buildForm);
window.addEventListener('DOMContentLoaded', () => {
    buildForm();
    renderHistoryView();
});