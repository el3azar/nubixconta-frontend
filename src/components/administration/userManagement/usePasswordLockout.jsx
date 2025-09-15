import { useState, useEffect } from 'react';

const usePasswordLockout = () => {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [blockDuration, setBlockDuration] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Efecto para el temporizador de bloqueo
  useEffect(() => {
    let timer;
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleFailedAttempt = () => {
    setFailedAttempts((prevAttempts) => prevAttempts + 1);
    
    // Lógica de bloqueo
    setFailedAttempts((prevAttempts) => {
      const newAttempts = prevAttempts + 1;
      if (newAttempts >= 5) {
        if (blockDuration === 0) {
          setBlockDuration(60);
          setLockoutTime(60);
          return 0; // Reinicia los intentos para el siguiente ciclo
        } else if (blockDuration === 60) {
          setBlockDuration(180);
          setLockoutTime(180);
          return 0;
        } else if (blockDuration === 180) {
          // Ya no es necesario manejar la redirección aquí
          return 0;
        }
      }
      return newAttempts;
    });
  };

  const resetLockoutState = () => {
    setFailedAttempts(0);
    setBlockDuration(0);
    setLockoutTime(0);
  };
  
  const isLocked = lockoutTime > 0;
  const remainingTime = Math.floor(lockoutTime / 60) + ':' + (`0${lockoutTime % 60}`).slice(-2);
  const shouldRedirect = blockDuration === 180 && failedAttempts >= 5;

  return {
    failedAttempts,
    setFailedAttempts,
    blockDuration,
    setBlockDuration,
    lockoutTime,
    setLockoutTime,
    handleFailedAttempt,
    resetLockoutState,
    isLocked,
    remainingTime,
    shouldRedirect
  };
};

export default usePasswordLockout;