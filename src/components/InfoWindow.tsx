import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface MarkerInfoProps {
  position: google.maps.LatLngLiteral;
  name: string;
  onEdit: () => void;
  onClose: () => void;
}

const MarkerInfo: React.FC<MarkerInfoProps> = ({ position, name, onEdit, onClose }) => {
  const map = useMap();

  // Muestra un recuadro con el nombre de la ubicación y el botón para editar
  useEffect(() => {
    if (!map) return;
    const contentDiv = document.createElement('div');
    contentDiv.style.display = 'flex';
    contentDiv.style.alignItems = 'center';
    contentDiv.innerHTML = `
      <span style="margin-right:8px;">${name}</span>
      <button id="edit-btn" style="border:none; background:transparent; cursor:pointer;">✎</button>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: contentDiv,
      position,
    });

    infoWindow.open(map);

    const btn = contentDiv.querySelector('#edit-btn');
    if (btn) {
      btn.addEventListener('click', onEdit);
    }

    infoWindow.addListener('closeclick', onClose);

    return () => {
      infoWindow.close();
    };
  }, [map, position, onEdit, onClose]);

  return null;
};

export default MarkerInfo;
