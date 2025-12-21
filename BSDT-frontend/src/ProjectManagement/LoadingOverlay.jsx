import React from 'react';
import './AutoSurveyGeneration.css';

const LoadingOverlay = ({ phase }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-animation">
          {phase === "initial" ? (
            <>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4 className="mt-3">Generating your survey...</h4>
              <p className="text-muted">Please wait while our AI creates your survey</p>
            </>
          ) : (
            <>
              <div className="checkmark-animation">
                <div className="checkmark-circle"></div>
              </div>
              <h4 className="mt-3">Almost there!</h4>
              <p className="text-muted">Finalizing your survey...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;