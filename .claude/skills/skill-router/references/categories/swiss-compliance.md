# Swiss Compliance Skills — HYPERVISUAL Switzerland

> Catégorie dédiée à la conformité légale suisse.
> Custom skill projet TOUJOURS disponible : `.claude/skills/swiss-compliance-engine/SKILL.md`

---

## ⚠️ RÈGLE ABSOLUE

**Tout fichier touchant à la finance, TVA, facturation ou comptabilité DOIT utiliser ce skill.**
Taux TVA corrects 2025 : **8.1%** standard · **2.6%** réduit · **3.8%** hébergement
Anciens taux interdits : ~~7.7% / 2.5% / 3.7%~~

---

## Custom Skill Projet (toujours chargé)

| Skill | Chemin | Déclencheur |
|-------|--------|-------------|
| **swiss-compliance-engine** | `.claude/skills/swiss-compliance-engine/SKILL.md` | TOUT ce qui touche TVA, QR-Invoice, CGV, comptabilité suisse |

**Lire ce SKILL.md pour :**
- TVA AFC — calcul, formulaire 200, déclaration trimestrielle/annuelle
- QR-Invoice ISO 20022 v2.3 — génération, validation IBAN CH
- Plan comptable PME Käfer — écritures automatiques
- Code des Obligations suisse — mentions légales obligatoires
- CGV suisses — acceptation obligatoire avant démarrage projet
- Recouvrement SchKG — procédure de relance légale

---

## Skills Globaux Swiss/Regulatory (~55 skills)
> Détail complet : `references/categories/regulatory.md`

| Skill | Usage |
|-------|-------|
| **regulatory-affairs-head** | Conformité réglementaire globale |
| **information-security-manager-iso27001** | ISO 27001, sécurité des données |
| **senior-secops** | Architecture sécurité conformité |
| **gdpr-compliance-scanner** | RGPD — protection données clients |
| **pci-dss-validator** | Validation paiements PCI DSS |

---

## Checklist obligatoire avant tout code Finance

- [ ] Taux TVA : 8.1 / 2.6 / 3.8 (jamais 7.7 / 2.5 / 3.7)
- [ ] QR-Invoice : IBAN CH valide, montant en CHF, référence QR
- [ ] Formulaire 200 AFC : période correcte, solde TVA calculé
- [ ] CGV : acceptation obligatoire avant signature devis
- [ ] Acompte : projet ne démarre QU'APRÈS paiement confirmé Revolut
