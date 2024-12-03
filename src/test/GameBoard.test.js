import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import GameBoard from '../components/GameBoard/GameBoard';
import Map from '../components/Map/map';

jest.mock('../components/Map/map', () => {
  return jest.fn(() => <div data-testid="mock-map" />);
});

describe('GameBoard Component', () => {
  const defaultProps = {
    tankColor: 'Azul',
    playersData: [
      { id: '1', name: 'Player1', position: { x: 1, y: 1 } }
    ]
  };

  test('renders Map component with correct props', () => {
    render(<GameBoard {...defaultProps} />);
    expect(Map).toHaveBeenCalledWith(
      expect.objectContaining({
        players: defaultProps.playersData,
        tankColor: defaultProps.tankColor
      }),
      expect.any(Object)
    );
  });

  test('updates players when playersData prop changes', async () => {
    const { rerender } = render(<GameBoard {...defaultProps} />);
    
    const newPlayersData = [
      { id: '1', name: 'Player1', position: { x: 1, y: 1 } },
      { id: '2', name: 'Player2', position: { x: 2, y: 2 } }
    ];

    rerender(<GameBoard {...defaultProps} playersData={newPlayersData} />);
    
    await waitFor(() => {
      expect(Map).toHaveBeenLastCalledWith(
        expect.objectContaining({
          players: newPlayersData
        }),
        expect.any(Object)
      );
    });
  });

  test('initializes with empty array when playersData is undefined', () => {
    const { tankColor } = defaultProps;
    render(<GameBoard tankColor={tankColor} playersData={undefined} />);
    
    expect(Map).toHaveBeenCalledWith(
      expect.objectContaining({
        players: []
      }),
      expect.any(Object)
    );
  });

  test('renders with game-board className', () => {
    const { container } = render(<GameBoard {...defaultProps} />);
    expect(container.firstChild).toHaveClass('game-board');
  });

  test('passes mapData to Map component', () => {
    render(<GameBoard {...defaultProps} />);
    expect(Map).toHaveBeenCalledWith(
      expect.objectContaining({
        mapData: expect.any(Array)
      }),
      expect.any(Object)
    );
  });
});