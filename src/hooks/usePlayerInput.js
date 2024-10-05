import { useEffect, useRef } from 'react';

const usePlayerInput = (onAction) => {
    const shootCooldownRef = useRef(false);  // Para controlar el enfriamiento de disparos

    useEffect(() => {
        const handleKeyDown = (event) => {
            let action = null;
            switch (event.key) {
                case 'ArrowUp':
                    action = { type: 'MOVE', direction: 'up' };
                    break;
                case 'ArrowDown':
                    action = { type: 'MOVE', direction: 'down' };
                    break;
                case 'ArrowLeft':
                    action = { type: 'MOVE', direction: 'left' };
                    break;
                case 'ArrowRight':
                    action = { type: 'MOVE', direction: 'right' };
                    break;
                case ' ':  // Barra espaciadora para disparar
                    if (!shootCooldownRef.current) {
                        action = { type: 'SHOOT' };
                        shootCooldownRef.current = true;
                        setTimeout(() => {
                            shootCooldownRef.current = false;
                        }, 500);  // Enfriamiento de 500 ms para disparar
                    }
                    break;
                default:
                    break;
            }
            if (action) {
                onAction(action);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onAction]);

    return null;
};

export default usePlayerInput;
