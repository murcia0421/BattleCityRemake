import { useEffect, useRef } from 'react';

const usePlayerInput = (onAction) => {
    const keyStates = useRef({});
    const shootCooldownRef = useRef(false);
    const movementIntervalRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (keyStates.current[event.key]) return;
            
            keyStates.current[event.key] = true;
            
            switch (event.key) {
                case ' ':
                    event.preventDefault();
                    if (!shootCooldownRef.current) {
                        onAction({ type: 'SHOOT' });
                        shootCooldownRef.current = true;
                        setTimeout(() => {
                            shootCooldownRef.current = false;
                        }, 500);
                    }
                    break;
            }
        };

        const handleKeyUp = (event) => {
            keyStates.current[event.key] = false;
        };

        // Crear intervalo de movimiento continuo
        movementIntervalRef.current = setInterval(() => {
            if (keyStates.current['w']) onAction({ type: 'MOVE', direction: 'up' });
            if (keyStates.current['s']) onAction({ type: 'MOVE', direction: 'down' });
            if (keyStates.current['a']) onAction({ type: 'MOVE', direction: 'left' });
            if (keyStates.current['d']) onAction({ type: 'MOVE', direction: 'right' });
        }, 16); // 60 FPS aproximadamente

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (movementIntervalRef.current) {
                clearInterval(movementIntervalRef.current);
            }
        };
    }, [onAction]);

    return null;
};

export default usePlayerInput;