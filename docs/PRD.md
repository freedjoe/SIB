# Product Requirements Document (PRD) - SIGB

## 1. Introduction

SIGB est une application web moderne pour la gestion budgétaire et financière. L'application sera développée avec **React 19**, **ShadCN UI**, **Tailwind CSS**, et intégrée avec **Supabase** pour la base de données et l'authentification.

## 2. Technologies Utilisées

- **Front-end** : React 19, Vite, TypeScript, ShadCN UI, Tailwind CSS
- **Back-end** : Supabase (PostgreSQL, Auth, Storage)
- **UI/UX** : Dark/Light mode, Responsive (Desktop, Tablet, Mobile)
- **i18n** : Support multilingue (AR, EN, FR)
- **DevOps** : Supabase direct connection, environnement sécurisé avec `.env`

---

## 3. Authentification & Sécurité

- **Login / Signup** : Intégration avec Supabase Auth
- **Forgot Password** : Formulaire de récupération
- **JWT Tokens** : Stockage sécurisé
- **Roles & Permissions** : Admin, Utilisateur
- **Test** : Utilisateur par défaut `admin/admin`

---

## 4. Interface Utilisateur

### 4.1. Layout Principal

- **Top bar** :

  - Avatar utilisateur avec menu (Profil, Paramètres, Aide, Déconnexion)
  - Boutons : Notifications, Recherche globale, Mode Sombre/Clair, Sélecteur de langue (AR, EN, FR)

- **Menu latéral** :
  - Dashboard
  - Budgets
  - Programmes
  - Portefeuilles
  - Actions
  - Opérations
  - Engagements
  - Paiements
  - Rapports
  - Contrôles & Audits
  - Paramètres

---

## 5. Fonctionnalités Détailées

### 5.1. Dashboard

- Exécution du budget : **Mensuel, Trimestriel, Annuel**
- Répartition par **Portefeuille de programme** et **Ministres**
- Allocation par programme
- Approbations en attente
- Activités récentes

### 5.2. Budgets

- Actions : **Voir, Éditer, Supprimer, Ajouter** (Fenêtre Modal)
- Onglets : **Aperçu, Prévision, Allocation, Historique**

### 5.3. Programmes

- Réorganisation des onglets (**Portefeuilles après Programmes**)
- Actions : **Voir, Éditer, Supprimer, Ajouter** (Fenêtre Modal)
- Détails d'un programme : **Popup avec détails, actions et opérations**

### 5.4. Portefeuilles

- Actions : **Voir, Éditer, Supprimer, Ajouter** (Fenêtre Modal)
- **Voir un portefeuille** : Redirige vers **Programmes** avec filtre appliqué

### 5.5. Actions

- Table : `action_id (PK), programme_id (FK), nom, type_action, montant_alloué`
- Actions : **Voir, Éditer, Supprimer, Ajouter** (Fenêtre Modal)
- Voir les détails : **Popup avec opérations liées**

### 5.6. Opérations

- Actions : **Voir, Éditer, Supprimer, Ajouter** (Fenêtre Modal)

### 5.7. Engagements

- Onglets : **Liste des Engagements, Approbations en Attente**
- Engagements : `operation, bénéficiaire, montant demandé, montant approuvé, statut`
- Approbations : `priorité, détail engagement, demandé par, montant, date`
- Actions : **Voir, Éditer, Supprimer, Ajouter** (Fenêtre Modal)

### 5.8. Paiements

- Actions : **Voir, Éditer, Supprimer, Ajouter** (Fenêtre Modal)

### 5.9. Rapports

- Rapport d'Exécution Budgétaire (**Quotidien**)
- Rapport d'Allocation par Ministère (**Hebdomadaire**)
- Rapport Financier Annuel
- Exécution Budgétaire (**Mensuel, Trimestriel, Annuel**)
- Répartition Budgétaire par Ministère

### 5.10. Contrôles & Audits

- **Rapport des Contrôles Financiers** : `date, type de contrôle, entité, contrôleur, résultat`
- **Logs d'audit**
- Actions : **Voir, Éditer, Supprimer, Ajouter** (Fenêtre Modal)

### 5.11. Paramètres

- **Basic Data** : Ministères, Utilisateurs, Rôles
- **Profil utilisateur** : Modifier profil et changer mot de passe
- **Aide & Support**
- **Conditions Générales**

---

## 6. Design & Expérience Utilisateur

- **Mode Sombre/Clair** avec **bouton de bascule**
- **Menu langues** avec **drapeaux (🇩🇿 🇺🇸 🇫🇷)**
- **UI moderne avec ShadCN et Tailwind**
- **Expérience fluide sur Desktop, Tablet, Mobile**

---

## 7. Tests & Validation

- Création de **10 enregistrements par table** pour tester
- Vérification de **tous les boutons, actions et fenêtres modales**
- Test des **requêtes Supabase (CRUD)**
- **Déploiement sur Vercel ou autre plateforme**

---

## 8. Base de Données (Supabase)

### Connexion :

```
POSTGRESQL_URL=postgresql://postgres:Admin@2014@db.iubymohnsgnmmxncroqs.supabase.co:5432/postgres
```

### Variables d'environnement :

```
REACT_APP_SUPABASE_URL=https://iubymohnsgnmmxncroqs.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
```

---

## 9. Déploiement & Hébergement

- **Utilisation de Vercel** pour le front-end
- **Base de données Supabase hébergée**
- **Configuration CI/CD** avec GitHub Actions

---

## 10. Roadmap

✅ Initialisation du projet (React 19 + ShadCN + Tailwind)
✅ Configuration de Supabase (DB, Auth, Storage)
✅ Création des interfaces UI/UX
🚧 Développement des modules
🚧 Tests et validation
🚧 Déploiement final

---

## 11. Améliorations Futures

- **Dashboard interactif avec Graphs & Stats**
- **Mode offline avec IndexedDB**
- **Automatisation des rapports**

---

🎯 **SIGB sera une plateforme moderne, fluide et intuitive pour la gestion budgétaire et financière !** 🚀
3.5. Commitments Module
Commitment Table: Requested amount, approved amount, status

Add a Commitment:

Select a Program

Enter requested amount

Workflow approval process

Detailed View: Modal showing historical records and associated documents

Approval by Officer: The officer approves or rejects the commitments

Budget Allocation Check: Automatic check for budget availability before approval

3.6. Payment Module
Payment Table: Displays liquidated and paid commitments

Payment Validation: Multi-level workflow (payment order, verification, final approval)

PDF Export: Report of payments made

Payment Request:

Submit payment requests for due claims, with the option to choose the frequency (monthly, quarterly, annually)

Requests are allocated from the available payment credit, with consumption tracking

3.7. Reports Module
List of Generated Reports: Executed budget, Allocation by ministry

Advanced Filters: Date, Category, Ministry, Payment status

Export to Excel/PDF

Performance Reports: Financial indicators and analysis of budget vs. actual spending discrepancies

3.8. Settings & Administration
User Management: Add, Delete, Assign roles

Roles: Administrator, Officer, Accountant, Standard user

Permissions: Define allowed actions per role (CRUD on budgets, payments, commitments, reports)

System Configuration: Budget period, Currency

Logs & Audit: User action history (create, modify, delete)

Payment Credit Management: Track available credits for payment requests

3.9. Officer & Accountant Module
Submit Payment Requests:

Officers and accountants can submit monthly, quarterly, or annual payment requests for payments to be made. They can specify the amount to be allocated and the frequency.

Each payment request is validated against the available budget and payment credit.

Integrated payment validation workflow (validation by officer and then by accountant).

Track Payment Requests:

Track the status of requests (Pending, Approved, Rejected).

Automatic notifications for actions required at each step of the validation process.

3.5. Commitments Module
Commitment Table: Requested amount, approved amount, status

Add a Commitment:

Select a Program

Enter requested amount

Workflow approval process

Detailed View: Modal showing historical records and associated documents

Approval by Officer: The officer approves or rejects the commitments

Budget Allocation Check: Automatic check for budget availability before approval

3.6. Payment Module
Payment Table: Displays liquidated and paid commitments

Payment Validation: Multi-level workflow (payment order, verification, final approval)

PDF Export: Report of payments made

Payment Request:

Submit payment requests for due claims, with the option to choose the frequency (monthly, quarterly, annually)

Requests are allocated from the available payment credit, with consumption tracking

3.7. Reports Module
List of Generated Reports: Executed budget, Allocation by ministry

Advanced Filters: Date, Category, Ministry, Payment status

Export to Excel/PDF

Performance Reports: Financial indicators and analysis of budget vs. actual spending discrepancies

3.8. Settings & Administration
User Management: Add, Delete, Assign roles

Roles: Administrator, Officer, Accountant, Standard user

Permissions: Define allowed actions per role (CRUD on budgets, payments, commitments, reports)

System Configuration: Budget period, Currency

Logs & Audit: User action history (create, modify, delete)

Payment Credit Management: Track available credits for payment requests

3.9. Officer & Accountant Module
Submit Payment Requests:

Officers and accountants can submit monthly, quarterly, or annual payment requests for payments to be made. They can specify the amount to be allocated and the frequency.

Each payment request is validated against the available budget and payment credit.

Integrated payment validation workflow (validation by officer and then by accountant).

Track Payment Requests:

Track the status of requests (Pending, Approved, Rejected).

Automatic notifications for actions required at each step of the validation process.

3.10. Module: Prévisions des Dépenses - CP à Mobiliser
Overview: This module allows users to forecast the expenses required to mobilize specific amounts of Credits de Paiement (CP). It enables better planning and tracking of funds that are forecasted but not yet mobilized.

Actions:

Add Forecasted Expense: Modal with a form to create a new forecasted expense entry. (Fields: Program Name, Forecasted Amount, Period, Ministry, Category)

Edit Forecasted Expense: Edit button with pre-filled fields to update the details of the forecasted expense.

Delete Forecasted Expense: Delete button with confirmation to remove a forecasted expense entry.

Forecast Display:

Monthly/Quarterly/Annually: Ability to forecast expenditures based on time periods.

CP to Mobilize: Display of available Credits de Paiement and the required mobilization for each forecasted expense.

Consumption Tracking: Monitoring of how much CP has been mobilized versus what was forecasted.

Budget Allocation & CP:

Linking Forecast to Budget: Each forecasted expense entry is linked to a specific program and budget allocation. This ensures that the forecast is realistic based on the available funds.

Tracking Mobilized CP: Real-time tracking of CP mobilized against the forecasted amounts. Alerts and notifications when the mobilization of CP is below the forecasted amounts.

Générer des données de test

Pour les exercices 2023 et 2024 avec toutes les relations (Dashboard → Budget → Portefeuille → Programme → Action → Opération → Engagement → Paiement → Demande de paiement → Prévision CP).

Injecter ces données dans Supabase

Création de scripts SQL pour insérer les données réelles dans la base Supabase.

Suppression de toutes les données mockées dans le code.

Affichage dans l’application

Modifier le code pour récupérer les données depuis Supabase au lieu d’utiliser des mocks.

### **3.X. Module Réévaluation des Engagements**

#### 📌 **Objectif :**

Permettre aux ordonnateurs et responsables budgétaires de **formuler, suivre et justifier une demande de réévaluation** sur un engagement existant, en conformité avec les procédures de la DGB.

---

#### 🧩 **Fonctionnalités principales :**

| Fonction                          | Description                                                               |
| --------------------------------- | ------------------------------------------------------------------------- |
| 🔁 **Créer une demande**          | Permet de demander une réévaluation pour un engagement validé             |
| 📄 **Ajouter un justificatif**    | Téléversement de documents (note de service, devis, analyse technique...) |
| 🧮 **Saisir le montant réévalué** | Champ de saisie du nouveau montant demandé                                |
| 📆 **Date de réévaluation**       | Sélection automatique ou manuelle                                         |
| 🗂️ **Suivi du statut**            | En attente, approuvée, rejetée, modifiée                                  |
| 🔐 **Validation multi-niveaux**   | DAF > DG/Ministère > DGB selon les seuils                                 |
| 🧾 **Historique des révisions**   | Liste chronologique des demandes et décisions précédentes                 |

---

#### 🧾 **Champs nécessaires (base de données)**

| Champ                   | Type     | Description                              |
| ----------------------- | -------- | ---------------------------------------- |
| `engagement_id`         | UUID     | Clé étrangère vers l’engagement concerné |
| `montant_initial`       | Numeric  | Montant initial de l’engagement          |
| `montant_reévalué`      | Numeric  | Montant demandé après révision           |
| `motif_reévaluation`    | Text     | Justification de la demande              |
| `document_justificatif` | File/URL | Lien vers le document téléversé          |
| `statut_reévaluation`   | Enum     | En attente / Approuvée / Rejetée         |
| `date_reévaluation`     | Date     | Date de la demande                       |
| `validé_par`            | Text     | Nom/fonction du validateur               |
| `date_validation`       | Date     | Date de décision                         |

---

#### 🧭 **Workflow Métier**

```mermaid
graph TD
    A[Engagement Validé] --> B[Demande de Réévaluation]
    B --> C{Justificatif + Montant Réévalué}
    C --> D[Transmission à la DAF]
    D --> E[Validation DGB / Autorité]
    E --> F{Approuvée / Rejetée}
    F --> G[Mise à jour de l’engagement]
    F --> H[Archivage de la demande]
```

---

#### 🎯 **Rôle dans le système SIB**

- Permet une **meilleure transparence** sur l’évolution des montants engagés.
- Répond à la réalité du terrain où les coûts évoluent (inflation, aléas techniques...).
- Renforce la **traçabilité budgétaire** et l’évaluation des besoins réels.
- Intégré aux modules :
  - **Engagements** (accès via bouton “Réévaluer”)
  - **Prévisions CP** (mise à jour automatique)
  - **Notifications** (workflow de validation)
  - **Audit & Logs** (traçabilité complète)

## 🔧 **Extension au PRD : Module Prévisions & Mobilisation des CP**

### 📌 **Objectif**

Permettre aux utilisateurs de :

- Planifier les crédits nécessaires au règlement des engagements.
- Demander officiellement la **mobilisation des CP** auprès de la DGB.
- Suivre en temps réel l’évolution des **CP prévus, mobilisés et consommés**.
- Anticiper les **écarts ou retards de mobilisation**.

---

### 🧩 **Fonctionnalités principales**

| Fonctionnalité                  | Description                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 📅 **Prévisions périodiques**   | L’utilisateur saisit les prévisions CP par programme ou opération, avec une répartition mensuelle/trimestrielle. |
| 🧾 **Demande de mobilisation**  | Formulaire dédié pour transmettre à la DGB une demande de mise à disposition des CP.                             |
| 🔄 **Suivi de la mobilisation** | Affiche les montants mobilisés vs montants prévus avec visualisation des écarts.                                 |
| 📊 **Tableaux & Graphiques**    | Vue synthétique avec filtres (ministère, programme, période, statut).                                            |
| 🔔 **Alertes automatiques**     | Notifie l’utilisateur si les montants mobilisés sont en retard ou inférieurs aux besoins.                        |

---

### 🧾 **Champs de la table `prevision_cp` étendue**

| Champ              | Type    | Description                                                           |
| ------------------ | ------- | --------------------------------------------------------------------- |
| `id`               | UUID    | Identifiant unique                                                    |
| `programme_id`     | UUID    | Clé étrangère vers le programme concerné                              |
| `exercice`         | INT     | Année concernée                                                       |
| `periode`          | VARCHAR | Mois ou trimestre (ex: `2024-Q1`)                                     |
| `montant_prevu`    | DECIMAL | Montant prévu de CP                                                   |
| `montant_demande`  | DECIMAL | Montant de CP demandé à la DGB                                        |
| `montant_mobilise` | DECIMAL | Montant effectivement mobilisé                                        |
| `montant_consomme` | DECIMAL | Montant payé sur les CP mobilisés                                     |
| `statut`           | ENUM    | `prévu`, `demandé`, `mobilisé`, `en retard`, `partiellement mobilisé` |
| `date_soumission`  | DATE    | Date d’envoi de la demande de mobilisation                            |
| `notes`            | TEXT    | Commentaires ou précisions                                            |

---

### 🔁 **Workflow de Mobilisation des CP**

```mermaid
graph TD
    A[Prévision CP par Programme] --> B[Demande de mobilisation envoyée]
    B --> C[Réception par DGB]
    C --> D{Montant disponible ?}
    D -- Oui --> E[CP Mobilisés]
    D -- Non --> F[Notification de refus/ajustement]
    E --> G[Mise à jour du tableau des CP]
    G --> H[Engagement payé via Paiement]
```

---

### 📈 **Écrans proposés dans l’application**

#### 🔍 **Vue Liste Prévisions CP**

- Filtres : Exercice, Ministère, Programme, Période, Statut
- Colonnes : Exercice | Programme | Période | Montant prévu | Mobilisé | Consommé | Écart

#### 📝 **Formulaire de Demande de Mobilisation**

- Programme (auto rempli)
- Montant demandé
- Période concernée
- Justificatif à joindre (optionnel)
- Bouton “Soumettre à la DGB”

#### 📊 **Graphique de Suivi CP**

- Ligne : CP Prévu
- Barre : CP Mobilisé
- Ligne pointillée : CP Consommé

---

### 🔐 **Rôles utilisateurs impliqués**

| Rôle        | Droits spécifiques                               |
| ----------- | ------------------------------------------------ |
| Ordonnateur | Créer une prévision, soumettre une demande de CP |
| DAF         | Valider les demandes avant transmission          |
| DGB         | Mobiliser les CP, modifier les montants          |
| Auditeur    | Lire toutes les lignes CP et leurs statuts       |

Nouveaux champs suggérés par les fichiers
wilaya : utile pour la répartition géographique

code, code_action, code_operation

titre_budgetaire (titre 1, 2, 3, 4)

statut_demande : En attente / Validée / Rejetée

origine_financement : Budget national / Financement externe

🎯 5. Finalité métier alignée avec la LOLF
Centralisation des projets budgétaires multi-ministères

Traçabilité de l'exécution de la ligne budgétaire jusqu'au paiement

Suivi multi-niveaux et analytique (par wilaya, secteur, programme)

Contrôle de la mobilisation et consommation des CP (crédits de paiement)

### **4.X. Historique de modifications et traçabilité**

Afin de garantir une **traçabilité complète des actions budgétaires** conformément aux exigences de la LOLF, le système SIB doit enregistrer **l’ensemble des modifications appliquées** aux entités financières sensibles (engagements, prévisions, paiements...).

#### 🔁 Historique des réévaluations :

- Chaque engagement peut faire l’objet de **plusieurs réévaluations successives**.
- Le système doit conserver :
  - Le **montant initial**
  - Chaque **demande de réévaluation** (avec date, motif, montant proposé, validation)
  - L’**auteur** de la demande et le **décideur**
- Chaque modification sera historisée avec un **horodatage** clair et une **signature fonctionnelle** (ex. DAF, DG, DGB).

#### 🧾 Journal des modifications (Audit Log) :

- Applicable à : Engagements, Paiements, Prévisions CP, Demandes de CP
- Contenu :
  - Avant / après des champs modifiés
  - Utilisateur initiateur
  - Date et heure de l’opération
  - Justificatif (si requis)

🎯 Cela renforce :

- La **transparence administrative**
- Le **contrôle a posteriori** par la DGB, IGF ou Cour des Comptes
- La capacité de **justifier les écarts financiers**

### **4.X. Données manquantes et optimisations à intégrer**

L’analyse des fichiers budgétaires réels a permis d’identifier plusieurs **champs essentiels non encore pris en compte** dans le système SIB actuel. Leur ajout est indispensable pour assurer une **traçabilité complète**, une **analyse plus fine**, et une **conformité accrue avec la LOLF**.

#### 🧾 Champs à ajouter :

- `wilaya` : localisation géographique du projet ou de l’opération.
- `code`, `code_action`, `code_operation` : identification uniforme des entités budgétaires.
- `titre_budgetaire` : classification par titre (1 : fonctionnement, 2 : équipement, etc.).
- `statut_demande` : état d'avancement d’une demande (En attente / Validée / Rejetée).
- `origine_financement` : source (Budget national / Financement extérieur).

#### 🎯 Finalité métier alignée avec la LOLF :

- Centralisation multi-niveaux des projets budgétaires.
- Traçabilité complète de l’exécution du budget jusqu’au paiement.
- Suivi analytique par structure, secteur et région.
- Contrôle rigoureux de la mobilisation et consommation des **crédits de paiement (CP)**.

### 📘 **Classification par titres budgétaires (titre_budgetaire)**

| Titre | Intitulé                                | Description principale                                   |
| ----- | --------------------------------------- | -------------------------------------------------------- |
| 1     | **Dépenses de fonctionnement**          | Dépenses courantes (salaires, loyers, fournitures, etc.) |
| 2     | **Dépenses d’équipement public**        | Investissements de l’État (infrastructures, matériel…)   |
| 3     | **Dépenses en capital (ou transferts)** | Subventions d’équipement, avances, transferts de capital |
| 4     | **Charge de la dette publique**         | Remboursement du principal et paiement des intérêts      |
| 5     | **Dépenses exceptionnelles**            | Catégorie spéciale pour événements ou dépenses imprévues |

---

### 📝 Remarques :

- Les titres **1 et 2** sont les plus fréquemment utilisés au niveau des **engagements et paiements ministériels**.
- Les titres **3 et 4** sont gérés plus centralement (Trésor, Finances).
- Certains documents parlent uniquement de **Titres 1 à 3**, selon le périmètre de l'institution.
