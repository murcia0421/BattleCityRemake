import { useEffect, useRef } from 'react';

const usePlayerInput = (onAction) => {
    const keyStates = useRef({});
    const shootCooldownRef = useRef(false);
    const movementIntervalRef = useRef(null);

    useEffect(() => {
        const handleShoot = () => {
            if (!shootCooldownRef.current) {
                onAction({ type: 'SHOOT' });
                // Activar cooldown
                shootCooldownRef.current = true;
                setTimeout(() => {
                    shootCooldownRef.current = false;
                }, 500); // Cooldown de 500ms entre disparos
            }
        };

        const handleKeyDown = (event) => {
            if (keyStates.current[event.key]) return;
            
            keyStates.current[event.key] = true;
            
            switch (event.key) {
                case ' ':  // Barra espaciadora para disparar
                    event.preventDefault();
                    handleShoot();
                    break;
                case 'Enter': // Opción alternativa para disparar
                    event.preventDefault();
                    handleShoot();
                    break;
            }
        };

        const handleKeyUp = (event) => {
            keyStates.current[event.key] = false;
        };

        // Movimiento continuo
        movementIntervalRef.current = setInterval(() => {
            if (keyStates.current['w']) onAction({ type: 'MOVE', direction: 'up' });
            if (keyStates.current['s']) onAction({ type: 'MOVE', direction: 'down' });
            if (keyStates.current['a']) onAction({ type: 'MOVE', direction: 'left' });
            if (keyStates.current['d']) onAction({ type: 'MOVE', direction: 'right' });
        }, 16);

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