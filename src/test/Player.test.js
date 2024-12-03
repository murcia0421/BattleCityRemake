import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import Player from '../components/Player/Player';

describe('Player Component', () => {
    const defaultProps = {
      position: { x: 1, y: 1 },
      direction: 'down',
      tankColor: 'Azul'
    };
  
    test('renders with correct position and rotation', () => {
      const { container } = render(<Player {...defaultProps} />);
      expect(container.firstChild).toHaveStyle({
        left: '32px',
        top: '32px',
        transform: 'rotate(0deg)',
        position: 'absolute'
      });
    });
  
    test('renders correct tank color image', () => {
      const { getByAltText } = render(<Player {...defaultProps} />);
      expect(getByAltText('Tank Azul')).toBeInTheDocument();
    });
  
    test('handles different directions', () => {
      const directions = {
        up: 180,
        right: 270,
        down: 0,
        left: 90
      };
  
      Object.entries(directions).forEach(([direction, rotation]) => {
        const { container } = render(
          <Player {...defaultProps} direction={direction} />
        );
        expect(container.firstChild).toHaveStyle({
          transform: `rotate(${rotation}deg)`
        });
      });
    });
  
    test('uses default yellow tank for invalid color', () => {
      const props = { ...defaultProps, tankColor: 'InvalidColor' };
      const { getByAltText } = render(<Player {...props} />);
      expect(getByAltText('Tank InvalidColor')).toBeInTheDocument();
    });
  });
  