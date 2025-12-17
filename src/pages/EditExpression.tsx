import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { expressionService } from '../services/expression.service';
import type { CreateExpressionDto, ExpressionDeBesoin } from '../services/expression.service';
import { matiereService } from '../services/matiere.service';
import type { Matiere } from '../services/matiere.service';
import { Layout } from '../components/Layout';

interface LigneForm {
  description: string;
  quantite: number;
  justification: string;
  matiereId: number;
  matiereSearch?: string;
  showMatiereDropdown?: boolean;
}

export default function EditExpression() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [expression, setExpression] = useState<ExpressionDeBesoin | null>(null);

  const [titre, setTitre] = useState('');
  const [divisionId, setDivisionId] = useState<number>(0);
  const [serviceId, setServiceId] = useState<number | undefined>(undefined);
  
  const [lignes, setLignes] = useState<LigneForm[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matieresData, expressionData] = await Promise.all([
        matiereService.getAll(),
        expressionService.getById(Number(id)),
      ]);
      
      setMatieres(matieresData);
      setExpression(expressionData);
      
      setTitre(expressionData.titre);
      setDivisionId(expressionData.divisionId);
      setServiceId(expressionData.serviceId);

      if (expressionData.lignes && expressionData.lignes.length > 0) {
        setLignes(
          expressionData.lignes.map((ligne) => {
            const matiere = matieresData.find(m => m.id === ligne.matiereId);
            return {
              description: ligne.description,
              quantite: ligne.quantite,
              justification: ligne.justification,
              matiereId: ligne.matiereId,
              matiereSearch: matiere ? `${matiere.designation} (${matiere.code})` : '',
              showMatiereDropdown: false,
            };
          })
        );
      } else {
        setLignes([{ 
          description: '', 
          quantite: 1, 
          justification: '', 
          matiereId: 0,
          matiereSearch: '',
          showMatiereDropdown: false
        }]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const addLigne = () => {
    setLignes([...lignes, { 
      description: '', 
      quantite: 1, 
      justification: '', 
      matiereId: 0,
      matiereSearch: '',
      showMatiereDropdown: false
    }]);
  };

  const removeLigne = (index: number) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter((_, i) => i !== index));
    }
  };

  const updateLigne = (index: number, field: keyof LigneForm, value: any) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    setLignes(newLignes);
  };

  const getFilteredMatieres = (searchTerm?: string) => {
    if (!searchTerm || searchTerm.trim() === '') return matieres.slice(0, 50);
    const search = searchTerm.toLowerCase();
    return matieres.filter(m => 
      m.designation.toLowerCase().includes(search) || 
      m.code.toLowerCase().includes(search)
    ).slice(0, 50);
  };

  const selectMatiere = (index: number, matiere: Matiere) => {
    setLignes(prevLignes => {
      const updated = [...prevLignes];
      updated[index] = {
        ...updated[index],
        matiereId: matiere.id,
        matiereSearch: `${matiere.designation} (${matiere.code})`,
        showMatiereDropdown: false
      };
      return updated;
    });
  };

  const handleSubmit = async (statut: 'BROUILLON' | 'EN_ATTENTE') => {
    setError('');

    if (!titre.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    if (!divisionId || divisionId === 0) {
      setError('La division est obligatoire');
      return;
    }

    const validLignes = lignes.filter(l => l.description && l.matiereId > 0);
    
    if (statut === 'EN_ATTENTE' && validLignes.length === 0) {
      setError('Veuillez ajouter au moins une ligne complète avant de soumettre');
      return;
    }

    try {
      setSubmitting(true);
      const data: CreateExpressionDto = {
        titre,
        divisionId,
        serviceId,
        statut,
        lignes: validLignes.map(l => ({
          description: l.description,
          quantite: l.quantite,
          justification: l.justification,
          matiereId: l.matiereId,
        })),
      };
      await expressionService.update(Number(id), data);
      navigate('/expressions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.loading}>Chargement...</div>
        </div>
      </Layout>
    );
  }

  if (!expression) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.error}>Expression non trouvée</div>
        </div>
      </Layout>
    );
  }

  if (expression.statut !== 'BROUILLON') {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.errorBox}>
            ⚠️ Seules les expressions en brouillon peuvent être modifiées
          </div>
          <button onClick={() => navigate('/expressions')} style={styles.backButton}>
            ← Retour à la liste
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate('/expressions')} style={styles.backButton}>
            ← Retour à la liste
          </button>
        </div>

        <div style={styles.titleSection}>
          <h1 style={styles.pageTitle}>✏️ Modifier l'Expression de Besoin</h1>
          <p style={styles.subtitle}>
            Modifiez votre expression comme vous le feriez dans Excel. 
            Vous pouvez ajouter, modifier ou supprimer des lignes.
          </p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>📋 Informations générales</h2>
          <p style={styles.helpText}>Modifiez les informations de votre demande</p>
          
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Titre de la demande <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                style={styles.input}
                placeholder="Ex: Achat de matériel informatique pour le service"
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Division <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={expression?.division?.nom || ''}
                  disabled
                  style={styles.input}
                  placeholder="Ex: Direction des Systèmes d'Information"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Service
                </label>
                <input
                  type="text"
                  value={expression?.service?.nom || ''}
                  disabled
                  style={styles.input}
                  placeholder="Ex: Service Informatique"
                />
              </div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>📊 Tableau des besoins (comme dans Excel)</h2>
            <button onClick={addLigne} style={styles.addRowButton}>
              ➕ Ajouter une ligne
            </button>
          </div>
          <p style={styles.helpText}>
            Modifiez vos lignes de besoin. Vous pouvez en ajouter ou en supprimer.
          </p>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={{...styles.th, width: '40px'}}>#</th>
                  <th style={{...styles.th, width: '250px'}}>Matière / Article <span style={styles.required}>*</span></th>
                  <th style={{...styles.th, width: '200px'}}>Description <span style={styles.required}>*</span></th>
                  <th style={{...styles.th, width: '100px'}}>Quantité <span style={styles.required}>*</span></th>
                  <th style={{...styles.th, width: '200px'}}>Justification <span style={styles.required}>*</span></th>
                  <th style={{...styles.th, width: '60px'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((ligne, index) => (
                  <tr key={`ligne-${index}`} style={styles.tableRow}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      <div style={styles.autocompleteContainer}>
                        <input
                          type="text"
                          value={ligne.matiereSearch ?? ''}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            console.log('Input onChange:', newValue);
                            setLignes(prevLignes => {
                              const updated = [...prevLignes];
                              updated[index] = {
                                ...updated[index],
                                matiereSearch: newValue,
                                showMatiereDropdown: true
                              };
                              console.log('New lignes state:', updated[index]);
                              return updated;
                            });
                          }}
                          onFocus={() => {
                            console.log('Input onFocus');
                            setLignes(prevLignes => {
                              const updated = [...prevLignes];
                              updated[index] = { ...updated[index], showMatiereDropdown: true };
                              return updated;
                            });
                          }}
                          onBlur={() => {
                            console.log('Input onBlur');
                            setTimeout(() => {
                              setLignes(prevLignes => {
                                const updated = [...prevLignes];
                                updated[index] = { ...updated[index], showMatiereDropdown: false };
                                return updated;
                              });
                            }, 200);
                          }}
                          onKeyDown={(e) => console.log('Key pressed:', e.key)}
                          style={styles.cellInput}
                          placeholder="Tapez pour rechercher..."
                          autoComplete="off"
                        />
                        {ligne.showMatiereDropdown && (
                          <div style={styles.dropdown}>
                            {getFilteredMatieres(ligne.matiereSearch ?? '').map(matiere => (
                              <div
                                key={matiere.id}
                                style={styles.dropdownItem}
                                onClick={() => selectMatiere(index, matiere)}
                              >
                                <div style={styles.matiereName}>{matiere.designation}</div>
                                <div style={styles.matiereCode}>{matiere.code} - {matiere.type}</div>
                              </div>
                            ))}
                            {getFilteredMatieres(ligne.matiereSearch ?? '').length === 0 && (
                              <div style={styles.dropdownEmpty}>Aucune matière trouvée</div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <input
                        type="text"
                        value={ligne.description}
                        onChange={(e) => updateLigne(index, 'description', e.target.value)}
                        style={styles.cellInput}
                        placeholder="Décrivez l'article..."
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        min="1"
                        value={ligne.quantite}
                        onChange={(e) => updateLigne(index, 'quantite', Number(e.target.value))}
                        style={styles.cellInputNumber}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="text"
                        value={ligne.justification}
                        onChange={(e) => updateLigne(index, 'justification', e.target.value)}
                        style={styles.cellInput}
                        placeholder="Pourquoi ce besoin..."
                      />
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => removeLigne(index)}
                        style={styles.deleteButton}
                        disabled={lignes.length === 1}
                        title="Supprimer cette ligne"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.tableFooter}>
            <button onClick={addLigne} style={styles.addRowButtonSecondary}>
              ➕ Ajouter une autre ligne
            </button>
            <span style={styles.lineCount}>
              {lignes.length} ligne{lignes.length > 1 ? 's' : ''} au total
            </span>
          </div>
        </div>

        <div style={styles.actionsCard}>
          <div style={styles.actionsInfo}>
            <h3 style={styles.actionsTitle}>💡 Que faire maintenant ?</h3>
            <ul style={styles.actionsList}>
              <li><strong>Enregistrer comme brouillon</strong> : Sauvegardez vos modifications pour continuer plus tard</li>
              <li><strong>Soumettre pour validation</strong> : Envoyez votre demande modifiée à votre supérieur hiérarchique</li>
            </ul>
          </div>
          <div style={styles.actions}>
            <button
              onClick={() => handleSubmit('BROUILLON')}
              disabled={submitting}
              style={styles.draftButton}
            >
              💾 Enregistrer comme brouillon
            </button>
            <button
              onClick={() => handleSubmit('EN_ATTENTE')}
              disabled={submitting}
              style={styles.submitButton}
            >
              📤 Soumettre pour validation
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '20px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#374151',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  titleSection: {
    marginBottom: '30px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.6',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '18px',
    color: '#666',
  },
  error: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '18px',
    color: '#dc3545',
  },
  errorBox: {
    padding: '15px 20px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '2px solid #fecaca',
    fontSize: '14px',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 8px 0',
  },
  helpText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 20px 0',
    fontStyle: 'italic',
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  required: {
    color: '#dc2626',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  addRowButton: {
    padding: '10px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tableContainer: {
    overflowX: 'auto' as const,
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    marginTop: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white',
  },
  tableHeaderRow: {
    backgroundColor: '#f3f4f6',
  },
  th: {
    padding: '12px 8px',
    textAlign: 'left' as const,
    fontSize: '13px',
    fontWeight: '700',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
    borderRight: '1px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '8px',
    borderRight: '1px solid #e5e7eb',
    verticalAlign: 'top' as const,
    position: 'relative' as const,
    pointerEvents: 'auto' as const,
  },
  cellInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    backgroundColor: 'white',
    cursor: 'text',
    pointerEvents: 'auto' as const,
  },
  cellInputNumber: {
    width: '100%',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
    textAlign: 'center' as const,
    boxSizing: 'border-box' as const,
  },
  autocompleteContainer: {
    position: 'relative' as const,
    width: '100%',
    pointerEvents: 'auto' as const,
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: '300px',
    overflowY: 'auto' as const,
    backgroundColor: 'white',
    border: '2px solid #667eea',
    borderRadius: '4px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    marginTop: '4px',
  },
  dropdownItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s',
  },
  matiereName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '2px',
  },
  matiereCode: {
    fontSize: '11px',
    color: '#6b7280',
  },
  dropdownEmpty: {
    padding: '12px',
    textAlign: 'center' as const,
    color: '#9ca3af',
    fontSize: '13px',
  },
  deleteButton: {
    padding: '6px 10px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '2px solid #e5e7eb',
  },
  addRowButtonSecondary: {
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  lineCount: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  },
  actionsInfo: {
    marginBottom: '20px',
  },
  actionsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 12px 0',
  },
  actionsList: {
    margin: '0',
    paddingLeft: '20px',
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '1.8',
  },
  actions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
  },
  draftButton: {
    padding: '14px 32px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButton: {
    padding: '14px 32px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
