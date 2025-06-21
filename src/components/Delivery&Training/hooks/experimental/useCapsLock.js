import { useEffect, useState } from 'react';

export default function useCapsLock() {
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    function handleKey(event) {
      const isOn = event.getModifierState && event.getModifierState('CapsLock');
      setCapsLockOn(isOn);
    }

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  return capsLockOn;
}
