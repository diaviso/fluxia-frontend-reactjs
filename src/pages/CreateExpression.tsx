import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expressionService, type CreateExpressionDto } from '../services/expression.service';
import { divisionService, type Division } from '../services/division.service';
import { serviceService, type Service } from '../services/service.service';
import { matiereService, type Matiere } from '../services/matiere.service';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { AccessDenied } from '../components/AccessDenied';
import { ConfettiEffect } from '../components/ConfettiEffect';

interface LigneForm {
  description: string;
  quantite: number;
  justification: string;
  matiereId: number;
  matiereSearch?: string;
  showMatiereDropdown?: boolean;
}

export const CreateExpression = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState('');
  const [isDirector, setIsDirector] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [titre, setTitre] = useState('');
  const [divisionId, setDivisionId] = useState<number>(0);
  const [serviceId, setServiceId] = useState<number | undefined>(undefined);
  
  const [lignes, setLignes] = useState<LigneForm[]>([
    { description: '', quantite: 1, justification: '', matiereId: 0, matiereSearch: '', showMatiereDropdown: false }
  ]);

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    try {
      const [matieresData, divisionsData] = await Promise.all([
        matiereService.getAll(),
        divisionService.getAll(),
      ]);
      setMatieres(matieresData);
      setDivisions(divisionsData);

      // Vérifier si l'utilisateur est chef d'une division
      const userDivision = divisionsData.find(d => d.directeurId === user?.id);
      if (userDivision) {
        setIsDirector(true);
        setDivisionId(userDivision.id);
        // Charger les services de cette division
        const servicesData = await serviceService.getByDivision(userDivision.id);
        setServices(servicesData);
      } else {
        setIsDirector(false);
        setError('Seuls les chefs de division peuvent créer des expressions de besoin.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
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
    console.log('updateLigne called:', { index, field, value });
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    console.log('Updated ligne:', newLignes[index]);
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

    if (!isDirector) {
      setError('Seuls les chefs de division peuvent créer des expressions de besoin');
      return;
    }

    const validLignes = lignes.filter(l => l.description && l.matiereId > 0);
    
    if (statut === 'EN_ATTENTE' && validLignes.length === 0) {
      setError('Veuillez ajouter au moins une ligne complète avant de soumettre');
      return;
    }

    try {
      setLoading(true);
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
      await expressionService.create(data);
      
      // Trigger confetti for submission
      if (statut === 'EN_ATTENTE') {
        setShowConfetti(true);
        setTimeout(() => {
          navigate('/expressions');
        }, 2000);
      } else {
        navigate('/expressions');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is activated
  if (user && !user.actif) {
    return (
      <Layout>
        <AccessDenied
          icon="⚠️"
          title="Compte non activé"
          message="Votre compte n'est pas encore activé. Veuillez contacter l'administrateur pour activer votre compte et accéder à la plateforme."
        />
      </Layout>
    );
  }

  // Check if user is chef de division or admin
  const isChefDivision = user?.divisionDirigee != null;
  const isAdminUser = user?.role === 'ADMIN';
  const canCreateExpression = isChefDivision || isAdminUser;

  if (user && !canCreateExpression) {
    return (
      <Layout>
        <AccessDenied
          icon="🔐"
          title="Accès restreint"
          message="Vous devez être désigné comme chef de division pour créer des expressions de besoin. Veuillez contacter l'administrateur si vous pensez que c'est une erreur."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <ConfettiEffect trigger={showConfetti} />
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate('/expressions')} style={styles.backButton}>
            ← Retour à la liste
          </button>
        </div>

        <div style={styles.titleSection}>
          <h1 style={styles.pageTitle}>📝 Nouvelle Expression de Besoin</h1>
          <p style={styles.subtitle}>
            Remplissez ce formulaire comme vous le feriez dans Excel. 
            Commencez par les informations générales, puis ajoutez vos lignes de besoin dans le tableau ci-dessous.
          </p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>📋 Informations générales</h2>
          <p style={styles.helpText}>Ces informations identifient votre demande</p>
          
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

            {isDirector ? (
              <div style={styles.infoBox}>
                ℹ️ Votre division : <strong>{divisions.find(d => d.id === divisionId)?.nom}</strong>
                {!isDirector && <span style={styles.errorText}> (Division auto-sélectionnée)</span>}
              </div>
            ) : (
              <div style={styles.warningBox}>
                ⚠️ Vous devez être chef d'une division pour créer une expression de besoin.
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Service (optionnel)
              </label>
              <select
                value={serviceId || ''}
                onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : undefined)}
                style={styles.input}
                disabled={!isDirector}
              >
                <option value="">Aucun service spécifique</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nom} ({s.code})
                  </option>
                ))}
              </select>
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
            Remplissez chaque ligne avec les détails de votre besoin. 
            Vous pouvez ajouter autant de lignes que nécessaire.
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
              <li><strong>Enregistrer comme brouillon</strong> : Sauvegardez votre travail pour le compléter plus tard</li>
              <li><strong>Soumettre pour validation</strong> : Envoyez votre demande à votre supérieur hiérarchique</li>
            </ul>
          </div>
          <div style={styles.actions}>
            <button
              onClick={() => handleSubmit('BROUILLON')}
              disabled={loading}
              style={styles.draftButton}
            >
              💾 Enregistrer comme brouillon
            </button>
            <button
              onClick={() => handleSubmit('EN_ATTENTE')}
              disabled={loading}
              style={styles.submitButton}
            >
              📤 Soumettre pour validation
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

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
    border: '2px solid #3b82f6',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
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
  infoBox: {
    padding: '15px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    color: '#1e40af',
    fontSize: '14px',
    marginBottom: '15px',
  },
  warningBox: {
    padding: '15px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    color: '#92400e',
    fontSize: '14px',
    marginBottom: '15px',
  },
  errorText: {
    color: '#dc2626',
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
