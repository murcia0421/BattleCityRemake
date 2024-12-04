import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import Bullet from '../components/Bullets/Bullet';

const BULLET_SPEED = 0.15;

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

//Verificar si el bullet impacta con un jugador-distinto al actual 
//si me tiro todo borro esto 
const checkPlayerCollision = (bullet, players = {}) => {
    // No verificar colisiones con el jugador que disparó
    console.log("Posición de la bala:", { x: bullet.x, y: bullet.y });
    console.log("Todos los jugadores:", players); // Añadir este log
    
    return Object.values(players).find(player => {

        if (!player.id) {
            console.log("Jugador sin ID:", player);
            return false;
        }

        console.log('Revisando colisión con jugador:', {
            playerId: player.id,
            playerPos: player.position,
            bulletPlayerId: bullet.playerId,
            isShooter: player.id === bullet.playerId, 
            bulletPos: { x: bullet.x, y: bullet.y },
            hitbox: {
                minX: player.position.x - 0.4,
                maxX: player.position.x + 0.4,
                minY: player.position.y - 0.4,
                maxY: player.position.y + 0.4
            }
        });

        if (player.id === bullet.playerId || !player.isAlive) return false;

        // Crear hitbox correcto alrededor del centro del tanque
        const playerBox = {
            minX: player.position.x - 0.4, // 0.4 unidades a la izquierda
            maxX: player.position.x + 0.4, // 0.4 unidades a la derecha
            minY: player.position.y - 0.4, // 0.4 unidades arriba
            maxY: player.position.y + 0.4  // 0.4 unidades abajo
        };

        console.log('Hitbox calculado:', playerBox);

        const isCollision = bullet.x > playerBox.minX && 
                          bullet.x < playerBox.maxX && 
                          bullet.y > playerBox.minY && 
                          bullet.y < playerBox.maxY;

        if (isCollision) {
            console.log('¡COLISIÓN DETECTADA con jugador:', player.id);
        }

        return isCollision;
    });
};

const updateBulletPosition = (bullet, mapData, players = {}, stompClient) => {
    let { x, y, direction } = bullet;
    console.log("ver que tiene players", players);
    
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

    // Verificar colisión bala-jugador
    //y esto 
    const hitPlayer = checkPlayerCollision({ ...bullet, x, y }, players);
    console.log("xxx: ", hitPlayer)
    if (hitPlayer) {
        // Notificar hit al servidor 
        stompClient?.publish({
            destination: '/app/player-hit',
            body: JSON.stringify({
                type: 'PLAYER_HIT',
                playerId: hitPlayer.id,
                bulletId: bullet.id,
                shooterId: bullet.playerId
            })
        });
        return null;
    }

    return { ...bullet, x, y };
};

const BulletController = forwardRef(({ 
    playerId, 
    stompClient, 
    playerPosition, 
    playerDirection,
    isCurrentPlayer,
    mapData,
    players = {}
}, ref) => {
    //console.log('Players en BulletController:', players);
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

        // Refactorizado para evitar ternarios anidados
        let bulletX = playerPosition.x;
        if (playerDirection === 'left') {
            bulletX -= 0.5;
        } else if (playerDirection === 'right') {
            bulletX += 0.5;
        }

        let bulletY = playerPosition.y;
        if (playerDirection === 'up') {
            bulletY -= 0.5;
        } else if (playerDirection === 'down') {
            bulletY += 0.5;
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

    useImperativeHandle(ref, () => ({ shoot }), [shoot]);

    const updateBulletsPositions = (prevBullets) => {
        return prevBullets
            .map(bullet => updateBulletPosition(bullet, mapData, players, stompClient))
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
    }, [mapData, stompClient, playerId, isCurrentPlayer, players]);

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
    mapData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    // Nuevo prop para PvP
    //y estos props
    players: PropTypes.objectOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        position: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }).isRequired,
        lives: PropTypes.number.isRequired,
        isAlive: PropTypes.bool.isRequired
    })).isRequired
};

export default BulletController;
