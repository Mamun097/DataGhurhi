// ResidualPlot.jsx
import React from 'react';

const ResidualPlot = ({ language }) => {
    return (
        <div className="plot-placeholder">
            <p>
                {language === 'bn' ? 'রেসিডুয়াল প্লট শীঘ্রই আসছে...' : 'Residual plot coming soon...'}
            </p>
        </div>
    );
};

export default ResidualPlot;