import React from 'react';
import '../styles/TankColorSelector.css';

const TankColorSelector = ({ onColorSelect }) => {
  const colors = [
    { name: 'Rojo', code: '#8B0000' },
    { name: 'Verde', code: '#006400' },
    { name: 'Azul', code: '#00008B' },
    { name: 'Amarillo', code: '#B8860B' }
  ];

  return (
    <div className="tank-color-selector">
      <div className="color-selector-box">
        <h2>Selecciona el color del tanque</h2>
        <div className="color-options">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => onColorSelect(color.name)}
              style={{ backgroundColor: color.code, color: '#fff' }}
              className="color-button"
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TankColorSelector;
