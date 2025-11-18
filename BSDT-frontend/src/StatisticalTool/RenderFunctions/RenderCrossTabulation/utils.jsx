// Utility functions for Results

export const mapDigitIfBengali = (text, language) => {
    if (language !== 'bn' || text === null || text === undefined) return text ?? '';
    const digitMapBn = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
        '.': '.'
    };
    return text.toString().split('').map(char => digitMapBn[char] || char).join('');
};

export const formatValue = (v, digits = 6, language) => {
    if (v === null || v === undefined || Number.isNaN(v)) return '–';
    const s = typeof v === 'number' ? v.toFixed(digits) : String(v);
    return mapDigitIfBengali(s, language);
};

export const downloadBlockPNG = async (anchor, blockRefs) => {
    const el = blockRefs.current[anchor];
    if (!el) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: window.devicePixelRatio < 2 ? 2 : window.devicePixelRatio,
    });
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${anchor.replace(/\s+/g, '_')}_cross_tabulation_table.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const downloadBlockPDF = async (anchor, blockRefs) => {
    const el = blockRefs.current[anchor];
    if (!el) return;
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: window.devicePixelRatio < 2 ? 2 : window.devicePixelRatio,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const imgW = pageW - 40;
    const imgH = (canvas.height * imgW) / canvas.width;
    const scale = Math.min(imgW / imgW, (pageH - 40) / imgH);
    const finalW = imgW * scale;
    const finalH = imgH * scale;

    pdf.addImage(imgData, "PNG", 20, 20, finalW, finalH);
    pdf.save(`${anchor.replace(/\s+/g, '_')}_cross_tabulation_table.pdf`);
};

export const downloadAllBlocksPDF = async (results, blockRefs) => {
    if (!results?.blocks?.length) return;
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    let first = true;
    for (const { anchor } of results.blocks) {
        const el = blockRefs.current[anchor];
        if (!el) continue;

        const canvas = await html2canvas(el, {
            backgroundColor: "#ffffff",
            scale: window.devicePixelRatio < 2 ? 2 : window.devicePixelRatio,
        });
        const imgData = canvas.toDataURL("image/png");

        const imgW = pageW - 40;
        const imgH = (canvas.height * imgW) / canvas.width;
        const scale = Math.min(1, (pageH - 40) / imgH);
        const finalW = imgW * scale;
        const finalH = imgH * scale;

        if (!first) pdf.addPage();
        pdf.addImage(imgData, "PNG", 20, 20, finalW, finalH);
        first = false;
    }

    pdf.save("cross_tabulation_all_comparisons.pdf");
};

// Add to your utils.js file

export const downloadVariableStatsPDF = async (results, language) => {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    // Find the variable stats section
    const statsSection = document.querySelector('.variable-stats-section');
    if (!statsSection) {
        alert('Variable statistics section not found');
        return;
    }

    try {
        const canvas = await html2canvas(statsSection, {
            backgroundColor: "#ffffff",
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            scrollY: -window.scrollY,
            scrollX: -window.scrollX,
            windowWidth: document.documentElement.scrollWidth,
            windowHeight: document.documentElement.scrollHeight
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Create PDF with appropriate size
        const pdf = new jsPDF({
            orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
            unit: 'px',
            format: [imgWidth, imgHeight]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save("variable_statistics.pdf");
    } catch (error) {
        console.error('Error downloading variable statistics:', error);
        alert('Error downloading PDF. Please try again.');
    }
};

export const downloadPairwiseBlockPNG = async (anchor, blockRefs) => {
    const blockEl = blockRefs.current[anchor];
    if (!blockEl) {
        alert('Block not found');
        return;
    }

    const html2canvas = (await import('html2canvas')).default;
    
    try {
        const canvas = await html2canvas(blockEl, {
            backgroundColor: "#ffffff",
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            scrollY: -window.scrollY,
            scrollX: -window.scrollX,
            windowWidth: document.documentElement.scrollWidth,
            windowHeight: document.documentElement.scrollHeight
        });

        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `${anchor.replace(/\s+/g, '_')}_comparison.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Error downloading PNG:', error);
        alert('Error downloading PNG. Please try again.');
    }
};

export const downloadPairwiseBlockJPG = async (anchor, blockRefs) => {
    const blockEl = blockRefs.current[anchor];
    if (!blockEl) {
        alert('Block not found');
        return;
    }

    const html2canvas = (await import('html2canvas')).default;
    
    try {
        const canvas = await html2canvas(blockEl, {
            backgroundColor: "#ffffff",
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            scrollY: -window.scrollY,
            scrollX: -window.scrollX,
            windowWidth: document.documentElement.scrollWidth,
            windowHeight: document.documentElement.scrollHeight
        });

        const dataURL = canvas.toDataURL("image/jpeg", 1.0);
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `${anchor.replace(/\s+/g, '_')}_comparison.jpg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Error downloading JPG:', error);
        alert('Error downloading JPG. Please try again.');
    }
};

export const downloadPairwiseBlockPDF = async (anchor, blockRefs) => {
    const blockEl = blockRefs.current[anchor];
    if (!blockEl) {
        alert('Block not found');
        return;
    }

    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    try {
        const canvas = await html2canvas(blockEl, {
            backgroundColor: "#ffffff",
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            scrollY: -window.scrollY,
            scrollX: -window.scrollX,
            windowWidth: document.documentElement.scrollWidth,
            windowHeight: document.documentElement.scrollHeight
        });

        const imgData = canvas.toDataURL("image/png");
        const imgW = canvas.width;
        const imgH = canvas.height;
        
        const pdf = new jsPDF({
            orientation: imgW > imgH ? 'landscape' : 'portrait',
            unit: 'px',
            format: [imgW, imgH]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
        pdf.save(`${anchor.replace(/\s+/g, '_')}_comparison.pdf`);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Error downloading PDF. Please try again.');
    }
};

export const downloadAllPairwiseBlocksPDF = async (results, blockRefs) => {
    if (!results?.blocks?.length) {
        alert('No blocks to download');
        return;
    }
    
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    try {
        const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const spacingBetweenBlocks = 30; // Space between comparisons
        const availableWidth = pageW - (2 * margin);
        
        let currentY = margin; // Track current Y position
        let isFirstBlock = true;

        for (const { anchor } of results.blocks) {
            const el = blockRefs.current[anchor];
            if (!el) continue;

            const canvas = await html2canvas(el, {
                backgroundColor: "#ffffff",
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                scrollY: -window.scrollY,
                scrollX: -window.scrollX,
                windowWidth: document.documentElement.scrollWidth,
                windowHeight: document.documentElement.scrollHeight
            });
            
            const imgData = canvas.toDataURL("image/png");
            
            // Calculate scaled dimensions to fit page width
            const imgW = availableWidth;
            const imgH = (canvas.height * imgW) / canvas.width;
            
            // Check if block fits on current page
            if (currentY + imgH > pageH - margin) {
                // Block doesn't fit, add new page
                pdf.addPage();
                currentY = margin;
            } else if (!isFirstBlock) {
                // Add spacing before block (except for first block)
                currentY += spacingBetweenBlocks;
            }
            
            // Add the image at current position
            pdf.addImage(imgData, "PNG", margin, currentY, imgW, imgH);
            
            // Update current Y position for next block
            currentY += imgH;
            isFirstBlock = false;
        }

        pdf.save("all_pairwise_comparisons.pdf");
    } catch (error) {
        console.error('Error downloading all blocks PDF:', error);
        alert('Error downloading PDF. Please try again.');
    }
};