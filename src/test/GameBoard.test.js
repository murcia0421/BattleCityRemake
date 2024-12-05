import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
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