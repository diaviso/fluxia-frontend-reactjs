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
  headerCenter: {
    width: '30%',
    alignItems: 'center',
  },
  headerRight: {
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
    backgroundColor: '#4A7C59',
    padding: 10,
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 14,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 130,
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
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderBottom: '1px solid #4A7C59',
  },
  tableHeaderText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #E0E0E0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#F9F9F9',
    borderBottom: '1px solid #E0E0E0',
  },
  tableCell: {
    fontSize: 8,
  },
  tableCellSmall: {
    fontSize: 7,
    color: '#666666',
  },
  col1: { width: '5%' },
  col2: { width: '15%' },
  col3: { width: '25%' },
  col4: { width: '12%', textAlign: 'center' },
  col5: { width: '12%', textAlign: 'center' },
  col6: { width: '12%', textAlign: 'center' },
  col7: { width: '19%' },
  summaryBox: {
    marginLeft: 'auto',
    width: 220,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 9,
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  summaryValueGreen: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#2E7D32',
  },
  summaryValueRed: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#C62828',
  },
  summaryFinal: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    borderTop: '1px solid #4A7C59',
    paddingTop: 8,
  },
  observations: {
    marginTop: 20,
    marginBottom: 20,
  },
  observationsTitle: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    marginBottom: 5,
  },
  observationsText: {
    fontSize: 8,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  signatureSection: {
    marginTop: 40,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '30%',
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    width: '100%',
    marginTop: 5,
  },
  signatureName: {
    fontSize: 8,
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

interface ReceptionPDFProps {
  reception: any;
  qrCodeDataUrl: string;
}

export const ReceptionPDF: React.FC<ReceptionPDFProps> = ({ reception, qrCodeDataUrl }) => {
  const rec = reception;
  const bc = rec.bonCommande;
  
  const dateReceptionStr = new Date(rec.dateReception).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const totalRecue = rec.lignes.reduce((sum: number, l: any) => sum + l.quantiteRecue, 0);
  const totalConforme = rec.lignes.reduce((sum: number, l: any) => sum + l.quantiteConforme, 0);
  const totalNonConforme = rec.lignes.reduce((sum: number, l: any) => sum + l.quantiteNonConforme, 0);
  const tauxConformite = totalRecue > 0 ? Math.round((totalConforme / totalRecue) * 100) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Même en-tête que le bon de commande */}
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
            <Text style={styles.numeroText}>N° {rec.numero}</Text>
            <Text style={styles.dateText}>Du {dateReceptionStr}</Text>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>PROCÈS-VERBAL DE RÉCEPTION</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>N° PV de Réception:</Text>
            <Text style={styles.infoValue}>{rec.numero}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bon de Commande:</Text>
            <Text style={styles.infoValue}>{bc?.numero || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expression:</Text>
            <Text style={styles.infoValue}>{bc?.expression?.titre || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Division:</Text>
            <Text style={styles.infoValue}>{bc?.expression?.division?.nom || 'N/A'}</Text>
          </View>
          {bc?.expression?.service && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service:</Text>
              <Text style={styles.infoValue}>{bc.expression.service.nom}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date de réception:</Text>
            <Text style={styles.infoValue}>
              {new Date(rec.dateReception).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          {bc?.fournisseur && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fournisseur:</Text>
              <Text style={styles.infoValue}>{bc.fournisseur.raisonSociale || bc.fournisseur}</Text>
            </View>
          )}
          {rec.livreur && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Livreur:</Text>
              <Text style={styles.infoValue}>{rec.livreur}</Text>
            </View>
          )}
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Code</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Désignation</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Qté Reçue</Text>
            <Text style={[styles.tableHeaderText, styles.col5]}>Conforme</Text>
            <Text style={[styles.tableHeaderText, styles.col6]}>Non Conf.</Text>
            <Text style={[styles.tableHeaderText, styles.col7]}>Observations</Text>
          </View>
          {rec.lignes.map((lg: any, i: number) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.tableCell, styles.col1]}>{i + 1}</Text>
              <Text style={[styles.tableCell, styles.col2]}>{lg.ligneBonCommande?.matiereCode || 'N/A'}</Text>
              <Text style={[styles.tableCell, styles.col3]}>{lg.ligneBonCommande?.matiereNom || 'N/A'}</Text>
              <Text style={[styles.tableCell, styles.col4]}>{lg.quantiteRecue}</Text>
              <Text style={[styles.tableCell, styles.col5, { color: '#2E7D32' }]}>{lg.quantiteConforme}</Text>
              <Text style={[styles.tableCell, styles.col6, { color: lg.quantiteNonConforme > 0 ? '#C62828' : '#000' }]}>
                {lg.quantiteNonConforme}
              </Text>
              <Text style={[styles.tableCellSmall, styles.col7]}>{lg.observations || '-'}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total articles reçus:</Text>
            <Text style={styles.summaryValue}>{totalRecue}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Articles conformes:</Text>
            <Text style={styles.summaryValueGreen}>{totalConforme}</Text>
          </View>
          {totalNonConforme > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Articles non conformes:</Text>
              <Text style={styles.summaryValueRed}>{totalNonConforme}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryFinal]}>
            <Text style={styles.summaryLabel}>Taux de conformité:</Text>
            <Text style={tauxConformite >= 90 ? styles.summaryValueGreen : styles.summaryValueRed}>
              {tauxConformite}%
            </Text>
          </View>
        </View>

        {/* Observations */}
        {rec.observations && (
          <View style={styles.observations}>
            <Text style={styles.observationsTitle}>Observations générales:</Text>
            <Text style={styles.observationsText}>{rec.observations}</Text>
          </View>
        )}

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Réceptionnaire</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Signature et Cachet</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Livreur</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Responsable</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Signature et Cachet</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Document généré automatiquement - CROUS Ziguinchor - PV de Réception
        </Text>
      </Page>
    </Document>
  );
};
