import { useEffect, useRef } from 'react';

const usePlayerInput = (onAction) => {
    const shootCooldownRef = useRef(false);  // Para controlar el enfriamiento de disparos

    useEffect(() => {
        console.log('useEffect montado, listener de keydown registrado');  // Para verificar que el hook se ejecuta

        const handleKeyDown = (event) => {
            console.log(`Tecla presionada: ${event.key}`);      

            let action = null;
            switch (event.key) {
                case 'w':
                    action = { type: 'MOVE', direction: 'up' };
                    break;
                case 's':
                    action = { type: 'MOVE', direction: 'down' };
                    break;
                case 'a':
                    action = { type: 'MOVE', direction: 'left' };
                    break;
                case 'd':
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
                console.log('Acción detectada:', action);  // Para verificar qué acción se está enviando
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
