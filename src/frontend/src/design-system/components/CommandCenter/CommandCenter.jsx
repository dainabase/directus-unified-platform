import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Info,
  Zap,
  ArrowRight 
} from 'lucide-react'
import clsx from 'clsx'
import styles from './CommandCenter.module.css'

const CommandCenter = ({ 
  alerts = [],
  actions = [],
  insights = [],
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState('alerts')

  const getAlertIcon = (type) => {
    switch(type) {
      case 'critical': return <XCircle className={styles.iconCritical} />
      case 'warning': return <AlertCircle className={styles.iconWarning} />
      case 'success': return <CheckCircle className={styles.iconSuccess} />
      case 'info': return <Info className={styles.iconInfo} />
      default: return <AlertCircle className={styles.iconDefault} />
    }
  }

  const tabs = [
    { id: 'alerts', label: 'Alertes', count: alerts.length },
    { id: 'actions', label: 'Actions', count: actions.length },
    { id: 'insights', label: 'Insights IA', count: insights.length }
  ]

  return (
    <div className={clsx(styles.commandCenter, className)}>
      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={clsx(styles.tab, {
              [styles.tabActive]: activeTab === tab.id
            })}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={styles.badge}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={styles.content}
        >
          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className={styles.alertsList}>
              {alerts.length === 0 ? (
                <div className={styles.emptyState}>
                  <CheckCircle className={styles.emptyIcon} />
                  <p>Aucune alerte active</p>
                </div>
              ) : (
                alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id || index}
                    className={clsx(styles.alert, styles[`alert-${alert.type}`])}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {getAlertIcon(alert.type)}
                    <div className={styles.alertContent}>
                      <div className={styles.alertTitle}>{alert.title}</div>
                      {alert.description && (
                        <div className={styles.alertDescription}>
                          {alert.description}
                        </div>
                      )}
                    </div>
                    {alert.action && (
                      <button className={styles.alertAction}>
                        {alert.action}
                        <ArrowRight className={styles.actionIcon} />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className={styles.actionsList}>
              {actions.length === 0 ? (
                <div className={styles.emptyState}>
                  <Zap className={styles.emptyIcon} />
                  <p>Aucune action requise</p>
                </div>
              ) : (
                actions.map((action, index) => (
                  <motion.div
                    key={action.id || index}
                    className={styles.actionItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={styles.actionPriority}>
                      {action.priority}
                    </div>
                    <div className={styles.actionContent}>
                      <div className={styles.actionTitle}>{action.title}</div>
                      {action.deadline && (
                        <div className={styles.actionDeadline}>
                          {action.deadline}
                        </div>
                      )}
                    </div>
                    <button className={styles.actionButton}>
                      {action.buttonText || 'Traiter'}
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className={styles.insightsList}>
              {insights.length === 0 ? (
                <div className={styles.emptyState}>
                  <Info className={styles.emptyIcon} />
                  <p>Aucun insight disponible</p>
                </div>
              ) : (
                insights.map((insight, index) => (
                  <motion.div
                    key={insight.id || index}
                    className={styles.insight}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={styles.insightIcon}>💡</div>
                    <div className={styles.insightContent}>
                      <div className={styles.insightTitle}>{insight.title}</div>
                      <div className={styles.insightValue}>{insight.value}</div>
                      {insight.confidence && (
                        <div className={styles.insightConfidence}>
                          Confiance: {insight.confidence}%
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default CommandCenter