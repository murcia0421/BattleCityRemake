import { useEffect, useRef } from 'react';

const usePlayerInput = (onAction) => {
    // Store the current state of keys being pressed
    const keyStates = useRef({});
    // Reference for the shooting cooldown
    const shootCooldownRef = useRef(false);
    // Reference for managing the movement interval
    const movementIntervalRef = useRef(null);

    useEffect(() => {
        // Handles shooting action with cooldown logic
        const handleShoot = () => {
            if (!shootCooldownRef.current) {
                onAction({ type: 'SHOOT' });
                shootCooldownRef.current = true;

                // Cooldown period of 500ms
                setTimeout(() => {
                    shootCooldownRef.current = false;
                }, 500);
            }
        };

        // Handles keydown events for movement and shooting
        const handleKeyDown = (event) => {
            if (keyStates.current[event.key]) return; // Avoid duplicate key presses
            keyStates.current[event.key] = true;

            switch (event.key) {
                case ' ':
                case 'Enter': // Alternative shooting key
                    event.preventDefault();
                    handleShoot();
                    break;
                default:
                    break;
            }
        };

        // Handles keyup events to reset key states
        const handleKeyUp = (event) => {
            keyStates.current[event.key] = false;
        };

        // Handles continuous movement based on key states
        movementIntervalRef.current = setInterval(() => {
            if (keyStates.current['w']) onAction({ type: 'MOVE', direction: 'up' });
            if (keyStates.current['s']) onAction({ type: 'MOVE', direction: 'down' });
            if (keyStates.current['a']) onAction({ type: 'MOVE', direction: 'left' });
            if (keyStates.current['d']) onAction({ type: 'MOVE', direction: 'right' });
        }, 16); // Approximately 60fps (16ms per frame)

        // Attach event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Cleanup function
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (movementIntervalRef.current) {
                clearInterval(movementIntervalRef.current);
            }
        };
    }, [onAction]); // Dependency on the `onAction` callback

    return null;
};

export default usePlayerInput;
