const initialState = {
    game: {
        players: [],
        // otros elementos del estado
    },
};

const gameReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'UPDATE_GAME_STATE':
            return {
                ...state,
                game: action.payload,
            };
        default:
            return state;
    }
};

export default gameReducer;
