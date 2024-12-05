import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import Bullet from '../components/Bullets/Bullet';

const BULLET_SPEED = 0.15;

const publishBulletUpdate = (stompClient, playerId, bullets) => {
    stompClient?.publish({
        destination: '/app/bullet-update',
        body: JSON.stringify({
            type: 'BULLET_UPDATE',
            playerId,
            bullets,
        }),
    });
};

const checkPlayerCollision = (bullet, players = {}) => {
    return Object.values(players).find((player) => {
        if (!player.id || player.id === bullet.playerId || !player.isAlive) return false;
        const playerBox = {
            minX: player.position.x - 0.4,
            maxX: player.position.x + 0.4,
            minY: player.position.y - 0.4,
            maxY: player.position.y + 0.4,
        };
        return (
            bullet.x > playerBox.minX &&
            bullet.x < playerBox.maxX &&
            bullet.y > playerBox.minY &&
            bullet.y < playerBox.maxY
        );
    });
};

const updateBulletPosition = (bullet, mapData, stompClient, players = {}) => {
    let { x, y, direction } = bullet;

    switch (direction) {
        case 'up':
            y -= BULLET_SPEED;
            break;
        case 'down':
            y += BULLET_SPEED;
            break;
        case 'left':
            x -= BULLET_SPEED;
            break;
        case 'right':
            x += BULLET_SPEED;
            break;
        default:
            break;
    }

    if (x < 0 || x >= mapData[0].length || y < 0 || y >= mapData.length) {
        return null;
    }

    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    const hitTile = mapData[tileY][tileX];

    if (hitTile === 1) {
        stompClient?.publish({
            destination: '/app/wall-hit',
            body: JSON.stringify({
                type: 'WALL_HIT',
                position: { x: tileX, y: tileY },
            }),
        });
        return null;
    }

    if (hitTile === 2) return null;

    const hitPlayer = checkPlayerCollision({ ...bullet, x, y }, players);
    if (hitPlayer) {
        stompClient?.publish({
            destination: '/app/player-hit',
            body: JSON.stringify({
                type: 'PLAYER_HIT',
                playerId: hitPlayer.id,
                bulletId: bullet.id,
                shooterId: bullet.playerId,
            }),
        });
        return null;
    }

    return { ...bullet, x, y };
};

const BulletController = forwardRef(
    (
        {
            playerId,
            stompClient,
            playerPosition,
            playerDirection,
            isCurrentPlayer,
            mapData,
            players = {},
        },
        ref
    ) => {
        const [bullets, setBullets] = useState([]);

        const handleGameUpdate = useCallback(
            (message) => {
                try {
                    const update = JSON.parse(message.body);
                    switch (update.type) {
                        case 'BULLET_FIRED': {
                            setBullets((prev) => [...prev, update.bullet]);
                            break;
                        }
                        case 'BULLET_UPDATE': {
                            setBullets(update.bullets);
                            break;
                        }
                        case 'WALL_HIT': {
                            const newMapData = [...mapData];
                            newMapData[update.position.y][update.position.x] = 0;
                            break;
                        }
                        default:
                            break;
                    }
                } catch (error) {
                    console.error('Error procesando actualización de bala:', error);
                }
            },
            [mapData]
        );

        useEffect(() => {
            if (!stompClient?.connected) return;
            const subscription = stompClient.subscribe('/topic/game-updates', handleGameUpdate);
            return () => subscription?.unsubscribe();
        }, [stompClient, handleGameUpdate]);

        const shoot = useCallback(() => {
            if (!isCurrentPlayer || !stompClient?.connected) return;
            let bulletX = playerPosition.x;
            let bulletY = playerPosition.y;
            switch (playerDirection) {
                case 'left':
                    bulletX -= 0.5;
                    break;
                case 'right':
                    bulletX += 0.5;
                    break;
                case 'up':
                    bulletY -= 0.5;
                    break;
                case 'down':
                    bulletY += 0.5;
                    break;
                default:
                    break;
            }
            const newBullet = {
                id: `${playerId}-${Date.now()}`,
                playerId,
                x: bulletX,
                y: bulletY,
                direction: playerDirection,
            };
            stompClient.publish({
                destination: '/app/bullet-fired',
                body: JSON.stringify({
                    type: 'BULLET_FIRED',
                    playerId,
                    bullet: newBullet,
                }),
            });
        }, [isCurrentPlayer, stompClient, playerId, playerPosition, playerDirection]);

        useImperativeHandle(ref, () => ({ shoot }), [shoot]);

        useEffect(() => {
            const interval = setInterval(() => {
                setBullets((prevBullets) => {
                    const updatedBullets = prevBullets
                        .map((bullet) => updateBulletPosition(bullet, mapData, stompClient, players))
                        .filter(Boolean);
                    if (isCurrentPlayer && updatedBullets.length !== prevBullets.length) {
                        publishBulletUpdate(stompClient, playerId, updatedBullets);
                    }
                    return updatedBullets;
                });
            }, 16);
            return () => clearInterval(interval);
        }, [mapData, stompClient, playerId, isCurrentPlayer, players]);

        return (
            <>
                {bullets.map((bullet) => (
                    <Bullet key={bullet.id} x={bullet.x} y={bullet.y} direction={bullet.direction} />
                ))}
            </>
        );
    }
);

BulletController.propTypes = {
    playerId: PropTypes.string.isRequired,
    stompClient: PropTypes.object.isRequired,
    playerPosition: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    playerDirection: PropTypes.oneOf(['up', 'down', 'left', 'right']).isRequired,
    isCurrentPlayer: PropTypes.bool.isRequired,
    mapData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    players: PropTypes.objectOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            position: PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired,
            }).isRequired,
            lives: PropTypes.number.isRequired,
            isAlive: PropTypes.bool.isRequired,
        })
    ).isRequired,
};

export default BulletController;
