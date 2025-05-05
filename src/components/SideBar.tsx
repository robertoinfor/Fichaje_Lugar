import React from "react";
import CustomBttn from "./CustomBttn";
import { Poi } from "../types/Poi";

interface SidebarProps {
  message: string;
  isAddingPoint: boolean;
  isDeletingPoint: boolean;
  isShowingOld: boolean;
  isEditing: boolean;
  newPointName: string;
  editPointName: string;
  oldlocations: Poi[];
  onAddClick: () => void;
  onDeleteClick: () => void;
  onRecoverClick: () => void;
  onChangeNewName: (v: string) => void;
  onChangeEditName: (v: string) => void;
  onSaveEdit: () => void;
  reactivateLocation: (id: string) => void;
}
const Sidebar: React.FC<SidebarProps> = ({
  message,
  isAddingPoint,
  isDeletingPoint,
  isShowingOld,
  isEditing,
  newPointName,
  editPointName,
  oldlocations,
  onAddClick,
  onDeleteClick,
  onRecoverClick,
  onChangeNewName,
  onChangeEditName,
  onSaveEdit,
  reactivateLocation
}) => (
  <div className="sidebar">
    <CustomBttn onClick={onAddClick} text="Añadir ubicación" />
    <CustomBttn onClick={onDeleteClick} text="Eliminar ubicación" />
    <CustomBttn onClick={onRecoverClick} text="Recuperar ubicación" />

    <div className="error-space">
      {message && <p className="sidebar-error">{message}</p>}
    </div>

    {isAddingPoint && (
      <div className="sidebar-section">
        <h4 className="section-title">Nombre de ubicación</h4>
        <input
          className="field-input"
          type="text"
          value={newPointName}
          onChange={e => onChangeNewName(e.target.value)}
          placeholder="Escribe aquí..."
        />
      </div>
    )}

    {isDeletingPoint && (
      <div className="sidebar-section">
        <p className="section-text">
          Haz clic en un marcador para eliminarlo.
        </p>
      </div>
    )}

    {isShowingOld && (
      <div className="sidebar-section">
        <h4 className="section-title">Ubicaciones inactivas</h4>
        <ul className="inactive-list">
          {oldlocations.map(loc => (
            <li
              key={loc.key}
              className="inactive-item"
              onClick={() => reactivateLocation(loc.key)}
            >
              {loc.name}
            </li>
          ))}
        </ul>
      </div>
    )}

    {isEditing && (
      <div style={{ marginTop: '20px' }}>
        <label>
          Editar nombre:
          <input
            type="text"
            value={editPointName}
            onChange={e => onChangeEditName(e.target.value)}
            style={{ marginLeft: '8px' }}
          />
        </label>
        <button onClick={onSaveEdit} style={{ marginLeft: '8px' }}>
          Guardar
        </button>
      </div>
    )}
  </div>
);

export default Sidebar;
