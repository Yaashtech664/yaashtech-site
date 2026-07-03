let qrContainer = document.getElementById("qrcode");
let qrCodeInstance = null;
let qrHistory = JSON.parse(localStorage.getItem("yaashtech_clean_history")) || [];
let editingRecordId = null;

// Multi-Column Template Grid Array Mapping Symbols
const fieldTemplates = {
    vcard: [
        { id: 'name', label: '👤 Full Name', value: 'UDHAYAKUMAR S', placeholder: 'e.g., Udhayakumar S', fullWidth: true },
        { id: 'title', label: '💼 Job Title / Designation', value: 'HEAD IT', placeholder: 'e.g., Managing Director' },
        { id: 'company', label: '🏢 Company Name', value: 'BULLET LOGISTICS INDIA PRIVATE LIMITED', placeholder: 'e.g., Yaashtech' },
        { id: 'phone1', label: '📞 Primary Mobile Number', value: '9080106508', placeholder: 'e.g., 9080106508 or +91...' },
        { id: 'phone2', label: '📱 Alternative Mobile Number', value: '7502608869', placeholder: 'e.g., 7502608869' },
        { id: 'email1', label: '✉️ Primary Email Address', value: 'udhayam1794@gmail.com', placeholder: 'e.g., name@domain.com' },
        { id: 'email2', label: '📧 Alternative Email Address', value: 'info@domain.com', placeholder: 'e.g., info@domain.com' },
        { id: 'website', label: '🌐 Website URL Name', value: 'https://yaashtech.in', placeholder: 'e.g., https://yaashtech.in', fullWidth: true },
        { id: 'address', label: '📍 Office Address', value: 'Flat No S1, May Flower Apartment, Vgn Avenue, Kumananchavadi, Chennai', placeholder: 'e.g., Kumananchavadi, Chennai', fullWidth: true },
        { id: 'pincode', label: '🧱 Pin Code', value: '600056', placeholder: 'e.g., 600056', fullWidth: false }
    ],
    whatsapp: [
        { id: 'waPhone', label: '💬 WhatsApp Number', value: '', placeholder: 'e.g., 9080106508', fullWidth: true },
        { id: 'waMessage', label: '📝 Pre-filled Message Text', value: '', placeholder: 'Type custom message text details here...', fullWidth: true }
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

// High-capacity compilation script engine with automated mapping integration loops
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
        const website = document.getElementById('website').value;
        const address = document.getElementById('address').value;
        const pincode = document.getElementById('pincode').value;

        const phone1 = formatCountryCode(rawPhone1);
        const phone2 = formatCountryCode(rawPhone2);

        // Your exact custom Google Maps directions link URL hardcoded securely inside the vCard parameters array:
        const hardcodedMapsUrl = "https://maps.app.goo.gl/fst2opWs4GL17MobA";

        if(name || phone1) {
            // Standard multi-field vCard string structure with dual TEL rows, website row, and dedicated URL navigation markers
            finalPayload = `BEGIN:VCARD\nVERSION:3.0\nN:${name};;;;\nFN:${name}\nORG:${company}\nTITLE:${title}\nTEL;TYPE=CELL,VOICE:${phone1}\nTEL;TYPE=WORK,FAX:${phone2}\nEMAIL;TYPE=PREF,INTERNET:${email1}\nEMAIL;TYPE=WORK,INTERNET:${email2}\nURL:${website}\nURL;TYPE=MAPS_LOCATION:${hardcodedMapsUrl}\nADR;TYPE=WORK:;;${address};;;${pincode};India\nEND:VCARD`;
        }
    } else {
        let rawWaPhone = document.getElementById('waPhone').value.replace(/[^0-9]/g, '');
        if (rawWaPhone.length === 10) rawWaPhone = "91" + rawWaPhone;
        const waMessage = encodeURIComponent(document.getElementById('waMessage').value);
        if(rawWaPhone) finalPayload = `https://wa.me/${rawWaPhone}?text=${waMessage}`;
    }

    document.getElementById('rawPayload').value = finalPayload;
    qrContainer.innerHTML = "";

    // 300x300 density layout with level M redundancy allows massive multi-line datasets to process and decode instantly
    qrCodeInstance = new QRCode(qrContainer, {
        text: finalPayload || "Yaashtech Engine Waiting...",
        width: 300,
        height: 300,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
}

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
        alert("Please fill out the forms blocks before committing records logs.");
        return;
    }

    if (editingRecordId !== null) {
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

    localStorage.setItem("yaashtech_clean_history", JSON.stringify(qrHistory));
    renderHistoryView();
    buildForm();
}

function renderHistoryView() {
    const viewportList = document.getElementById('historyLogList');
    viewportList.innerHTML = "";

    if (qrHistory.length === 0) {
        viewportList.innerHTML = `<div class="text-center py-10 text-zinc-600 text-sm italic">No history logs elements.</div>`;
        return;
    }

    qrHistory.forEach(record => {
        const logCard = document.createElement('div');
        logCard.className = "bg-black border border-zinc-900 rounded-xl p-3.5 flex flex-col justify-between hover:border-[#00dcff] transition-all relative group";
        logCard.innerHTML = `
            <div class="pr-12 cursor-pointer" onclick="loadPayloadBackToForm(${record.id})">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-[#00dcff]">${record.type}</span>
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
    if(!record) return;

    editingRecordId = record.id;
    document.getElementById('logRecordBtn').innerText = "🔄 Update Entry";
    
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
        const webM = payload.match(/URL:(.*?)\n/);
        const adrM = payload.match(/ADR;TYPE=WORK:;;(.*?);;;(.*?);India/);

        if(nameM) document.getElementById('name').value = nameM[1];
        if(titleM) document.getElementById('title').value = titleM[1];
        if(orgM) document.getElementById('company').value = orgM[1];
        if(tel1M) document.getElementById('phone1').value = tel1M[1];
        if(tel2M) document.getElementById('phone2').value = tel2M[1];
        if(em1M) document.getElementById('email1').value = em1M[1];
        if(em2M) document.getElementById('email2').value = em2M[1];
        if(webM) document.getElementById('website').value = webM[1];
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
    localStorage.setItem("yaashtech_clean_history", JSON.stringify(qrHistory));
    renderHistoryView();
    if(editingRecordId === recordId) buildForm();
};

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm("Permanently wipe your local logs database history?")) {
        qrHistory = [];
        localStorage.removeItem("yaashtech_clean_history");
        renderHistoryView();
        buildForm();
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
            } else {
                alert("Invalid backup log structural formatting profile.");
            }
        } catch (err) {
            alert("Execution critical error: failed parsing target JSON text file configuration data.");
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
    } else {
        alert("Please input data parameters.");
    }
});

document.getElementById('logRecordBtn').addEventListener('click', saveRecordToHistory);
document.getElementById('qrType').addEventListener('change', buildForm);
window.addEventListener('DOMContentLoaded', () => {
    buildForm();
    renderHistoryView();
});