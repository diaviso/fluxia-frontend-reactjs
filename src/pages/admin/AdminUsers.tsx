import { useEffect, useState } from 'react';
import { AdminLayout, DataTable, Modal, Button, Badge, FormField, Select } from '../../components/admin';
import { adminService, type User } from '../../services/admin.service';
import type { Column } from '../../components/admin/DataTable';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<'role' | 'delete' | null>(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const usersData = await adminService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!window.confirm(`${user.actif ? 'Désactiver' : 'Activer'} ${user.prenom} ${user.nom} ?`)) {
      return;
    }
    try {
      await adminService.toggleUserStatus(user.id, !user.actif);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    try {
      await adminService.updateUserRole(selectedUser.id, newRole as any);
      await loadData();
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la modification du rôle');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUser(selectedUser.id);
      await loadData();
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setModalType('role');
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setModalType('delete');
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
    setNewRole('');
  };

  const getRoleBadge = (role: string) => {
    const variants: { [key: string]: 'danger' | 'warning' | 'info' } = {
      ADMIN: 'danger',
      VALIDATEUR: 'warning',
      AGENT: 'info',
    };
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
  };

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'Utilisateur',
      render: (user) => (
        <div style={styles.userCell}>
          {user.photo ? (
            <img src={user.photo} alt="" style={styles.avatar} />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {user.prenom?.[0] || user.nom?.[0] || '?'}
            </div>
          )}
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user.prenom} {user.nom}</span>
            <span style={styles.userEmail}>{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rôle',
      sortable: true,
      render: (user) => getRoleBadge(user.role),
    },
    {
      key: 'division.nom',
      header: 'Division',
      sortable: true,
      render: (user) => user.division?.nom || <span style={styles.muted}>Non assigné</span>,
    },
    {
      key: 'divisionDirigee',
      header: 'Directeur de',
      render: (user) => user.divisionDirigee ? (
        <Badge variant="purple">🏢 {user.divisionDirigee.nom}</Badge>
      ) : <span style={styles.muted}>-</span>,
    },
    {
      key: '_count.expressionsDeBesoin',
      header: 'Expressions',
      sortable: true,
      render: (user) => (
        <span style={styles.countBadge}>{user._count?.expressionsDeBesoin || 0}</span>
      ),
    },
    {
      key: 'actif',
      header: 'Statut',
      sortable: true,
      render: (user) => (
        <Badge variant={user.actif ? 'success' : 'danger'}>
          {user.actif ? '✓ Actif' : '✗ Inactif'}
        </Badge>
      ),
    },
  ];

  const renderActions = (user: User) => (
    <div style={styles.actions}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => openRoleModal(user)}
      >
        Rôle
      </Button>
      <Button
        size="sm"
        variant={user.actif ? 'warning' : 'success'}
        onClick={() => handleToggleStatus(user)}
      >
        {user.actif ? 'Désactiver' : 'Activer'}
      </Button>
      {user._count?.expressionsDeBesoin === 0 && !user.divisionDirigee && (
        <Button
          size="sm"
          variant="danger"
          onClick={() => openDeleteModal(user)}
        >
          Supprimer
        </Button>
      )}
    </div>
  );

  const activeUsers = users.filter(u => u.actif).length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const validateurCount = users.filter(u => u.role === 'VALIDATEUR').length;

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Gestion des Utilisateurs</h1>
            <p style={styles.pageSubtitle}>Gérez les comptes utilisateurs et leurs permissions</p>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{users.length}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#10b981' }}>{activeUsers}</span>
            <span style={styles.statLabel}>Actifs</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#ef4444' }}>{adminCount}</span>
            <span style={styles.statLabel}>Admins</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#f59e0b' }}>{validateurCount}</span>
            <span style={styles.statLabel}>Validateurs</span>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          searchPlaceholder="Rechercher un utilisateur..."
          searchKeys={['nom', 'prenom', 'email', 'role']}
          actions={renderActions}
          emptyMessage="Aucun utilisateur trouvé"
        />

        {/* Info */}
        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>ℹ️</span>
          <span>Un utilisateur ne peut être supprimé que s'il n'a aucune expression de besoin et n'est pas directeur d'une division.</span>
        </div>

        {/* Role Modal */}
        <Modal
          isOpen={modalType === 'role'}
          onClose={closeModal}
          title="Modifier le rôle"
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
              <Button variant="primary" onClick={handleChangeRole}>Enregistrer</Button>
            </>
          }
        >
          {selectedUser && (
            <div style={styles.modalContent}>
              <div style={styles.userPreview}>
                {selectedUser.photo ? (
                  <img src={selectedUser.photo} alt="" style={styles.previewAvatar} />
                ) : (
                  <div style={styles.previewAvatarPlaceholder}>
                    {selectedUser.prenom?.[0] || selectedUser.nom?.[0] || '?'}
                  </div>
                )}
                <div>
                  <div style={styles.previewName}>{selectedUser.prenom} {selectedUser.nom}</div>
                  <div style={styles.previewEmail}>{selectedUser.email}</div>
                </div>
              </div>
              <FormField label="Nouveau rôle" required>
                <Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  options={[
                    { value: 'AGENT', label: 'Agent - Peut créer des expressions' },
                    { value: 'VALIDATEUR', label: 'Validateur - Peut valider les expressions' },
                    { value: 'ADMIN', label: 'Administrateur - Accès complet' },
                  ]}
                />
              </FormField>
            </div>
          )}
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={modalType === 'delete'}
          onClose={closeModal}
          title="Confirmer la suppression"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
              <Button variant="danger" onClick={handleDeleteUser}>Supprimer</Button>
            </>
          }
        >
          {selectedUser && (
            <div style={styles.deleteContent}>
              <div style={styles.deleteIcon}>⚠️</div>
              <p style={styles.deleteText}>
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser.prenom} {selectedUser.nom}</strong> ?
              </p>
              <p style={styles.deleteWarning}>Cette action est irréversible.</p>
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
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '20px 24px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  statDivider: {
    width: '1px',
    height: '40px',
    background: '#e2e8f0',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  userEmail: {
    fontSize: '12px',
    color: '#64748b',
  },
  muted: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '28px',
    padding: '0 8px',
    background: '#f1f5f9',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
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
    background: '#eff6ff',
    borderRadius: '10px',
    marginTop: '20px',
    fontSize: '14px',
    color: '#1e40af',
  },
  infoIcon: {
    fontSize: '18px',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  userPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
  },
  previewAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    objectFit: 'cover',
  },
  previewAvatarPlaceholder: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: '600',
  },
  previewName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  previewEmail: {
    fontSize: '13px',
    color: '#64748b',
  },
  deleteContent: {
    textAlign: 'center',
    padding: '20px 0',
  },
  deleteIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  deleteText: {
    fontSize: '15px',
    color: '#475569',
    marginBottom: '8px',
  },
  deleteWarning: {
    fontSize: '13px',
    color: '#ef4444',
    fontWeight: '500',
  },
};
