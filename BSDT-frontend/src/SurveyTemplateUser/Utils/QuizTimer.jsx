// QuizTimer.jsx
import React, { useState, useEffect, useRef } from 'react';

const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0')
  ].join(':');
};

const QuizTimer = ({ durationInMinutes, onTimeUp }) => {
  const [remainingTime, setRemainingTime] = useState(durationInMinutes * 60);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    const timerId = setInterval(() => {
      setRemainingTime((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(timerId);
          onTimeUpRef.current();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const isRunningOut = remainingTime <= 300;

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2050,
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: isRunningOut ? '#dc3545' : '#212529',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        animation: isRunningOut ? 'pulse 1.5s infinite' : 'none',
      }}
      role="timer"
      aria-live="assertive"
    >
      Time Left: {formatTime(remainingTime)}
    </div>
  );
};

export default QuizTimer;