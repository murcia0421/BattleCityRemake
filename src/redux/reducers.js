const initialState = {
    game: {
        players: [],
    },
};

const gameReducer = (state = initialState, action) => {
    if (action.type === 'UPDATE_GAME_STATE') {
        return {
            ...state,
            game: action.payload,
        };
    }
s
    return state;
};

export default gameReducer;
