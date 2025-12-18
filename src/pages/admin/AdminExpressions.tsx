import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout, DataTable, Modal, Button, Badge, FormField, Select } from '../../components/admin';
import { adminService, type ExpressionAdmin } from '../../services/admin.service';
import type { Column } from '../../components/admin/DataTable';

const STATUTS = [
  { value: 'BROUILLON', label: 'Brouillon', variant: 'default' as const },
  { value: 'EN_ATTENTE', label: 'En attente', variant: 'warning' as const },
  { value: 'VALIDE', label: 'Validé', variant: 'success' as const },
  { value: 'REFUSE', label: 'Refusé', variant: 'danger' as const },
  { value: 'PRIS_EN_CHARGE', label: 'Pris en charge', variant: 'info' as const },
];

export default function AdminExpressions() {
  const navigate = useNavigate();
  const [expressions, setExpressions] = useState<ExpressionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpression, setSelectedExpression] = useState<ExpressionAdmin | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await adminService.getAllExpressions();
      setExpressions(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedExpression || !newStatus) return;
    try {
      await adminService.updateExpressionStatus(selectedExpression.id, newStatus as any);
      await loadData();
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const openStatusModal = (expression: ExpressionAdmin) => {
    setSelectedExpression(expression);
    setNewStatus(expression.statut);
    setShowStatusModal(true);
  };

  const closeModal = () => {
    setSelectedExpression(null);
    setShowStatusModal(false);
    setNewStatus('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = STATUTS.find(s => s.value === status);
    return <Badge variant={config?.variant || 'default'}>{config?.label || status}</Badge>;
  };

  const filteredExpressions = filterStatus 
    ? expressions.filter(e => e.statut === filterStatus)
    : expressions;

  const columns: Column<ExpressionAdmin>[] = [
    {
      key: 'titre',
      header: 'Expression',
      sortable: true,
      render: (expr) => (
        <div style={styles.expressionCell}>
          <div style={styles.expressionIcon}>📋</div>
          <div style={styles.expressionInfo}>
            <span style={styles.expressionTitle}>{expr.titre}</span>
            <span style={styles.expressionMeta}>
              {`#${expr.id}`} • {expr._count?.lignes || 0} ligne(s)
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'createur',
      header: 'Créateur',
      render: (expr) => (
        <div style={styles.creatorCell}>
          <div style={styles.creatorAvatar}>
            {expr.createur.prenom?.[0] || expr.createur.nom?.[0] || '?'}
          </div>
          <div style={styles.creatorInfo}>
            <span style={styles.creatorName}>{expr.createur.prenom} {expr.createur.nom}</span>
            <span style={styles.creatorEmail}>{expr.createur.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'division.nom',
      header: 'Division',
      sortable: true,
      render: (expr) => (
        <span style={styles.divisionBadge}>🏢 {expr.division.nom}</span>
      ),
    },
    {
      key: 'dateCreation',
      header: 'Date',
      sortable: true,
      render: (expr) => (
        <span style={styles.date}>{formatDate(expr.dateCreation)}</span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (expr) => getStatusBadge(expr.statut),
    },
  ];

  const renderActions = (expr: ExpressionAdmin) => (
    <div style={styles.actions}>
      <Button 
        size="sm" 
        variant="secondary" 
        onClick={() => navigate(`/expressions/${expr.id}`)}
      >
        👁️ Voir
      </Button>
      <Button 
        size="sm" 
        variant="primary" 
        onClick={() => openStatusModal(expr)}
      >
        Statut
      </Button>
    </div>
  );

  // Stats
  const stats = {
    total: expressions.length,
    brouillon: expressions.filter(e => e.statut === 'BROUILLON').length,
    enAttente: expressions.filter(e => e.statut === 'EN_ATTENTE').length,
    valide: expressions.filter(e => e.statut === 'VALIDE').length,
    refuse: expressions.filter(e => e.statut === 'REFUSE').length,
    prisEnCharge: expressions.filter(e => e.statut === 'PRIS_EN_CHARGE').length,
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Gestion des Expressions</h1>
            <p style={styles.pageSubtitle}>Consultez et gérez toutes les expressions de besoin</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div 
            style={{
              ...styles.statCard,
              borderLeftColor: '#6366f1',
              background: filterStatus === '' ? '#f8fafc' : '#ffffff',
            }}
            onClick={() => setFilterStatus('')}
          >
            <span style={styles.statCardValue}>{stats.total}</span>
            <span style={styles.statCardLabel}>Total</span>
          </div>
          <div 
            style={{
              ...styles.statCard,
              borderLeftColor: '#94a3b8',
              background: filterStatus === 'BROUILLON' ? '#f8fafc' : '#ffffff',
            }}
            onClick={() => setFilterStatus(filterStatus === 'BROUILLON' ? '' : 'BROUILLON')}
          >
            <span style={styles.statCardValue}>{stats.brouillon}</span>
            <span style={styles.statCardLabel}>Brouillons</span>
          </div>
          <div 
            style={{
              ...styles.statCard,
              borderLeftColor: '#f59e0b',
              background: filterStatus === 'EN_ATTENTE' ? '#f8fafc' : '#ffffff',
            }}
            onClick={() => setFilterStatus(filterStatus === 'EN_ATTENTE' ? '' : 'EN_ATTENTE')}
          >
            <span style={styles.statCardValue}>{stats.enAttente}</span>
            <span style={styles.statCardLabel}>En attente</span>
          </div>
          <div 
            style={{
              ...styles.statCard,
              borderLeftColor: '#10b981',
              background: filterStatus === 'VALIDE' ? '#f8fafc' : '#ffffff',
            }}
            onClick={() => setFilterStatus(filterStatus === 'VALIDE' ? '' : 'VALIDE')}
          >
            <span style={styles.statCardValue}>{stats.valide}</span>
            <span style={styles.statCardLabel}>Validées</span>
          </div>
          <div 
            style={{
              ...styles.statCard,
              borderLeftColor: '#ef4444',
              background: filterStatus === 'REFUSE' ? '#f8fafc' : '#ffffff',
            }}
            onClick={() => setFilterStatus(filterStatus === 'REFUSE' ? '' : 'REFUSE')}
          >
            <span style={styles.statCardValue}>{stats.refuse}</span>
            <span style={styles.statCardLabel}>Refusées</span>
          </div>
          <div 
            style={{
              ...styles.statCard,
              borderLeftColor: '#3b82f6',
              background: filterStatus === 'PRIS_EN_CHARGE' ? '#f8fafc' : '#ffffff',
            }}
            onClick={() => setFilterStatus(filterStatus === 'PRIS_EN_CHARGE' ? '' : 'PRIS_EN_CHARGE')}
          >
            <span style={styles.statCardValue}>{stats.prisEnCharge}</span>
            <span style={styles.statCardLabel}>Prises en charge</span>
          </div>
        </div>

        {/* Filter indicator */}
        {filterStatus && (
          <div style={styles.filterIndicator}>
            <span>Filtré par: {STATUTS.find(s => s.value === filterStatus)?.label}</span>
            <button style={styles.clearFilter} onClick={() => setFilterStatus('')}>
              ✕ Effacer le filtre
            </button>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          data={filteredExpressions}
          columns={columns}
          loading={loading}
          searchPlaceholder="Rechercher une expression..."
          searchKeys={['titre', 'numero', 'createur.nom', 'createur.prenom', 'division.nom']}
          actions={renderActions}
          emptyMessage="Aucune expression trouvée"
        />

        {/* Info */}
        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>ℹ️</span>
          <span>En tant qu'administrateur, vous pouvez modifier le statut des expressions mais pas leur contenu.</span>
        </div>

        {/* Status Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={closeModal}
          title="Modifier le statut"
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
              <Button variant="primary" onClick={handleChangeStatus}>Enregistrer</Button>
            </>
          }
        >
          {selectedExpression && (
            <div style={styles.modalContent}>
              <div style={styles.expressionPreview}>
                <div style={styles.previewIcon}>📋</div>
                <div>
                  <div style={styles.previewTitle}>{selectedExpression.titre}</div>
                  <div style={styles.previewMeta}>
                    Par {selectedExpression.createur.prenom} {selectedExpression.createur.nom}
                  </div>
                </div>
              </div>

              <div style={styles.currentStatus}>
                <span style={styles.currentStatusLabel}>Statut actuel:</span>
                {getStatusBadge(selectedExpression.statut)}
              </div>

              <FormField label="Nouveau statut" required>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  options={STATUTS.map(s => ({ value: s.value, label: s.label }))}
                />
              </FormField>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  pageHeader: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    padding: '20px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    borderLeft: '4px solid',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
  },
  statCardLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
  filterIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#eff6ff',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    color: '#1e40af',
  },
  clearFilter: {
    background: 'none',
    border: 'none',
    color: '#1e40af',
    cursor: 'pointer',
    fontWeight: '500',
  },
  expressionCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  expressionIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  expressionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  expressionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  expressionMeta: {
    fontSize: '12px',
    color: '#64748b',
  },
  creatorCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  creatorAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
  },
  creatorInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  creatorName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1e293b',
  },
  creatorEmail: {
    fontSize: '11px',
    color: '#64748b',
  },
  divisionBadge: {
    padding: '6px 12px',
    background: '#ede9fe',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#5b21b6',
    fontWeight: '500',
  },
  date: {
    fontSize: '13px',
    color: '#64748b',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: '#fef3c7',
    borderRadius: '10px',
    marginTop: '20px',
    fontSize: '14px',
    color: '#92400e',
  },
  infoIcon: {
    fontSize: '18px',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  expressionPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
  },
  previewIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  },
  previewTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  previewMeta: {
    fontSize: '13px',
    color: '#64748b',
  },
  currentStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  currentStatusLabel: {
    fontSize: '14px',
    color: '#64748b',
  },
};
