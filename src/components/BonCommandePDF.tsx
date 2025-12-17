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
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
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
  col2: { width: '18%' },
  col3: { width: '30%' },
  col4: { width: '12%', textAlign: 'center' },
  col5: { width: '17.5%', textAlign: 'right' },
  col6: { width: '17.5%', textAlign: 'right' },
  totalsBox: {
    marginLeft: 'auto',
    width: 200,
    backgroundColor: '#F5E6D3',
    padding: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 9,
  },
  totalValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  totalFinal: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    borderTop: '1px solid #D4A574',
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
  },
  signatureSection: {
    marginTop: 40,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 10,
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

interface BonCommandePDFProps {
  bonCommande: any;
  qrCodeDataUrl: string;
  flagImageUrl?: string;
  logoImageUrl?: string;
}

export const BonCommandePDF: React.FC<BonCommandePDFProps> = ({ bonCommande, qrCodeDataUrl }) => {
  const bc = bonCommande;
  const dateStr = new Date(bc.dateEmission).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const total = bc.lignes.reduce((sum: number, lg: any) => sum + lg.quantite * lg.prixUnitaire, 0);
  const remise = (total * bc.remise) / 100;
  const apresRemise = total - remise;
  const tva = (apresRemise * bc.tauxTVA) / 100;
  const ttc = apresRemise + tva;

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
            <Text style={styles.numeroText}>N° {bc.numero}</Text>
            <Text style={styles.dateText}>Du {dateStr}</Text>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>BON DE COMMANDE</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>N° Bon de Commande:</Text>
            <Text style={styles.infoValue}>{bc.numero}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Division:</Text>
            <Text style={styles.infoValue}>{bc.expression?.division?.nom || 'N/A'}</Text>
          </View>
          {bc.expression?.service && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service:</Text>
              <Text style={styles.infoValue}>{bc.expression.service.nom}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date émission:</Text>
            <Text style={styles.infoValue}>
              {new Date(bc.dateEmission).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          {bc.fournisseur && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fournisseur:</Text>
              <Text style={styles.infoValue}>{bc.fournisseur}</Text>
            </View>
          )}
          {bc.adresseLivraison && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Adresse livraison:</Text>
              <Text style={styles.infoValue}>{bc.adresseLivraison}</Text>
            </View>
          )}
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Matière</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Qté</Text>
            <Text style={[styles.tableHeaderText, styles.col5]}>P.U. (FCFA)</Text>
            <Text style={[styles.tableHeaderText, styles.col6]}>Total (FCFA)</Text>
          </View>
          {bc.lignes.map((lg: any, i: number) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.tableCell, styles.col1]}>{i + 1}</Text>
              <View style={styles.col2}>
                <Text style={styles.tableCell}>{lg.matiereNom || 'N/A'}</Text>
                <Text style={styles.tableCellSmall}>({lg.matiereCode || 'N/A'})</Text>
              </View>
              <Text style={[styles.tableCell, styles.col3]}>{lg.description}</Text>
              <Text style={[styles.tableCell, styles.col4]}>{lg.quantite}</Text>
              <Text style={[styles.tableCell, styles.col5]}>
                {lg.prixUnitaire.toLocaleString('fr-FR')}
              </Text>
              <Text style={[styles.tableCell, styles.col6]}>
                {(lg.quantite * lg.prixUnitaire).toLocaleString('fr-FR')}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT:</Text>
            <Text style={styles.totalValue}>{total.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          {bc.remise > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Remise ({bc.remise}%):</Text>
              <Text style={styles.totalValue}>-{remise.toLocaleString('fr-FR')} FCFA</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({bc.tauxTVA}%):</Text>
            <Text style={styles.totalValue}>{tva.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={styles.totalLabel}>Total TTC:</Text>
            <Text style={styles.totalValue}>{ttc.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        </View>

        {/* Observations */}
        {bc.observations && (
          <View style={styles.observations}>
            <Text style={styles.observationsTitle}>Observations:</Text>
            <Text style={styles.observationsText}>{bc.observations}</Text>
          </View>
        )}

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Chef du Service{'\n'}des Approvisionnements</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Signature et Cachet</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Directeur</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Signature et Cachet</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Document généré automatiquement - CROUS Ziguinchor
        </Text>
      </Page>
    </Document>
  );
};
