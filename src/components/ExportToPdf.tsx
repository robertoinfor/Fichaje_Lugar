import React from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import dayjs from 'dayjs';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  table: {
    width: 'auto',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #ccc',
    padding: 4,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  header: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
});

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

const ExportToPdf: React.FC<Props> = ({ eventos, nombreArchivo = 'fichajes' }) => {
  const filename = `${nombreArchivo}_${dayjs().format('YYYY-MM-DD')}.pdf`;

  return (
    <PDFDownloadLink
      document={<FichajesPdf eventos={eventos} />}
      fileName={filename}
      style={{
        textDecoration: 'none',
        padding: '8px 16px',
        color: '#fff',
        backgroundColor: '#007bff',
        borderRadius: '4px',
        fontSize: '14px',
      }}
    >
      {({ loading }) => (loading ? 'Generando PDF...' : '📄 Exportar PDF')}
    </PDFDownloadLink>
  );
};

export default ExportToPdf;
