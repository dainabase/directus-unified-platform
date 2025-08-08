import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, TrendingUp, Users, DollarSign, 
  AlertCircle, Clock, Zap,
  Package, FileText, BarChart3,
  RefreshCw, Settings,
  ClipboardList, Folder, Wallet
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import styles from './DashboardV3.module.css'

// Importer les graphiques
import RevenueChart from '../../components/charts/RevenueChart'
import CashFlowChart from '../../components/charts/CashFlowChart'
import ProjectsChart from '../../components/charts/ProjectsChart'
import PerformanceChart from '../../components/charts/PerformanceChart'
import ClientsChart from '../../components/charts/ClientsChart'
import MetricsRadar from '../../components/charts/MetricsRadar'

// Importer les hooks
import { useCompanies, useCompanyMetrics } from '../../services/hooks/useCompanies'
import { useProjects, useProjectStatus, useProjectTimeline } from '../../services/hooks/useProjects'
import { useCashFlow, useRevenue, useRunway } from '../../services/hooks/useFinances'
import { useMetrics, useAlerts, useUrgentTasks, useInsights } from '../../services/hooks/useMetrics'

// Variants d'animation pour les cards
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)",
    transition: {
      duration: 0.2
    }
  }
}

// Animation stagger pour les listes
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3
    }
  }
}

// Composant pour les barres de progression animées
const AnimatedProgress = ({ progress, color = '#8B5CF6' }) => (
  <div className={styles.progressContainer}>
    <motion.div 
      className={styles.progressBar}
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ 
        duration: 1.5, 
        ease: "easeInOut",
        delay: 0.2 
      }}
      style={{
        background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
        boxShadow: `0 0 20px ${color}66`
      }}
    />
  </div>
)

// Indicateur de tendance animé
const TrendIndicator = ({ trend, value }) => (
  <motion.div 
    className={`${styles.metricTrend} ${styles[`trend-${trend}`]}`}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3 }}
  >
    <motion.span
      animate={{ 
        y: trend === 'up' ? [0, -2, 0] : [0, 2, 0] 
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 2,
        ease: "easeInOut" 
      }}
    >
      {trend === 'up' ? '↑' : '↓'}
    </motion.span>
  </motion.div>
)

// Skeleton loader pendant le chargement
const SkeletonCard = () => (
  <div className={styles.skeleton}>
    <div className={styles.shimmer} />
  </div>
)

// Fonction pour afficher les notifications
const showNotification = (message, type = 'success') => {
  toast[type](message, {
    style: {
      background: 'linear-gradient(135deg, #1e293b, #334155)',
      color: '#fff',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
    },
    icon: type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️',
    duration: 4000
  })
}

const DashboardV4 = ({ selectedCompany }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const queryClient = useQueryClient()
  
  // Fonction pour forcer le rafraîchissement des vraies données
  const forceRefreshData = async () => {
    console.log('🔄 FORCE REFRESH DE TOUTES LES DONNÉES...')
    showNotification('info', 'Rafraîchissement des données...')
    
    // Invalider toutes les queries pour forcer le rechargement
    await queryClient.invalidateQueries()
    
    // Refetch tout
    await queryClient.refetchQueries()
    
    console.log('✅ Données rafraîchies !')
    showNotification('success', 'Données réelles chargées !')
  }
  
  // Requêtes API avec React Query
  const { data: companies, isLoading: loadingCompanies } = useCompanies()
  const { data: companyMetrics } = useCompanyMetrics(selectedCompany)
  const { data: projects, isLoading: loadingProjects } = useProjects(selectedCompany !== 'all' ? { company: { _eq: selectedCompany } } : {})
  const { data: projectStatus } = useProjectStatus()
  const { data: cashFlow } = useCashFlow()
  const { data: revenue } = useRevenue()
  const { data: runway } = useRunway()
  const { data: kpis } = useMetrics()
  const { data: alerts = [] } = useAlerts()
  const { data: tasks = [] } = useUrgentTasks()
  const { data: insights = [] } = useInsights()
  
  // Gérer le loading global
  const isLoadingData = loadingCompanies || loadingProjects || !kpis || !revenue || !runway
  
  useEffect(() => {
    console.log('✅ DashboardV4 monté avec succès')
    // Montrer le contenu après un court délai
    setTimeout(() => setShowContent(true), 100)
  }, [])

  // DEBUG: Log des données reçues
  useEffect(() => {
    console.log('🔍 DEBUG DONNÉES RÉELLES:');
    console.log('Companies:', companies);
    console.log('Projects:', projects);
    console.log('Cash Flow:', cashFlow);
    console.log('Revenue:', revenue);
    console.log('Runway:', runway);
    console.log('KPIs:', kpis);
    console.log('Alerts:', alerts);
    console.log('Tasks:', tasks);
    console.log('Insights:', insights);
    
    // Vérifier si les données sont réelles ou démo
    if (revenue?.arr > 10000000) {
      console.warn('⚠️ ATTENTION: ARR trop élevé, probablement des données démo !');
    }
    if (runway?.runway < 0) {
      console.warn('⚠️ ATTENTION: Runway négatif, probablement des données démo !');
    }
  }, [companies, projects, cashFlow, revenue, runway, kpis, alerts, tasks, insights])
  
  // Formater les métriques pour l'affichage
  const metrics = {
    runway: { 
      value: runway ? `${runway.runway} mois` : '...',
      trend: runway?.status === 'critical' ? 'down' : 'up',
      color: '#8B5CF6'
    },
    arr: { 
      value: revenue ? `€${(revenue.arr / 1000000).toFixed(1)}M` : '...',
      trend: 'up',
      color: '#3B82F6'
    },
    mrr: { 
      value: revenue ? `€${(revenue.mrr / 1000).toFixed(0)}K` : '...',
      trend: 'up',
      color: '#10B981'
    },
    ebitda: { 
      value: kpis ? `${kpis.ebitda}%` : '...',
      trend: kpis?.ebitda > 15 ? 'up' : 'down',
      color: '#F59E0B'
    },
    ltvcac: { 
      value: kpis ? `${kpis.ltvcac}x` : '...',
      trend: kpis?.ltvcac > 3 ? 'up' : 'down',
      color: '#EC4899'
    },
    nps: { 
      value: kpis ? kpis.nps.toString() : '...',
      trend: kpis?.nps > 70 ? 'up' : 'down',
      color: '#6366F1'
    }
  }
  
  // Données pour les graphiques
  const chartData = {
    revenue: cashFlow?.map((month, index) => ({
      month: month.month,
      arr: revenue?.arr || 0,
      mrr: revenue?.mrr || 0,
      growth: index > 0 ? Math.random() * 30 : 0 // À calculer depuis les données réelles
    })),
    cashFlow: cashFlow?.map(month => ({
      ...month,
      entrees: month.entrees / 1000, // Convertir en K€
      sorties: Math.abs(month.sorties) / 1000,
      net: month.net / 1000
    })),
    projects: projectStatus ? [
      { name: 'Terminés', value: projectStatus.completed, color: '#10B981' },
      { name: 'En cours', value: projectStatus.in_progress, color: '#3B82F6' },
      { name: 'En attente', value: projectStatus.on_hold, color: '#F59E0B' },
      { name: 'Annulés', value: projectStatus.cancelled, color: '#EF4444' },
    ].filter(p => p.value > 0) : null,
    performance: null, // À implémenter selon vos besoins
    clients: null, // À implémenter selon vos besoins
    metricsRadar: kpis ? [
      { metric: 'Croissance', current: revenue?.growth || 0, target: 25 },
      { metric: 'Rentabilité', current: kpis.ebitda || 0, target: 20 },
      { metric: 'Satisfaction', current: kpis.nps || 0, target: 80 },
      { metric: 'Productivité', current: (kpis.productivity || 0.85) * 100, target: 90 },
      { metric: 'Efficacité', current: 88, target: 90 },
      { metric: 'Qualité', current: 95, target: 95 },
    ] : null
  }
  
  // Formater les projets pour l'affichage
  const displayProjects = projects?.slice(0, 3).map(project => ({
    id: project.id,
    name: project.name,
    status: project.status === 'in_progress' ? 'En cours' : 
            project.status === 'completed' ? 'Terminé' : 
            project.status === 'on_hold' ? 'En attente' : 'Annulé',
    progress: project.progress || 0,
    color: project.status === 'in_progress' ? '#3B82F6' : 
           project.status === 'completed' ? '#10B981' : '#F59E0B'
  })) || []

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      // Invalider toutes les requêtes pour forcer le rafraîchissement
      await queryClient.invalidateQueries()
      showNotification('Données actualisées avec succès', 'success')
    } catch (error) {
      showNotification('Erreur lors de l\'actualisation', 'error')
    }
    setTimeout(() => setIsLoading(false), 1000)
  }

  // Skeleton loading pendant le chargement des données
  if (!showContent || isLoadingData) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Centre de Commande V4</h1>
        </div>
        <div className={styles.commandCenter}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.commandBlock}>
              <SkeletonCard />
            </div>
          ))}
        </div>
        <div className={styles.mainGrid}>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className={styles.dashboard}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header animé */}
      <motion.div 
        className={styles.header}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className={styles.title}>Centre de Commande V4</h1>
        <div className={styles.headerActions}>
          <motion.button 
            className={styles.refreshButton} 
            disabled={isLoading}
            onClick={handleRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={isLoading ? styles.spinning : ''} size={18} />
            <span>Actualiser</span>
          </motion.button>
          <motion.button 
            className={styles.settingsButton}
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Settings size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* 3 Blocs Command Center avec animations */}
      <motion.div 
        className={styles.commandCenter}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Alertes */}
        <motion.div 
          className={styles.commandBlock}
          variants={cardVariants}
          whileHover="hover"
        >
          <div className={`${styles.commandCard} ${alerts.some(a => a.priority === 'high') ? styles.alertCritical : ''}`}>
            <div className={styles.commandHeader}>
              <motion.div 
                className={styles.commandIcon}
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <AlertCircle size={20} className={styles.iconAlert} />
              </motion.div>
              <div className={styles.commandInfo}>
                <h3 className={styles.commandTitle}>Alertes</h3>
                <p className={styles.commandCount}>{alerts.length} actives</p>
              </div>
            </div>
            <motion.div 
              className={styles.commandContent}
              variants={containerVariants}
            >
              <div className={styles.alertsList}>
                {alerts.map((alert, index) => (
                  <motion.div 
                    key={alert.id} 
                    className={styles.alertItem}
                    data-type={alert.type}
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ x: 5 }}
                  >
                    <span className={styles.alertBadge}>{alert.type}</span>
                    <span className={styles.alertText}>{alert.title}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          className={styles.commandBlock}
          variants={cardVariants}
          whileHover="hover"
        >
          <div className={styles.commandCard}>
            <div className={styles.commandHeader}>
              <motion.div 
                className={styles.commandIcon}
                animate={{ 
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Zap size={20} className={styles.iconAction} />
              </motion.div>
              <div className={styles.commandInfo}>
                <h3 className={styles.commandTitle}>Actions</h3>
                <p className={styles.commandCount}>{tasks.length} à traiter</p>
              </div>
            </div>
            <motion.div 
              className={styles.commandContent}
              variants={containerVariants}
            >
              <div className={styles.actionsList}>
                {tasks.map((task, index) => (
                  <motion.div 
                    key={task.id} 
                    className={styles.actionItem}
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ x: 5 }}
                  >
                    <span className={styles.actionPriority}>{task.priority}</span>
                    <span className={styles.actionText}>{task.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div 
          className={styles.commandBlock}
          variants={cardVariants}
          whileHover="hover"
        >
          <div className={styles.commandCard}>
            <div className={styles.commandHeader}>
              <motion.div 
                className={styles.commandIcon}
                animate={{ 
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <TrendingUp size={20} className={styles.iconInsight} />
              </motion.div>
              <div className={styles.commandInfo}>
                <h3 className={styles.commandTitle}>Insights IA</h3>
                <p className={styles.commandCount}>{insights.length} disponibles</p>
              </div>
            </div>
            <div className={styles.commandContent}>
              <div className={styles.insightsList}>
                {insights.map((insight, index) => (
                  <motion.div 
                    key={insight.id}
                    className={styles.insightItem}
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ scale: 1.02 }}
                  >
                    <TrendingUp size={16} />
                    <div>
                      <p className={styles.insightTitle}>{insight.title}</p>
                      <p className={styles.insightValue}>{insight.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Métriques animées */}
      <motion.div 
        className={styles.metricsRow}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h3 className={styles.metricsTitle}>Métriques Clés</h3>
        <motion.div 
          className={styles.metricsLine}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {Object.entries(metrics).map(([key, metric], index) => (
            <motion.div 
              key={key} 
              className={styles.metricItem}
              variants={itemVariants}
              custom={index}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(139, 92, 246, 0.1)"
              }}
            >
              <span className={styles.metricLabel}>{key.toUpperCase()}</span>
              <motion.span 
                className={styles.metricValue}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.5 + index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                style={{ color: metric.color }}
              >
                {metric.value}
              </motion.span>
              <TrendIndicator trend={metric.trend} value={metric.value} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Titres des colonnes */}
      <motion.div 
        className={styles.columnsHeader}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.h2 
          className={styles.columnMainTitle}
          whileHover={{ x: 10 }}
        >
          OPÉRATIONNEL
        </motion.h2>
        <motion.h2 
          className={styles.columnMainTitle}
          whileHover={{ x: 10 }}
        >
          COMMERCIAL & MARKETING
        </motion.h2>
        <motion.h2 
          className={styles.columnMainTitle}
          whileHover={{ x: 10 }}
        >
          FINANCE
        </motion.h2>
      </motion.div>

      {/* 3 Colonnes principales avec animations */}
      <motion.div 
        className={styles.mainGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {/* Colonne 1: OPÉRATIONNEL */}
        <div className={styles.column}>
          <motion.div 
            className={styles.card}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <div className={styles.cardHeader}>
              <h3><ClipboardList size={18} /> Tâches & Actions</h3>
              <span className={styles.badge}>{tasks.length} actives</span>
            </div>
            <motion.div 
              className={styles.cardContent}
              variants={containerVariants}
            >
              <div className={styles.tasksList}>
                {tasks.map((task, index) => (
                  <motion.div 
                    key={task.id} 
                    className={styles.taskItem}
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ x: 5 }}
                  >
                    <span className={styles.taskPriority}>{task.priority}</span>
                    <div className={styles.taskContent}>
                      <p className={styles.taskName}>{task.name}</p>
                      <p className={styles.taskDeadline}>{task.deadline}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className={styles.card}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.1 }}
          >
            <div className={styles.cardHeader}>
              <h3><Folder size={18} /> Projets Actifs</h3>
              <span className={styles.badge}>{displayProjects.length}</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.projectsList}>
                {displayProjects.map((project, index) => (
                  <motion.div 
                    key={project.id} 
                    className={styles.projectItem}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className={styles.projectHeader}>
                      <span className={styles.projectName}>{project.name}</span>
                      <span className={styles.projectStatus}>{project.status}</span>
                    </div>
                    <AnimatedProgress progress={project.progress} color={project.color} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Graphique Projets */}
          <motion.div 
            className={`${styles.card} ${styles.chartCard}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.2 }}
          >
            <div className={styles.cardHeader}>
              <h3><BarChart3 size={18} /> Statut des Projets</h3>
            </div>
            <div className={styles.cardContent}>
              <ProjectsChart data={chartData.projects} height={250} />
            </div>
          </motion.div>
        </div>

        {/* Colonne 2: COMMERCIAL */}
        <div className={styles.column}>
          <motion.div 
            className={styles.card}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.2 }}
          >
            <div className={styles.cardHeader}>
              <h3><DollarSign size={18} /> Pipeline Commercial</h3>
              <span className={styles.value}>€850K</span>
            </div>
            <div className={styles.cardContent}>
              <motion.div 
                className={styles.pipelineStats}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  { name: 'Lead', value: '€150K', color: '#60A5FA' },
                  { name: 'Proposition', value: '€300K', color: '#A78BFA' },
                  { name: 'Négociation', value: '€250K', color: '#F59E0B' },
                  { name: 'Gagné', value: '€150K', color: '#10B981' }
                ].map((stage, index) => (
                  <motion.div 
                    key={stage.name}
                    className={styles.stageStat}
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.span 
                      className={styles.stageIndicator} 
                      style={{ backgroundColor: stage.color }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    />
                    <span className={styles.stageName}>{stage.name}</span>
                    <span className={styles.stageValue}>{stage.value}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className={styles.card}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.3 }}
          >
            <div className={styles.cardHeader}>
              <h3><BarChart3 size={18} /> Marketing & Acquisition</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.marketingMetrics}>
                {[
                  { label: 'Visiteurs aujourd\'hui', value: '2,847' },
                  { label: 'Taux de conversion', value: '6.7%' },
                  { label: 'CAC', value: '€320' },
                  { label: 'Leads ce mois', value: '456' }
                ].map((metric, index) => (
                  <motion.div 
                    key={metric.label}
                    className={styles.metricRow}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                  >
                    <span>{metric.label}</span>
                    <motion.span 
                      className={styles.metricValue}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {metric.value}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Graphique Performance */}
          <motion.div 
            className={`${styles.card} ${styles.chartCard}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.4 }}
          >
            <div className={styles.cardHeader}>
              <h3><Activity size={18} /> Performance Commerciale</h3>
            </div>
            <div className={styles.cardContent}>
              <PerformanceChart height={300} />
            </div>
          </motion.div>

          {/* Graphique Clients */}
          <motion.div 
            className={`${styles.card} ${styles.chartCard}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.5 }}
          >
            <div className={styles.cardHeader}>
              <h3><Users size={18} /> Évolution Clients</h3>
            </div>
            <div className={styles.cardContent}>
              <ClientsChart height={300} />
            </div>
          </motion.div>
        </div>

        {/* Colonne 3: FINANCE */}
        <div className={styles.column}>
          <motion.div 
            className={styles.card}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.4 }}
          >
            <div className={styles.cardHeader}>
              <h3><Wallet size={18} /> Métriques Financières</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.metricsGrid}>
                {[
                  { label: 'Trésorerie', value: '€847K', color: '#10B981' },
                  { label: 'Burn Rate', value: '€115K/mois', color: '#EF4444' },
                  { label: 'Revenus mensuels', value: '€200K', color: '#3B82F6' },
                  { label: 'Marge EBITDA', value: '18.5%', color: '#F59E0B' }
                ].map((metric, index) => (
                  <motion.div 
                    key={metric.label}
                    className={styles.metric}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className={styles.metricLabel}>{metric.label}</span>
                    <motion.span 
                      className={styles.metricValue}
                      style={{ color: metric.color }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                    >
                      {metric.value}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            className={styles.card}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.5 }}
          >
            <div className={styles.cardHeader}>
              <h3><FileText size={18} /> Factures</h3>
              <span className={styles.badge}>3 impayées</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.invoicesList}>
                <motion.div 
                  className={styles.invoiceStat}
                  whileHover={{ scale: 1.02 }}
                >
                  <span>Total impayé</span>
                  <span className={styles.amount}>€320K</span>
                </motion.div>
                <motion.div 
                  className={styles.invoiceStat}
                  whileHover={{ scale: 1.02 }}
                >
                  <span>En retard (&gt;30j)</span>
                  <span className={styles.amountDanger}>€85K</span>
                </motion.div>
                <motion.button 
                  className={styles.actionButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => showNotification('Relance envoyée aux clients', 'success')}
                >
                  Relancer les impayés
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Graphique Revenus */}
          <motion.div 
            className={`${styles.card} ${styles.chartCard}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.6 }}
          >
            <div className={styles.cardHeader}>
              <h3><TrendingUp size={18} /> Évolution ARR/MRR</h3>
            </div>
            <div className={styles.cardContent}>
              <RevenueChart data={chartData.revenue} height={300} />
            </div>
          </motion.div>

          {/* Graphique Cash Flow */}
          <motion.div 
            className={`${styles.card} ${styles.chartCard}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.7 }}
          >
            <div className={styles.cardHeader}>
              <h3><Wallet size={18} /> Cash Flow</h3>
            </div>
            <div className={styles.cardContent}>
              <CashFlowChart data={chartData.cashFlow} height={300} />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Section Métriques Globales */}
      <motion.div 
        className={styles.metricsSection}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.h2 
          className={styles.sectionTitle}
          whileHover={{ x: 10 }}
        >
          MÉTRIQUES GLOBALES
        </motion.h2>
        
        <motion.div 
          className={`${styles.card} ${styles.chartCard} ${styles.fullWidth}`}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          transition={{ delay: 0.9 }}
        >
          <div className={styles.cardHeader}>
            <h3><Activity size={18} /> Vue d'ensemble des performances</h3>
          </div>
          <div className={styles.cardContent}>
            <MetricsRadar data={chartData.metricsRadar} height={400} />
          </div>
        </motion.div>
      </motion.div>
      
      {/* Bouton temporaire pour forcer les vraies données */}
      <button 
        onClick={forceRefreshData}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <RefreshCw size={20} />
        🔄 FORCER VRAIES DONNÉES
      </button>
    </motion.div>
  )
}

export default DashboardV4