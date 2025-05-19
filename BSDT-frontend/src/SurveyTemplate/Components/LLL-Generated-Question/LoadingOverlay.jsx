import React, { useState, useEffect } from "react";
import "./ChatbotLoading.css"

const LoadingOverlay = ({ phase }) => {
    const [loadingPhase, setLoadingPhase] = useState("generating");
    const [dotCount, setDotCount] = useState(0);

    useEffect(() => {
        if (phase === "initial") {
            setLoadingPhase("generating");

            // After 2 seconds, change to "almost there"
            const almostThereTimer = setTimeout(() => {
                setLoadingPhase("almostThere");

                // After 1.5 more seconds, change to "success"
                const successTimer = setTimeout(() => {
                    setLoadingPhase("success");
                }, 2000);

                return () => clearTimeout(successTimer);
            }, 3000);

            return () => clearTimeout(almostThereTimer);
        }
    }, [phase]);

    // Animation for dots
    useEffect(() => {
        // Animate dots during loading phases and success
        if (loadingPhase === "generating" || loadingPhase === "almostThere" || loadingPhase === "success") {
            const dotsInterval = setInterval(() => {
                setDotCount((prevCount) => (prevCount + 1) % 4); // 0, 1, 2, 3, then back to 0
            }, 250);

            return () => clearInterval(dotsInterval);
        }
    }, [loadingPhase]);

    const renderDots = () => '.'.repeat(dotCount);

    // Common warning to be used in generating and almostThere phases
    const warningMessage = (
        <div className="alert alert-info mt-2">
            <small><i className="fas fa-info-circle me-2"></i>AI models may occasionally provide inaccurate information.<br />
                Please review the generated content carefully.</small>
        </div>
    );

    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="loading-animation">
                    {loadingPhase === "generating" && (
                        <>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <h3 className="mt-3">
                                <span>Generating your question</span>
                                <span style={{ display: 'inline-block', width: '24px', textAlign: 'left' }}>{renderDots()}</span>
                            </h3>
                            <p className="text-muted">Our AI is crafting a question based on your inputs.</p>
                            {warningMessage}
                        </>
                    )}

                    {loadingPhase === "almostThere" && (
                        <>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <h3 className="mt-3">
                                <span>Almost there</span>
                                <span style={{ display: 'inline-block', width: '24px', textAlign: 'left' }}>{renderDots()}</span>
                            </h3>
                            <p className="text-muted">Our AI is crafting a question based on your inputs.</p>
                            {warningMessage}
                        </>
                    )}

                    {loadingPhase === "success" && (
                        <>
                            <div className="checkmark-animation">
                                <div className="checkmark-circle"></div>
                                <div className="checkmark-stem"></div>
                                <div className="checkmark-kick"></div>
                            </div>
                            <h3 className="mt-3">Success!</h3>
                            <p>
                                <span>Finalizing your question format and structure</span>
                                <span style={{ display: 'inline-block', width: '24px', textAlign: 'left' }}>{renderDots()}</span>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;