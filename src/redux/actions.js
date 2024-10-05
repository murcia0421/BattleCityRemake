// src/redux/actions.js

// Acción para actualizar el estado general del juego (game state completo)
export const updateGameState = (gameState) => ({
    type: 'UPDATE_GAME_STATE',
    payload: {
        players: gameState.players,          // Información de todos los jugadores
        map: gameState.map,                  // Estado actual del mapa
        bullets: gameState.bullets,          // Posiciones de las balas activas
        scores: gameState.scores,            // Estado de las puntuaciones
        time: gameState.time,                // Tiempo restante o ronda actual
    },
});

// Acción específica para actualizar la posición de un jugador
export const updatePlayerPosition = (playerId, position) => ({
    type: 'UPDATE_PLAYER_POSITION',
    payload: {
        playerId,
        position,
    },
});

// Acción específica para actualizar las balas activas
export const updateBullets = (bullets) => ({
    type: 'UPDATE_BULLETS',
    payload: bullets,    // Array con la información de todas las balas activas
});

// Acción específica para actualizar los elementos del mapa (muros, árboles, bases, etc.)
export const updateMapElements = (mapElements) => ({
    type: 'UPDATE_MAP_ELEMENTS',
    payload: mapElements,    // Array con la información de los elementos en el mapa
});

// Acción para actualizar el puntaje de un jugador o de los equipos
export const updateScores = (scores) => ({
    type: 'UPDATE_SCORES',
    payload: scores,    // Información de los puntajes (podría ser un objeto de jugadores o equipos)
});

// Acción para actualizar el tiempo restante o la ronda del juego
export const updateTime = (time) => ({
    type: 'UPDATE_TIME',
    payload: time,    // Tiempo o ronda restante del juego
});
