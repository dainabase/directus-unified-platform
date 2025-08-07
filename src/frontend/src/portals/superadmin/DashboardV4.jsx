import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, TrendingUp, Users, DollarSign, 
  AlertCircle, Clock, Zap,
  Package, FileText, BarChart3,
  RefreshCw, Settings,
  ClipboardList, Folder, Wallet
} from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './DashboardV3.module.css'

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
  
  useEffect(() => {
    console.log('✅ DashboardV4 monté avec succès')
    // Simuler un chargement initial
    setTimeout(() => setShowContent(true), 100)
  }, [])

  // Données démo statiques
  const metrics = {
    runway: { value: '7.3 mois', trend: 'up', color: '#8B5CF6' },
    arr: { value: '€2.4M', trend: 'up', color: '#3B82F6' },
    mrr: { value: '€200K', trend: 'up', color: '#10B981' },
    ebitda: { value: '18.5%', trend: 'up', color: '#F59E0B' },
    ltvcac: { value: '3.2x', trend: 'up', color: '#EC4899' },
    nps: { value: '72', trend: 'up', color: '#6366F1' }
  }

  const alerts = [
    { id: 1, type: 'warning', title: 'Cash runway < 8 mois', priority: 'high' },
    { id: 2, type: 'info', title: '3 factures en retard', priority: 'medium' },
    { id: 3, type: 'success', title: 'Objectif Q4 atteint', priority: 'low' }
  ]

  const tasks = [
    { id: 1, name: 'Révision contrat client', priority: 1, deadline: '15 Dec' },
    { id: 2, name: 'Présentation investisseurs', priority: 2, deadline: '20 Dec' },
    { id: 3, name: 'Audit sécurité', priority: 3, deadline: '18 Dec' }
  ]

  const projects = [
    { id: 1, name: 'Migration Cloud', status: 'En cours', progress: 65, color: '#8B5CF6' },
    { id: 2, name: 'Refonte UI/UX', status: 'En cours', progress: 40, color: '#3B82F6' },
    { id: 3, name: 'API v2', status: 'En cours', progress: 80, color: '#10B981' }
  ]

  const handleRefresh = () => {
    setIsLoading(true)
    showNotification('Données actualisées avec succès', 'success')
    setTimeout(() => setIsLoading(false), 2000)
  }

  if (!showContent) {
    return (
      <div className={styles.dashboard}>
        <SkeletonCard />
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
                <p className={styles.commandCount}>2 disponibles</p>
              </div>
            </div>
            <div className={styles.commandContent}>
              <div className={styles.insightsList}>
                <motion.div 
                  className={styles.insightItem}
                  whileHover={{ scale: 1.02 }}
                >
                  <TrendingUp size={16} />
                  <div>
                    <p className={styles.insightTitle}>Prévision revenus</p>
                    <p className={styles.insightValue}>+23% ce trimestre</p>
                  </div>
                </motion.div>
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
              <span className={styles.badge}>{projects.length}</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.projectsList}>
                {projects.map((project, index) => (
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
        </div>
      </motion.div>
    </motion.div>
  )
}

export default DashboardV4