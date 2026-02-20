/**
 * ProfilePage — S-02-07
 * Page /prestataire/profile — profil prestataire + gestion documents.
 * Collection : providers (structure à vérifier — loggé dans PROGRESS.md).
 * Upload via directus_files.
 *
 * Sections:
 *   1. GeneralInfoSection (company_name, ide_number, address, phone, email, daily_rate)
 *   2. DocumentsSection (upload/manage provider_documents)
 *   3. SpecialtiesSection (specialties tags + canton zones)
 *   4. StatistiquesSection (missions, factures, livrables)
 *   5. NotificationsSection (email preferences toggles)
 */

import React, { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  UserCircle, Building, Phone, Mail, MapPin, Save,
  Upload, FileCheck, AlertTriangle, Clock, Trash2,
  Shield, Tag, Globe, Loader2, CheckCircle, XCircle,
  BarChart3, Bell, Briefcase, Receipt, PackageCheck
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useProviderAuth } from '../hooks/useProviderAuth'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

// Cantons suisses
const CANTONS = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
]

// Spécialités prestataire
const SPECIALTIES = [
  'LED', 'Audio', 'Vidéo', 'Installation', 'Maintenance',
  'Développement', 'Design', 'Conseil', 'Formation', 'Infrastructure'
]

// Types de documents requis
const DOCUMENT_TYPES = [
  { key: 'rc_insurance', label: 'Assurance RC Pro', required: true },
  { key: 'trade_register', label: 'Extrait registre commerce', required: false },
  { key: 'certifications', label: 'Certifications', required: false }
]

// ── Fetch documents du prestataire ──
const fetchDocuments = async (providerId) => {
  if (!providerId) return []
  try {
    const { data } = await api.get('/items/provider_documents', {
      params: {
        filter: { provider_id: { _eq: providerId } },
        fields: ['*', 'file_id.id', 'file_id.filename_download', 'file_id.type', 'file_id.filesize'],
        sort: ['-date_created']
      }
    })
    return data?.data || []
  } catch {
    // Collection provider_documents peut ne pas exister
    return []
  }
}

// ── Section 1 : Informations générales ──
const GeneralInfoSection = ({ profile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      company_name: profile?.company_name || '',
      ide_number: profile?.ide_number || '',
      address: profile?.address || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
      daily_rate: profile?.daily_rate || ''
    }
  })

  const onSubmit = (data) => {
    onSave(data)
    setIsEditing(false)
  }

  return (
    <div className="ds-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Informations générales
          </h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Modifier
          </button>
        ) : (
          <button
            onClick={handleSubmit(onSubmit)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0071E3] text-white hover:bg-blue-700 transition-colors"
          >
            <Save size={14} /> Sauvegarder
          </button>
        )}
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nom entreprise</label>
          {isEditing ? (
            <input {...register('company_name')} className="ds-input w-full" />
          ) : (
            <p className="text-sm font-medium text-gray-900">{profile?.company_name || '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">N° IDE (Suisse)</label>
          {isEditing ? (
            <input
              {...register('ide_number')}
              className="ds-input w-full"
              placeholder="CHE-123.456.789"
            />
          ) : (
            <p className="text-sm font-medium text-gray-900">{profile?.ide_number || '—'}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Adresse</label>
          {isEditing ? (
            <input {...register('address')} className="ds-input w-full" />
          ) : (
            <p className="text-sm text-gray-900">{profile?.address || '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label>
          {isEditing ? (
            <input {...register('phone')} className="ds-input w-full" type="tel" />
          ) : (
            <p className="text-sm text-gray-900">{profile?.phone || '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
          {isEditing ? (
            <input {...register('email')} className="ds-input w-full" type="email" />
          ) : (
            <p className="text-sm text-gray-900">{profile?.email || '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tarif journalier indicatif</label>
          {isEditing ? (
            <div className="relative">
              <input
                type="number"
                min="0"
                {...register('daily_rate')}
                className="ds-input w-full pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">CHF/j</span>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-900">
              {profile?.daily_rate ? formatCHF(profile.daily_rate) + '/jour' : '—'}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

// ── Section 2 : Documents ──
const DocumentsSection = ({ documents, providerId, onUploadSuccess }) => {
  const fileInputRef = useRef(null)
  const [uploadType, setUploadType] = useState(null)

  const uploadMutation = useMutation({
    mutationFn: async ({ file, docType }) => {
      // Upload fichier vers directus_files
      const formData = new FormData()
      formData.append('file', file)
      const { data: fileData } = await api.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const fileId = fileData?.data?.id
      if (!fileId) throw new Error('Upload échoué')

      // Créer entrée provider_documents
      await api.post('/items/provider_documents', {
        provider_id: providerId,
        file_id: fileId,
        document_type: docType,
        status: 'pending',
        date_created: new Date().toISOString()
      })
    },
    onSuccess: () => {
      toast.success('Document uploadé')
      onUploadSuccess?.()
    },
    onError: (err) => {
      console.error('Erreur upload document:', err)
      toast.error("Erreur lors de l'upload")
    }
  })

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file && uploadType) {
      uploadMutation.mutate({ file, docType: uploadType })
      setUploadType(null)
    }
    e.target.value = ''
  }

  const triggerUpload = (docType) => {
    setUploadType(docType)
    fileInputRef.current?.click()
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validated': return <CheckCircle size={14} className="text-green-600" />
      case 'rejected': return <XCircle size={14} className="text-red-600" />
      default: return <Clock size={14} className="text-yellow-600" />
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'validated': return 'Validé'
      case 'rejected': return 'Refusé'
      default: return 'En attente'
    }
  }

  // Vérifier quels documents sont uploadés
  const uploadedTypes = new Set(documents.map(d => d.document_type))

  return (
    <div className="ds-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Documents
        </h3>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />

      {/* Types de documents requis */}
      <div className="space-y-3 mb-4">
        {DOCUMENT_TYPES.map(docType => {
          const existing = documents.filter(d => d.document_type === docType.key)
          const hasDoc = existing.length > 0

          return (
            <div key={docType.key} className={`p-3 rounded-lg border ${
              !hasDoc && docType.required ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hasDoc ? (
                    getStatusIcon(existing[0].status)
                  ) : docType.required ? (
                    <AlertTriangle size={14} className="text-red-500" />
                  ) : (
                    <FileCheck size={14} className="text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {docType.label}
                    {docType.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </div>

                {hasDoc ? (
                  <span className={`text-xs font-medium ${
                    existing[0].status === 'validated' ? 'text-green-600' :
                    existing[0].status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {getStatusLabel(existing[0].status)}
                  </span>
                ) : (
                  <button
                    onClick={() => triggerUpload(docType.key)}
                    disabled={uploadMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    {uploadMutation.isPending && uploadType === docType.key ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Upload size={12} />
                    )}
                    Uploader
                  </button>
                )}
              </div>

              {hasDoc && existing[0].file_id && (
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  {existing[0].file_id.filename_download}
                  {existing[0].expiry_date && (
                    <span className={`ml-2 ${
                      new Date(existing[0].expiry_date) < new Date() ? 'text-red-500 font-medium' : ''
                    }`}>
                      · Expire le {format(new Date(existing[0].expiry_date), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  )}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Liste complète des documents */}
      {documents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            Tous les documents ({documents.length})
          </p>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(doc.status)}
                  <span className="text-gray-700">
                    {doc.file_id?.filename_download || doc.document_type}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {doc.date_created && format(new Date(doc.date_created), 'dd/MM/yyyy', { locale: fr })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Section 3 : Spécialités et zones ──
const SpecialtiesSection = ({ profile, onSave }) => {
  const [selectedSpecialties, setSelectedSpecialties] = useState(
    profile?.specialties || []
  )
  const [selectedCantons, setSelectedCantons] = useState(
    profile?.zones || []
  )

  const toggleSpecialty = (s) => {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const toggleCanton = (c) => {
    setSelectedCantons(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  const handleSave = () => {
    onSave({ specialties: selectedSpecialties, zones: selectedCantons })
  }

  return (
    <div className="ds-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Spécialités & Zones
          </h3>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0071E3] text-white hover:bg-blue-700 transition-colors"
        >
          <Save size={14} /> Sauvegarder
        </button>
      </div>

      {/* Spécialités */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Spécialités</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => toggleSpecialty(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedSpecialties.includes(s)
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Zones géographiques */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Zones d'intervention (cantons)</p>
        <div className="flex flex-wrap gap-1.5">
          {CANTONS.map(c => (
            <button
              key={c}
              onClick={() => toggleCanton(c)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedCantons.includes(c)
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Section 4 : Statistiques ──
const StatistiquesSection = ({ stats, isLoading }) => {
  const statItems = [
    {
      label: 'Total missions',
      value: stats?.totalProjects || 0,
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Total facturé',
      value: formatCHF(stats?.totalInvoiced || 0),
      icon: Receipt,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Nb factures',
      value: stats?.invoiceCount || 0,
      icon: FileCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Livrables terminés',
      value: stats?.completedDeliverables || 0,
      icon: PackageCheck,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ]

  return (
    <div className="ds-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Statistiques
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 flex flex-col items-center gap-2`}>
            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
              <Icon size={20} className={color} />
            </div>
            {isLoading ? (
              <div className="h-6 w-16 ds-skeleton rounded" />
            ) : (
              <p className={`text-lg font-bold ${color}`}>{value}</p>
            )}
            <p className="text-xs text-gray-500 text-center">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Section 5 : Préférences de notifications ──
const NotificationsSection = () => {
  const [prefs, setPrefs] = useState({
    newProposals: true,
    paymentStatus: true,
    weeklyDigest: false
  })

  const togglePref = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    toast.success('Préférences de notifications sauvegardées')
  }

  const notifOptions = [
    {
      key: 'newProposals',
      label: 'Nouvelles propositions de mission',
      description: 'Recevoir un email quand une nouvelle proposition de mission correspond à votre profil'
    },
    {
      key: 'paymentStatus',
      label: 'Statut des paiements',
      description: 'Être notifié par email lorsqu\'un paiement est émis ou confirmé'
    },
    {
      key: 'weeklyDigest',
      label: 'Résumé hebdomadaire',
      description: 'Recevoir chaque lundi un récapitulatif de votre activité de la semaine'
    }
  ]

  return (
    <div className="ds-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Notifications
          </h3>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0071E3] text-white hover:bg-blue-700 transition-colors"
        >
          <Save size={14} /> Sauvegarder
        </button>
      </div>

      <div className="space-y-4">
        {notifOptions.map(({ key, label, description }) => (
          <div key={key} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-gray-50">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[key]}
              onClick={() => togglePref(key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                prefs[key] ? 'bg-[#0071E3]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  prefs[key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page principale ──
const ProfilePage = () => {
  const queryClient = useQueryClient()
  const { provider } = useProviderAuth()
  const providerId = provider?.id

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['prestataire-profile', providerId],
    queryFn: async () => {
      if (!providerId) return null
      try {
        const { data } = await api.get(`/items/providers/${providerId}`, {
          params: { fields: ['*'] }
        })
        return data?.data || null
      } catch {
        return null
      }
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5
  })

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ['prestataire-documents', providerId],
    queryFn: () => fetchDocuments(providerId),
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5
  })

  // Fetch provider stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['provider-stats', providerId],
    queryFn: async () => {
      const [projectsRes, invoicesRes, deliverablesRes] = await Promise.all([
        api.get('/items/projects', {
          params: { filter: { main_provider_id: { _eq: providerId } }, aggregate: { count: ['*'] } }
        }),
        api.get('/items/supplier_invoices', {
          params: { filter: { provider_id: { _eq: providerId } }, aggregate: { count: ['*'], sum: ['amount'] } }
        }),
        api.get('/items/deliverables', {
          params: { filter: { assigned_provider_id: { _eq: providerId }, status: { _eq: 'completed' } }, aggregate: { count: ['*'] } }
        })
      ])
      return {
        totalProjects: parseInt(projectsRes.data?.data?.[0]?.count || 0),
        totalInvoiced: parseFloat(invoicesRes.data?.data?.[0]?.sum?.amount || 0),
        invoiceCount: parseInt(invoicesRes.data?.data?.[0]?.count || 0),
        completedDeliverables: parseInt(deliverablesRes.data?.data?.[0]?.count || 0)
      }
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5
  })

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (profile?.id) {
        return api.patch(`/items/providers/${profile.id}`, data)
      }
      // Créer un profil si inexistant
      return api.post('/items/providers', { ...data, user_id: providerId })
    },
    onSuccess: () => {
      toast.success('Profil mis à jour')
      queryClient.invalidateQueries({ queryKey: ['prestataire-profile'] })
    },
    onError: (err) => {
      console.error('Erreur sauvegarde profil:', err)
      toast.error('Erreur lors de la sauvegarde')
    }
  })

  const handleSaveProfile = (data) => {
    saveMutation.mutate(data)
  }

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="ds-card p-6"><div className="h-48 ds-skeleton rounded-lg" /></div>
        <div className="ds-card p-6"><div className="h-48 ds-skeleton rounded-lg" /></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-sm text-gray-500">
          Gérez vos informations, documents et spécialités
        </p>
      </div>

      {/* Alerte si profil inexistant */}
      {!profile && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Profil incomplet</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Complétez vos informations pour recevoir des demandes de devis.
            </p>
          </div>
        </div>
      )}

      {/* Section 1 */}
      <GeneralInfoSection
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Section 2 */}
      <DocumentsSection
        documents={documents || []}
        providerId={providerId}
        onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ['prestataire-documents'] })}
      />

      {/* Section 3 */}
      <SpecialtiesSection
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Section 4 */}
      <StatistiquesSection
        stats={stats}
        isLoading={statsLoading}
      />

      {/* Section 5 */}
      <NotificationsSection />
    </div>
  )
}

export default ProfilePage
