
-- 1. Ministries
CREATE TABLE ministries (
    id INT PRIMARY KEY,
    code TEXT,
    name TEXT,
    parent INT REFERENCES ministries(id),
);

-- 2. Budget Categories
CREATE TABLE budget_categories (
    id INT PRIMARY KEY,
    code TEXT,
    label TEXT
);

-- 3. Portfolios
CREATE TABLE portfolios (
    id INT PRIMARY KEY,
    ministry_id INT REFERENCES ministries(id),
    name TEXT,
    code TEXT
);

-- 4. Programs
CREATE TABLE programs (
    id INT PRIMARY KEY,
    portfolio_id INT REFERENCES portfolios(id),
    code TEXT,
    name TEXT
);

-- 5. Actions
CREATE TABLE actions (
    id INT PRIMARY KEY,
    program_id INT REFERENCES programs(id),
    name TEXT,
    code TEXT
);

-- 6. Wilayas
CREATE TABLE wilayas (
    id INT PRIMARY KEY,
    code TEXT,
    name TEXT
);

-- 7. Operations
CREATE TABLE operations (
    id INT PRIMARY KEY,
    action_id INT REFERENCES actions(id),
    wilaya_id INT REFERENCES wilayas(id),
    title TEXT,
    year INT,
    status TEXT,
    observation TEXT
);

-- 8. Engagements
CREATE TABLE engagements (
    id INT PRIMARY KEY,
    operation_id INT REFERENCES operations(id),
    amount BIGINT,
    year INT,
    type TEXT
);

-- 9. Engagement Revaluations
CREATE TABLE engagement_revaluations (
    id INT PRIMARY KEY,
    engagement_id INT REFERENCES engagements(id),
    revaluation_amount BIGINT,
    reason TEXT
);

-- 10. CP Previsions
CREATE TABLE cp_previsions (
    id INT PRIMARY KEY,
    operation_id INT REFERENCES operations(id),
    year INT,
    forecast_cp BIGINT
);

-- 11. CP Mobilisations
CREATE TABLE cp_mobilisations (
    id INT PRIMARY KEY,
    operation_id INT REFERENCES operations(id),
    mobilised_cp BIGINT,
    date DATE
);

-- 12. CP Consommations
CREATE TABLE cp_consommations (
    id INT PRIMARY KEY,
    mobilisation_id INT REFERENCES cp_mobilisations(id),
    consumed_cp BIGINT,
    date DATE
);

-- 13. CP Alerts
CREATE TABLE cp_alerts (
    id INT PRIMARY KEY,
    operation_id INT REFERENCES operations(id),
    threshold_exceeded BOOLEAN,
    alert_level TEXT,
    message TEXT
);

-- 14. Budget Allocations
CREATE TABLE budget_allocations (
    id INT PRIMARY KEY,
    program_id INT REFERENCES programs(id),
    budget_category_id INT REFERENCES budget_categories(id),
    allocated_ae BIGINT,
    allocated_cp BIGINT,
    year INT
);

-- 15. Financial Operations
CREATE TABLE financial_operations (
    id INT PRIMARY KEY,
    operation_id INT REFERENCES operations(id),
    executed_ae BIGINT,
    executed_cp BIGINT,
    execution_date DATE
);

-- 16. More Engagements for 2025
CREATE TABLE more_engagements_2025 (
    id INT PRIMARY KEY,
    operation_id INT REFERENCES operations(id),
    requested_amount BIGINT,
    justification TEXT
);
