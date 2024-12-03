import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import Bullet from '../components/Bullets/Bullet';

describe('Bullet Component', () => {
  const TILE_SIZE = 32;

  test('renders with correct position and rotation - up direction', () => {
    const { container } = render(<Bullet x={5} y={3} direction="up" />);
    expect(container.firstChild).toHaveStyle({
      left: `${5 * TILE_SIZE}px`,
      top: `${3 * TILE_SIZE}px`,
      transform: 'rotate(180deg)'
    });
  });

  test('renders with correct position and rotation - down direction', () => {
    const { container } = render(<Bullet x={2} y={4} direction="down" />);
    expect(container.firstChild).toHaveStyle({
      left: `${2 * TILE_SIZE}px`,
      top: `${4 * TILE_SIZE}px`,
      transform: 'rotate(0deg)'
    });
  });

  test('renders with correct position and rotation - left direction', () => {
    const { container } = render(<Bullet x={1} y={1} direction="left" />);
    expect(container.firstChild).toHaveStyle({
      left: `${1 * TILE_SIZE}px`,
      top: `${1 * TILE_SIZE}px`,
      transform: 'rotate(90deg)'
    });
  });

  test('renders with correct position and rotation - right direction', () => {
    const { container } = render(<Bullet x={3} y={2} direction="right" />);
    expect(container.firstChild).toHaveStyle({
      left: `${3 * TILE_SIZE}px`,
      top: `${2 * TILE_SIZE}px`,
      transform: 'rotate(270deg)'
    });
  });

  test('renders bullet image with correct alt text', () => {
    const { getByAltText } = render(<Bullet x={0} y={0} direction="up" />);
    expect(getByAltText('Bullet')).toBeInTheDocument();
  });

  test('applies absolute positioning', () => {
    const { container } = render(<Bullet x={1} y={1} direction="up" />);
    expect(container.firstChild).toHaveStyle({
      position: 'absolute'
    });
  });

  test('handles default rotation for invalid direction', () => {
    const { container } = render(<Bullet x={0} y={0} direction="invalid" />);
    expect(container.firstChild).toHaveStyle({
      transform: 'rotate(0deg)'
    });
  });

  test('applies bullet class name', () => {
    const { container } = render(<Bullet x={0} y={0} direction="up" />);
    expect(container.firstChild).toHaveClass('bullet');
  });
});
