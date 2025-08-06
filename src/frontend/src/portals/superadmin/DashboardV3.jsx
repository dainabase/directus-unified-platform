import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, TrendingUp, Users, DollarSign, 
  AlertCircle, CheckCircle, Clock, Zap,
  Package, FileText, CreditCard, BarChart3,
  RefreshCw, Settings, Calendar, Target,
  Sun, Moon, Info
} from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts'
import toast from 'react-hot-toast'

// Design System Components
import { GlassCard, MetricDisplay, CommandCenter } from '../../design-system/components'

// Services & Hooks
import useStore from '../../services/state/store'
import { useDashboardData, useRefreshDashboard } from '../../services/hooks/useDirectusQuery'
import { useInitialize } from '../../services/hooks/useInitialize'

// Styles
import styles from './DashboardV3.module.css'

const DashboardV3 = ({ selectedCompany }) => {
  const [activeMetric, setActiveMetric] = useState(null)
  const [darkMode, setDarkMode] = useState(false) // Mode clair par défaut
  
  // Store
  const setSelectedCompany = useStore(state => state.setSelectedCompany)
  const getFormattedMetrics = useStore(state => state.getFormattedMetrics)
  const getAlerts = useStore(state => state.getAlerts)
  
  // Data fetching
  const { data: dashboardData, isLoading, error } = useDashboardData()
  const { mutate: refreshDashboard, isLoading: isRefreshing } = useRefreshDashboard()
  
  // Initialize
  useInitialize()
  
  // Update company when prop changes
  useEffect(() => {
    if (selectedCompany) {
      setSelectedCompany(selectedCompany)
    }
  }, [selectedCompany])
  
  // Format data for charts
  const formatCashFlowData = () => {
    if (!dashboardData?.cashFlow) return []
    
    return dashboardData.cashFlow.slice(0, 7).map(transaction => ({
      day: new Date(transaction.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
      value: transaction.amount,
      type: transaction.type
    }))
  }
  
  const formatPipelineData = () => {
    if (!dashboardData?.pipeline?.opportunities) return []
    
    const stages = {
      lead: { name: 'Lead', value: 0, color: '#60A5FA' },
      proposal: { name: 'Proposition', value: 0, color: '#A78BFA' },
      negotiation: { name: 'Négociation', value: 0, color: '#F59E0B' },
      won: { name: 'Gagné', value: 0, color: '#10B981' }
    }
    
    dashboardData.pipeline.opportunities.forEach(opp => {
      if (stages[opp.status]) {
        stages[opp.status].value += opp.value || 0
      }
    })
    
    return Object.values(stages)
  }
  
  // Get metrics
  const metrics = getFormattedMetrics() || {}
  const alerts = getAlerts() || []
  
  // Prepare Command Center data
  const commandCenterData = {
    alerts: alerts,
    actions: dashboardData?.tasks?.urgent?.slice(0, 5).map(task => ({
      id: task.id,
      priority: task.priority || 1,
      title: task.name,
      deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : null,
      buttonText: 'Traiter'
    })) || [],
    insights: [
      {
        id: 'revenue-prediction',
        title: 'Prévision de revenus',
        value: '+23% ce trimestre',
        confidence: 85
      },
      {
        id: 'cash-optimization',
        title: 'Optimisation trésorerie',
        value: '€45K économisables',
        confidence: 92
      }
    ]
  }
  
  // Loading state
  if (isLoading && !dashboardData) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={48} />
        </motion.div>
        <p>Chargement du dashboard...</p>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} />
        <h3>Erreur de chargement</h3>
        <p>{error.message}</p>
        <button onClick={() => refreshDashboard()} className={styles.retryButton}>
          Réessayer
        </button>
      </div>
    )
  }
  
  return (
    <div className={`${styles.dashboard} ${darkMode ? styles.dark : ''}`}>
      {/* Header avec actions */}
      <div className={styles.header}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Dashboard SuperAdmin
        </motion.h1>
        
        <div className={styles.headerActions}>
          <button 
            className={styles.refreshButton}
            onClick={() => refreshDashboard()}
            disabled={isRefreshing}
          >
            <RefreshCw className={isRefreshing ? styles.spinning : ''} />
            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
          
          <button 
            className={styles.themeToggle}
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className={styles.settingsButton}>
            <Settings />
          </button>
        </div>
      </div>
      
      {/* Command Center - 3 blocs séparés */}
      <div className={styles.commandCenter}>
        {/* Bloc 1: Alertes */}
        <motion.div 
          className={styles.commandBlock}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className={styles.commandCard}>
            <div className={styles.commandHeader}>
              <div className={styles.commandIcon}>
                <AlertCircle size={20} className={styles.iconAlert} />
              </div>
              <div className={styles.commandInfo}>
                <h3 className={styles.commandTitle}>Alertes</h3>
                <p className={styles.commandCount}>{commandCenterData.alerts.length} actives</p>
              </div>
            </div>
            <div className={styles.commandContent}>
              {commandCenterData.alerts.length === 0 ? (
                <div className={styles.emptyState}>
                  <CheckCircle size={32} className={styles.emptyIcon} />
                  <p>Aucune alerte</p>
                </div>
              ) : (
                <div className={styles.alertsList}>
                  {commandCenterData.alerts.slice(0, 3).map((alert, index) => (
                    <div key={alert.id || index} className={styles.alertItem}>
                      <span className={styles.alertBadge}>{alert.type}</span>
                      <span className={styles.alertText}>{alert.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Bloc 2: Actions */}
        <motion.div 
          className={styles.commandBlock}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <GlassCard className={styles.commandCard}>
            <div className={styles.commandHeader}>
              <div className={styles.commandIcon}>
                <Zap size={20} className={styles.iconAction} />
              </div>
              <div className={styles.commandInfo}>
                <h3 className={styles.commandTitle}>Actions</h3>
                <p className={styles.commandCount}>{commandCenterData.actions.length} à traiter</p>
              </div>
            </div>
            <div className={styles.commandContent}>
              {commandCenterData.actions.length === 0 ? (
                <div className={styles.emptyState}>
                  <CheckCircle size={32} className={styles.emptyIcon} />
                  <p>Aucune action requise</p>
                </div>
              ) : (
                <div className={styles.actionsList}>
                  {commandCenterData.actions.slice(0, 3).map((action, index) => (
                    <div key={action.id || index} className={styles.actionItem}>
                      <span className={styles.actionPriority}>{action.priority}</span>
                      <span className={styles.actionText}>{action.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Bloc 3: Insights */}
        <motion.div 
          className={styles.commandBlock}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className={styles.commandCard}>
            <div className={styles.commandHeader}>
              <div className={styles.commandIcon}>
                <TrendingUp size={20} className={styles.iconInsight} />
              </div>
              <div className={styles.commandInfo}>
                <h3 className={styles.commandTitle}>Insights IA</h3>
                <p className={styles.commandCount}>{commandCenterData.insights.length} disponibles</p>
              </div>
            </div>
            <div className={styles.commandContent}>
              {commandCenterData.insights.length === 0 ? (
                <div className={styles.emptyState}>
                  <Info size={32} className={styles.emptyIcon} />
                  <p>Analyse en cours...</p>
                </div>
              ) : (
                <div className={styles.insightsList}>
                  {commandCenterData.insights.slice(0, 3).map((insight, index) => (
                    <div key={insight.id || index} className={styles.insightItem}>
                      <span className={styles.insightIcon}>💡</span>
                      <div>
                        <p className={styles.insightTitle}>{insight.title}</p>
                        <p className={styles.insightValue}>{insight.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
      
      {/* KPI Cards Row */}
      <div className={styles.kpiRow}>
        {Object.entries(metrics).map(([key, metric], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className={styles.kpiCard}
          >
            <GlassCard 
              variant="colored" 
              hover={true}
              onClick={() => setActiveMetric(key)}
            >
              <MetricDisplay
                label={key.toUpperCase()}
                value={metric.formatted}
                trend={metric.trend}
                trendValue={metric.trend === 'up' ? '+12%' : '-5%'}
                icon={getMetricIcon(key)}
                size="medium"
                animated={true}
              />
            </GlassCard>
          </motion.div>
        ))}
      </div>
      
      {/* Main Grid - 3 colonnes */}
      <div className={styles.mainGrid}>
        
        {/* Colonne 1: OPÉRATIONNEL */}
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>OPÉRATIONNEL</h2>
          <div className={styles.columnContent}>
            {/* Bloc 1: Tâches & Actions */}
            <GlassCard className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>📋 Tâches & Actions</h3>
                <span className={styles.badge}>
                  {dashboardData?.tasks?.total || 0} actives
                </span>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.tasksList}>
                  {dashboardData?.tasks?.urgent?.slice(0, 5).map((task, index) => (
                    <motion.div 
                      key={task.id}
                      className={styles.taskItem}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <span className={styles.taskPriority}>
                        {task.priority || index + 1}
                      </span>
                      <div className={styles.taskContent}>
                        <p className={styles.taskName}>{task.name}</p>
                        <p className={styles.taskDeadline}>
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Sans échéance'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard>
            
            {/* Bloc 2: Projets Actifs */}
            <GlassCard className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>📁 Projets Actifs</h3>
                <span className={styles.badge}>
                  {dashboardData?.projects?.total || 0}
                </span>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.projectsList}>
                  {dashboardData?.projects?.active?.slice(0, 4).map((project, index) => (
                    <motion.div 
                      key={project.id}
                      className={styles.projectItem}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                    >
                      <div className={styles.projectHeader}>
                        <span className={styles.projectName}>{project.name}</span>
                        <span className={styles.projectStatus}>{project.status}</span>
                      </div>
                      <div className={styles.projectProgress}>
                        <div 
                          className={styles.progressBar}
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard>
            
          </div>
        </div>
        
        {/* Colonne 2: COMMERCIAL & MARKETING */}
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>COMMERCIAL & MARKETING</h2>
          <div className={styles.columnContent}>
            {/* Bloc 1: Pipeline Commercial */}
            <GlassCard className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>🎯 Pipeline Commercial</h3>
                <span className={styles.value}>
                  €{((dashboardData?.pipeline?.totalValue || 0) / 1000).toFixed(0)}K
                </span>
              </div>
              
              <div className={styles.cardContent}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={formatPipelineData()}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={entry => `€${(entry.value / 1000).toFixed(0)}K`}
                    >
                      {formatPipelineData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className={styles.pipelineStats}>
                  {formatPipelineData().map(stage => (
                    <div key={stage.name} className={styles.stageStat}>
                      <span 
                        className={styles.stageIndicator}
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className={styles.stageName}>{stage.name}</span>
                      <span className={styles.stageValue}>
                        €{(stage.value / 1000).toFixed(0)}K
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
            
            {/* Bloc 2: Marketing & Acquisition */}
            <GlassCard className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>📈 Marketing & Acquisition</h3>
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
            </GlassCard>
            
          </div>
        </div>
        
        {/* Colonne 3: FINANCE */}
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>FINANCE</h2>
          <div className={styles.columnContent}>
            {/* Bloc 1: Métriques Financières (au lieu de Cash Flow) */}
            <GlassCard className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>💰 Métriques Financières</h3>
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
            </GlassCard>
            
            {/* Bloc 2: Factures */}
            <GlassCard className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>📄 Factures</h3>
                <span className={styles.badge}>
                  {dashboardData?.invoices?.unpaid?.length || 0} impayées
                </span>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.invoicesList}>
                  <div className={styles.invoiceStat}>
                    <span>Total impayé</span>
                    <span className={styles.amount}>
                      €{((dashboardData?.invoices?.totalUnpaid || 0) / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className={styles.invoiceStat}>
                    <span>En retard (&gt;30j)</span>
                    <span className={styles.amountDanger}>
                      €{((dashboardData?.invoices?.totalOverdue || 0) / 1000).toFixed(0)}K
                    </span>
                  </div>
                  
                  {dashboardData?.invoices?.overdue?.slice(0, 3).map(invoice => (
                    <div key={invoice.id} className={styles.invoiceItem}>
                      <span className={styles.invoiceClient}>
                        {invoice.client_name || 'Client'}
                      </span>
                      <span className={styles.invoiceAmount}>
                        €{(invoice.amount / 1000).toFixed(0)}K
                      </span>
                    </div>
                  ))}
                </div>
                
                <button className={styles.actionButton}>
                  Relancer les impayés
                </button>
              </div>
            </GlassCard>
            
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for metric icons
const getMetricIcon = (key) => {
  const icons = {
    runway: <Clock size={24} />,
    arr: <TrendingUp size={24} />,
    mrr: <Activity size={24} />,
    ebitda: <DollarSign size={24} />,
    ltvcac: <Users size={24} />,
    nps: <Zap size={24} />
  }
  return icons[key] || <BarChart3 size={24} />
}

export default DashboardV3