import { useEffect } from 'react';

const usePlayerInput = (onAction) => {
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
                case ' ':
                    action = { type: 'SHOOT' };
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
};

export default usePlayerInput;
