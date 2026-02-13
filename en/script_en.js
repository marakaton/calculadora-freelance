document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const resultCard = document.getElementById('resultCard');
    const finalPriceEl = document.getElementById('finalPrice');
    const priceRangeEl = document.getElementById('priceRange');
    const maintPriceEl = document.getElementById('maintPrice');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    // US Market Rates (Adjusted for Higher Pricing & Complexity)
    const rates = {
        web_landing: { base: 1200, hours: 25 },  // Simple Landing Page ($1.2k - $1.8k)
        web_corporate: { base: 3500, hours: 60 }, // Corporate Site ($3.5k - $5k)
        ecommerce: { base: 6000, hours: 100 },    // E-commerce ($6k+)
        logo: { base: 800, hours: 15 },           // Branding Package ($800+)
        app_mvp: { base: 12000, hours: 200 }      // Mobile MVP ($12k+)
    };

    const multipliers = {
        experience: {
            junior: 0.8,   // Beginner (Fiverr level)
            mid: 1.2,      // Professional (Upwork top rated)
            senior: 2.0,   // Agency / Expert
            expert: 3.5    // High-End Agency
        },
        urgency: {
            normal: 1.0,   // Standard Timeline
            rush: 1.5,     // Rush Job (+50%)
            relaxed: 0.9   // Flexible (-10%)
        }
    };

    let lastCalculation = {};

    calculateBtn.addEventListener('click', () => {
        // 1. Get Values
        const type = document.getElementById('projectType').value;
        const exp = document.getElementById('experience').value;
        const urgency = document.getElementById('urgency').value;
        const maintenance = document.getElementById('maintenance').checked;

        // 2. Calculate Logic
        const baseProject = rates[type] || rates.web_landing;
        const expMult = multipliers.experience[exp] || 1;
        const urgMult = multipliers.urgency[urgency] || 1;

        let total = baseProject.base * expMult * urgMult;

        // Maintenance logic (Retainer: usually 10-15% or flat hourly)
        // In the US, retainers are higher. Min $150/mo.
        let maintFee = maintenance ? Math.round(total * 0.10) : 0;
        if (maintFee < 150 && maintenance) maintFee = 150;

        // Rounding to nearest 50
        total = Math.ceil(total / 50) * 50;

        const minRange = Math.round(total * 0.9);
        const maxRange = Math.round(total * 1.3); // Wider range for US negotiation

        // 3. Update UI
        animateValue(finalPriceEl, 0, total, 1000);

        priceRangeEl.textContent = `$${minRange.toLocaleString()} - $${maxRange.toLocaleString()}`;
        maintPriceEl.textContent = `$${maintFee}`;

        // Reveal Card
        resultCard.classList.remove('result-hidden');
        resultCard.classList.add('result-visible');

        // Close keyboard on mobile
        document.activeElement.blur();

        // Scroll to result slightly
        // resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Store for PDF
        lastCalculation = {
            typeText: document.getElementById('projectType').options[document.getElementById('projectType').selectedIndex].text,
            total: total,
            range: `$${minRange.toLocaleString()} - $${maxRange.toLocaleString()}`,
            maint: maintFee,
            date: new Date().toLocaleDateString('en-US')
        };
    });

    downloadPdfBtn.addEventListener('click', () => {
        generatePDF(lastCalculation);
    });

    // Copy Link Logic (Simple for now)
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const originalText = copyLinkBtn.textContent;
                copyLinkBtn.textContent = "Link Copied! ✅";
                setTimeout(() => {
                    copyLinkBtn.textContent = originalText;
                }, 2000);
            });
        });
    }

    // Demo Button Logic
    const demoBtn = document.getElementById('demoBtn');
    if (demoBtn) {
        demoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('calculadora').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                document.getElementById('projectType').value = 'ecommerce';
                document.getElementById('experience').value = 'senior';
                document.getElementById('urgency').value = 'rush';
                document.getElementById('maintenance').checked = true;
                calculateBtn.click();
            }, 800);
        });
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    async function generatePDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Branding
        doc.setFontSize(22);
        doc.setTextColor(108, 99, 255); // Primary color
        doc.text("Project Estimate", 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Date: ${data.date}`, 20, 30);
        doc.text("Generated by FreelanceCalc.net", 20, 35);

        // Content
        doc.setDrawColor(200);
        doc.line(20, 40, 190, 40);

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Project Details", 20, 55);

        doc.setFontSize(12);
        doc.setTextColor(80);
        doc.text(`Service: ${data.typeText}`, 20, 65);

        doc.text("Recommended Net Price:", 20, 80);
        doc.setFontSize(30);
        doc.setTextColor(0);
        doc.text(`$${data.total.toLocaleString()}`, 20, 95);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Market Range: ${data.range}`, 20, 105);

        if (data.maint > 0) {
            doc.text(`+ Monthly Retainer: $${data.maint}/mo`, 20, 115);
        }

        // Footer / Affiliate Hook
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Note: This is an estimated quote based on US market rates.", 20, 140);
        doc.text("Always use a legal contract to protect your work.", 20, 145);

        doc.setTextColor(108, 99, 255);
        // Generic Legal Link for US
        doc.textWithLink("Download Legal Contract Template >", 20, 155, { url: "https://www.rocketlawyer.com/" });

        // Save
        doc.save("freelance-estimate.pdf");
    }
});
