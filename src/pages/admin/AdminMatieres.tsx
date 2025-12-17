import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { matiereService, type Matiere } from '../../services/matiere.service';

export default function AdminMatieres() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<Matiere | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    designation: '',
    type: 'CONSOMMABLE',
    categorie: 'AUTRE',
    unite: 'PIECE',
    valeurUnitaire: '',
    seuilAlerte: '',
    actif: true,
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    loadMatieres();
  }, [user, navigate]);

  const loadMatieres = async () => {
    try {
      const data = await matiereService.getAll();
      setMatieres(data);
    } catch (error) {
      console.error('Erreur chargement matières:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        valeurUnitaire: formData.valeurUnitaire ? parseFloat(formData.valeurUnitaire) : undefined,
        seuilAlerte: formData.seuilAlerte ? parseInt(formData.seuilAlerte) : undefined,
      };

      if (editingMatiere) {
        await matiereService.update(editingMatiere.id, data);
      } else {
        await matiereService.create(data);
      }

      setShowForm(false);
      setEditingMatiere(null);
      resetForm();
      await loadMatieres();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (matiere: Matiere) => {
    setEditingMatiere(matiere);
    setFormData({
      code: matiere.code,
      designation: matiere.designation,
      type: matiere.type,
      categorie: matiere.categorie,
      unite: matiere.unite,
      valeurUnitaire: matiere.valeurUnitaire?.toString() || '',
      seuilAlerte: matiere.seuilAlerte?.toString() || '',
      actif: matiere.actif,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, designation: string) => {
    if (!window.confirm(`Supprimer la matière "${designation}" ?`)) return;
    try {
      await matiereService.delete(id);
      await loadMatieres();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      designation: '',
      type: 'CONSOMMABLE',
      categorie: 'AUTRE',
      unite: 'PIECE',
      valeurUnitaire: '',
      seuilAlerte: '',
      actif: true,
    });
  };

  if (loading) return <Layout><div style={{padding:'20px'}}>Chargement...</div></Layout>;

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📦 Gestion des Matières</h1>
            <p style={styles.subtitle}>{matieres.length} matière(s)</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.backButton} onClick={() => navigate('/admin')}>← Retour</button>
            <button style={styles.addButton} onClick={() => { resetForm(); setEditingMatiere(null); setShowForm(true); }}>
              ➕ Nouvelle Matière
            </button>
          </div>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>{editingMatiere ? 'Modifier' : 'Nouvelle'} Matière</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Code *</label>
                  <input style={styles.input} value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Désignation *</label>
                  <input style={styles.input} value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Type *</label>
                  <select style={styles.input} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="CONSOMMABLE">Consommable</option>
                    <option value="DURABLE">Durable</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Catégorie *</label>
                  <select style={styles.input} value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value})}>
                    <option value="INFORMATIQUE">Informatique</option>
                    <option value="MOBILIER">Mobilier</option>
                    <option value="FOURNITURE">Fourniture</option>
                    <option value="VEHICULE">Véhicule</option>
                    <option value="EQUIPEMENT">Équipement</option>
                    <option value="MATERIEL_MEDICAL">Matériel Médical</option>
                    <option value="PRODUIT_ENTRETIEN">Produit d'Entretien</option>
                    <option value="PAPETERIE">Papeterie</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Unité *</label>
                  <select style={styles.input} value={formData.unite} onChange={(e) => setFormData({...formData, unite: e.target.value})}>
                    <option value="PIECE">Pièce</option>
                    <option value="LOT">Lot</option>
                    <option value="BOITE">Boîte</option>
                    <option value="PAQUET">Paquet</option>
                    <option value="KG">Kilogramme</option>
                    <option value="GRAMME">Gramme</option>
                    <option value="LITRE">Litre</option>
                    <option value="MILLILITRE">Millilitre</option>
                    <option value="METRE">Mètre</option>
                    <option value="METRE_CARRE">Mètre Carré</option>
                    <option value="CARTON">Carton</option>
                    <option value="PALETTE">Palette</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Valeur Unitaire</label>
                  <input type="number" step="0.01" style={styles.input} value={formData.valeurUnitaire} onChange={(e) => setFormData({...formData, valeurUnitaire: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Seuil d'Alerte</label>
                  <input type="number" style={styles.input} value={formData.seuilAlerte} onChange={(e) => setFormData({...formData, seuilAlerte: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <input type="checkbox" checked={formData.actif} onChange={(e) => setFormData({...formData, actif: e.target.checked})} />
                    {' '}Actif
                  </label>
                </div>
              </div>
              <div style={styles.formActions}>
                <button type="submit" style={styles.submitButton}>💾 Enregistrer</button>
                <button type="button" style={styles.cancelButton} onClick={() => { setShowForm(false); setEditingMatiere(null); }}>Annuler</button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Désignation</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Catégorie</th>
                <th style={styles.th}>Unité</th>
                <th style={styles.th}>Valeur</th>
                <th style={styles.th}>Seuil</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matieres.map((matiere) => (
                <tr key={matiere.id} style={styles.tableRow}>
                  <td style={styles.td}>{matiere.code}</td>
                  <td style={styles.td}>{matiere.designation}</td>
                  <td style={styles.td}><span style={{...styles.badge, backgroundColor: matiere.type === 'DURABLE' ? '#3b82f6' : '#f59e0b'}}>{matiere.type}</span></td>
                  <td style={styles.td}>{matiere.categorie}</td>
                  <td style={styles.td}>{matiere.unite}</td>
                  <td style={styles.td}>{matiere.valeurUnitaire ? `${matiere.valeurUnitaire} €` : '-'}</td>
                  <td style={styles.td}>{matiere.seuilAlerte || '-'}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, backgroundColor: matiere.actif ? '#10b981' : '#ef4444'}}>
                      {matiere.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={{...styles.actionButton, backgroundColor: '#3b82f6'}} onClick={() => handleEdit(matiere)}>✏️</button>
                      <button style={{...styles.actionButton, backgroundColor: '#ef4444'}} onClick={() => handleDelete(matiere.id, matiere.designation)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

const styles: {[key:string]:React.CSSProperties} = {
  container: {maxWidth:'1400px',margin:'0 auto',padding:'20px'},
  header: {display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'30px'},
  title: {fontSize:'32px',fontWeight:'bold',color:'#1f2937',marginBottom:'4px'},
  subtitle: {fontSize:'14px',color:'#6b7280'},
  headerActions: {display:'flex',gap:'12px'},
  backButton: {padding:'10px 20px',backgroundColor:'#6b7280',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'600'},
  addButton: {padding:'10px 20px',backgroundColor:'#10b981',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'600'},
  formCard: {backgroundColor:'white',padding:'24px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',marginBottom:'20px'},
  formTitle: {fontSize:'20px',fontWeight:'bold',marginBottom:'20px'},
  formGrid: {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px',marginBottom:'20px'},
  formGroup: {display:'flex',flexDirection:'column',gap:'8px'},
  label: {fontSize:'14px',fontWeight:'600',color:'#374151'},
  input: {padding:'10px',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'14px'},
  formActions: {display:'flex',gap:'12px',justifyContent:'flex-end'},
  submitButton: {padding:'10px 24px',backgroundColor:'#10b981',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'600'},
  cancelButton: {padding:'10px 24px',backgroundColor:'#6b7280',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'600'},
  tableCard: {backgroundColor:'white',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',overflow:'hidden'},
  table: {width:'100%',borderCollapse:'collapse'},
  tableHeaderRow: {backgroundColor:'#f9fafb'},
  th: {padding:'12px',textAlign:'left',fontSize:'12px',fontWeight:'700',color:'#374151',borderBottom:'2px solid #e5e7eb'},
  tableRow: {borderBottom:'1px solid #e5e7eb'},
  td: {padding:'12px',fontSize:'14px',color:'#1f2937'},
  badge: {padding:'4px 8px',borderRadius:'12px',fontSize:'11px',fontWeight:'600',color:'white',display:'inline-block'},
  actions: {display:'flex',gap:'8px'},
  actionButton: {padding:'6px 12px',color:'white',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'14px'},
};
