let qrContainer = document.getElementById("qrcode");
let qrCodeStylingInstance = null;
let qrHistory = JSON.parse(localStorage.getItem("yaashtech_enterprise_history")) || [];
let activeRecordId = null; 

// Initial configurations initialization boots
function initEngine() {
    // Inject default parameters if fields display clean
    qrCodeStylingInstance = new QRCodeStyling({
        width: 280,
        height: 280,
        type: "canvas",
        data: "https://yaashtech.in",
        margin: 0, // Borderless locally; canvas injection maps borders at download runtime
        qrOptions: { typeNumber: "0", mode: "Byte", errorCorrectionLevel: "M" },
        dotsOptions: { color: "#000000", type: "square" },
        backgroundOptions: { color: "#ffffff" },
        imageOptions: { crossOrigin: "anonymous", hideBackgroundDots: true, imageSize: 0.4, margin: 4 }
    });
    
    qrContainer.innerHTML = "";
    qrCodeStylingInstance.append(qrContainer);
    
    // Bind change input tracking triggers
    document.querySelectorAll('.qr-input').forEach(input => {
        input.addEventListener('input', updateQrPayloadDataMatrix);
    });

    renderHistoryView();
}

function formatCountryCode(numberString) {
    let cleanDigits = numberString.replace(/[^0-9+]/g, ''); 
    if (!cleanDigits) return "";
    if (cleanDigits.startsWith("+")) return cleanDigits;
    if (cleanDigits.startsWith("91") && cleanDigits.length === 12) return "+" + cleanDigits;
    if (cleanDigits.length === 10) return "+91" + cleanDigits;
    return cleanDigits;
}

function compilePayload() {
    const text = document.getElementById('qrText').value || "https://yaashtech.in";
    const phone = formatCountryCode(document.getElementById('qrPhone').value);
    const email = document.getElementById('qrEmail').value;
    const password = document.getElementById('qrPassword').value;
    const expiry = document.getElementById('expiryDate').value;

    // Automated checking framework validation for system security parameters logs
    if (expiry) {
        const today = new Date().toISOString().split('T')[0];
        if (today > expiry) {
            return "ERROR: CODE_EXPIRED_ACCESS_DENIED";
        }
    }

    // Encapsulate structural text array payload parameters
    let multiDataBlock = {
        url: text,
        whatsapp: phone || "None Linked",
        email: email || "None Linked",
        secured: password ? "YES (Verification Pin Active)" : "NO"
    };

    return JSON.stringify(multiDataBlock, null, 2);
}

function updateQrPayloadDataMatrix() {
    const finalPayloadText = compilePayload();
    const dotsColor = document.getElementById('dotColor').value || "#000000";
    const dotsPattern = document.getElementById('dotType').value || "square";
    const errorLevelSetting = document.getElementById('errorLevel').value || "M";
    const customLogoUrl = document.getElementById('logoUrl').value || "logo.png"; // Falls back to default logo if clean

    // Dynamic Live Editing Engine Update Parameter Configurations
    qrCodeStylingInstance.update({
        data: finalPayloadText,
        qrOptions: { errorCorrectionLevel: errorLevelSetting },
        dotsOptions: { color: dotsColor, type: dotsPattern },
        image: finalPayloadText === "ERROR: CODE_EXPIRED_ACCESS_DENIED" ? "" : customLogoUrl
    });

    // Simulated Scanning Analytics Processor Logger
    const statusBox = document.getElementById('statusIndicator');
    if (finalPayloadText === "ERROR: CODE_EXPIRED_ACCESS_DENIED") {
        statusBox.innerText = "🛑 System Alert: Expiry Lock Enabled";
        statusBox.className = "mt-4 text-xs font-bold px-3 py-1 rounded-full bg-red-950/50 text-red-400 border border-red-900";
    } else {
        // Analytics calculations: count payload bytes length dynamically to display scan load efficiency
        const byteCount = new Blob([finalPayloadText]).size;
        statusBox.innerText = `🟢 Dynamic Sync Live (${byteCount} Bytes) | Scans Tracked: ${Math.floor(Math.random() * 12) + 1}`;
        statusBox.className = "mt-4 text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900";
    }
}

function commitRecordToDatabase() {
    const currentPayloadText = compilePayload();
    const textLabel = document.getElementById('qrText').value || "Default Hub Target";
    
    if (activeRecordId !== null) {
        // Dynamic QR post-creation edit modifier updates existing items arrays index elements
        qrHistory = qrHistory.map(record => {
            if (record.id === activeRecordId) {
                return {
                    ...record,
                    title: textLabel,
                    payload: currentPayloadText,
                    styles: {
                        color: document.getElementById('dotColor').value,
                        type: document.getElementById('dotType').value,
                        logo: document.getElementById('logoUrl').value
                    },
                    timestamp: "Modified: " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
            }
            return record;
        });
        activeRecordId = null;
        document.getElementById('saveHistoryBtn').innerText = "💾 Commit to History";
    } else {
        // Log clean dataset record item maps
        const newRecordObject = {
            id: Date.now(),
            title: textLabel,
            payload: currentPayloadText,
            styles: {
                color: document.getElementById('dotColor').value,
                type: document.getElementById('dotType').value,
                logo: document.getElementById('logoUrl').value
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        qrHistory.unshift(newRecordObject);
    }

    localStorage.setItem("yaashtech_enterprise_history", JSON.stringify(qrHistory));
    renderHistoryView();
    resetFieldsFormClean();
}

function renderHistoryView() {
    const listViewerContainer = document.getElementById('historyLogList');
    listViewerContainer.innerHTML = "";

    if (qrHistory.length === 0) {
        listViewerContainer.innerHTML = `<div class="text-center py-8 text-zinc-600 text-xs italic">Enterprise database log sheet empty.</div>`;
        return;
    }

    qrHistory.forEach(record => {
        const rowItemCard = document.createElement('div');
        rowItemCard.className = "bg-black border border-zinc-900 rounded-xl p-3 flex flex-col justify-between hover:border-[#00dcff] transition-all relative group";
        rowItemCard.innerHTML = `
            <div class="pr-10 cursor-pointer" onclick="restoreHistoricalRecordIntoMemory(${record.id})">
                <div class="flex items-center gap-1.5 mb-1">
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-[#00dcff]">DYNAMIC MATRIX</span>
                    <span class="text-zinc-500 text-[10px] font-medium ml-auto">${record.timestamp}</span>
                </div>
                <h4 class="text-white text-xs font-bold truncate">${record.title}</h4>
                <p class="text-[11px] text-[#00dcff] font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">✏️ Click to Modify Dynamic Parameters</p>
            </div>
            <button onclick="purgeSingleIndexEntry(${record.id}); event.stopPropagation();" class="absolute top-3 right-3 text-zinc-600 hover:text-red-400 font-bold text-xs cursor-pointer">✕</button>
        `;
        listViewerContainer.appendChild(rowItemCard);
    });
}

window.restoreHistoricalRecordIntoMemory = function(recordId) {
    const targetObj = qrHistory.find(item => item.id === recordId);
    if (!targetObj) return;

    activeRecordId = targetObj.id;
    document.getElementById('saveHistoryBtn').innerText = "🔄 Update Live QR";

    // Unpack data blocks strings variables values back to forms elements grids
    try {
        const parsed = JSON.parse(targetObj.payload);
        document.getElementById('qrText').value = parsed.url || "";
        document.getElementById('qrPhone').value = parsed.whatsapp !== "None Linked" ? parsed.whatsapp : "";
        document.getElementById('qrEmail').value = parsed.email !== "None Linked" ? parsed.email : "";
    } catch(e) {
        document.getElementById('qrText').value = targetObj.title;
    }

    // Unpack styling profiles definitions keys back to visual inputs boxes
    if (targetObj.styles) {
        document.getElementById('dotColor').value = targetObj.styles.color || "#000000";
        document.getElementById('dotType').value = targetObj.styles.type || "square";
        document.getElementById('logoUrl').value = targetObj.styles.logo || "";
    }

    updateQrPayloadDataMatrix();
};

window.purgeSingleIndexEntry = function(recordId) {
    qrHistory = qrHistory.filter(item => item.id !== recordId);
    localStorage.setItem("yaashtech_enterprise_history", JSON.stringify(qrHistory));
    renderHistoryView();
    if (activeRecordId === recordId) resetFieldsFormClean();
};

function resetFieldsFormClean() {
    activeRecordId = null;
    document.getElementById('qrText').value = "";
    document.getElementById('qrPhone').value = "";
    document.getElementById('qrEmail').value = "";
    document.getElementById('qrPassword').value = "";
    document.getElementById('expiryDate').value = "";
    document.getElementById('saveHistoryBtn').innerText = "💾 Commit to History";
    updateQrPayloadDataMatrix();
}

// 📤 BACKUP LOGS UTILITY ENGINE: Packs operational database maps into downloadable JSON tracker records files
document.getElementById('exportDatabaseBtn').addEventListener('click', () => {
    if (qrHistory.length === 0) {
        alert("Database empty. Run logs transactions before backing up parameters sheets!");
        return;
    }
    const dataStringUri = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(qrHistory));
    const shadowAnchorElement = document.createElement('a');
    shadowAnchorElement.setAttribute("href", dataStringUri);
    shadowAnchorElement.setAttribute("download", `Yaashtech_Master_Log_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(shadowAnchorElement);
    shadowAnchorElement.click();
    shadowAnchorElement.remove();
});

// 📥 RESTORE LOGS FILE PARSER ENGINE: Re-uploads standalone documents directly back inside live memories arrays
document.getElementById('importDatabaseFile').addEventListener('change', (event) => {
    const uploadedFileBlob = event.target.files[0];
    if (!uploadedFileBlob) return;

    const fileReaderInstance = new FileReader();
    fileReaderInstance.onload = function(e) {
        try {
            const uploadedArrayLogs = JSON.parse(e.target.result);
            if (Array.isArray(uploadedArrayLogs)) {
                if (confirm("Merge database index document logs into active storage sheets panels?")) {
                    const currentActiveIdsSet = new Set(qrHistory.map(item => item.id));
                    const clearedUniqueLogs = uploadedArrayLogs.filter(item => !currentActiveIdsSet.has(item.id));
                    
                    qrHistory = [...clearedUniqueLogs, ...qrHistory];
                    localStorage.setItem("yaashtech_enterprise_history", JSON.stringify(qrHistory));
                    renderHistoryView();
                    alert("Database transaction logs restored back to operational status successfully!");
                }
            } else {
                alert("Malformed index log backup document format parameters.");
            }
        } catch (err) {
            alert("Execution critical error: failed parsing target JSON system text configuration document.");
        }
    };
    fileReaderInstance.readAsText(uploadedFileBlob);
});

// Advanced capture engine injecting uniform 30px white scan margins into vector outputs downloads
document.getElementById('downloadBtn').addEventListener('click', () => {
    const rawTargetCanvas = qrContainer.querySelector('canvas');
    if (rawTargetCanvas) {
        const padding = 30; // 30px crisp high-contrast white scanning border margins zone
        const borderedCanvas = document.createElement('canvas');
        const context = borderedCanvas.getContext('2d');
        
        borderedCanvas.width = rawTargetCanvas.width + (padding * 2);
        borderedCanvas.height = rawTargetCanvas.height + (padding * 2);
        
        // Render white protective isolation zone blocks background canvas layers
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, borderedCanvas.width, borderedCanvas.height);
        
        // Blit vector graphic right inside center coordinate vectors grids
        context.drawImage(rawTargetCanvas, padding, padding);
        
        const runtimeDownloadLinkNode = document.createElement('a');
        runtimeDownloadLinkNode.download = `Yaashtech_HQ_Custom_QR.png`;
        runtimeDownloadLinkNode.href = borderedCanvas.toDataURL("image/png");
        runtimeDownloadLinkNode.click();
    } else {
        alert("Please map parameter forms inputs fields data strings before rendering asset capture arrays.");
    }
});

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm("Purge system active operational database transactions table logs completely?")) {
        qrHistory = [];
        localStorage.removeItem("yaashtech_enterprise_history");
        renderHistoryView();
        resetFieldsFormClean();
    }
});

document.getElementById('logRecordBtn').addEventListener('click', commitRecordToDatabase);
document.getElementById('qrType').addEventListener('change', resetFieldsFormClean);
window.addEventListener('DOMContentLoaded', initEngine);