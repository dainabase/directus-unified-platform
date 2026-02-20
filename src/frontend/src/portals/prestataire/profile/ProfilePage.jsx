/**
 * ProfilePage — S-02-07
 * Page /prestataire/profile — profil prestataire + gestion documents.
 * Collection : providers (structure à vérifier — loggé dans PROGRESS.md).
 * Upload via directus_files.
 */

import React, { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  UserCircle, Building, Phone, Mail, MapPin, Save,
  Upload, FileCheck, AlertTriangle, Clock, Trash2,
  Shield, Tag, Globe, Loader2, CheckCircle, XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../stores/authStore'

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

// ── Fetch profil prestataire ──
const fetchProfile = async (userId) => {
  try {
    // Chercher le profil prestataire lié à l'utilisateur
    const { data } = await api.get('/items/providers', {
      params: {
        filter: { user_id: { _eq: userId } },
        fields: ['*'],
        limit: 1
      }
    })
    return data?.data?.[0] || null
  } catch {
    return null
  }
}

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
          <Building className="w-5 h-5 text-purple-600" />
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
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
        <Shield className="w-5 h-5 text-purple-600" />
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
                    className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors disabled:opacity-50"
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
          <Tag className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Spécialités & Zones
          </h3>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
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
                  ? 'bg-purple-600 text-white'
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
                  ? 'bg-purple-600 text-white'
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

// ── Page principale ──
const ProfilePage = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const userId = user?.id

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['prestataire-profile', userId],
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5
  })

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ['prestataire-documents', profile?.id],
    queryFn: () => fetchDocuments(profile?.id),
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5
  })

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (profile?.id) {
        return api.patch(`/items/providers/${profile.id}`, data)
      }
      // Créer un profil si inexistant
      return api.post('/items/providers', { ...data, user_id: userId })
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
        providerId={profile?.id}
        onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ['prestataire-documents'] })}
      />

      {/* Section 3 */}
      <SpecialtiesSection
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  )
}

export default ProfilePage
