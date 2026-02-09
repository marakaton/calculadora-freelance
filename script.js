document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const resultCard = document.getElementById('resultCard');
    const finalPriceEl = document.getElementById('finalPrice');
    const priceRangeEl = document.getElementById('priceRange');
    const maintPriceEl = document.getElementById('maintPrice');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');

    // Base Rates (Example Data - Ideally customizable via admin later)
    const rates = {
        web_landing: { base: 400, hours: 15 },
        web_corporate: { base: 1200, hours: 40 },
        ecommerce: { base: 2500, hours: 80 },
        logo: { base: 300, hours: 10 },
        app_mvp: { base: 4500, hours: 120 }
    };

    const multipliers = {
        experience: {
            junior: 0.8,
            mid: 1.2,
            senior: 1.8,
            expert: 2.5
        },
        urgency: {
            normal: 1.0,
            rush: 1.3,
            relaxed: 0.9
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

        // Maintenance logic (e.g., 10% of total per month or flat fee)
        let maintFee = maintenance ? Math.round(total * 0.05) : 0;
        if (maintFee < 50 && maintenance) maintFee = 50; // Minimum maintenance

        // Rounding for cleaner numbers
        total = Math.ceil(total / 50) * 50;

        const minRange = Math.round(total * 0.9);
        const maxRange = Math.round(total * 1.2);

        // 3. Update UI
        // Animate count up
        animateValue(finalPriceEl, 0, total, 1000);

        priceRangeEl.textContent = `${minRange}€ - ${maxRange}€`;
        maintPriceEl.textContent = `${maintFee}€`;

        // Reveal Card
        resultCard.classList.remove('result-hidden');
        resultCard.classList.add('result-visible');

        // Close keyboard on mobile
        document.activeElement.blur();

        // Store for PDF
        lastCalculation = {
            typeText: document.getElementById('projectType').options[document.getElementById('projectType').selectedIndex].text,
            total: total,
            range: `${minRange} - ${maxRange}`,
            maint: maintFee,
            date: new Date().toLocaleDateString()
        };
    });

    downloadPdfBtn.addEventListener('click', () => {
        generatePDF(lastCalculation);
    });

    // Demo Button Logic
    const demoBtn = document.getElementById('demoBtn');
    if (demoBtn) {
        demoBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Scroll to form
            document.getElementById('calculadora').scrollIntoView({ behavior: 'smooth' });

            // 2. Fill with example data (after short delay for smooth scroll)
            setTimeout(() => {
                document.getElementById('projectType').value = 'ecommerce';
                document.getElementById('experience').value = 'senior';
                document.getElementById('urgency').value = 'rush';
                document.getElementById('maintenance').checked = true;

                // 3. Trigger calculation visual effect
                calculateBtn.click();
            }, 800);
        });
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    async function generatePDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(108, 99, 255); // Primary color
        doc.text("Presupuesto Estimado", 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha: ${data.date}`, 20, 30);
        doc.text("Generado por FreelanceCalc.es", 20, 35);

        // Content
        doc.setDrawColor(200);
        doc.line(20, 40, 190, 40); // Horizontal line

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Detalles del Proyecto", 20, 55);

        doc.setFontSize(12);
        doc.setTextColor(80);
        doc.text(`Servicio: ${data.typeText}`, 20, 65);

        doc.text("Base Imponible Recomendada:", 20, 80);
        doc.setFontSize(30);
        doc.setTextColor(0);
        doc.text(`€${data.total}`, 20, 95);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Rango de mercado: €${data.range}`, 20, 105);

        if (data.maint > 0) {
            doc.text(`+ Mantenimiento mensual: €${data.maint}/mes`, 20, 115);
        }

        // Footer / Affiliate Hook
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Nota: Este precio no incluye IVA (21%).", 20, 140);
        doc.text("Para formalizar este trabajo, recomendamos firmar un contrato legal.", 20, 145);

        doc.setTextColor(108, 99, 255);
        doc.textWithLink("Descargar Modelo de Contrato Oficial >", 20, 155, { url: "https://www.rocketlawyer.com/es/es" });

        // Save
        doc.save("presupuesto-autonomo.pdf");
    }
});
