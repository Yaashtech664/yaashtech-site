let qrContainer = document.getElementById("qrcode");
let qrCodeInstance = null;

// Dynamic configuration structure mapping additional target details fields
const fieldTemplates = {
    vcard: [
        { id: 'name', label: '👤 Full Name', value: 'Iyyanar', placeholder: 'e.g., Iyyanar' },
        { id: 'title', label: '💼 Job Title / Designation', value: 'Managing Director', placeholder: 'e.g., Managing Director' },
        { id: 'company', label: '🏢 Company Name', value: 'Bullet Trans Solutions Private Limited', placeholder: 'e.g., Bullet Trans' },
        { id: 'phone1', label: '📞 Primary Mobile Number', value: '+919344590431', placeholder: 'e.g., +919344590431' },
        { id: 'phone2', label: '📱 Alternative Mobile Number', value: '+919080106508', placeholder: 'e.g., +919080106508' },
        { id: 'email', label: '✉️ Email Address', value: 'Iyyanar@bullettrans.in', placeholder: 'e.g., name@domain.com' },
        { id: 'website', label: '🌐 Official Website URL', value: 'https://yaashtech.in', placeholder: 'e.g., https://domain.com' },
        { id: 'address', label: '📍 Office Address', value: 'No.112/B, P H Road, Velappanchavadi, Chennai', placeholder: 'Street, City' },
        { id: 'pincode', label: '🧱 Pin Code', value: '600077', placeholder: '600077' }
    ],
    whatsapp: [
        { id: 'waPhone', label: '💬 WhatsApp Phone Number (Numbers only with country code)', value: '919344590431', placeholder: 'e.g., 919344590431' },
        { id: 'waMessage', label: '📝 Default Pre-filled Message Text', value: 'Hello Sir, I would like to enquire about your logistics and transport services.', placeholder: 'Type custom text...' }
    ]
};

// Renders input fields based on drop-down choice
function buildForm() {
    const type = document.getElementById('qrType').value;
    const container = document.getElementById('formFields');
    container.innerHTML = '';

    fieldTemplates[type].forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col';
        
        wrapper.innerHTML = `
            <label class="text-xs font-semibold text-gray-600 mb-1">${field.label}</label>
            <input type="text" id="${field.id}" value="${field.value}" placeholder="${field.placeholder}" 
                   class="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all input-trigger">
        `;
        container.appendChild(wrapper);
    });

    // Rebind real-time input event listeners to all newly created elements
    document.querySelectorAll('.input-trigger').forEach(input => {
        input.addEventListener('input', generateQRCode);
    });

    generateQRCode();
}

// Compiles data outputs and refreshes the canvas QR view
function generateQRCode() {
    const type = document.getElementById('qrType').value;
    let finalPayload = "";

    if (type === 'vcard') {
        const name = document.getElementById('name').value;
        const title = document.getElementById('title').value;
        const company = document.getElementById('company').value;
        const phone1 = document.getElementById('phone1').value;
        const phone2 = document.getElementById('phone2').value;
        const email = document.getElementById('email').value;
        const website = document.getElementById('website').value;
        const address = document.getElementById('address').value;
        const pincode = document.getElementById('pincode').value;

        // Build standardized raw vCard string supporting multi-phone and web links rows
        finalPayload = `BEGIN:VCARD\nVERSION:3.0\nN:${name};;;;\nFN:${name}\nORG:${company}\nTITLE:${title}\nTEL;TYPE=CELL,VOICE:${phone1}\nTEL;TYPE=WORK,VOICE:${phone2}\nEMAIL;TYPE=PREF,INTERNET:${email}\nURL:${website}\nADR;TYPE=WORK:;;${address};;;${pincode};India\nEND:VCARD`;
        document.getElementById('qrStatusLabel').innerText = "Raw vCard Contact Payload:";
    } else {
        const waPhone = document.getElementById('waPhone').value.replace(/[^0-9]/g, '');
        const waMessage = encodeURIComponent(document.getElementById('waMessage').value);
        
        // Build standardized WhatsApp click-to-chat URL string
        finalPayload = `https://wa.me/${waPhone}?text=${waMessage}`;
        document.getElementById('qrStatusLabel').innerText = "Direct WhatsApp Target URL:";
    }

    // Update debug text visualization panel
    document.getElementById('rawPayload').value = finalPayload;

    // Wipe out old rendering elements clean
    qrContainer.innerHTML = "";

    // Initialize fresh layout context execution engine object (Enhanced 300x300 structural sizing frame)
    qrCodeInstance = new QRCode(qrContainer, {
        text: finalPayload || "Waiting for inputs...",
        width: 300,
        height: 300,
        colorDark: "#0f172a", 
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M 
    });
}

// Download functionality handling standard PNG output capture stream with white scanning margins
document.getElementById('downloadBtn').addEventListener('click', () => {
    const originalImg = qrContainer.querySelector('img');
    if (originalImg) {
        const tempImage = new Image();
        tempImage.crossOrigin = "anonymous";
        tempImage.src = originalImg.src;
        
        tempImage.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const padding = 30; // 30px uniform protective scanning border
            
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
        alert("Please wait for the QR code to finish rendering before downloading.");
    }
});

// Initialize dynamic boot cycle sequencing
document.getElementById('qrType').addEventListener('change', buildForm);
window.addEventListener('DOMContentLoaded', buildForm);