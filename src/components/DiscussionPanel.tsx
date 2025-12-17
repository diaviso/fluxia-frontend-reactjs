import React, { useState, useEffect, useRef } from 'react';
import type { Discussion } from '../services/discussion.service';
import { discussionService } from '../services/discussion.service';
import { useAuth } from '../contexts/AuthContext';

interface DiscussionPanelProps {
  expressionId: number;
}

export const DiscussionPanel: React.FC<DiscussionPanelProps> = ({ expressionId }) => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadDiscussions = async () => {
    try {
      const data = await discussionService.getByExpression(expressionId);
      setDiscussions(data);
    } catch (err: any) {
      console.error('Erreur chargement discussions:', err);
      setError(err.response?.data?.message || 'Erreur de chargement');
    }
  };

  useEffect(() => {
    loadDiscussions();
    // Rafraîchir toutes les 10 secondes
    const interval = setInterval(loadDiscussions, 10000);
    return () => clearInterval(interval);
  }, [expressionId]);

  useEffect(() => {
    // Scroll vers le bas quand de nouveaux messages arrivent
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [discussions]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    setError('');

    try {
      await discussionService.create({
        message: newMessage,
        expressionId,
      });
      setNewMessage('');
      await loadDiscussions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur d\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('Supprimer ce message ?')) return;

    try {
      await discussionService.delete(id);
      await loadDiscussions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de suppression');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '450px',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
    },
    header: {
      padding: '14px 18px',
      borderBottom: '1px solid #e2e8f0',
      background: 'linear-gradient(to right, #4299e1, #3182ce)',
      borderRadius: '12px 12px 0 0',
      display: 'flex',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#ffffff',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      backgroundColor: '#f8fafc',
      backgroundImage: 'linear-gradient(rgba(226, 232, 240, 0.3) 1px, transparent 1px)',
      backgroundSize: '100% 24px',
    },
    messageWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      maxWidth: '85%',
    },
    message: {
      marginBottom: '18px',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '80%',
    },
    messageOwn: {
      alignSelf: 'flex-end',
      alignItems: 'flex-end',
    },
    messageOther: {
      alignSelf: 'flex-start',
      alignItems: 'flex-start',
    },
    messageBubble: {
      padding: '12px 16px',
      borderRadius: '18px',
      wordWrap: 'break-word',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.06)',
      width: '100%',
      position: 'relative',
    },
    bubbleOwn: {
      background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
      color: '#ffffff',
      borderBottomRightRadius: '4px',
    },
    bubbleOther: {
      background: '#ffffff',
      color: '#1e293b',
      border: '1px solid #e2e8f0',
      borderBottomLeftRadius: '4px',
    },
    messageHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
      gap: '8px',
    },
    avatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 600,
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    authorName: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#4a5568',
    },
    roleBadge: {
      fontSize: '11px',
      padding: '3px 8px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)',
      color: '#ffffff',
      fontWeight: 500,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    messageText: {
      fontSize: '14px',
      lineHeight: '1.5',
      margin: 0,
      whiteSpace: 'pre-wrap',
    },
    messageFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '6px',
      fontSize: '11px',
      color: '#94a3b8',
      padding: '0 4px',
    },
    deleteButton: {
      background: 'none',
      border: 'none',
      color: '#e53e3e',
      cursor: 'pointer',
      fontSize: '12px',
      padding: '3px 8px',
      borderRadius: '4px',
      transition: 'all 0.2s',
      fontWeight: '500',
    },
    inputContainer: {
      padding: '14px 18px',
      borderTop: '1px solid #e2e8f0',
      backgroundColor: '#fff',
      borderRadius: '0 0 12px 12px',
    },
    form: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
    },
    textarea: {
      flex: 1,
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '24px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
      resize: 'none',
      minHeight: '44px',
      maxHeight: '120px',
      fontFamily: 'inherit',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    textareaFocus: {
      borderColor: '#4299e1',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
    },
    sendButton: {
      padding: '12px 20px',
      background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '24px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 5px rgba(66, 153, 225, 0.3)',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    sendButtonDisabled: {
      background: 'linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%)',
      boxShadow: 'none',
      cursor: 'not-allowed',
      opacity: 0.7,
    },
    errorMessage: {
      padding: '10px 14px',
      backgroundColor: '#fed7d7',
      color: '#c53030',
      borderRadius: '8px',
      fontSize: '13px',
      marginBottom: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#94a3b8',
      fontSize: '14px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    },
    emptyStateIcon: {
      fontSize: '32px',
      marginBottom: '8px',
      color: '#cbd5e0',
    },
  };

  const getInitials = (nom: string | null, prenom: string | null) => {
    const n = nom?.charAt(0) || '';
    const p = prenom?.charAt(0) || '';
    return (n + p).toUpperCase() || '?';
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.messagesContainer}>
        {error && (
          <div style={styles.errorMessage}>
            <span>⚠️</span> {error}
          </div>
        )}

        {discussions.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyStateIcon}>💬</span>
            <div>
              Aucun message pour le moment.<br />
              Commencez la discussion ci-dessous.
            </div>
          </div>
        ) : (
          discussions.map((discussion) => {
            const isOwn = discussion.auteurId === user?.id;
            return (
              <div
                key={discussion.id}
                style={{
                  ...styles.message,
                  ...(isOwn ? styles.messageOwn : styles.messageOther),
                }}
              >
                {!isOwn && (
                  <div style={styles.messageHeader}>
                    <div style={styles.avatar}>
                      {getInitials(discussion.auteur.nom, discussion.auteur.prenom)}
                    </div>
                    <span style={styles.authorName}>
                      {discussion.auteur.prenom} {discussion.auteur.nom}
                    </span>
                    {(discussion.auteur.role === 'ADMIN' || discussion.auteur.role === 'VALIDATEUR') && (
                      <span style={styles.roleBadge}>
                        {discussion.auteur.role === 'ADMIN' ? 'Admin' : 'Validateur'}
                      </span>
                    )}
                  </div>
                )}

                <div
                  style={{
                    ...styles.messageBubble,
                    ...(isOwn ? styles.bubbleOwn : styles.bubbleOther),
                  }}
                >
                  <div style={styles.messageText}>{discussion.message}</div>
                </div>

                <div style={styles.messageFooter}>
                  <span>{formatDate(discussion.createdAt)}</span>
                  {isOwn && (
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDeleteMessage(discussion.id)}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <form onSubmit={handleSendMessage} style={styles.form}>
          <textarea
            style={{
              ...styles.textarea,
              ...(isFocused ? styles.textareaFocus : {})
            }}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Écrivez votre message..."
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            style={{
              ...styles.sendButton,
              ...(loading || !newMessage.trim() ? styles.sendButtonDisabled : {}),
            }}
            disabled={loading || !newMessage.trim()}
            title="Envoyer le message"
          >
            {loading ? 'Envoi...' : (
              <>
                <span>Envoyer</span>
                <span style={{ fontSize: '18px' }}>➤</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
