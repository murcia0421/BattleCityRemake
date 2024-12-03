import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import TankColorSelector from '../components/TankColorSelector/TankColorSelector';

describe('TankColorSelector', () => {
  test('handles color selection', () => {
    const handleColorSelect = jest.fn();
    const { getByRole } = render(<TankColorSelector onColorSelect={handleColorSelect} />);
    const blueButton = getByRole('button', { name: /azul/i });
    fireEvent.click(blueButton);
    expect(handleColorSelect).toHaveBeenCalledWith('Azul');
  });

  test('renders title correctly', () => {
    const { getByText } = render(<TankColorSelector onColorSelect={() => {}} />);
    expect(getByText('Selecciona el color del tanque')).toBeInTheDocument();
  });

  test('renders all color buttons', () => {
    const { getAllByRole } = render(<TankColorSelector onColorSelect={() => {}} />);
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  test('each button has correct aria-label', () => {
    const { getByLabelText } = render(<TankColorSelector onColorSelect={() => {}} />);
    ['Morado', 'Verde', 'Azul', 'Amarillo'].forEach(color => {
      expect(getByLabelText(`Seleccionar color ${color}`)).toBeInTheDocument();
    });
  });

  test('clicking each color triggers callback with correct value', () => {
    const handleColorSelect = jest.fn();
    const { getByText } = render(<TankColorSelector onColorSelect={handleColorSelect} />);
    
    ['Morado', 'Verde', 'Azul', 'Amarillo'].forEach(color => {
      fireEvent.click(getByText(color));
      expect(handleColorSelect).toHaveBeenLastCalledWith(color);
    });
  });

  test('buttons are enabled by default', () => {
    const { getAllByRole } = render(<TankColorSelector onColorSelect={() => {}} />);
    getAllByRole('button').forEach(button => {
      expect(button).not.toBeDisabled();
    });
  });

  test('buttons have correct class name', () => {
    const { getAllByRole } = render(<TankColorSelector onColorSelect={() => {}} />);
    getAllByRole('button').forEach(button => {
      expect(button).toHaveClass('color-button');
    });
  });
});