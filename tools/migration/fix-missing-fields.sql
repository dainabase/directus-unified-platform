-- Correction des champs manquants pour KPIs
ALTER TABLE kpis 
ADD COLUMN IF NOT EXISTS metric_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS date DATE;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_kpis_date ON kpis(date);
CREATE INDEX IF NOT EXISTS idx_kpis_metric ON kpis(metric_name);

-- Correction pour payments
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_date DATE;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Migration des données existantes
UPDATE payments 
SET payment_date = DATE(created_at)
WHERE payment_date IS NULL AND created_at IS NOT NULL;

UPDATE kpis 
SET date = CURRENT_DATE,
    metric_name = 'Default Metric',
    value = 0
WHERE date IS NULL OR metric_name IS NULL OR value IS NULL;