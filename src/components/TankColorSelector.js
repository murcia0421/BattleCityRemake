import React from 'react';
import '../styles/TankColorSelector.css';

const TankColorSelector = ({ onColorSelect }) => {
  const colors = ['Rojo', 'Verde', 'Azul', 'Amarillo'];

  return (
    <div className="tank-color-selector">
      <h2>Selecciona el color del tanque</h2>
      <div className="color-options">
        {colors.map((color) => (
          <button key={color} onClick={() => onColorSelect(color)}>
            {color}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TankColorSelector;