/**
 * Swiss QR-Bill React Component v2.3
 * Conforme aux Swiss Implementation Guidelines pour QR-facture
 * Adresses structurées OBLIGATOIRES depuis 22.11.2025
 */

import React, { useMemo } from 'react';
import QRCode from 'qrcode.react';

// Dimensions en mm (converti en px à 96dpi)
const MM_TO_PX = 3.7795275591;
const QR_SIZE = 46 * MM_TO_PX; // 46mm
const PAYMENT_PART_WIDTH = 148 * MM_TO_PX; // A6 width
const PAYMENT_PART_HEIGHT = 105 * MM_TO_PX; // A6 height
const RECEIPT_WIDTH = 62 * MM_TO_PX;

/**
 * Format IBAN with spaces
 */
const formatIBAN = (iban) => {
  const clean = iban.replace(/\s/g, '');
  return clean.match(/.{1,4}/g)?.join(' ') || iban;
};

/**
 * Format reference number
 */
const formatReference = (ref, type) => {
  if (!ref) return '';
  const clean = ref.replace(/\s/g, '');
  
  if (type === 'QRR') {
    // QRR: XX XXXXX XXXXX XXXXX XXXXX XXXXX X
    return clean.slice(0, 2) + ' ' + 
           clean.slice(2, 7) + ' ' + 
           clean.slice(7, 12) + ' ' + 
           clean.slice(12, 17) + ' ' + 
           clean.slice(17, 22) + ' ' + 
           clean.slice(22, 27);
  }
  return clean;
};

/**
 * Format amount in Swiss format
 */
const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '';
  const parts = Number(amount).toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join('.');
};

/**
 * Generate QR code data string according to Swiss QR-Bill standard
 */
const generateQRData = (data) => {
  const lines = [
    'SPC',                          // QR Type
    '0200',                         // Version
    '1',                            // Coding Type
    data.iban.replace(/\s/g, ''),   // IBAN
    'S',                            // Address Type (S = Structured)
    data.creditor.name,
    data.creditor.street || '',
    data.creditor.buildingNumber || '',
    data.creditor.postalCode,
    data.creditor.city,
    data.creditor.country,
    '',                             // Ultimate Creditor (not used)
    '',
    '',
    '',
    '',
    '',
    '',
    data.amount ? data.amount.toFixed(2) : '',
    data.currency || 'CHF',
    data.debtor ? 'S' : '',         // Debtor Address Type
    data.debtor?.name || '',
    data.debtor?.street || '',
    data.debtor?.buildingNumber || '',
    data.debtor?.postalCode || '',
    data.debtor?.city || '',
    data.debtor?.country || '',
    data.referenceType || 'NON',    // Reference Type (QRR, SCOR, NON)
    data.reference || '',
    data.message || '',
    'EPD',                          // Trailer
    data.additionalInfo || ''
  ];
  
  return lines.join('\n');
};

/**
 * Address display component
 */
const AddressBlock = ({ address, label }) => (
  <div className="qr-address-block">
    {label && <div className="qr-label">{label}</div>}
    <div className="qr-address">
      <div>{address.name}</div>
      {address.street && (
        <div>{address.street} {address.buildingNumber}</div>
      )}
      <div>{address.postalCode} {address.city}</div>
    </div>
  </div>
);

/**
 * Main QR-Bill Component
 */
const QRBill = ({ 
  iban,
  creditor,
  debtor,
  amount,
  currency = 'CHF',
  referenceType = 'QRR',
  reference,
  message,
  additionalInfo,
  language = 'fr'
}) => {
  // Labels by language
  const labels = {
    fr: {
      receipt: 'Récépissé',
      paymentPart: 'Section paiement',
      account: 'Compte / Payable à',
      reference: 'Référence',
      additionalInfo: 'Informations supplémentaires',
      payableBy: 'Payable par',
      payableByBlank: 'Payable par (nom/adresse)',
      currency: 'Monnaie',
      amount: 'Montant',
      acceptancePoint: 'Point de dépôt'
    },
    de: {
      receipt: 'Empfangsschein',
      paymentPart: 'Zahlteil',
      account: 'Konto / Zahlbar an',
      reference: 'Referenz',
      additionalInfo: 'Zusätzliche Informationen',
      payableBy: 'Zahlbar durch',
      payableByBlank: 'Zahlbar durch (Name/Adresse)',
      currency: 'Währung',
      amount: 'Betrag',
      acceptancePoint: 'Annahmestelle'
    },
    it: {
      receipt: 'Ricevuta',
      paymentPart: 'Sezione pagamento',
      account: 'Conto / Pagabile a',
      reference: 'Riferimento',
      additionalInfo: 'Informazioni supplementari',
      payableBy: 'Pagabile da',
      payableByBlank: 'Pagabile da (nome/indirizzo)',
      currency: 'Valuta',
      amount: 'Importo',
      acceptancePoint: 'Punto di accettazione'
    },
    en: {
      receipt: 'Receipt',
      paymentPart: 'Payment part',
      account: 'Account / Payable to',
      reference: 'Reference',
      additionalInfo: 'Additional information',
      payableBy: 'Payable by',
      payableByBlank: 'Payable by (name/address)',
      currency: 'Currency',
      amount: 'Amount',
      acceptancePoint: 'Acceptance point'
    }
  };
  
  const t = labels[language] || labels.fr;
  
  // Generate QR data string
  const qrData = useMemo(() => generateQRData({
    iban,
    creditor,
    debtor,
    amount,
    currency,
    referenceType,
    reference,
    message,
    additionalInfo
  }), [iban, creditor, debtor, amount, currency, referenceType, reference, message, additionalInfo]);
  
  return (
    <div className="qr-bill-container" style={{
      display: 'flex',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10px',
      lineHeight: '1.4',
      border: '1px solid #000',
      width: `${PAYMENT_PART_WIDTH + RECEIPT_WIDTH}px`,
      height: `${PAYMENT_PART_HEIGHT}px`,
      backgroundColor: '#fff'
    }}>
      {/* Receipt Part */}
      <div className="qr-receipt" style={{
        width: `${RECEIPT_WIDTH}px`,
        padding: '5mm',
        borderRight: '1px dashed #000',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="qr-title" style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5mm' }}>
          {t.receipt}
        </div>
        
        <div style={{ marginBottom: '3mm' }}>
          <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '6px' }}>
            {t.account}
          </div>
          <div style={{ fontSize: '8px' }}>{formatIBAN(iban)}</div>
          <AddressBlock address={creditor} />
        </div>
        
        {reference && (
          <div style={{ marginBottom: '3mm' }}>
            <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '6px' }}>
              {t.reference}
            </div>
            <div style={{ fontSize: '8px' }}>{formatReference(reference, referenceType)}</div>
          </div>
        )}
        
        <div style={{ marginBottom: '3mm' }}>
          <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '6px' }}>
            {debtor ? t.payableBy : t.payableByBlank}
          </div>
          {debtor ? (
            <AddressBlock address={debtor} />
          ) : (
            <div style={{ 
              border: '1px solid #000', 
              height: '25mm', 
              marginTop: '2mm' 
            }} />
          )}
        </div>
        
        <div style={{ display: 'flex', marginTop: 'auto' }}>
          <div style={{ marginRight: '5mm' }}>
            <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '6px' }}>
              {t.currency}
            </div>
            <div style={{ fontSize: '8px' }}>{currency}</div>
          </div>
          <div>
            <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '6px' }}>
              {t.amount}
            </div>
            <div style={{ fontSize: '8px' }}>
              {amount ? formatAmount(amount) : (
                <div style={{ 
                  border: '1px solid #000', 
                  width: '30mm', 
                  height: '10mm' 
                }} />
              )}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '3mm', textAlign: 'right' }}>
          <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '6px' }}>
            {t.acceptancePoint}
          </div>
        </div>
      </div>
      
      {/* Payment Part */}
      <div className="qr-payment" style={{
        width: `${PAYMENT_PART_WIDTH}px`,
        padding: '5mm',
        display: 'flex'
      }}>
        {/* Left column - QR Code */}
        <div style={{ marginRight: '5mm' }}>
          <div className="qr-title" style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5mm' }}>
            {t.paymentPart}
          </div>
          
          <div style={{
            width: `${QR_SIZE}px`,
            height: `${QR_SIZE}px`,
            padding: '5px',
            backgroundColor: '#fff'
          }}>
            <QRCode
              value={qrData}
              size={QR_SIZE - 10}
              level="M"
              includeMargin={false}
              renderAs="svg"
            />
          </div>
          
          <div style={{ display: 'flex', marginTop: '5mm' }}>
            <div style={{ marginRight: '5mm' }}>
              <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '8px' }}>
                {t.currency}
              </div>
              <div style={{ fontSize: '10px' }}>{currency}</div>
            </div>
            <div>
              <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '8px' }}>
                {t.amount}
              </div>
              <div style={{ fontSize: '10px' }}>
                {amount ? formatAmount(amount) : (
                  <div style={{ 
                    border: '1px solid #000', 
                    width: '40mm', 
                    height: '15mm' 
                  }} />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Details */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '3mm' }}>
            <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '8px' }}>
              {t.account}
            </div>
            <div style={{ fontSize: '10px' }}>{formatIBAN(iban)}</div>
            <AddressBlock address={creditor} />
          </div>
          
          {reference && (
            <div style={{ marginBottom: '3mm' }}>
              <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '8px' }}>
                {t.reference}
              </div>
              <div style={{ fontSize: '10px' }}>{formatReference(reference, referenceType)}</div>
            </div>
          )}
          
          {(message || additionalInfo) && (
            <div style={{ marginBottom: '3mm' }}>
              <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '8px' }}>
                {t.additionalInfo}
              </div>
              <div style={{ fontSize: '10px' }}>
                {message}
                {additionalInfo && <div>{additionalInfo}</div>}
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '3mm' }}>
            <div className="qr-label" style={{ fontWeight: 'bold', fontSize: '8px' }}>
              {debtor ? t.payableBy : t.payableByBlank}
            </div>
            {debtor ? (
              <AddressBlock address={debtor} />
            ) : (
              <div style={{ 
                border: '1px solid #000', 
                height: '20mm', 
                marginTop: '2mm' 
              }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRBill;

// Example usage:
/*
<QRBill
  iban="CH44 3199 9123 0008 8901 2"
  creditor={{
    name: "HYPERVISUAL Sàrl",
    street: "Rue du Commerce",
    buildingNumber: "12",
    postalCode: "1204",
    city: "Genève",
    country: "CH"
  }}
  debtor={{
    name: "Client SA",
    street: "Avenue des Alpes",
    buildingNumber: "45",
    postalCode: "1000",
    city: "Lausanne",
    country: "CH"
  }}
  amount={1234.56}
  currency="CHF"
  referenceType="QRR"
  reference="210000000003139471430009017"
  message="Facture 2025-001"
  language="fr"
/>
*/