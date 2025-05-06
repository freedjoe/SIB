# 📊 Workflow complet de l'exercice budgétaire (LOLF Algérie)

## 1. 📋 Prévision et Programmation Budgétaire

- Définition des grandes orientations (cadre de dépenses à moyen terme - CDMT).
- Recensement des besoins par les ministères et institutions.
- Élaboration des programmes budgétaires :
  - Portefeuilles → Programmes → Sous-programmes → Actions → Opérations.
- Estimation des dotations AE / CP par opération et année.

---

## 2. 🏛️ Élaboration de la Loi de Finances

- Consolidation des prévisions par le ministère des Finances.
- Arbitrage budgétaire (interne/interministériel).
- Élaboration du projet de loi de finances (PLF).
- Dépôt du PLF au Parlement.

---

## 3. 🗳️ Adoption de la Loi de Finances

- Débats parlementaires.
- Amendements éventuels.
- Vote et promulgation de la Loi de Finances.

---

## 4. 🧾 Création des Budgets Initiaux

- Création des titres budgétaires (budgets par ministère, wilaya, etc.).
- Ventilation des AE et CP :
  - Initialisation des opérations budgétaires.
  - Prévisions pluriannuelles des CP (via `operation_cps`).
- Notification des crédits aux ordonnateurs.

---

## 5. ⚙️ Exécution Budgétaire

### a. 💼 Engagements (AE)

- Signature de contrats, bons de commande.
- Enregistrement des engagements (AE engagée).
- Suivi des AE consommées.

### b. 💳 Paiements (CP)

- Ordonnancement puis paiement des dépenses.
- Paiement des CP liés aux engagements.
- Suivi des paiements réalisés (CP consommés).

---

## 6. 🧾 Réévaluations

- Révision des montants AE/CP alloués (hausse/baisse).
- Création d’entrées `revaluations` justifiant les ajustements.
- Mise à jour de l’opération.

---

## 7. 🆘 Demandes Hors Budget

- Dépôt d’une demande d’extension ou de régularisation (hors enveloppe initiale).
- Analyse et validation par les autorités compétentes.
- Intégration dans les revalorisations ou ajustements.

---

## 8. 📝 Suivi et Évaluation

- Calcul des taux d'exécution physique et financière.
- Suivi des indicateurs de performance.
- Rapports périodiques de suivi budgétaire.
- Audit / contrôle / reporting.

---

## 9. 📦 Clôture de l’Exercice

- Clôture administrative et comptable.
- Rapprochement AE / CP / engagements / paiements.
- Récupération des crédits non consommés (ou report).
- Préparation du rapport d’exécution pour l’exercice suivant.

---

# Workflow budgétaire : Opérations, AE, CP

## Création de l'opération

- Une opération est enregistrée dans un programme/action
- Elle contient les détails techniques, géographiques, financiers initiaux

## Allocation initiale (AE/CP)

- **AE (Autorisations d'Engagement)** : montant autorisé à engager
- **CP (Crédits de Paiement)** : montant disponible pour paiement sur une année donnée (pluriannuel possible via operation_cps)

## Engagements

- Représentent les décisions d'engager une partie ou la totalité de l'AE (contrats, bons de commande, etc.)
- L'engagement doit respecter les AE disponibles

## Paiements

- Les paiements sont réalisés sur CP disponibles, en lien avec des engagements
- Chaque paiement consomme une portion des CP

## Réévaluation

- Modification des AE (ou CP) d'une opération pour prendre en compte une révision de coût ou une extension du projet

## Demande hors budget

- Saisie exceptionnelle pour des besoins non couverts par l'enveloppe budgétaire initiale

## ✅ Types d'engagements (`type`) – Français 🇫🇷

| Code            | Nom complet                          | Description                                                                     |
| --------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| `juridique`     | Engagement juridique                 | Né d’un contrat, d’une commande ou d’un marché. Il engage juridiquement l'État. |
| `provisoire`    | Engagement provisoire                | Réservation budgétaire sans contrat signé, à régulariser.                       |
| `technique`     | Engagement technique                 | Utilisé à des fins de gestion ou pour bloquer des crédits temporairement.       |
| `pluriannuel`   | Engagement pluriannuel               | Lié à une opération s'étalant sur plusieurs années (souvent avec AE/CP).        |
| `reconduction`  | Engagement reconduit                 | Reprise d’un engagement d’un exercice antérieur (ex. non payé).                 |
| `réévaluation`  | Réévaluation (ou régularisation)     | Modification à la hausse d’un engagement existant.                              |
| `décaissement`  | Décaissement associé à un engagement | Souvent lié aux paiements d’une opération validée.                              |
| `réaffectation` | Réaffectation de crédits             | Déplacement d’un engagement vers une autre opération.                           |
| `hors_budget`   | Demande hors budget (exceptionnelle) | Cas particuliers nécessitant une régularisation ou validation exceptionnelle.   |

---

## ✅ Engagement Types (`type`) – English 🇬🇧

| Code           | English Name            | Description                                                                   |
| -------------- | ----------------------- | ----------------------------------------------------------------------------- |
| `legal`        | Legal Commitment        | A formal commitment arising from a contract, order, or signed agreement.      |
| `provisional`  | Provisional Commitment  | Temporary reservation of funds without a signed contract; to be regularized.  |
| `technical`    | Technical Commitment    | Used for internal management or temporary credit blocking.                    |
| `multiannual`  | Multiannual Commitment  | Related to projects spread across several fiscal years (commonly with AE/CP). |
| `carryover`    | Carried-over Commitment | Renewal of a previous year's engagement (e.g., unpaid from last year).        |
| `revaluation`  | Revaluation             | Increase or adjustment of an existing commitment.                             |
| `disbursement` | Disbursement            | Payment made based on a validated commitment.                                 |
| `reallocation` | Credit Reallocation     | Movement of committed funds to a different operation.                         |
| `off_budget`   | Off-Budget Request      | Exceptional case not covered in the initial budget; requires justification.   |

## ✅ Project Status (`project_status`)

| Code                | English Name      | Description                                                      |
| ------------------- | ----------------- | ---------------------------------------------------------------- |
| `not_started`       | Not Started       | The project is registered but no physical work has begun.        |
| `planned`           | Planned           | The project has been approved and is scheduled to begin.         |
| `in_progress`       | In Progress       | Execution or construction is currently underway.                 |
| `completed`         | Completed         | The project is fully finished.                                   |
| `on_hold`           | On Hold           | Work is temporarily stopped (e.g., due to external constraints). |
| `suspended`         | Suspended         | Work stopped indefinitely with no planned restart date.          |
| `delayed`           | Delayed           | The project is active but behind the original schedule.          |
| `canceled`          | Canceled          | The project has been permanently stopped and will not resume.    |
| `completely_frozen` | Completely Frozen | Entirely blocked (e.g., legally or administratively).            |
| `partially_frozen`  | Partially Frozen  | Some components of the project are frozen, others may continue.  |
