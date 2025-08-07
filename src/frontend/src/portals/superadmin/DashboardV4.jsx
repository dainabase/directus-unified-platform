import React, { useEffect, useState } from 'react'
import { 
  Activity, TrendingUp, Users, DollarSign, 
  AlertCircle, Clock, Zap,
  Package, FileText, BarChart3,
  RefreshCw, Settings,
  ClipboardList, Folder, Wallet
} from 'lucide-react'
import styles from './DashboardV3.module.css'

const DashboardV4 = ({ selectedCompany }) => {
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    console.log('✅ DashboardV4 monté avec succès')
  }, [])

  // Données démo statiques
  const metrics = {
    runway: { value: '7.3 mois', trend: 'up' },
    arr: { value: '€2.4M', trend: 'up' },
    mrr: { value: '€200K', trend: 'up' },
    ebitda: { value: '18.5%', trend: 'up' },
    ltvcac: { value: '3.2x', trend: 'up' },
    nps: { value: '72', trend: 'up' }
  }

  const alerts = [
    { id: 1, type: 'warning', title: 'Cash runway < 8 mois' },
    { id: 2, type: 'info', title: '3 factures en retard' },
    { id: 3, type: 'success', title: 'Objectif Q4 atteint' }
  ]

  const tasks = [
    { id: 1, name: 'Révision contrat client', priority: 1, deadline: '15 Dec' },
    { id: 2, name: 'Présentation investisseurs', priority: 2, deadline: '20 Dec' },
    { id: 3, name: 'Audit sécurité', priority: 3, deadline: '18 Dec' }
  ]

  const projects = [
    { id: 1, name: 'Migration Cloud', status: 'En cours', progress: 65 },
    { id: 2, name: 'Refonte UI/UX', status: 'En cours', progress: 40 },
    { id: 3, name: 'API v2', status: 'En cours', progress: 80 }
  ]

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Centre de Commande V4</h1>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} disabled={isLoading}>
            <RefreshCw className={isLoading ? styles.spinning : ''} size={18} />
            <span>Actualiser</span>
          </button>
          <button className={styles.settingsButton}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* 3 Blocs Command Center */}
      <div className={styles.commandCenter}>
        {/* Alertes */}
        <div className={styles.commandBlock}>
          <div className={styles.commandCard}>
            <div className={styles.commandHeader}>
              <div className={styles.commandIcon}>
                <AlertCircle size={20} className={styles.iconAlert} />
              </div>
              <div className={styles.commandInfo}>
                <h3 className={styles.commandTitle}>Alertes</h3>
                <p className={styles.commandCount}>{alerts.length} actives</p>
              </div>
            </div>
            <div className={styles.commandContent}>
              <div className={styles.alertsList}>
                {alerts.map(alert => (
                  <div key={alert.id} className={styles.alertItem}>
                    <span className={styles.alertBadge}>{alert.type}</span>
                    <span className={styles.alertText}>{alert.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.commandBlock}>
          <div className={styles.commandCard}>
            <div className={styles.commandHeader}>
              <div className={styles.commandIcon}>
                <Zap size={20} className={styles.iconAction} />
              </div>
              <div className={styles.commandInfo}>
                <h3 className={styles.commandTitle}>Actions</h3>
                <p className={styles.commandCount}>{tasks.length} à traiter</p>
              </div>
            </div>
            <div className={styles.commandContent}>
              <div className={styles.actionsList}>
                {tasks.map(task => (
                  <div key={task.id} className={styles.actionItem}>
                    <span className={styles.actionPriority}>{task.priority}</span>
                    <span className={styles.actionText}>{task.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className={styles.commandBlock}>
          <div className={styles.commandCard}>
            <div className={styles.commandHeader}>
              <div className={styles.commandIcon}>
                <TrendingUp size={20} className={styles.iconInsight} />
              </div>
              <div className={styles.commandInfo}>
                <h3 className={styles.commandTitle}>Insights IA</h3>
                <p className={styles.commandCount}>2 disponibles</p>
              </div>
            </div>
            <div className={styles.commandContent}>
              <div className={styles.insightsList}>
                <div className={styles.insightItem}>
                  <TrendingUp size={16} />
                  <div>
                    <p className={styles.insightTitle}>Prévision revenus</p>
                    <p className={styles.insightValue}>+23% ce trimestre</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métriques */}
      <div className={styles.metricsRow}>
        <h3 className={styles.metricsTitle}>Métriques Clés</h3>
        <div className={styles.metricsLine}>
          {Object.entries(metrics).map(([key, metric]) => (
            <div key={key} className={styles.metricItem}>
              <span className={styles.metricLabel}>{key.toUpperCase()}</span>
              <span className={styles.metricValue}>{metric.value}</span>
              <span className={`${styles.metricTrend} ${styles[`trend-${metric.trend}`]}`}>
                {metric.trend === 'up' ? '↑' : '↓'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Titres des colonnes */}
      <div className={styles.columnsHeader}>
        <h2 className={styles.columnMainTitle}>OPÉRATIONNEL</h2>
        <h2 className={styles.columnMainTitle}>COMMERCIAL & MARKETING</h2>
        <h2 className={styles.columnMainTitle}>FINANCE</h2>
      </div>

      {/* 3 Colonnes principales */}
      <div className={styles.mainGrid}>
        {/* Colonne 1: OPÉRATIONNEL */}
        <div className={styles.column}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3><ClipboardList size={18} /> Tâches & Actions</h3>
              <span className={styles.badge}>{tasks.length} actives</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.tasksList}>
                {tasks.map(task => (
                  <div key={task.id} className={styles.taskItem}>
                    <span className={styles.taskPriority}>{task.priority}</span>
                    <div className={styles.taskContent}>
                      <p className={styles.taskName}>{task.name}</p>
                      <p className={styles.taskDeadline}>{task.deadline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3><Folder size={18} /> Projets Actifs</h3>
              <span className={styles.badge}>{projects.length}</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.projectsList}>
                {projects.map(project => (
                  <div key={project.id} className={styles.projectItem}>
                    <div className={styles.projectHeader}>
                      <span className={styles.projectName}>{project.name}</span>
                      <span className={styles.projectStatus}>{project.status}</span>
                    </div>
                    <div className={styles.projectProgress}>
                      <div 
                        className={styles.progressBar}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne 2: COMMERCIAL */}
        <div className={styles.column}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3><DollarSign size={18} /> Pipeline Commercial</h3>
              <span className={styles.value}>€850K</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.pipelineStats}>
                <div className={styles.stageStat}>
                  <span className={styles.stageIndicator} style={{ backgroundColor: '#60A5FA' }} />
                  <span className={styles.stageName}>Lead</span>
                  <span className={styles.stageValue}>€150K</span>
                </div>
                <div className={styles.stageStat}>
                  <span className={styles.stageIndicator} style={{ backgroundColor: '#A78BFA' }} />
                  <span className={styles.stageName}>Proposition</span>
                  <span className={styles.stageValue}>€300K</span>
                </div>
                <div className={styles.stageStat}>
                  <span className={styles.stageIndicator} style={{ backgroundColor: '#F59E0B' }} />
                  <span className={styles.stageName}>Négociation</span>
                  <span className={styles.stageValue}>€250K</span>
                </div>
                <div className={styles.stageStat}>
                  <span className={styles.stageIndicator} style={{ backgroundColor: '#10B981' }} />
                  <span className={styles.stageName}>Gagné</span>
                  <span className={styles.stageValue}>€150K</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3><BarChart3 size={18} /> Marketing & Acquisition</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.marketingMetrics}>
                <div className={styles.metricRow}>
                  <span>Visiteurs aujourd'hui</span>
                  <span className={styles.metricValue}>2,847</span>
                </div>
                <div className={styles.metricRow}>
                  <span>Taux de conversion</span>
                  <span className={styles.metricValue}>6.7%</span>
                </div>
                <div className={styles.metricRow}>
                  <span>CAC</span>
                  <span className={styles.metricValue}>€320</span>
                </div>
                <div className={styles.metricRow}>
                  <span>Leads ce mois</span>
                  <span className={styles.metricValue}>456</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne 3: FINANCE */}
        <div className={styles.column}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3><Wallet size={18} /> Métriques Financières</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.metricsGrid}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Trésorerie</span>
                  <span className={styles.metricValue}>€847K</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Burn Rate</span>
                  <span className={styles.metricValue}>€115K/mois</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Revenus mensuels</span>
                  <span className={styles.metricValue}>€200K</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Marge EBITDA</span>
                  <span className={styles.metricValue}>18.5%</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3><FileText size={18} /> Factures</h3>
              <span className={styles.badge}>3 impayées</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.invoicesList}>
                <div className={styles.invoiceStat}>
                  <span>Total impayé</span>
                  <span className={styles.amount}>€320K</span>
                </div>
                <div className={styles.invoiceStat}>
                  <span>En retard (&gt;30j)</span>
                  <span className={styles.amountDanger}>€85K</span>
                </div>
                <button className={styles.actionButton}>
                  Relancer les impayés
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardV4