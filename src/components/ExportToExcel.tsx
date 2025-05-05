import React from 'react';
import ExcelJS from 'exceljs';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import { Capacitor } from '@capacitor/core';
import { saveAs } from 'file-saver';
import { Buffer } from 'buffer';

interface Props {
  eventos: {
    nombre: string;
    fecha: string;
    hora: string;
    tipo: string;
  }[];
  nombreArchivo?: string;
}

const tipoMap: Record<string, string> = {
  E: 'Entrada',
  S: 'Salida',
  D: 'Descanso',
  FD: 'Terminado el descanso',
  HE: 'Horas extra',
  FQ: 'Terminadas horas extra',
};

const ExportToExcel: React.FC<Props> = ({ eventos, nombreArchivo = 'fichajes' }) => {
  const handleExport = async () => {
    try {
      // 1) Creamos workbook y worksheet
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Fichajes');

      ws.columns = [
        { header: 'Nombre', key: 'nombre', width: 20 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Hora', key: 'hora', width: 10 },
        { header: 'Tipo', key: 'tipo', width: 25 },
      ];

      // 2) Rellenamos filas
      eventos.forEach(e =>
        ws.addRow({
          nombre: e.nombre,
          fecha: e.fecha,
          hora: e.hora,
          tipo: tipoMap[e.tipo] || e.tipo,
        })
      );

      // 3) Estilizado cabecera
      const header = ws.getRow(1);
      header.font = { bold: true };
      header.alignment = { vertical: 'middle', horizontal: 'center' };
      header.commit();

      // 4) Ajuste ancho columnas
      ws.columns.forEach(col => {
        let max = 10;
        col.eachCell?.({ includeEmpty: true }, cell => {
          const text = cell.value?.toString() ?? '';
          max = Math.max(max, text.length + 2);
        });
        col.width = max;
      });

      // 5) Generamos buffer
      const buffer = await wb.xlsx.writeBuffer();

      const platform = Capacitor.getPlatform();
      if (platform === 'web') {
        // 5a) Web: descarga directa
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${nombreArchivo}.xlsx`);
      } else {
        // 5b) Móvil: guardamos en Descargas/Documentos
        const base64 = Buffer.from(buffer).toString('base64');
        const dir = platform === 'android' ? Directory.External : Directory.Documents;
        await Filesystem.writeFile({
          path: `Download/${nombreArchivo}.xlsx`,
          data: base64,
          directory: dir,
          encoding: 'base64' as Encoding,
        });
        await Toast.show({
          text: `Excel guardado como ${nombreArchivo}.xlsx`,
          duration: 'long',
        });
      }
    } catch (err) {
      console.error('Error al exportar Excel:', err);
      await Toast.show({
        text: 'Error al guardar el archivo Excel',
        duration: 'long',
      });
    }
  };

  return (
    <button
      onClick={handleExport}
      style={{
        padding: '8px 16px',
        color: '#fff',
        backgroundColor: '#007bff',
        borderRadius: '4px',
        fontSize: '14px',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      📄 Exportar Excel
    </button>
  );
};

export default ExportToExcel;
