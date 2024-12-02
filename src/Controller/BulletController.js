import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import Bullet from '../components/Bullets/Bullet';

const BULLET_SPEED = 0.15;

const BulletController = forwardRef(({ 
    playerId, 
    stompClient, 
    playerPosition, 
    playerDirection,
    isCurrentPlayer,
    mapData 
}, ref) => {
    const [bullets, setBullets] = useState([]);

    const handleGameUpdate = useCallback((message) => {
        try {
            const update = JSON.parse(message.body);
            
            switch(update.type) {
                case 'BULLET_FIRED':
                    console.log('Nueva bala disparada:', update.bullet);
                    setBullets(prev => [...prev, update.bullet]);
                    break;
                case 'BULLET_UPDATE':
                    console.log('Actualización de balas:', update.bullets);
                    setBullets(update.bullets);
                    break;
            }
        } catch (error) {
            console.error('Error procesando actualización de bala:', error);
        }
    }, []);

    useEffect(() => {
        if (!stompClient?.connected) return;

        const subscription = stompClient.subscribe(
            '/topic/game-updates',
            handleGameUpdate
        );

        return () => subscription.unsubscribe();
    }, [stompClient, handleGameUpdate]);

    const shoot = useCallback(() => {
        if (!isCurrentPlayer || !stompClient?.connected) {
            console.log('No se puede disparar:', { isCurrentPlayer, isConnected: stompClient?.connected });
            return;
        }

        console.log('Disparando desde posición:', playerPosition, 'en dirección:', playerDirection);

        let bulletX = playerPosition.x;
        let bulletY = playerPosition.y;
        
        switch (playerDirection) {
            case 'up': bulletY -= 0.5; break;
            case 'down': bulletY += 0.5; break;
            case 'left': bulletX -= 0.5; break;
            case 'right': bulletX += 0.5; break;
        }

        const newBullet = {
            id: `${playerId}-${Date.now()}`,
            playerId,
            x: bulletX,
            y: bulletY,
            direction: playerDirection
        };

        stompClient.publish({
            destination: '/app/bullet-fired',
            body: JSON.stringify({
                type: 'BULLET_FIRED',
                playerId,
                bullet: newBullet
            })
        });
    }, [isCurrentPlayer, stompClient, playerId, playerPosition, playerDirection]);

    // Exponer la función shoot al PlayerController
    useImperativeHandle(ref, () => ({
        shoot
    }), [shoot]);

    useEffect(() => {
        const interval = setInterval(() => {
            setBullets(prevBullets => {
                const updatedBullets = prevBullets
                    .map(bullet => {
                        let { x, y, direction } = bullet;
                        
                        switch (direction) {
                            case 'up': y -= BULLET_SPEED; break;
                            case 'down': y += BULLET_SPEED; break;
                            case 'left': x -= BULLET_SPEED; break;
                            case 'right': x += BULLET_SPEED; break;
                            default: break;
                        }

                        if (x < 0 || x >= mapData[0].length || 
                            y < 0 || y >= mapData.length || 
                            mapData[Math.floor(y)][Math.floor(x)] !== 0) {
                            return null;
                        }

                        return { ...bullet, x, y };
                    })
                    .filter(Boolean);

                if (isCurrentPlayer && updatedBullets.length !== prevBullets.length) {
                    stompClient.publish({
                        destination: '/app/bullet-update',
                        body: JSON.stringify({
                            type: 'BULLET_UPDATE',
                            playerId,
                            bullets: updatedBullets
                        })
                    });
                }

                return updatedBullets;
            });
        }, 16);

        return () => clearInterval(interval);
    }, [mapData, stompClient, playerId, isCurrentPlayer]);

    return (
        <>
            {bullets.map(bullet => (
                <Bullet
                    key={bullet.id}
                    x={bullet.x}
                    y={bullet.y}
                    direction={bullet.direction}
                />
            ))}
        </>
    );
});

export default BulletController;