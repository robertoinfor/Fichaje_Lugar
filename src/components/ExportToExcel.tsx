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
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Fichajes');

      worksheet.columns = [
        { header: 'Nombre', key: 'nombre', width: 20 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Hora', key: 'hora', width: 10 },
        { header: 'Tipo', key: 'tipo', width: 25 },
      ];

      eventos.forEach(e =>
        worksheet.addRow({
          ...e,
          tipo: tipoMap[e.tipo] || e.tipo,
        })
      );

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.commit();

      worksheet.columns.forEach(column => {
        let maxLength = 10;
        if (column.eachCell) {
          column.eachCell({ includeEmpty: true }, cell => {
            const value = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, value.length + 2);
          });
        }
        column.width = maxLength;
      });

      const buffer = await workbook.xlsx.writeBuffer();

      if (Capacitor.getPlatform() === 'web') {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${nombreArchivo}.xlsx`);
      } else {
        const base64 = Buffer.from(buffer).toString('base64');

        await Filesystem.writeFile({
          path: `${nombreArchivo}.xlsx`,
          data: base64,
          directory: Directory.Documents,
          encoding: 'base64' as Encoding,
        });

        await Toast.show({
          text: `Excel guardado en Documentos como ${nombreArchivo}.xlsx`,
          duration: 'long',
        });
      }
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      await Toast.show({
        text: 'Error al guardar el archivo Excel',
        duration: 'long',
      });
    }
  };

  return <button onClick={handleExport}>📄 Exportar Excel</button>;
};

export default ExportToExcel;
