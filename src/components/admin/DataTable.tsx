import { useState, useMemo } from 'react';

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T) => void;
  itemsPerPage?: number;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Rechercher...',
  searchKeys = [],
  actions,
  emptyMessage = 'Aucune donnée disponible',
  loading = false,
  onRowClick,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      
      if (searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const value = getNestedValue(item, key);
          return value?.toString().toLowerCase().includes(searchLower);
        });
      }
      
      return Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchTerm, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span style={styles.loadingText}>Chargement des données...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Search & Info Bar */}
      {searchable && (
        <div style={styles.toolbar}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={styles.clearSearch}
              >
                ✕
              </button>
            )}
          </div>
          <div style={styles.resultInfo}>
            <span style={styles.resultCount}>
              {sortedData.length} résultat{sortedData.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    ...styles.th,
                    width: column.width,
                    cursor: column.sortable ? 'pointer' : 'default',
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div style={styles.thContent}>
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span style={styles.sortIcon}>
                        {sortConfig?.key === column.key
                          ? sortConfig.direction === 'asc'
                            ? '↑'
                            : '↓'
                          : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th style={{ ...styles.th, width: '150px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  style={styles.emptyCell}
                >
                  <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>📭</span>
                    <span style={styles.emptyText}>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    ...styles.row,
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                  }}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td key={column.key} style={styles.td}>
                      {column.render
                        ? column.render(item)
                        : getNestedValue(item, column.key)?.toString() || '-'}
                    </td>
                  ))}
                  {actions && (
                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      <div style={styles.actionsCell}>{actions(item)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={{
              ...styles.pageBtn,
              ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
            }}
          >
            ««
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              ...styles.pageBtn,
              ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
            }}
          >
            «
          </button>
          
          <div style={styles.pageInfo}>
            Page {currentPage} sur {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              ...styles.pageBtn,
              ...(currentPage === totalPages ? styles.pageBtnDisabled : {}),
            }}
          >
            »
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              ...styles.pageBtn,
              ...(currentPage === totalPages ? styles.pageBtnDisabled : {}),
            }}
          >
            »»
          </button>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    background: '#ffffff',
    borderRadius: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#64748b',
    fontSize: '14px',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    fontSize: '16px',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 44px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1e293b',
    background: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  clearSearch: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px',
  },
  resultInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  resultCount: {
    color: '#64748b',
    fontSize: '14px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    background: '#f1f5f9',
  },
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e2e8f0',
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sortIcon: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  row: {
    transition: 'background-color 0.15s ease',
    cursor: 'default',
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#334155',
  },
  actionsCell: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-start',
  },
  emptyCell: {
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  emptyIcon: {
    fontSize: '48px',
    opacity: 0.5,
  },
  emptyText: {
    color: '#64748b',
    fontSize: '15px',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '20px',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  pageBtn: {
    padding: '8px 14px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#475569',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  pageBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageInfo: {
    padding: '8px 16px',
    color: '#64748b',
    fontSize: '14px',
  },
};

export default DataTable;
