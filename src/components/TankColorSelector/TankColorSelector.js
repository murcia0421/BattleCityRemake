// src/components/TankColorSelector/TankColorSelector.js
import PropTypes from 'prop-types';
import React from 'react';
import './TankColorSelector.css';

const TankColorSelector = ({ onColorSelect }) => {
  const colors = [
    { name: 'Morado' },
    { name: 'Verde' },
    { name: 'Azul' },
    { name: 'Amarillo' },
  ];

  return (
    <div className="tank-color-selector">
      <div className="color-selector-box">
        <h2>Selecciona el color del tanque</h2>
        <div className="color-options">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => onColorSelect(color.name)} // Pasar solo el nombre del color
              className="color-button"
              aria-label={`Seleccionar color ${color.name}`}
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

TankColorSelector.propTypes = {
  onColorSelect: PropTypes.func.isRequired,
};

export default TankColorSelector;
