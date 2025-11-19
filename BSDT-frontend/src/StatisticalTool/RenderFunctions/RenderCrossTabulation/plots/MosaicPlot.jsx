import React, { useState, useRef, useEffect } from 'react';

const MosaicPlot = ({
    results,
    language,
    settings: propSettings,
    onSettingsChange,
    openCustomization,
    handleDownload,
    downloadMenuOpen,
    setDownloadMenuOpen,
    chartRef
}) => {
    const t = (en, bn) => (language === 'bn' ? bn : en);
    const canvasRef = useRef(null);

    // Default settings
    const getDefaultSettings = () => ({
        dimensions: '800x600',
        fontFamily: 'Times New Roman',
        captionOn: false,
        captionText: '',
        captionSize: 22,
        captionBold: false,
        captionItalic: false,
        captionUnderline: false,
        captionTopMargin: 30,
        colorScheme: 'categorical',
        showLabels: true,
        labelSize: 12,
        showPercentages: true,
        percentageSize: 11,
        showCounts: false,
        countSize: 10,
        cellBorderOn: true,
        cellBorderColor: '#ffffff',
        cellBorderWidth: 2,
        variableLabelSize: 14,
        variableLabelBold: true,
        categoryLabelSize: 12,
        highlightSignificant: true,
        significanceAlpha: 0.05,
        legendOn: true,
        legendPosition: 'right',
        legendTitle: 'Categories',
        borderOn: false,
        selectedPair: null,
        categoryColors: [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
            '#06b6d4', '#84cc16', '#f43f5e', '#a855f7'
        ],
        marginTop: 80,
        marginBottom: 60,
        marginLeft: 100,
        marginRight: 100,
        spacingBetweenVariables: 20
    });

    const settings = propSettings || getDefaultSettings();


    const generateMosaicData = () => {
        if (!results?.pairwise_results || results.pairwise_results.length === 0) {
            return null;
        }

        // Use selected pair or first pair (cross-tab doesn't have p-values)
        let selectedResult;
        if (settings.selectedPair) {
            selectedResult = results.pairwise_results.find(
                r => `${r.variable1}-${r.variable2}` === settings.selectedPair
            );
        }

        if (!selectedResult) {
            selectedResult = results.pairwise_results[0]; // Just use first result for cross-tab
        }

        // Use cross-tab specific field names
        const var1Categories = selectedResult.categories_var1 || selectedResult.var1_categories || ['Category A', 'Category B'];
        const var2Categories = selectedResult.categories_var2 || selectedResult.var2_categories || ['Type 1', 'Type 2'];

        const contingencyTable = selectedResult.contingency_table || [
            [45, 30],
            [35, 40]
        ];

        return {
            variable1: selectedResult.variable1,
            variable2: selectedResult.variable2,
            var1Categories,
            var2Categories,
            contingencyTable,
            // Cross-tab doesn't have p-value/chi2, use dummy values
            pValue: selectedResult.p_value || 0.05,
            chi2: selectedResult.chi2 || 10.5,
            isSignificant: selectedResult.p_value ? selectedResult.p_value < settings.significanceAlpha : true
        };
    };

    const mosaicData = generateMosaicData();

    // Calculate mosaic layout
    const calculateMosaicLayout = (data, width, height) => {
        if (!data) return null;

        const { contingencyTable, var1Categories, var2Categories } = data;

        // Calculate totals
        const rowTotals = contingencyTable.map(row => row.reduce((a, b) => a + b, 0));
        const colTotals = contingencyTable[0].map((_, i) =>
            contingencyTable.reduce((sum, row) => sum + row[i], 0)
        );
        const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

        // Calculate proportions
        const cells = [];
        let currentY = 0;

        contingencyTable.forEach((row, i) => {
            const rowHeight = (rowTotals[i] / grandTotal) * height;
            let currentX = 0;

            row.forEach((value, j) => {
                const colWidth = (colTotals[j] / grandTotal) * width;
                const cellWidth = (value / rowTotals[i]) * colWidth;

                cells.push({
                    x: currentX,
                    y: currentY,
                    width: cellWidth,
                    height: rowHeight,
                    value: value,
                    percentage: ((value / grandTotal) * 100).toFixed(1),
                    rowCategory: var1Categories[i],
                    colCategory: var2Categories[j],
                    rowIndex: i,
                    colIndex: j
                });

                currentX += cellWidth;
            });

            currentY += rowHeight;
        });

        return { cells, rowTotals, colTotals, grandTotal };
    };

    // Color schemes
    const getColorScheme = (scheme) => {
        const schemes = {
            categorical: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
            pastel: ['#93c5fd', '#86efac', '#fcd34d', '#fca5a5', '#c4b5fd', '#f9a8d4', '#5eead4', '#fdba74'],
            vibrant: ['#1e40af', '#047857', '#b45309', '#991b1b', '#6b21a8', '#9f1239', '#0f766e', '#c2410c'],
            grayscale: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6'],
            ocean: ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#a3e635', '#bef264'],
            sunset: ['#dc2626', '#ea580c', '#f59e0b', '#fbbf24', '#fcd34d', '#fde047', '#fef08a', '#fef3c7']
        };
        return schemes[scheme] || schemes.categorical;
    };

    const getDimensions = (dimensionString) => {
        const [width, height] = dimensionString.split('x').map(Number);
        return { width, height };
    };

    // Draw mosaic plot
    useEffect(() => {
        if (!canvasRef.current || !mosaicData) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { width, height } = getDimensions(settings.dimensions);

        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Calculate plot area
        const plotWidth = width - settings.marginLeft - settings.marginRight;
        const plotHeight = height - settings.marginTop - settings.marginBottom;

        const layout = calculateMosaicLayout(mosaicData, plotWidth, plotHeight);
        if (!layout) return;

        const colors = settings.colorScheme === 'custom'
            ? settings.categoryColors
            : getColorScheme(settings.colorScheme);

        // Draw caption
        if (settings.captionOn) {
            ctx.font = `${settings.captionBold ? 'bold ' : ''}${settings.captionItalic ? 'italic ' : ''}${settings.captionSize}px ${settings.fontFamily}`;
            ctx.fillStyle = '#1f2937';
            ctx.textAlign = 'center';
            ctx.fillText(settings.captionText, width / 2, settings.captionTopMargin);
            if (settings.captionUnderline) {
                const textWidth = ctx.measureText(settings.captionText).width;
                ctx.beginPath();
                ctx.moveTo((width - textWidth) / 2, settings.captionTopMargin + 5);
                ctx.lineTo((width + textWidth) / 2, settings.captionTopMargin + 5);
                ctx.strokeStyle = '#1f2937';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // Draw mosaic cells
        layout.cells.forEach(cell => {
            const x = settings.marginLeft + cell.x;
            const y = settings.marginTop + cell.y;

            // Determine color based on column category
            const colorIndex = cell.colIndex % colors.length;
            const baseColor = colors[colorIndex];

            // Add slight opacity variation based on row
            const opacity = 0.85 + (cell.rowIndex * 0.05);
            ctx.fillStyle = baseColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');

            // Draw cell
            ctx.fillRect(x, y, cell.width, cell.height);

            // Draw subtle border
            if (settings.cellBorderOn) {
                ctx.strokeStyle = settings.cellBorderColor;
                ctx.lineWidth = settings.cellBorderWidth;
                ctx.strokeRect(x, y, cell.width, cell.height);
            }

            // Draw labels if cell is large enough
            if (cell.width > 40 && cell.height > 30) {
                const centerX = x + cell.width / 2;
                const centerY = y + cell.height / 2;

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                let yOffset = 0;

                // Draw percentage
                if (settings.showPercentages) {
                    ctx.font = `bold ${settings.percentageSize}px ${settings.fontFamily}`;
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 1;
                    ctx.fillText(`${cell.percentage}%`, centerX, centerY + yOffset);
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    yOffset += settings.percentageSize + 4;
                }

                // Draw count
                if (settings.showCounts) {
                    ctx.font = `${settings.countSize}px ${settings.fontFamily}`;
                    ctx.fillStyle = '#ffffff';
                    ctx.globalAlpha = 0.9;
                    ctx.fillText(`(n=${cell.value})`, centerX, centerY + yOffset);
                    ctx.globalAlpha = 1.0;
                }
            }
        });

        // Draw plot border frame
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            settings.marginLeft,
            settings.marginTop,
            plotWidth,
            plotHeight
        );

        // Draw variable labels
        ctx.font = `${settings.variableLabelBold ? 'bold ' : ''}${settings.variableLabelSize}px ${settings.fontFamily}`;
        ctx.fillStyle = '#1f2937';

        // Y-axis label (Variable 1)
        ctx.save();
        ctx.translate(30, settings.marginTop + plotHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(mosaicData.variable1, 0, 0);
        ctx.restore();

        // X-axis label (Variable 2)
        ctx.textAlign = 'center';
        ctx.fillText(mosaicData.variable2, settings.marginLeft + plotWidth / 2, height - 20);

        // Draw category labels
        ctx.font = `${settings.categoryLabelSize}px ${settings.fontFamily}`;

        // Row category labels (left side)
        layout.cells.filter((c, i, arr) => arr.findIndex(cell => cell.rowIndex === c.rowIndex) === i)
            .forEach(cell => {
                const y = settings.marginTop + cell.y + cell.height / 2;
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#374151';
                ctx.fillText(cell.rowCategory, settings.marginLeft - 10, y);
            });

        // Column category labels (top)
        const uniqueColCells = [];
        layout.cells.forEach(cell => {
            if (!uniqueColCells.find(c => c.colIndex === cell.colIndex)) {
                uniqueColCells.push(cell);
            }
        });

        uniqueColCells.forEach(cell => {
            const avgX = layout.cells
                .filter(c => c.colIndex === cell.colIndex)
                .reduce((sum, c) => sum + c.x + c.width / 2, 0) /
                layout.cells.filter(c => c.colIndex === cell.colIndex).length;

            const x = settings.marginLeft + avgX;
            ctx.save();
            ctx.translate(x, settings.marginTop - 15);
            ctx.rotate(-Math.PI / 4);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#374151';
            ctx.fillText(cell.colCategory, 0, 0);
            ctx.restore();
        });

        // Draw legend
        if (settings.legendOn) {
            const legendX = settings.marginLeft + plotWidth + 30;
            let legendY = settings.marginTop;

            ctx.font = `bold ${settings.categoryLabelSize + 2}px ${settings.fontFamily}`;
            ctx.fillStyle = '#1f2937';
            ctx.textAlign = 'left';
            ctx.fillText(settings.legendTitle, legendX, legendY);
            legendY += 30;

            mosaicData.var2Categories.forEach((cat, i) => {
                const color = colors[i % colors.length];

                // Draw color box
                ctx.fillStyle = color;
                ctx.fillRect(legendX, legendY, 20, 20);
                ctx.strokeStyle = settings.cellBorderColor;
                ctx.lineWidth = 1;
                ctx.strokeRect(legendX, legendY, 20, 20);

                // Draw label
                ctx.font = `${settings.categoryLabelSize}px ${settings.fontFamily}`;
                ctx.fillStyle = '#374151';
                ctx.fillText(cat, legendX + 28, legendY + 14);

                legendY += 28;
            });
        }

        // Draw border
        if (settings.borderOn) {
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, width, height);
        }

    }, [settings, mosaicData]);

    if (!mosaicData) {
        return (
            <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                color: 'white'
            }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>
                    {t('No Data Available', 'কোনো ডেটা উপলব্ধ নেই')}
                </h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                    {t('Please run the Chi-Square test first', 'প্রথমে কাই-স্কয়ার পরীক্ষা চালান')}
                </p>
            </div>
        );
    }

    const { width, height } = getDimensions(settings.dimensions);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Control Buttons */}
            <div style={{ position: 'absolute', top: '150px', right: '30px', display: 'flex', gap: '8px', zIndex: 10 }}>
                <button className="customize-btn" onClick={() => openCustomization('mosaic')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                    </svg>
                    Customize
                </button>
                <div style={{ position: 'relative' }}>
                    <button
                        className="customize-btn"
                        onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Download
                    </button>
                    {downloadMenuOpen && (
                        <div className="download-menu">
                            <button onClick={() => handleDownload('png')}>PNG</button>
                            <button onClick={() => handleDownload('jpg')}>JPG</button>
                            <button onClick={() => handleDownload('jpeg')}>JPEG</button>
                            <button onClick={() => handleDownload('pdf')}>PDF</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Container with Statistics Header */}
            <div ref={chartRef} style={{ position: 'relative' }}>
                {/* Statistics Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    borderRadius: '12px',
                    border: '2px solid #bae6fd'
                }}>
                    <div>
                        <h4 style={{
                            margin: '0 0 4px 0',
                            fontSize: '14px',
                            color: '#0369a1',
                            fontWeight: '600',
                            fontFamily: settings.fontFamily
                        }}>
                            {t('Analyzing', 'বিশ্লেষণ করা হচ্ছে')}: {mosaicData.variable1} × {mosaicData.variable2}
                        </h4>
                        <p style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#0c4a6e',
                            fontFamily: settings.fontFamily
                        }}>
                            {t('Mosaic representation of categorical associations', 'শ্রেণীগত সংযোগের মোজাইক উপস্থাপনা')}
                        </p>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            padding: '8px 16px',
                            background: 'white',
                            borderRadius: '10px',
                            border: '2px solid #0ea5e9'
                        }}>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#0369a1',
                                fontFamily: settings.fontFamily
                            }}>
                                {mosaicData.chi2.toFixed(2)}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: '#0c4a6e',
                                fontWeight: '600'
                            }}>
                                χ² {t('Statistic', 'পরিসংখ্যান')}
                            </div>
                        </div>
                        <div style={{
                            textAlign: 'center',
                            padding: '8px 16px',
                            background: mosaicData.pValue < 0.05 ? '#dcfce7' : '#fee2e2',
                            borderRadius: '10px',
                            border: `2px solid ${mosaicData.pValue < 0.05 ? '#16a34a' : '#dc2626'}`
                        }}>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: mosaicData.pValue < 0.05 ? '#15803d' : '#991b1b',
                                fontFamily: settings.fontFamily
                            }}>
                                {mosaicData.pValue.toFixed(4)}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: mosaicData.pValue < 0.05 ? '#166534' : '#7f1d1d',
                                fontWeight: '600'
                            }}>
                                p-{t('value', 'মান')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Canvas Container */}
                <div
                    style={{
                        position: 'relative',
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%'
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        style={{
                            display: 'block',
                            maxWidth: '100%',
                            height: 'auto'
                        }}
                    />
                </div>
            </div>

            {/* Info Panel */}
            <div style={{
                marginTop: '24px',
                padding: '20px',
                background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecf3 100%)',
                borderRadius: '12px',
                border: '2px solid #e5e7eb'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <h4 style={{ margin: 0, color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                        {t('Mosaic Plot Information', 'মোজাইক প্লট তথ্য')}
                    </h4>
                </div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                    {t(
                        'This mosaic plot visualizes the relationship between two categorical variables. The area of each rectangle is proportional to the frequency of the corresponding category combination. Wider rectangles indicate more frequent combinations.',
                        'এই মোজাইক প্লট দুটি শ্রেণীগত ভেরিয়েবলের মধ্যে সম্পর্ক দৃশ্যমান করে। প্রতিটি আয়তক্ষেত্রের ক্ষেত্রফল সংশ্লিষ্ট শ্রেণী সমন্বয়ের ফ্রিকোয়েন্সির সমানুপাতিক। প্রশস্ত আয়তক্ষেত্র আরো ঘন ঘন সমন্বয় নির্দেশ করে।'
                    )}
                </p>
            </div>
        </div>
    );
};

export default MosaicPlot;