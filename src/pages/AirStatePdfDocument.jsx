// AirStatePdfDocument.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import dayjs from 'dayjs';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 4,
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'black',
    borderRightStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderBottomStyle: 'solid',
  },
  cell: {
    fontSize: 8,
    textAlign: 'center',
    padding: 4,
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'black',
    borderRightStyle: 'solid',
  },
  doubleCell: {
    flexDirection: 'column',
    textAlign: 'center',
    padding: 4,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: 'black',
    borderRightStyle: 'solid',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
  },
  notesSection: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  note: {
    fontSize: 8,
    marginVertical: 2,
  },
});

const AirStatePdfDocument = ({ logs, selectedDate }) => {
  const formattedDate = selectedDate ? dayjs(selectedDate).format('DD MMM YY') : 'Unknown Date';

  return (
    <Document>
      <Page style={styles.page} size="A4" orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Air State of MI-17/MI-171SH Heli</Text>
          <Text style={styles.subtitle}>(Mi-17 FLT LINE)</Text>
        </View>

        {/* Date and Office Time */}
        <View style={styles.infoRow}>
          <Text>Office Time: {logs[0]?.officeTime || 'hrs'}</Text>
          <Text>Date: {formattedDate}</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Main Table Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeaderCell}>HELI SER NO</Text>
            <Text style={styles.tableHeaderCell}>STATUS</Text>
            <Text style={styles.tableHeaderCell}>DAILY FLG HRS & SORTIES</Text>
            <Text style={styles.tableHeaderCell}>HELI PRESENT HRS</Text>
            <Text style={styles.tableHeaderCell}>NEXT IDLE G/R (7+3 DAYS) DUE ON</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>ENG HRS</Text>
            <Text style={styles.tableHeaderCell}>MGB HRS</Text>
            <Text style={styles.tableHeaderCell}>MGB HRS LEFT FOR O/H</Text>
            <Text style={styles.tableHeaderCell}>DAILY LDG</Text>
            <Text style={styles.tableHeaderCell}>TTL LDG</Text>
            <Text style={styles.tableHeaderCell}>APU HRS</Text>
            <Text style={styles.tableHeaderCell}>APU ST</Text>
            <Text style={styles.tableHeaderCell}>APU A/B</Text>
            <Text style={styles.tableHeaderCell}>GEN MODE</Text>
            <Text style={styles.tableHeaderCell}>25 HRS INSP/HRS LEFT</Text>
            <Text style={styles.tableHeaderCell}>NEXT INSP & O/H HRS LEFT</Text>
            <Text style={styles.tableHeaderCell}>LOCATION</Text>
          </View>

          {/* Table Content */}
          {logs.map((log, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cell}>{log.heliSerNo}</Text>
              <Text style={styles.cell}>{log.status}</Text>
              <Text style={styles.cell}>{log.dailyFlyingHours || "-"}</Text>
              <Text style={styles.cell}>{log.heliPresentHrs || "-"}</Text>
              <Text style={styles.cell}>{dayjs(log.nextGrdRun).format("DD.MM.YY") || "-"}</Text>
              <View style={styles.doubleCell}>
                <Text>L: {log.engPresentHrsL || "-"}</Text>
                <Text>R: {log.engPresentHrsR || "-"}</Text>
              </View>
              <Text style={styles.cell}>{log.mgbPresentHrs || "-"}</Text>
              <Text style={styles.cell}>{log.MgbHrsLeftForOH || "-"}</Text>
              <Text style={styles.cell}>{log.dailyLdg || "-"}</Text>
              <Text style={styles.cell}>{log.totalLdg || "-"}</Text>
              <Text style={styles.cell}>{log.apuHrs || "-"}</Text>
              <Text style={styles.cell}>{log.apuSt || "-"}</Text>
              <Text style={styles.cell}>{log.apuAB || "-"}</Text>
              <Text style={styles.cell}>{log.genMode || "-"}</Text>
              <Text style={styles.cell}>{log.inspectionCycle || "-"}</Text>
              <Text style={styles.cell}>{log.inspectionLeft || "-"}</Text>
              <Text style={styles.cell}>{log.location || "-"}</Text>
            </View>
          ))}
        </View>

        {/* Notes Section */}
        <View style={styles.notesSection}>
          <Text style={styles.note}>NOTE: HELI-216: MAIN ROTOR HUB REPLACED DUE ON 30 APR 24...</Text>
          {/* Additional notes can be dynamically added here */}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Prepared By: {logs[0]?.preRoleAndName || 'Unknown'} &emsp; Supervised By: {logs[0]?.supRoleAndName || 'Unknown'}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default AirStatePdfDocument;
