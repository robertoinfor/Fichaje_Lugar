import React from 'react';
import ExcelJS from 'exceljs';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import { Capacitor } from '@capacitor/core';
import { saveAs } from 'file-saver';
import { Buffer } from 'buffer';
import CustomBttn from './CustomBttn';
import dayjs from 'dayjs';

interface Props {
  eventos: {
    nombre: string;
    fecha: string;
    hora: string;
    tipo: string;
  }[];
  nombreArchivo?: string;
}

// Traduce el evento para mejor entendimiento en el Excel
const tipoMap: Record<string, string> = {
  E: 'Entrada',
  S: 'Salida',
  D: 'Descanso',
  FD: 'Terminado el descanso',
  HE: 'Horas extra',
  FHE: 'Terminadas horas extra',
};

const ExportToExcel: React.FC<Props> = ({ eventos, nombreArchivo = 'fichajes' }) => {
  const handleExport = async () => {
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Fichajes');

      // Columnas
      ws.columns = [
        { header: 'Nombre', key: 'nombre', width: 20 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Hora', key: 'hora', width: 10 },
        { header: 'Tipo', key: 'tipo', width: 25 },
      ];

      // Desglosa el evento en función de las columnas
      eventos.forEach(e =>
        ws.addRow({
          nombre: e.nombre,
          fecha: e.fecha,
          hora: e.hora,
          tipo: tipoMap[e.tipo] || e.tipo,
        })
      );

      const header = ws.getRow(1);
      header.font = { bold: true };
      header.alignment = { vertical: 'middle', horizontal: 'center' };
      header.commit();

      ws.columns.forEach(col => {
        let max = 10;
        col.eachCell?.({ includeEmpty: true }, cell => {
          const text = cell.value?.toString() ?? '';
          max = Math.max(max, text.length + 2);
        });
        col.width = max;
      });

      const buffer = await wb.xlsx.writeBuffer();

      // Cojo la plataforma
      const platform = Capacitor.getPlatform();
      if (platform === 'web') {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });        
        saveAs(blob, `${nombreArchivo}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
        // Si es móvil lo paso a base64
      } else {
        const base64 = Buffer.from(buffer).toString('base64');
        // En función del SO lo guardo en una carpeta u otra
        const dir = platform === 'android' ? Directory.External : Directory.Documents;
        await Filesystem.writeFile({
          path: `Download/${nombreArchivo}_${dayjs().format('YYYY-MM-DD')}.xlsx`,
          data: base64,
          directory: dir,
          encoding: 'base64' as Encoding,
        });
        await Toast.show({
          text: `Excel guardado como ${nombreArchivo}_${dayjs().format('YYYY-MM-DD')}.xlsx`,
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
    <CustomBttn
      onClick={handleExport}
      text='📄 Exportar a Excel'
      width='15vw'
    />
  );
};

export default ExportToExcel;
