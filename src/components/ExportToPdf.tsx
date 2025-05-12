import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import CustomBttn from './CustomBttn';

interface Props {
  eventos: {
    nombre: string;
    fecha: string;
    hora: string;
    tipo: string;
  }[];
  nombreArchivo?: string;
}

// Estilos de la hoja
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  title: { fontSize: 18, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  table: { marginVertical: 10 },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #ccc', padding: 4 },
  tableCell: { flex: 1, paddingHorizontal: 4 },
  header: { fontWeight: 'bold', backgroundColor: '#f0f0f0' },
});

// Conversión del tipo de evento para mostrarlo completo
const tipoMap: Record<string, string> = {
  E: 'Entrada',
  S: 'Salida',
  D: 'Descanso',
  FD: 'Terminado el descanso',
  HE: 'Horas extra',
  FHE: 'Terminadas horas extra',
};

// Componente a modo de plantilla para el contenido del pdf
const FichajesPdf: React.FC<Props> = ({ eventos }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Listado de Fichajes</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.header]}>
          <Text style={styles.tableCell}>Nombre</Text>
          <Text style={styles.tableCell}>Fecha</Text>
          <Text style={styles.tableCell}>Hora</Text>
          <Text style={styles.tableCell}>Tipo</Text>
        </View>
        {eventos.map((e, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.tableCell}>{e.nombre}</Text>
            <Text style={styles.tableCell}>{e.fecha}</Text>
            <Text style={styles.tableCell}>{e.hora}</Text>
            <Text style={styles.tableCell}>{tipoMap[e.tipo] || e.tipo}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

// Botón para exportar a pdf y su función
const ExportToPdf: React.FC<Props> = ({ eventos, nombreArchivo = 'fichajes' }) => {
  const filename = `${nombreArchivo}_${dayjs().format('YYYY-MM-DD')}.pdf`;

  const handleExport = async () => {
    // Se guarda en memoria
    const blob = await pdf(<FichajesPdf eventos={eventos} />).toBlob();

    // Se detecta la plataforma
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      // Si es móvil se pasa a base64
    } else {
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res((reader.result as string).split(',')[1]);
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      });
      // En funcion del SO, se guarda en un directorio u otro
      const dir = platform === 'android' ? Directory.External : Directory.Documents;
      await Filesystem.writeFile({
        path: `Download/${filename}`,
        data: base64,
        directory: dir,
      });
      await Toast.show({
        text: `PDF guardado como ${filename}`,
        duration: 'long',
      });
    }
  };

  return (
    <CustomBttn
      onClick={handleExport}
      text='📄 Exportar a PDF'
      width='15vw'
    />
  );
};

export default ExportToPdf;
