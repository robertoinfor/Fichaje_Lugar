import React from 'react';
import { IonButton } from '@ionic/react';
import './CustomBttn.css';
import { CustomButton } from '../types/CustomButton';

const CustomBttn: React.FC<CustomButton> = ({
  text,
  fontSize = '1rem',
  width = '150px',
  height = '45px',
  onClick,
  disabled
}) => {
  return (
    <IonButton
      className="fancy-ion-button"
      style={{ fontSize, width, height }}
      onClick={onClick}
      expand="block"
      disabled={disabled}
    >
      {text}
    </IonButton>
  );
};

export default CustomBttn;