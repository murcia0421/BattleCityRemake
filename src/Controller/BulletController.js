import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import Bullet from '../components/Bullets/Bullet';

const BULLET_SPEED = 0.15;

const updateBulletPosition = (bullet, mapData) => {
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
};

const publishBulletUpdate = (stompClient, playerId, bullets) => {
    stompClient.publish({
        destination: '/app/bullet-update',
        body: JSON.stringify({
            type: 'BULLET_UPDATE',
            playerId,
            bullets
        })
    });
};

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
                    setBullets(prev => [...prev, update.bullet]);
                    break;
                case 'BULLET_UPDATE':
                    setBullets(update.bullets);
                    break;
            }
        } catch (error) {
            console.error('Error procesando actualización de bala:', error);
        }
    }, []);

    useEffect(() => {
        if (!stompClient?.connected) return;
        const subscription = stompClient.subscribe('/topic/game-updates', handleGameUpdate);
        return () => subscription.unsubscribe();
    }, [stompClient, handleGameUpdate]);

    const shoot = useCallback(() => {
        if (!isCurrentPlayer || !stompClient?.connected) return;

        const bulletX = playerPosition.x + (playerDirection === 'left' ? -0.5 : playerDirection === 'right' ? 0.5 : 0);
        const bulletY = playerPosition.y + (playerDirection === 'up' ? -0.5 : playerDirection === 'down' ? 0.5 : 0);

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

    useImperativeHandle(ref, () => ({ shoot }), [shoot]);

    const updateBulletsPositions = (prevBullets) => {
        return prevBullets
            .map(bullet => updateBulletPosition(bullet, mapData))
            .filter(Boolean);
    };

    const handleBulletUpdate = (updatedBullets, prevBullets) => {
        if (isCurrentPlayer && updatedBullets.length !== prevBullets.length) {
            publishBulletUpdate(stompClient, playerId, updatedBullets);
        }
        return updatedBullets;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setBullets(prevBullets => {
                const updatedBullets = updateBulletsPositions(prevBullets);
                return handleBulletUpdate(updatedBullets, prevBullets);
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

BulletController.propTypes = {
    playerId: PropTypes.string.isRequired,
    stompClient: PropTypes.object.isRequired,
    playerPosition: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
    }).isRequired,
    playerDirection: PropTypes.oneOf(['up', 'down', 'left', 'right']).isRequired,
    isCurrentPlayer: PropTypes.bool.isRequired,
    mapData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired
};

export default BulletController;
