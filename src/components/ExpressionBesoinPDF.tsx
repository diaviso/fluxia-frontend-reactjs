import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { IMAGES } from '../utils/imageToBase64';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Times-Roman',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  headerLeft: {
    width: '35%',
    alignItems: 'center',
  },
  flag: {
    width: 40,
    height: 30,
    marginBottom: 5,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  headerCenter: {
    width: '30%',
    alignItems: 'center',
  },
  headerRight: {
    width: '35%',
    alignItems: 'center',
  },
  qrCode: {
    width: 80,
    height: 80,
  },
  headerText: {
    fontSize: 8,
    textAlign: 'center',
    marginBottom: 2,
  },
  headerTextBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  headerTextSmall: {
    fontSize: 7,
    textAlign: 'center',
    marginBottom: 2,
  },
  numeroText: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 5,
  },
  banner: {
    backgroundColor: '#D4A574',
    padding: 10,
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 16,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    color: '#000000',
  },
  title: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 9,
  },
  infoValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5E6D3',
    padding: 8,
    borderBottom: '1px solid #D4A574',
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #E0E0E0',
    minHeight: 35,
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#F9F9F9',
    borderBottom: '1px solid #E0E0E0',
    minHeight: 35,
  },
  tableCell: {
    fontSize: 8,
  },
  tableCellSmall: {
    fontSize: 7,
    color: '#666666',
  },
  col1: { width: '5%' },
  col2: { width: '22%' },
  col3: { width: '35%' },
  col4: { width: '10%', textAlign: 'center' },
  col5: { width: '28%' },
  signatureSection: {
    marginTop: 40,
    marginBottom: 20,
  },
  signatureBox: {
    alignItems: 'flex-end',
    paddingRight: 40,
  },
  signatureLabel: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    marginBottom: 40,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    width: 200,
    marginTop: 5,
  },
  signatureName: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    fontStyle: 'italic',
    color: '#666666',
  },
});

interface ExpressionBesoinPDFProps {
  expression: any;
  qrCodeDataUrl: string;
  flagImageUrl?: string;
  logoImageUrl?: string;
}

export const ExpressionBesoinPDF: React.FC<ExpressionBesoinPDFProps> = ({ expression, qrCodeDataUrl }) => {
  const exp = expression;
  const dateStr = new Date(exp.dateCreation).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTextBold}>REPUBLIQUE DU SENEGAL</Text>
            <Text style={styles.headerTextSmall}>Un Peuple, Un but, Une Foi</Text>
            {IMAGES.SN && <Image src={IMAGES.SN} style={styles.flag} />}
            <Text style={styles.headerTextSmall}>MINISTERE DE L'ENSEIGNEMENT SUPERIEUR</Text>
            <Text style={styles.headerTextSmall}>DE LA RECHERCHE ET DE L'INNOVATION</Text>
            <Text style={styles.headerTextSmall}>CENTRE REGIONAL DES OEUVRES UNIVERSITAIRES</Text>
            <Text style={styles.headerTextSmall}>SOCIALES DE ZIGUINCHOR</Text>
          </View>
          <View style={styles.headerCenter}>
            <Image src={qrCodeDataUrl} style={styles.qrCode} />
          </View>
          <View style={styles.headerRight}>
            {IMAGES.CROUSZ && <Image src={IMAGES.CROUSZ} style={styles.logo} />}
            <Text style={styles.numeroText}>N° {exp.numero}</Text>
            <Text style={styles.dateText}>Du {dateStr}</Text>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>EXPRESSION DE BESOIN</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{exp.titre}</Text>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Division:</Text>
            <Text style={styles.infoValue}>{exp.division?.nom || 'N/A'}</Text>
          </View>
          {exp.service && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service:</Text>
              <Text style={styles.infoValue}>{exp.service.nom}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date création:</Text>
            <Text style={styles.infoValue}>
              {new Date(exp.dateCreation).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          {exp.createur && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Créé par:</Text>
              <Text style={styles.infoValue}>
                {exp.createur.prenom} {exp.createur.nom}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut:</Text>
            <Text style={styles.infoValue}>{exp.statut}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Matière</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Qté</Text>
            <Text style={[styles.tableHeaderText, styles.col5]}>Justification</Text>
          </View>
          {exp.lignes.map((lg: any, i: number) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.tableCell, styles.col1]}>{i + 1}</Text>
              <View style={styles.col2}>
                <Text style={styles.tableCell}>{lg.matiere?.designation || 'N/A'}</Text>
                <Text style={styles.tableCellSmall}>({lg.matiere?.code || 'N/A'})</Text>
              </View>
              <Text style={[styles.tableCell, styles.col3]}>{lg.description}</Text>
              <Text style={[styles.tableCell, styles.col4]}>{lg.quantite}</Text>
              <Text style={[styles.tableCell, styles.col5]}>{lg.justification}</Text>
            </View>
          ))}
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Chef de Division</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Signature et Cachet</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Document généré automatiquement par le système de gestion des expressions de besoin du CROUS Ziguinchor
        </Text>
      </Page>
    </Document>
  );
};
