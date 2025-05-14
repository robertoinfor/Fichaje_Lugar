import React from 'react';
import { IonButton } from '@ionic/react';
import './CustomBttn.css';
import { CustomButton } from '../types/CustomButton';

// Botón personalizado para toda la aplicación
const CustomBttn: React.FC<CustomButton> = ({
  text,
  fontSize = '1rem',
  width = '150px',
  height = '45px',
  onClick,
  disabled,
  type = 'button',
}) => {
  return (
    <IonButton
      className="fancy-ion-button"
      style={{ fontSize, width, height }}
      onClick={onClick}
      expand="block"
      disabled={disabled}
      type={type}
    >
      {text}
    </IonButton>
  );
};

export default CustomBttn;