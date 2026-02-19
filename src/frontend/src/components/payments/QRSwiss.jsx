/**
 * QRSwiss — Composant de QR-Facture suisse (ISO 20022 / SIX v2.3)
 *
 * Genere un bulletin de paiement QR conforme aux normes suisses.
 * Utilise la librairie "qrcode" pour le rendu canvas.
 *
 * @see https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf
 */

import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

// --- Constantes SIX ---
const QR_TYPE = 'SPC'          // Swiss Payments Code
const QR_VERSION = '0200'      // Version 2.0
const QR_CODING = '1'          // UTF-8
const CURRENCY = 'CHF'
const COUNTRY = 'CH'

/**
 * Formatte un montant en string QR (max 2 decimales, pas de separateur de milliers)
 */
function formatAmount(amount) {
  if (!amount && amount !== 0) return ''
  return Number(amount).toFixed(2)
}

/**
 * Formatte un IBAN suisse (enleve espaces)
 */
function formatIBAN(iban) {
  return (iban || '').replace(/\s/g, '').toUpperCase()
}

/**
 * Genere le payload QR-Bill selon la norme SIX v2.3
 *
 * @param {Object} params
 * @param {string} params.iban - IBAN du creancier (CH...)
 * @param {string} params.creditorName - Nom du creancier
 * @param {string} params.creditorStreet - Rue du creancier
 * @param {string} params.creditorZip - NPA du creancier
 * @param {string} params.creditorCity - Ville du creancier
 * @param {string} params.creditorCountry - Pays (defaut: CH)
 * @param {number} params.amount - Montant
 * @param {string} params.currency - Devise (defaut: CHF)
 * @param {string} params.debtorName - Nom du debiteur (optionnel)
 * @param {string} params.debtorStreet - Rue du debiteur (optionnel)
 * @param {string} params.debtorZip - NPA du debiteur (optionnel)
 * @param {string} params.debtorCity - Ville du debiteur (optionnel)
 * @param {string} params.debtorCountry - Pays debiteur (defaut: CH)
 * @param {string} params.reference - Reference QRR ou SCOR
 * @param {string} params.referenceType - 'QRR' | 'SCOR' | 'NON'
 * @param {string} params.message - Information supplementaire
 * @returns {string} Payload QR
 */
function buildQRPayload(params) {
  const lines = [
    QR_TYPE,
    QR_VERSION,
    QR_CODING,
    // Creditor account
    formatIBAN(params.iban),
    // Creditor (combined address type = 'K')
    'K',
    params.creditorName || '',
    params.creditorStreet || '',
    `${params.creditorZip || ''} ${params.creditorCity || ''}`.trim(),
    '', // (reserved)
    '', // (reserved)
    params.creditorCountry || COUNTRY,
    // Ultimate creditor (not used)
    '', '', '', '', '', '', '',
    // Amount
    formatAmount(params.amount),
    params.currency || CURRENCY,
    // Debtor (combined address type = 'K')
    params.debtorName ? 'K' : '',
    params.debtorName || '',
    params.debtorStreet || '',
    params.debtorName ? `${params.debtorZip || ''} ${params.debtorCity || ''}`.trim() : '',
    '', // (reserved)
    '', // (reserved)
    params.debtorCountry || (params.debtorName ? COUNTRY : ''),
    // Reference
    params.referenceType || 'NON',
    params.reference || '',
    // Additional info
    params.message || '',
    'EPD', // End Payment Data
    // AV (alternative schemes — not used)
  ]

  return lines.join('\n')
}

/**
 * Formatte un montant CHF pour l'affichage
 */
function displayCHF(amount) {
  if (!amount && amount !== 0) return '—'
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount)
}

/**
 * Composant QRSwiss
 *
 * Props:
 * @param {Object} invoice - Objet facture avec les champs necessaires
 * @param {Object} creditor - Infos du creancier (iban, name, street, zip, city, country)
 * @param {Object} debtor - Infos du debiteur (name, street, zip, city, country) — optionnel
 * @param {string} reference - Reference structuree (QRR/SCOR)
 * @param {string} referenceType - Type de reference: 'QRR' | 'SCOR' | 'NON'
 * @param {string} message - Message additionnel
 * @param {boolean} compact - Mode compact (pas de section recepisse)
 * @param {boolean} printable - Ajoute les styles pour impression A4 en bas de page
 */
const QRSwiss = ({
  invoice = {},
  creditor = {},
  debtor = null,
  reference = '',
  referenceType = 'NON',
  message = '',
  compact = false,
  printable = false
}) => {
  const canvasRef = useRef(null)
  const [qrError, setQrError] = useState(null)

  const amount = invoice.total_ttc || invoice.amount || 0
  const invoiceRef = invoice.reference || invoice.invoice_number || ''

  // Build full message
  const fullMessage = message || (invoiceRef ? `Facture ${invoiceRef}` : '')

  useEffect(() => {
    if (!canvasRef.current || !creditor.iban) return

    const payload = buildQRPayload({
      iban: creditor.iban,
      creditorName: creditor.name,
      creditorStreet: creditor.street,
      creditorZip: creditor.zip,
      creditorCity: creditor.city,
      creditorCountry: creditor.country,
      amount,
      currency: CURRENCY,
      debtorName: debtor?.name,
      debtorStreet: debtor?.street,
      debtorZip: debtor?.zip,
      debtorCity: debtor?.city,
      debtorCountry: debtor?.country,
      reference,
      referenceType,
      message: fullMessage
    })

    QRCode.toCanvas(canvasRef.current, payload, {
      width: 180,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' }
    }).catch((err) => {
      console.error('QR generation error:', err)
      setQrError('Erreur de generation QR')
    })
  }, [creditor, debtor, amount, reference, referenceType, fullMessage])

  if (!creditor.iban) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400">
        <p className="text-sm">QR-Facture indisponible — IBAN manquant</p>
      </div>
    )
  }

  return (
    <div
      className={`bg-white border border-gray-200 ${printable ? 'print:fixed print:bottom-0 print:left-0 print:right-0' : ''}`}
      style={{ fontFamily: 'Liberation Sans, Helvetica, Arial, sans-serif' }}
    >
      <div className={`flex ${compact ? 'gap-4 p-4' : 'gap-0'}`}>
        {/* === RECEPISSE (gauche) === */}
        {!compact && (
          <div className="w-[210px] border-r border-dashed border-gray-400 p-4 text-xs">
            <h3 className="text-[11px] font-bold mb-3 tracking-wide uppercase">Recepisse</h3>

            <div className="mb-2">
              <p className="font-bold text-[9px] tracking-wide uppercase text-gray-500 mb-0.5">Compte / Payable a</p>
              <p className="leading-tight">
                {formatIBAN(creditor.iban)}<br />
                {creditor.name}<br />
                {creditor.street && <>{creditor.street}<br /></>}
                {creditor.zip} {creditor.city}
              </p>
            </div>

            {reference && (
              <div className="mb-2">
                <p className="font-bold text-[9px] tracking-wide uppercase text-gray-500 mb-0.5">Reference</p>
                <p className="leading-tight font-mono text-[10px]">{reference}</p>
              </div>
            )}

            {debtor && (
              <div className="mb-2">
                <p className="font-bold text-[9px] tracking-wide uppercase text-gray-500 mb-0.5">Payable par</p>
                <p className="leading-tight">
                  {debtor.name}<br />
                  {debtor.street && <>{debtor.street}<br /></>}
                  {debtor.zip} {debtor.city}
                </p>
              </div>
            )}

            <div className="mt-4">
              <p className="font-bold text-[9px] tracking-wide uppercase text-gray-500 mb-0.5">Monnaie</p>
              <div className="flex items-baseline gap-3">
                <span>{CURRENCY}</span>
                <span className="font-bold text-sm">{formatAmount(amount)}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-300 pt-2">
              <p className="font-bold text-[9px] tracking-wide uppercase text-gray-500">Point de depot</p>
            </div>
          </div>
        )}

        {/* === SECTION PAIEMENT (droite) === */}
        <div className={`flex-1 ${compact ? '' : 'p-4'}`}>
          <h3 className="text-[11px] font-bold mb-3 tracking-wide uppercase">Section paiement</h3>

          <div className={`flex ${compact ? 'flex-col items-center gap-3' : 'gap-6'}`}>
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="border border-gray-200 p-1 bg-white">
                {qrError ? (
                  <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-50 text-gray-400 text-xs">
                    {qrError}
                  </div>
                ) : (
                  <canvas ref={canvasRef} />
                )}
              </div>
              {/* Swiss cross overlay */}
              <div className="relative -mt-[100px] mb-[80px]">
                <div className="w-[26px] h-[26px] bg-black flex items-center justify-center">
                  <div className="w-[22px] h-[22px] bg-white flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <rect x="5" y="0" width="4" height="14" fill="black" />
                      <rect x="0" y="5" width="14" height="4" fill="black" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Infos textuelles */}
            <div className="flex-1 text-xs space-y-2">
              <div>
                <p className="font-bold text-[9px] tracking-wide uppercase text-gray-500 mb-0.5">Compte / Payable a</p>
                <p className="leading-tight">
                  {formatIBAN(creditor.iban)}<br />
                  {creditor.name}<br />
                  {creditor.street && <>{creditor.street}<br /></>}
                  {creditor.zip} {creditor.city}
                </p>
              </div>

              {reference && (
                <div>
                  <p className="font-bold text-[9px] tracking-wide uppercase text-gray-500 mb-0.5">Reference</p>
                  <p className="leading-tight font-mono text-[10px]">{reference}</p>
                </div>
              )}

              {fullMessage && (
                <div>
                  <p className="font-bold text-[9px] tracking-wide uppercase text-gray-500 mb-0.5">Informations supplementaires</p>
                  <p className="leading-tight">{fullMessage}</p>
                </div>
              )}

              {debtor && (
                <div>
                  <p className="font-bold text-[9px] tracking-wide uppercase text-gray-500 mb-0.5">Payable par</p>
                  <p className="leading-tight">
                    {debtor.name}<br />
                    {debtor.street && <>{debtor.street}<br /></>}
                    {debtor.zip} {debtor.city}
                  </p>
                </div>
              )}

              <div className="pt-1">
                <p className="font-bold text-[9px] tracking-wide uppercase text-gray-500 mb-0.5">Monnaie</p>
                <div className="flex items-baseline gap-4">
                  <span className="font-bold">{CURRENCY}</span>
                  <span className="font-bold text-base">{formatAmount(amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ligne de decoupage */}
      {!compact && (
        <div className="border-t border-dashed border-gray-400 px-4 py-1 flex items-center justify-between text-[9px] text-gray-400">
          <span>Avant le versement, detacher le recepisse</span>
          <svg width="20" height="10" viewBox="0 0 20 10">
            <path d="M2 8 L10 2 L18 8" stroke="currentColor" fill="none" strokeWidth="1" />
          </svg>
        </div>
      )}
    </div>
  )
}

// --- Exports supplementaires ---
export { buildQRPayload, formatAmount, formatIBAN, displayCHF }
export default QRSwiss
