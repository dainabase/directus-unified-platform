/**
 * ProfilClient — Client portal profile page
 * 4 sections: Personal info, Security, Preferences, Portal info
 * Data from Directus collections: people, companies, client_portal_accounts
 */
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { User, Shield, Settings, Info, Loader2, Check, LogOut, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useClientAuth } from '../hooks/useClientAuth'

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-5">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: 'rgba(0,113,227,0.10)' }}
    >
      <Icon size={18} style={{ color: 'var(--accent-hover)' }} />
    </div>
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
  </div>
)

const FieldRow = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    {children}
  </div>
)

const ReadOnlyField = ({ label, value }) => (
  <FieldRow label={label}>
    <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
  </FieldRow>
)

const ProfilClient = () => {
  const { client, logout } = useClientAuth()
  const contactId = client?.id
  const companyId = client?.company_id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // ── Personal info state ──
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: ''
  })

  // ── Security state ──
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPwd, setShowOldPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)

  // ── Preferences state ──
  const [language, setLanguage] = useState('fr')
  const [notifInvoices, setNotifInvoices] = useState(true)
  const [notifMilestones, setNotifMilestones] = useState(true)
  const [notifTickets, setNotifTickets] = useState(true)

  // Sync form data when client loads
  useEffect(() => {
    if (client) {
      setFormData({
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        email: client.email || '',
        phone: client.phone || '',
        position: client.position || ''
      })
    }
  }, [client])

  // ── Fetch company ──
  const { data: company } = useQuery({
    queryKey: ['client-company', companyId],
    queryFn: async () => {
      const { data } = await api.get(`/items/companies/${companyId}`, {
        params: {
          fields: ['id', 'name', 'address_line1', 'address_line2', 'city', 'postal_code', 'country']
        }
      })
      return data?.data || null
    },
    enabled: !!companyId
  })

  // ── Fetch portal account ──
  const { data: portalAccount } = useQuery({
    queryKey: ['client-portal-account', contactId],
    queryFn: async () => {
      const { data } = await api.get('/items/client_portal_accounts', {
        params: {
          filter: { contact_id: { _eq: contactId } },
          fields: ['id', 'email', 'language', 'notification_preferences', 'last_login_at', 'date_created', 'status'],
          limit: 1
        }
      })
      const account = data?.data?.[0] || null
      return account
    },
    enabled: !!contactId,
    onSuccess: (account) => {
      if (account) {
        if (account.language) setLanguage(account.language)
        if (account.notification_preferences) {
          const prefs = typeof account.notification_preferences === 'string'
            ? JSON.parse(account.notification_preferences)
            : account.notification_preferences
          setNotifInvoices(prefs.invoices !== false)
          setNotifMilestones(prefs.milestones !== false)
          setNotifTickets(prefs.tickets !== false)
        }
      }
    }
  })

  // Load preferences from portalAccount when it arrives
  useEffect(() => {
    if (portalAccount) {
      if (portalAccount.language) setLanguage(portalAccount.language)
      if (portalAccount.notification_preferences) {
        const prefs = typeof portalAccount.notification_preferences === 'string'
          ? JSON.parse(portalAccount.notification_preferences)
          : portalAccount.notification_preferences
        setNotifInvoices(prefs.invoices !== false)
        setNotifMilestones(prefs.milestones !== false)
        setNotifTickets(prefs.tickets !== false)
      }
    } else {
      // Try localStorage fallback
      const saved = localStorage.getItem('client_portal_preferences')
      if (saved) {
        try {
          const prefs = JSON.parse(saved)
          if (prefs.language) setLanguage(prefs.language)
          if (prefs.invoices !== undefined) setNotifInvoices(prefs.invoices)
          if (prefs.milestones !== undefined) setNotifMilestones(prefs.milestones)
          if (prefs.tickets !== undefined) setNotifTickets(prefs.tickets)
        } catch { /* ignore */ }
      }
    }
  }, [portalAccount])

  // ── Update profile mutation ──
  const updateProfile = useMutation({
    mutationFn: async (fields) => {
      const { data } = await api.patch(`/items/people/${contactId}`, fields)
      return data?.data
    },
    onSuccess: () => {
      toast.success('Profil mis à jour')
      queryClient.invalidateQueries({ queryKey: ['client-profile'] })
      setIsEditing(false)
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du profil')
    }
  })

  // ── Save preferences mutation ──
  const savePreferences = useMutation({
    mutationFn: async () => {
      const preferences = {
        invoices: notifInvoices,
        milestones: notifMilestones,
        tickets: notifTickets
      }

      if (portalAccount?.id) {
        await api.patch(`/items/client_portal_accounts/${portalAccount.id}`, {
          language,
          notification_preferences: preferences
        })
        return { saved: 'remote' }
      }

      // Try to find by contact_id and patch
      const { data } = await api.get('/items/client_portal_accounts', {
        params: {
          filter: { contact_id: { _eq: contactId } },
          fields: ['id'],
          limit: 1
        }
      })
      const account = data?.data?.[0]
      if (account) {
        await api.patch(`/items/client_portal_accounts/${account.id}`, {
          language,
          notification_preferences: preferences
        })
        return { saved: 'remote' }
      }

      throw new Error('no_account')
    },
    onSuccess: (result) => {
      if (result.saved === 'remote') {
        toast.success('Préférences sauvegardées')
        queryClient.invalidateQueries({ queryKey: ['client-portal-account'] })
      }
    },
    onError: () => {
      // Fallback to localStorage
      const prefs = {
        language,
        invoices: notifInvoices,
        milestones: notifMilestones,
        tickets: notifTickets
      }
      localStorage.setItem('client_portal_preferences', JSON.stringify(prefs))
      toast.success('Préférences sauvegardées localement')
    }
  })

  // ── Handlers ──
  const handleSaveProfile = () => {
    updateProfile.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      position: formData.position
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (client) {
      setFormData({
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        email: client.email || '',
        phone: client.phone || '',
        position: client.position || ''
      })
    }
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.error('Le mot de passe doit contenir au moins une majuscule')
      return
    }
    if (!/\d/.test(newPassword)) {
      toast.error('Le mot de passe doit contenir au moins un chiffre')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    // POST to password change endpoint
    api.post('/api/commercial/portal/change-password', {
      old_password: oldPassword,
      new_password: newPassword
    })
      .then(() => {
        toast.success('Mot de passe modifié avec succès')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      })
      .catch(() => {
        toast.error('Erreur lors du changement de mot de passe')
      })
  }

  const handleLogout = () => {
    logout()
    navigate('/client/login')
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400'
  const inputBg = { background: 'var(--bg)' }
  const readOnlyClass = 'w-full px-4 py-2.5 rounded-xl border border-gray-100 text-sm text-gray-500 cursor-not-allowed'
  const readOnlyBg = { background: '#F2F2F7' }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez vos informations personnelles et vos préférences</p>
      </div>

      {/* ─── Section 1: Personal Info ─── */}
      <div className="ds-card p-6">
        <div className="flex items-center justify-between mb-5">
          <SectionHeader icon={User} title="Informations personnelles" />
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ color: 'var(--accent-hover)', background: 'rgba(0,113,227,0.10)' }}
            >
              Modifier
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={updateProfile.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: 'var(--accent-hover)' }}
              >
                {updateProfile.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Enregistrer
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isEditing ? (
            <>
              <FieldRow label="Prénom">
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={inputClass}
                  style={inputBg}
                />
              </FieldRow>
              <FieldRow label="Nom">
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={inputClass}
                  style={inputBg}
                />
              </FieldRow>
              <FieldRow label="Email">
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className={readOnlyClass}
                  style={readOnlyBg}
                />
              </FieldRow>
              <FieldRow label="Téléphone">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputClass}
                  style={inputBg}
                  placeholder="+41 XX XXX XX XX"
                />
              </FieldRow>
              <FieldRow label="Fonction">
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className={inputClass}
                  style={inputBg}
                />
              </FieldRow>
            </>
          ) : (
            <>
              <ReadOnlyField label="Prénom" value={client?.first_name} />
              <ReadOnlyField label="Nom" value={client?.last_name} />
              <ReadOnlyField label="Email" value={client?.email} />
              <ReadOnlyField label="Téléphone" value={client?.phone} />
              <ReadOnlyField label="Fonction" value={client?.position} />
            </>
          )}
        </div>

        {/* Company info */}
        {company && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Entreprise</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadOnlyField label="Nom" value={company.name} />
              <ReadOnlyField label="Adresse" value={[company.address_line1, company.address_line2].filter(Boolean).join(', ')} />
              <ReadOnlyField label="Ville" value={[company.postal_code, company.city].filter(Boolean).join(' ')} />
              <ReadOnlyField label="Pays" value={company.country} />
            </div>
          </div>
        )}
      </div>

      {/* ─── Section 2: Security ─── */}
      <div className="ds-card p-6">
        <SectionHeader icon={Shield} title="Sécurité" />

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <FieldRow label="Ancien mot de passe">
            <div className="relative">
              <input
                type={showOldPwd ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className={inputClass}
                style={inputBg}
              />
              <button
                type="button"
                onClick={() => setShowOldPwd(!showOldPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FieldRow>

          <FieldRow label="Nouveau mot de passe">
            <div className="relative">
              <input
                type={showNewPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className={inputClass}
                style={inputBg}
              />
              <button
                type="button"
                onClick={() => setShowNewPwd(!showNewPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Min. 8 caractères, 1 majuscule, 1 chiffre</p>
          </FieldRow>

          <FieldRow label="Confirmer le mot de passe">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
              style={inputBg}
            />
          </FieldRow>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ background: 'var(--accent-hover)' }}
          >
            <Shield size={14} />
            Changer le mot de passe
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'var(--semantic-red)', background: 'rgba(255,59,48,0.08)' }}
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </div>

      {/* ─── Section 3: Preferences ─── */}
      <div className="ds-card p-6">
        <SectionHeader icon={Settings} title="Préférences" />

        <div className="space-y-5">
          {/* Language */}
          <FieldRow label="Langue">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`${inputClass} appearance-none`}
              style={inputBg}
            >
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </FieldRow>

          {/* Notification toggles */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Notifications</p>
            <div className="space-y-3">
              <ToggleRow
                label="Nouvelles factures"
                description="Recevoir une notification pour chaque nouvelle facture"
                checked={notifInvoices}
                onChange={setNotifInvoices}
              />
              <ToggleRow
                label="Jalons projet"
                description="Être informé des étapes clés de vos projets"
                checked={notifMilestones}
                onChange={setNotifMilestones}
              />
              <ToggleRow
                label="Tickets support"
                description="Recevoir les mises à jour de vos tickets"
                checked={notifTickets}
                onChange={setNotifTickets}
              />
            </div>
          </div>

          <button
            onClick={() => savePreferences.mutate()}
            disabled={savePreferences.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: 'var(--accent-hover)' }}
          >
            {savePreferences.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            Enregistrer les préférences
          </button>
        </div>
      </div>

      {/* ─── Section 4: Portal Info ─── */}
      <div className="ds-card p-6">
        <SectionHeader icon={Info} title="Informations portail" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Email de connexion">
            <div
              className="px-4 py-2.5 rounded-xl text-sm text-gray-500"
              style={{ background: '#F2F2F7' }}
            >
              {portalAccount?.email || client?.email || '—'}
            </div>
          </FieldRow>

          <ReadOnlyField
            label="Dernière connexion"
            value={portalAccount?.last_login_at ? formatDate(portalAccount.last_login_at) : '—'}
          />

          <ReadOnlyField
            label="Compte créé le"
            value={client?.date_created ? formatDate(client.date_created) : (portalAccount?.date_created ? formatDate(portalAccount.date_created) : '—')}
          />

          <ReadOnlyField
            label="Statut du compte"
            value={portalAccount?.status === 'active' ? 'Actif' : portalAccount?.status || '—'}
          />
        </div>
      </div>
    </div>
  )
}

// ── Toggle component ──
const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-xs text-gray-400">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
      style={{ background: checked ? 'var(--accent-hover)' : 'var(--gray-4)' }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(24px)' : 'translateX(4px)' }}
      />
    </button>
  </div>
)

export default ProfilClient
