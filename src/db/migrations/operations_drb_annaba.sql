CREATE TABLE "operations" (
    "DRB"	VARCHAR(512),
    "Province"	VARCHAR(512),
    "Program_Type"	VARCHAR(512),
    "Number"	VARCHAR(512),
    "Project_Identification"	VARCHAR(512),
    "Program_Portfolio"	VARCHAR(512),
    "Beneficiary_Municipalities"	VARCHAR(512),
    "Amount_AP_103_DA"	INT,
    "Cumulative_Commitments"	VARCHAR(512),
    "Cumulative_Payments"	VARCHAR(512),
    "Project_Owner"	VARCHAR(512),
    "Project_By_Lot"	VARCHAR(512),
    "Companies_In_Charge"	VARCHAR(512),
    "Project_Impacts"	VARCHAR(512),
    "Physical_Progress_Rate"	VARCHAR(512),
    "Financial_Rate"	VARCHAR(512),
    "Implementation_Period"	VARCHAR(512),
    "Expected_Delivery_Date"	VARCHAR(512),
    "Direct_Jobs_Expected"	VARCHAR(512),
    "Indirect_Jobs_Expected"	VARCHAR(512),
    "Constraints_Encountered"	VARCHAR(512),
    "Proposed_Solutions"	VARCHAR(512),
    "Observations"	VARCHAR(512)
);

INSERT INTO "operations" (
    "DRB", "Province", "Program_Type", "Number", "Project_Identification", 
    "Program_Portfolio", "Beneficiary_Municipalities", "Amount_AP_103_DA", 
    "Cumulative_Commitments", "Cumulative_Payments", "Project_Owner", 
    "Project_By_Lot", "Companies_In_Charge", "Project_Impacts", 
    "Physical_Progress_Rate", "Financial_Rate", "Implementation_Period", 
    "Expected_Delivery_Date", "Direct_Jobs_Expected", "Indirect_Jobs_Expected", 
    "Constraints_Encountered", "Proposed_Solutions", "Observations"
) VALUES
	('Annaba', '23-Annaba', 'PSD', '1', 'N1 005 017 02 4823 000 023 11 008
Etude et réalisation d\'un système de vidéosurveillance de la wilaya de Annaba', '5', 'W.ANNABA', '6700000', '', '4182054.487', 'DEP', '1- les zone du système de vidéosurveillance
2- Extension du système de vidéosurveillance
3- Extension les zone du système de vidéosurveillance
4- Raccordement en energie electrique des camera de survillance', '1- S.A.D.E.G
2- EPIC-ERSV
3- EPW AM-UR
4- EPE-SPA ALGERIE TELECOM', 'Sécurité, ordre public, prévention et intervention pour la wilaya d\'annaba', '0.65', '0.624187237', '24 mois', '2026', '/', '/', '/', '/', 'En cours'),
	('Annaba', '23-Annaba', 'PSD', '2', 'N1 005 020 01 4823 000 023 08 006
Etude, réalisation et équipement d’un centre national de formation et de perfectionnement et de recyclage du personnel des collectivités locales à El Bouni, Annaba', '6', 'EL BOUNI', '4537000', '', '2543494.243', 'DAL', '1- LOT ESPACE VERT
2- LOT TERRAINS DES SPORT
3- Reste à   Réaliser Bloc N°05  : l’Auditorium capacité  845 places, corps d’état secondaires
4- Reste à Réaliser Bloc 07 hébergement R+9 avec cage d\'escalier (type A)', '1- yaala sofiane
2- sidrati khalifa
3- ETPBH MENDOUCHE LAMRI', 'formé et recyclage du personnel des collectivités locales ', '0.8', '0.560611471', '18 mois', '2026', '/', '/', '/', '/', 'En cours'),
	('Annaba', '23-Annaba', 'PSD', '3', 'N1 006 021 01 4023 000 023 04 001
Etude, réalisation et équipement d\'une cour de justice à Annaba', '5', 'ANNABA', '4457000', '', '2665334.629', 'DEP', '1- realisation du rest a realiser  cour de justice a annaba', '1- ETPBH MENDOUCHE LAMRI', 'une cour de justice à Annaba', '0.8', '0.598010911', '18 mois', '2026', '/', '/', '/', '/', 'En cours'),
	('Annaba', '23-Annaba', 'PSD', '4', 'Etude et taravaux de mise à niveau de la station d\'épuration d\'annaba y compris l\'amélioration de la collecte des eaux usées et les infrastructures de transfert des eaux épurées vers le périmétre agricole de Bounamoussa et le complexe d\'EL Hadjar (Wilaya d\'Annaba) ', '3', 'EL HADJAR', '62000000', '', '4813054.186', 'DRE', '1-Travaux de réalisation des systèmes de traitementvtertiaire et d\'une station de pompage pour la production d\'eau industrielle pour le complexe Sider et agricole pour le périmetre agricole de Bounamoussa
2- travaux de transfert et d\'adduction des eaux traitées au profit du complexe Sider avec ouvrages de réception', '1- EURL POWER HYDRAULIQUE 
2- EURL TGCTP', 'la protection contre l innondation', '0.05', '0', '2 ans', '46113', '/', '/', '/', '/', 'en cours'),
	('Annaba', '23-Annaba', 'PSD', '5', 'N1 024 090 01 2023 000 023 24 003
Dédoublement de la RN21 entre El Hadjar et la limite de la wilaya de Guelma sur 18 Kms (1 ere Tranche) (W d\'Annaba)
', 'Travaux Publics', 'EL hadjar- Ain Berda', '2250000', '', '961960.3355', 'DTP', ' lot 01: Réalisation d\'une passerelle au pk 7+580', 'EURL E,T,P,B,H,S Bouzida', '', '0.05', '0', '3 mois', '/', '/', '/', '/', '/', ''),
	('Annaba', '23-Annaba', 'PSD', '', '', '', '', '', '', '0', '', ' lot 02: Réalisation d\'une passerelle au pk 13+950', 'Entreprise publique Economique Societe par Actions SAPTA', '', '', '', '3 mois', '', '', '', '', '', ''),
	('Annaba', '23-Annaba', 'PSD', '', '', '', '', '', '', '0', '', 'Lot 03: Réalisation d\'une passerelle au pk 17+200', '', '', '', '', '', '', '', '', '', '', ''),
	('Annaba', '23-Annaba', 'PSD', '6', 'N1 024 090 01 4023 000 023 08 006
Etude et réalisation d\'un chemin communal y compris les ouvrages d\'art reliant Ras El Hamra à Oued Begrat sur 08 km Annaba et Seraidi.', 'Travaux Publics', 'Annaba', '5650000', '', '3046552.478', 'DTP', 'Lot 01: Realisation d\'un chemin communal reliant RAS EL Hamra a oued Begrat ( accés sud)', 'ETP: BEN ZAMIA ', '', '0.4', '0.54', '11 mois', '/', '/', '/', '/', '/', '/'),
	('Annaba', '23-Annaba', 'PSD', '', '', '', '', '', '', '0', '', 'Lot 2 : Réalisation d\'un chemin communal y compris les ouvrages d\'art reliant Ras el hamra à Oued Begrat sur 06 km ', 'ETP : Groupement  GRTOB ( ALTRO / SAPTA)', '', '', '', '27 mois ', '', '', '', '', '', ''),
	('Annaba', '23-Annaba', 'PSD', '', '', '', '', '', '', '0', '', 'parachevement de la réalisation d\'un chemin communal reliant Ras el hamra à Oued Begrat sur 06 km ( rest à réaliser du lot 02)', 'ETP : SARL ETPH BENATTIA', '', '', '', '14mois', '', '', '', '', '', ''),
	('Annaba', '23-Annaba', 'PSD', '7', 'N1 024 091 01 4023 000 023 09 001
Etude et Réalisation d\'un parking avion E pour la nouvelle aérogare de Annaba', 'Travaux Publics', ' EL BOUNI ', '5056000', '', '4438680.718', 'DTP ', 'lots 01: Travaux de réhabilitation ', 'Groupement abrantina - ALTRO', '', '1', '0.88', '11 mois', '/', '/', '/', '/', '/', '/'),
	('Annaba', '23-Annaba', 'PSD', '', '', '', '', '', '', '0', '', 'lots 02: Travaux d\'extention ', 'Lavantina ingenieria y construccion , S,L ( LIC)', '', '', '', '34 mois', '', '', '', '', '', ''),
	('Annaba', '23-Annaba', 'PSD', '', '', '', '', '', '', '0', '', 'lot03 : parachevement de l\'extension du parkinge avion E', 'Groupement star route seghir abd elmadjid ', '', '', '', '7 mois', '', '', '', '', '', ''),
	('Annaba', '24-Guelma', 'PSC', '1', 'Réalisation du dédoublement de la RN 16 entre la limite de la wilaya de Souk ahras et la limite de la wilaya de Tarf via l\'autoroute Est/Ouest sur 42 Km ', 'travaux publics ', 'BOUCHEGOUF MDJEZ SAFA AIN TAHMMIMIN BOUCHEGOUF AIN BEN BAIDA  OUED FRAGHA ', '7638', '', '4146876.175', 'DTP', '', 'lot 01 : SARL GTR EL DJAZIRA EL ARABIA       lot 02: TRENTERAP  Lot 02: EPTER SUD -EST -BATNA - lot 03: SARL GTR EL DJAZIRA EL ARABIA    ', 'améliorer le niveau de service de la route et assurer l\'accés rapide à l\'autouroute EST -OUEST et assurer la continuité du dédoublement de la RN 16 et eviter l\'empietement des deux cimetiéres et la traversée de la zone de glissement ', '0.52', '51,77%', '22 mois ', '1 er trimestre 2027                    ', '25', '/', '_ présence des différents réseaux dans l\'emprise du projet                _ difficulté d\'approvisionement  en matériaux de remblais          
_ opposition des proprétaires des terrains touchés ', '_ Toutes les mesures ont été prises pour la prise en charge des déplacements des réseaux 
   _  Octroi des autorisations d\'exploitation des gites d\'emprunt au profit des entreprises    _  enquete parcellaire en cours pour l\'indemnisation des proprétaires ', ' suite à l\'accord pour la réévaluation de l\'opération  au titre de l\'exercice 2025, un avis d\'appel d\'offre a été lancé .                                pour  l\'achevement de la RN 16    lot 03 : attribution provisoire en cours  et                         lot 01 : attribution provisoire en cours '),
	('Annaba', '24-Guelma', 'PSC', '2', 'Réalisation d\'un viaduc sur RN 16 au PK 69+800(wilaya de guelma)', 'travaux publics ', ' AIN TAHMMIMIN ', '1760', '', '/', 'DTP', '', 'ENGOA   ALGER', '', '/', '/', '20 mois', '1er trimestre 2027', '40', '/', '', '', 'marché en cours de visa au niveau de la  commission séctorielle des marchés publics des travaux publics '),
	('Annaba', '36-El Tarf', 'PSD', '1', 'Etude et réalisation de 2000 places pédagogiques', 'Enseignement supérieur et recherche scientifique', 'EL TARF', '1545300', '', '371983', 'equipement publique', '', '', 'Création d’un nouveau pole', '0.3', '0.240718954', '', '2026', '/', '/', '/', '/', 'Procédure en cours'),
	('Annaba', '36-El Tarf', 'PSD', '2', 'Suivi et réalisation de 2000 Lits d\'hébergement à El-Tarf', 'Enseignement supérieur et recherche scientifique', 'EL TARF', '2379640', '', '1450008.09', 'equipement publique', '', 'EURL TALIAA,GROUPEMENT HITECH ,', '', '0.85', '0.609339266', '24 MOIS', '45901', '20', '50', '/', '/', 'en cours'),
	('Annaba', '36-El Tarf', 'PSD', '3', 'Suivi et réalisation d\'un restaurant central à El-Tarf', 'Enseignement supérieur et recherche scientifique', 'EL TARF', '370000', '', '258952.37', 'equipement publique', '', 'bouzergui soufiane', '', '0.95', '0.69987127', '18 mois', '45901', '30', '40', '/', '/', 'en cours'),
	('Annaba', '36-El Tarf', 'PSD', '4', 'Etude et réalisation de 1500 lits', 'Enseignement supérieur et recherche scientifique', 'EL TARF', '1600800', '', '172605.2', 'equipement publique', '', '', '', '0.15', '0.107824338', '', '2026', '/', '/', '/', '/', 'Procédure en cours'),
	('Annaba', '36-El Tarf', 'PSD', '5', 'Viabilisation et aménagement du pôle universitaire', 'Enseignement supérieur et recherche scientifique', 'EL TARF', '900000', '', '104622.65', 'equipement publique', '', 'ami kheiredine , chloufi mounir', '', '0.15', '0.116247389', '15 mois', '45901', '28', '40', '/', '/', 'en cours'),
	('Annaba', '36-El Tarf', 'PSD', '6', 'Suivi et réalisation de 4000 places pédagogiques à El-Tarf', 'Enseignement supérieur et recherche scientifique', 'EL TARF', '1800000', '', '0', 'equipement publique', '', '', '', '0', '0', '/', '/', '/', '/', 'Insuffisance d’ AE ', ' ( demande de réévaluation )  1,958,025,000,00', 'Procédure en cours'),
	('Annaba', '36-El Tarf', 'PSD', '7', 'Etude d’adaptation, suivi control et travaux de réalisation et équipement de 03 centres de proximité pour le stockage intermédiaire des céréales au niveau de la wilaya d’EL Tarf', 'Agriculture et de dévlopement rural', 'Bouhadjar  ain assel , Ben mhidi ', '758914', '', '228518', 'equipement publique', '', 'bouzergui soufiane,batimital , ami kheiredine ', 'augmentation de stockage ', 'Bouhadjar   80% Ain assel 70%,Ben mhidi 100%', '0.301111852', '6 mois', '45748', '50', '90', 'Insuffisance d’ AE', 'Demande de réévaluation d’un montant 222 106 716 da', 'en cours'),
	('Annaba', '36-El Tarf', 'PSD', '8', 'Suivi et réalisation d’une zone industrielle à matrouha wilaya de EL Tarf  ( tranche 1 )', 'industrie', 'EL TARF', '500000', '', '435042', 'Urbanisme , de l\'architecture et de construction', '', 'ETP maizi mohamed redha , dida, moundir nabil', 'Création pole industrielle Encouragement de l’investissement privé              Création de richesse', '0.95', '0.870084', '15 mois', '2 t 2025', '80', '150', 'Insuffisance d’ AE', 'Demande de réévaluation d’un montant 318.606.000 da', 'en cours'),
	('Annaba', '36-El Tarf', 'PSC', '1', 'Projet de réalisation de la line ferroviaire chibaita moukhtar .drean . chihani', 'Travaux publics ', 'chibaita moukhtar .drean . chihani', '548554', '', '', 'ANESRIF', '', 'Cosider OA      INFRAFER , INFRARAIL , ENGOA , GCB,SERO EST', 'La ligne ferroviaire miniére est à partir du port d\'annaba jusqua\' au gisement de blede hadba sur un finéaire total de 422 km traversant les territoire de cinq wilayas annaba el tarf geulma souk ahras et tebessa l\'objectif principal de ce projet et d\'augmenter la capacité de cette ligne miniére actuellement de l\'ordre de 03 millions de tonnes pour un besoin future en premiére phase de l\'onrdre de 13,5 million de tonnes /an a l\'horizon 2027 et ce par rapport aux implantations industrielles et economiques existantes et future notamment le gisement de phosphate de bledhadba ppi et la mineral de fer prévenant des gisements de boukhadra et ouenza', '0.4619', '0.387', '30 mois', '46061', '1072', '274', 'L’existence de 70 construction des EAC terrain privé ( relogement de 43 familles –démolition de 54 construction libration du couloir', 'relogement de 43 familles –démolition de 54 construction libration du couloir', ''),
	('Annaba', '36-El Tarf', 'PSC', '2', 'Réalisation de la station eau dessalement des eaux de mer', 'Hydraulique ', 'W-EL TARF ,Geulma ,Annaba , Skikda', '400 millions de dollar', '', '/', 'société Miah EL tarf', '', 'Groupement SARPI spa  et ENAC spa', 'Renforcé et sécurisé le complexe hydraulique et besoin en eau de wilaya', '0.95', '0', '25 mois', '45714', '400', '900', '/', '/', ''),
	('Annaba', '36-El Tarf', 'PSC', '3', 'Travaux de raccordement à Laval  de la station de dessalement d’eau de mer . D’EL TARF   lot 0 01 : SDEM ver ANNABA', 'Hydraulique ', 'Wilaya ANNABA', '15778292', '', '/', 'ADE', '', 'COSIDER', 'Alimentation en eau potable quatre wilaya Annaba, EL tarf , Geulma , et skikda ', '1', '0.7', '14 MOIS', 'FIN décembre 2024', '300', '450', '/', '/', ''),
	('Annaba', '36-El Tarf', 'PSC', '4', 'Travaux de raccordement à Laval  de la station de dessalement d’eau de mer . D’EL TARF Lot n 2 : SDEM ver RMC', 'Hydraulique ', 'Wilaya ANNABA', '12741089', '', '/', 'ADE', '', 'Groupe Gerhyd', '', '1', '0.75', '14 MOIS', 'FIN décembre 2024', '220', '310', '/', '/', ''),
	('Annaba', '36-El Tarf', 'PSC', '', 'Travaux de raccordement à Laval  de la station de dessalement d’eau de mer . D’EL TARF LOT n 03-1 : RMC LAC DES OISEAUX VERS MEXA ', 'Hydraulique ', 'Cheffia,lac des oiseaux , bouteldja, berrihanne , el tarf ,geurgour ,zitouna', '4381982', '', '/', 'ADE', '', 'eurl eatah', '', '0.43', '0.324', '45778', '', '80', '120', 'Remonter des eaux de la nappe intempérie et impraticabilité de terrain', 'Les autorité ont facilité  des terrains l’obtention nécessaire à l’installation  de centrales à béton et de bases de vie', ''),
	('Annaba', '36-El Tarf', 'PSC', '5', 'Travaux de raccordement à Laval  de la station de dessalement d’eau de mer . D’EL TARF LOT n 03-2: RMC MEXA –RV EL KALA', 'Hydraulique ', 'el kala ,ain el assel , bougous , el Aioun , Raml essougue', '1260982', '', '/', 'ADE', '', 'SARL ETHIPE', '', '0.43', '0.22', '9 MOIS', '45658', '75', '100', '', '', ''),
	('Annaba', '36-El Tarf', 'PSC', '6', 'Travaux de raccordement de la station de dessalement d’eau de mer .LOT n 04 : RMC LAC DES OISEAUX –RMC daghoussa', 'Hydraulique ', 'sidi kaci, ben m\'hidi ,dréan , echatt , Besbes', '5959786', '', '/', 'ADE', '', 'ERL STRAPHYD', '', '0.3', '0.06', '14 MOIS', 'Janivier 2025', '180', '250', 'Remonter des eaux de la nappe intempérie et impraticabilité de terrain demande traversé de ADA  DTP  il n\'ya pas de réponse', 'Les autorités ont facilité l’obtention des terrains nécessaires à l’inhalation de centrales à béton et de bases de vie', ''),
	('Annaba', '36-El Tarf', 'PSC', '7', 'Travaux de raccordement de la station de dessalement d’eau de mer .LOT n 05 : RMC daghoussa EL TARF Sud Drean', 'Hydraulique ', 'Dagoussa , dréan sud', '1693578', '', '/', 'ADE', '', 'HYDRO AMENAGEMENT', '', '0.13', '0', '12 MOIS', 'Nnovembre 2025', '68', '110', '', '/', ''),
	('Annaba', '36-El Tarf', 'PSC', '8', 'Construction et mise en service du barrage boukhroufa ( bouteldja )', 'Hydraulique ', 'bouteldja', '22077000', '', '/', 'ANBT', '', 'Groupement Nurol / gesi TP TRUC / ALGERIE', 'Assurer alimentation AEP + Irrigation agricole', '0.8', '0.7323', '118 Mois marché + avent 11', 'Fin 2025', 'Travaux à l\'arrét', 'Travaux à l\'arrét', 'Confit ntre les deux membres du groupement. ( le groupement nurol gesi TP à refusé de signer RODS de reprise des travaux à partir 29/11/2023 pour motif non paiement des créances des situations causée par le manque de couverture de AE ', 'Attente du l’approbatif de réévaluation', ''),
	('Annaba', '40-Khenechla', 'PSD', '', 'Etude et Réalisation de  1000 km de réseaux éléctriques basse tension et moyenne tension', 'Agriculture et Développement rural', '', '1000000', '255687', '204549', '', '', '', '', '80', '', '', '', '', '', '', 'Oppositions des agriculteurs', 'Agriculture et développement rural'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Etude et Réalisation de  1000 km de réseaux éléctriques basse tension et moyenne tension', 'Agriculture et Développement rural', '', '1500000', '936228', '638679', '', '', '', '', '98', '', '', '', '', '', '', 'Oppositions des agriculteurs', 'Agriculture et développement rural'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Réalisation d\'une unité de stockage', 'Agriculture et Développement rural', '', '162000', '161847', '41069', '', '', '', '', '80', '', '', '', '', '', '', '/', 'Agriculture et développement rural'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Etude, suivi et réalisation de 03 unités de stockages d\'une capacité de 60.000 Qtx pour chacune soit un total de 180.000 Qtx', 'Agriculture et Développement rural', '', '486000', '459977', '205419', '', '', '', '', '80', '', '', '', '', '', '', '/', 'Agriculture et développement rural'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Etude, suivi, aménagement et réalisation des pistes agricoles améliorées et aménagements des pistes existantes sur 520 km', 'Agriculture et Développement rural', '', '1400000', '1210373', '513457', '', '', '', '', '67', '', '', '', '', '', '', '* Oppositions des agriculteurs contre le tracé des pistes traversent leurs terres agricoles
* problème de la disponibilité de la matière TUFF', 'Agriculture et développement rural'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Electrification agricole sur 500 km', 'Agriculture et Développement rural', '', '1500000', '1331871', '1157747', '', '', '', '', '98', '', '', '', '', '', '', 'Oppositions des agriculteurs', 'Agriculture et développement rural'),
	('Annaba', '40-Khenechla', 'PSD', '', '5000 logements publics locatifs', 'Habitat, Urbanisme et Ville', '', '14610000', '13611907', '10529573', '', '', '', '', '71', '', '', '', '', '', '', '/', 'Logement'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Suivi, réalisation et équipement d’une station d’épuration à Babar', 'Hydraulique ', '', '2500000', '2142157', '826597', '', '', '', '', '85', '', '', '', '', '', '', '/', 'Assainissement et protection du milieu naturel '),
	('Annaba', '40-Khenechla', 'PSD', '', 'Suivi, réalisation et équipement d’une station d’épuration à Chechar', 'Hydraulique ', '', '2490000', '1999404', '412576', '', '', '', '', '50', '', '', '', '', '', '', '/', 'Assainissement et protection du milieu naturel '),
	('Annaba', '40-Khenechla', 'PSD', '', 'Réalisation et suivi du dédoublement de la RN 88 reliant Kais -limite de la wilaya de Batna sur 18 km.', 'Travaux Publics et infrastructures de Base', '', '2000000', '1517700', '1428287', '', '', '', '', '90', '', '', '', '', '', '', '/', 'Infrastructures routières et autoroutières'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Etude réhabilitation et développement de la zone d’activité de BAGHAI', 'Industrie', '', '1700000', '1201064', '574074', '', '', '', '', '65', '', '', '', '', '', '', '* Terrain rocheux
* Opposition des citoyens à la traversée du réseau gazier
* Résiliation du contrat avec le bureau d\'études', 'Appui à l\'investissement '),
	('Annaba', '40-Khenechla', 'PSD', '', 'Etude, suivi et réalisation de cinq (05) mini zones d\'activité (10 ha chacune) au niveau des communes de : Taouzianet, Remila, Chechar, El Ouldja et Djellal.', 'Industrie', '', '700000', '611126', '126410', '', '', '', '', '45', '', '', '', '', '', '', '* Terrain rocheux
* Résiliation du Marché avec l\'entreprise et relancement de procédure
* Insuffisance de l’enveloppe financière', 'Appui à l\'investissement '),
	('Annaba', '40-Khenechla', 'PSD', '', 'Etude ,réalisation et réhabilitation des zones d’activité de Ain touila, M’toussa, El mahmel.   ', 'Industrie', '', '2000000', '1637616', '507012', '', '', '', '', '45', '', '', '', '', '', '', '* Opposition des citoyens
* Résiliation du Marché avec l\'entreprise et relancement de procédure
* Résiliation du contrat avec le bureau d\'études', 'Appui à l\'investissement '),
	('Annaba', '40-Khenechla', 'PSD', '', 'Etude, construction et Equipement d\'un hopital Mére et Enfant à Khenchela', 'Santé', '', '900000', '333414', '44449', '', '', '', '', '15', '', '', '', '', '', '', '* Insuffisance de l’enveloppe financière', 'Prévention et soins'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Etude,construction et Equipement d\'une urgence médicale chirurgicale à Khenchela', 'Santé', '', '700000', '227304', '164018', '', '', '', '', '65', '', '', '', '', '', '', '* Insuffisance de l’enveloppe financière
* Réévaluation notifié au titre de l\'année 2025 pour un montant de 200 Millions DA', 'Prévention et soins'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Suivi et réalisation de 6 000 places pédagogiques.', 'Enseignement Supérieur et Recherche Scientifique', '', '3110000', '2986303', '2285748', '', '', '', '', '90', '', '', '', '', '', '', '* Résiliation du Marché avec l\'entreprise et relancement de procédure pour 2000/6000 PP ', 'Enseignement et formation supérieurs'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Suivi et réalisation de 3000 lits d’hébergement', 'Enseignement Supérieur et Recherche Scientifique', '', '2292000', '1997405', '1906385', '', '', '', '', '85', '', '', '', '', '', '', '/', 'Vie estudiantine'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Suivi, réalisation et équipement d’un institut national  spécialisé de formation professionnelle  (INSFP) 300 PF/120 lits à khenchela ', 'Formation et Enseignement Professionnels', '', '522000', '358383', '282841', '', '', '', '', '85', '', '', '', '', '', '', '/', 'Formation Professionnelle'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Suivi, réalisation et équipement d’un institut d’enseignement professionnel (IEP) 1000 PF /300 lits à khenchela', 'Formation et Enseignement Professionnels', '', '568000', '382994', '308530', '', '', '', '', '85', '', '', '', '', '', '', '/', 'Enseignement Professionnel'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Etude, construction et équipement d\'un Centre Régional de  regroupement des Equipes Nationales à Ain Silane ', 'Sports', '', '3693200', '3435134', '1549144', '', '', '', '', '70', '', '', '', '', '', '', '* stabilisation des terrains', 'Sports'),
	('Annaba', '40-Khenechla', 'PSD', '', 'Suivi et travaux de viabilisation de la station climatique à Chelia', 'Tourisme', '', '561000', '297670', '161083', '', '', '', '', '78', '', '', '', '', '', '', '/', 'Tourisme'),
	('Annaba', '40-Khenechla', 'PSC', '', 'Centrale Electrique cycle combiné 1266,71 MW à Remila - Daira de kais', 'Energie', '', '82230000', '/', '/', '', '/', '', '', '0.92', '', '', '', '', '', '', '', 'Retard et difficulté dans la régularisation du foncier (Périmètre de sécurité, l\'accès de la route menant à la centrale et la canal de rejets)'),
	('Annaba', '40-Khenechla', 'PSC', '', 'Réalisation du barrage lazreg  (w . Khenchela)', 'Hydraulique', '', '4000000', '2997084', '0', '', '4000000', '', '', '0.17', '', '', '', '', '', '', '', 'la maturation des plans d\'executions'),
	('Annaba', '04-Oum El Bouaghi', 'PSC', '1', 'Etude, réalisation et gestion de la STEP de la ville de Oum El Bouaghi', 'Hydraulique', 'Oum El Bouaghi', '1733000', '', '0', 'ONA', '', 'Groupement Hydro-traitement (Algerie)/EFACEC (Portugal)', ' réutilisation des eaux usées à des fins agricoles 120 Ha ,protection de l\'environnement , lutte contre les MTH', '0.7', '0.59', '46 mois', 'fin 2025', '50', '500', 'Difficultés financières, situation juridique', 'Arret des travaux depuis le15/06/2022', '  /'),
	('Annaba', '04-Oum El Bouaghi', 'PSC', '2', 'Travaux de raccordement en energie electrique pour les expoloitations agricoles', 'DSA', 'ATW', '1063998', '', '762251', 'DSA', '', 'sonelgaz', 'prise en charge 940 exploitations agricoles +creation d\'emplois + develloper l\'industrie agro-alimentaire', '0.83', '0.716402662', '24 mois', '45992', '2000', '1000', 'Opositions des agriculteurs 
Consultations declarées infrictueusements', 'Lever des oppositions locales', ' /'),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '1', 'Réalisation et équipement d\'une annexe de l\'école régionale des Beaux arts à Oum El Bouaghi', '', ''),
	(',', 'Culture', 'OUM EL BOUAGHI', '255000', '', '173624', 'DEP', '', 'Nasri Mohamed Fouzi (Administration + Ateliers + Amphi théâtre  R+2 (gros œuvres) ) / Aboud Abd Elouahab (Travaux secondaires pour l\'administration + les ateliers et l\'amphi théâtre  + VRD + aménagement)', 'prise en charge des jeunes artistes', '0.9', '0.680878431', '/', '45747', '30', '/', 'manque AP pour equipement', 'demande de réevation de 20 millions lors des travaux d\'arbitrages', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '2', 'Réalisation de 500 lits d’hébergement en extension de la résidence universitaire d’Ain M’lila. 
', 'Enseignement Supérieur ', 'AIN M\'LILA', '500000', '', '149695', 'DEP', '', 'Barrah Abd Rahmane OEB', 'prise en charge des etudiants en matière d\'hebergement', '0.6', '0.29939', '30 mois', '45900', '25', '10', '/', 'Travaux en cours', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '3', 'Réalisation et équipement d\'un hôpital 120 lits à Ain Fakroun
', 'Santé', 'AIN FAKROUNE', '3118969', '', '1135783', 'DEP', '', 'Hamel Ali Constantine', 'Prise en charge sanitaire de la population', '0.8', '0.364153347', '24 mois', '45838', '500', '/', '/', 'Travaux en cours pour Lot n 01
les 03 lots du RAR projet des marchés au niveau de CMS pour etude 
Réevaluation accordée', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '4', 'Réalisation d\'un hôpital 240 lits à Ain M\'Lila
', 'Santé', 'AIN M\'LILA', '4600000', '', '4160577', 'DEP', '', 'EURL Ababsa et associes', 'Prise en charge sanitaire de la population', '1', '0.904473261', '24 mois', '45444', '800', '/', '/', 'Achevée,receptionné,  reste logement de fonction', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '5', 'Réalisation d\'un hôpital 60 lits à Ain Kercha', '', ''),
	('', 'Santé', 'AIN KERCHA', '1600000', '', '341235', 'DEP', '', 'SARL Mohamed El Hachemi Ain M\'lila', 'Prise en charge sanitaire de la population', '0.8', '0.213271875', '24 mois', '45838', '250', '/', '/', 'travaux en cours', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '6', 'Etude, réalisation et gestion de la station d\'épuration de la ville de Ain Fakroun 
', 'Hydraulique ', 'AIN FAKROUNE', '2500000', '', '3156', 'DRE', '', 'procedures administratives (appel d\'offre)', ' réutilisation des eaux usées à des fins agricoles 100 Ha ,protection de l\'environnement , lutte contre les MTH', '0', '0.0012624', '18 mois', '/', '100', '/', 'probleme de distraction de terrain agricole', 'dossier de disctraction à transmis au ministère de l\'agriculture', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '7', 'Renforcement RN 80 du PK 128+000 au PK 150+500 sur 22,5 Km.', 'Travaux Publics', 'ATW', '640000', '', '623459', 'DTP', '', 'SOTROB', 'Amélioration circulation et diminution des accidens de la route', '1', '0.974154688', '8 mois', '/', '8', '2', '/', '/', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '', '', '', '', '', '', '', '', '', 'EPTR SUD EST Batna', '', '', '', '8 mois', '', '', '', '', '', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '', 'Etude, Réhabilitation et développement de la zone d\'activités d\'Oum El Bouaghi Est 
', 'PME', 'OUM EL BOUAGHI', '1217108', '', '', 'DUAC', '', 'SOTROB', '189 lots /unites de productions et de stokage', '0.75', '0.662826142', '20 mois', '45992', '1000', '3000', 'Travaux Amenés electrique et Gaz non achevés par Sonelgaz', 'Plusieurs réunions au niveau du secretariat Général de la wilaya avec Sonelgaz', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '', '', '', '', '', '', '', '', '', 'CETGTP', '', '', '', '', '', '', '', '', '', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '9', '', '', '', '', '', '', '', '', 'Yahi Chakib', '', '', '', '', '', '', '', '', '', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '', '', '', '', '', '', '806731', '', '', 'Ben Sahli', '', '', '', '', '', '', '', '', '', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '', '', '', '', '', '', '', '', '', 'Adnane Hassanine', '', '', '', '', '', '', '', '', '', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '', '', '', '', '', '', '', '', '', 'Algégie Télécom', '', '1', '1', '/', '/', '', '', '/', '/', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '10', 'Etude, réalisation et équipement d\'une piscine de proximité à Ain M\'lila
', 'Jeunesse et des Sports', 'AIN M\'LILA', '160000', '', '93804', 'DJS', '', 'EPE d\'individus mobilier et construction métalique (Ex Elm Tebessa)', 'Prise en charge des clubs sportifs', '0.8', '0.586275', '18 mois', '45992', '20', '/', '/', 'demande de réevation ', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', '11', 'Réalisation et équipement d\'un centre de regroupement sportif  à Zorg
', 'Jeunesse et des Sports', 'ZORG', '2392145', '', '851222', 'DJS', '', 'Lot N° 01 Maconst Sud Adrar et Chibane Rachid Ain Beida après résiliation (Bloc d\'hébergement  + bloc pédagogique + Administration + bloc de récupération et soins) / Faraj Elkamassi Lot N°02 Complexe sportif (salle de sport + piscine + salle de musculation) / Lot N° 04 Berhail Mourad (Mur de clôture + loge de gardien + voie d\'accès   ', 'Prise en charge des clubs sportifs et d\'elites / 22 Ha', '0.7', '0.36', '24 mois', '45992', '100', '/', '/', '/', ''),
	('Annaba', '04-Oum El Bouaghi', 'PSD', 'p', 'Réalisation d\'une zone industrielle à Ouled Gacem, wilaya d\'Oum El Bouaghi sur 399,85 ha.', '', ''),
	('', 'PME', 'OULED GACEM', '4000000', '', '1106580', 'DTP', '', 'Zone A+B:  SNCاغزر امقران و AFRO-TP Batna         Zone C:ش ذ م م etp hm مخلوفي يعقوب سطيف      zone D+E: ش ذ م م الاخوة غربي باتنة    ZONE F:سايغي محمد علي  الجزائر   ZONE G+H:EURLللاشغال العمومية خنشلة                       ', 'création 83 unites de productions', '0.4', '0.26513975', '24 mois', '45992', '900', '/', 'Oppositions des occupants', 'Les mesures d\'indemnisation des occupants pour libérer l\'assiette ont été prises par les services de la wilaya.', ''),
	('Annaba', '21-Skikda', 'PSD', '', 'Etude et construction d\'un centre des brulés', 'Santé', 'Skikda', '3083000', '', '1021151.32', 'Direction des Equipements Publics', '', 'SPA TRAVOCOVIA', 'Assurer une meileure prise en charge des brulés
Améliorer les indicateurs de santé
Réduire les évacuations sur d\'autres Wilayas', '0.5', '0.33', '32 mois', '', '180', '30', 'ETP et ETB hors délais', 'Au niveau du ministère de la santé (CNM compétente)', 'Opération à l\'arrêt'),
	('Annaba', '21-Skikda', 'PSD', '', 'Réalisation et équipement d\'un Hôpital 60 lits à Oum Toub (1ère tranche) (W.Skikda)', 'Santé', 'Oum Toub', '1400000', '', '974.61', 'Direction des Equipements Publics', '', 'A.O le 10/12/2023
Ouverture le 31/12/2023
Montant du marché  après l\'analyse des plis est : 
2 307 719 335,26 DA
Jugement subordonné à la réévaluation', 'Assurer une meileure prise en charge de la population de la Daira d\'Oum Toub
Réduction des délais de prise en charge des malades
Réduire les évacuations sur les CHU de Constantine et Annaba 
Désenclaver la région sur le plan sanitaire', '0', '0', '-', '-', '150', '30', '', '', ''),
	('Phase ouverture des plis après le 3ème appel d\'offres "', '', '', '', '', '', ''),
	('Annaba', '21-Skikda', 'PSD', '', 'Etude et suivi pour la réalisation d\'un hôpital 240 lits à Skikda', 'Santé', 'Skikda', '300000', '', '0', 'Direction des Equipements Publics', '', 'notifiée en 2023 
(MF/2023/DI/494 du 14/08/2023)
(action déconcentrée 2023)', 'Renforcement des infrastructures médicales
Assurer une meilleure couverture sanitaire', '0', '0', '-', '-', '', '', '', '', 'Phase analyse des offres après un 1er avis infructueux'),
	('Annaba', '21-Skikda', 'PSD', '', 'Etude et suivi pour la réalisation d\'un hôpital 120 lits à Collo, Wilaya de Skikda', 'Santé', 'Collo', '160000', '', '0', 'Direction des Equipements Publics', '', 'notifiée en 2023 
(MF/2023/DI/494 du 14/08/2023)
(action déconcentrée 2023)', 'Renforcement des infrastructures médicales
Réduction des délais de prise en charge des malades
Réduire les évacuations sur les autres structures ', '0', '0', '-', '-', '', '', '', '', 'Phase analyse des offres après un 1er avis infructueux'),
	('Annaba', '21-Skikda', 'PSD', '', '', '', ''),
	('Réalisation de la station d’épuration du groupement urbain de FILFILA"', 'Hydraulique', 'Skikda
FIL FILA', '3005000', '', '2649907.603', 'Direction des Ressources en eau', '', 'Power Hydraulique', ' - Collecte des eaux usées des groupements urbains (la nouvelle ville de bouzaaroura, Fil-Fila , Salah Chebel, Ben M\'hidi et la ZET), 
 -  Elimination des rejets directs sur mer et chaabet, préservation de la nappe phréatique.
Population touchée: 30 000 hab', '0.99', '0.88', '36 mois et 15 jours (réalisation)
+ 24 mois (exploitation)', 'Projet réceptionné le 31/12/2024', '20', '0', '', '-', 'La STEP est mise en régime et sera en exploitation (par l\'entreprise) pendant deux (02) ans apres la reception provisoire '),
	('Annaba', '41-Souk Ahras', 'PSD', '01', 'Réalisation d\'une zone industrielle à M\'daourouch, wilaya souk ahras', '1', 'M\'daourouch', '3000000', '', '2341776', 'DUAC', '', 'SARL MECELTI Yacine ', 'assainissement trottoirs+voirie + AEP', '0.8', '0.647304308', ' 06 mois', '45838', '40', '4', 'Insuffisance de l’autorisation d’engagement de l’opération portant réalisation d\'une zone industrielle à M\'daourouch, wilaya                  Souk Ahras', '', 'Reste travaux de pose des couches GB+BB+ETP réclament la hausse des prix +ETP est mise en demeure pour la deuxieme fois'),
	('Annaba', '41-Souk Ahras', 'PSD', '02', 'Etude et réalisation d\'un centre frontalier mixte (DGSN - DGD) avec (05) logements de fonction et acquisition d\'un groupe électrogène à Ouled-Moumen', '5', 'Ouled-Moumen', '1604564', '', '1325438', 'DAL', '', 'Lot N°01 et 02 : AFFIF ZAKIA', 'تحسين ظروف إستقبال المسافرين إلى داخل و خارج الوطن', '0.98', '0.826042464', 'Lot n°01: مستلم', 'جوان 2026', '/', '/', '/', '/', 'En cours'),
	('Annaba', '41-Souk Ahras', 'PSD', '03', 'Etude et réalisation d\'une Unité Républicaine de Sécurité (U.R.S) à Souk-Ahras', '5', 'Souk-Ahras', '1250000', '', '238684', 'DAL', '', 'Lot N°04:Nedjeh Ammar', 'تعزيز الأمن و الإستقرار على مستوى المنطقة', '0.49', '0.1909472', '18 شهر ', '/', '/', '/', '', '/', 'تم الإعلان عن طلب عروض بعد تعديل دفتر الشروط  لإنجاز الوحدة الجمهورية في 07 حصص'),
	('Annaba', '41-Souk Ahras', 'PSD', '04', 'Suivi et réalisation de 6000 places pédagogiques', '6', 'Souk-Ahras', '4665000', '', '2867642', 'DEP', '', 'SINOHYDRO
( CHINE) ', 'UNIVERSITE  SOUK-AHRAS', '0.98', '0.614714255', '30 mois', '3000/6000 tuliser
3000/6000 juin 2025', '/', '/', '/', '/', 'En cours'),
	('Annaba', '41-Souk Ahras', 'PSD', '05', 'Réalisation d\'un hôpital de 120 lits à M\'Daourouch', '7', 'M\'daourouch', '2715000', '', '632429', 'DEP', '', 'EURL Touati Abdelkader', 'Rapprocher la santé du citoyen', '0.72', '0.232938858', '30 mois', '2026', '/', '/', '/', '/', 'En cours'),
	('Annaba', '41-Souk Ahras', 'PSD', '06', 'Etude d\'adaptation, suivi et réalisation d\'un hôpital 120 lits en remplacement de l\'ancienne structure à Sedrata', '7', 'Sedrata', '1600000', '', '6830', 'DEP', '', 'ETB Ben Rahel abedelkrim', '', '0.15', '0.00426875', '34 mois', '2027', '/', '/', '/', '/', 'En cours'),
	('Annaba', '41-Souk Ahras', 'PSD', '07', 'Etude, suivi et réalisation d\'un hôpital de 120 lits à Souk-Ahras', '7', 'Souk-Ahras', '3815000', '', '1092', 'DEP', '', 'groupement sari mouldi ', '', '0.05', '0.000286239', '/', '2027', '/', '/', 'Manque l’extrait de DPIC (réévaluation 2024) de l’opération portant Etude, suivi et réalisation d\'un hôpital de 120 lits à Souk Ahras ', '/', 'En cours'),
	('Annaba', '41-Souk Ahras', 'PSD', '08', 'Etude d\'adaptation,suivi et réalisation d\'un hôpital de 60 lits à Heddada', '7', 'Heddada', '990000', '', '345180', 'DEP', '', 'EURL HYPROMAX', '', '0.45', '0.348666667', '36 mois', '2027', '/', '/', '/', '/', 'En cours'),
	('Annaba', '12-Tebessa', 'PSD', '1', 'Etude d\'adaptation , suivi, cntrole  et travaux de réalisation et équipement de 08 centres de proximité pour le stockage intermédiaire des céréales au niveau de la wilaya de Tébessa ', 'Agriculture et développement rural ', 'Tébessa - Bir El Ater - Bir d Hab - El Ogla - El Malabiod – Chéria - Ferkane ', '2023771', '', '5861', 'Directeur des équipements publics(DEP)', '', ' ETB: Prayem gérant Chorfi Tahar pour le lot N°01 
 ETB: SPA Frame Metal gérant Mechri Souhila pour le lot N°02
 ETB: SPA Divendus gérant Seddiki Hadj Yassine pour le lot N°03
 ETB: BH Bifouh Moussa  pour le lot N°04
 ETB: SPA Frame Metal gérant Mechri Souhila pour le lot N°05
 ETB: SARL Samet et ses fils gérant Samet Tahar pour le lot N°06
 ETB: Groupement des entreprises Ben Chanouf Abdel Hafid gérant  + Eyett El Hadj Kaled pour le lot N°07
ETB: Groupement des entreprises Ben Chanouf Abdel Hafid gérant  + Eyett El Hadj Kaled pour le lot N°08
', '-Renforcement des capacités de stockage.
-Promouvoir La filière céréalière.
', '0.12', '0.002896079', '08 mois', '45898', '128', '/', '/', '/', 'pogramme 2023 En cours pour les 8 centres'),
	('Annaba', '12-Tebessa', 'PSD', '2', 'Réalisation Hopital 60 litsà Negrine', 'Santé', 'Negrine', '1500000', '', '0', 'Directeur des équipements publics(DEP)', '', '/', '-Amélioration de la couverture sanitaire
-Amélioration des services et des conditions d’accueil de malades', '0', '0', '/', '/', '/', '/', 'Etude en cours', '/', ' PEC-PSD                                  Non lancée,  lancement subordoné à l\'achèvement de l\'étude ,'),
	('Annaba', '12-Tebessa', 'PSD', '3', 'N 1 027 105 01 4012 000 012 08 004                           ETUDE ET REALISATION D\'UN HÖPITAL 60 LITS EL OGLA', 'Santé', 'EL OGLA', '750000', '', '554740', 'Directeur de la santé', '', '*  Djaradi Zoubir Tébessa  * Slimani El Ouerdi Tébessa * Rachech Noredine Tébessa             * Boussahia Abdenoure Tébessa             *  Manad djalal Tébessa             * Younsi yassine Tébessa            * ETP rabhalah samir tébessa', '-Amélioration de la couverture sanitaire
-Amélioration des services et des conditions d’accueil de malades', '0.97', '0.739653333', '33 mois', '45807', '267', '68', '/', '/', 'PEC-PSD En cours'),
	('Annaba', '12-Tebessa', 'PSD', '4', 'N 1 027 105 01 4012 000 012 06 005                                REALISATION D\'UN HOPITAL GENERAL  120 LITS A TEBESSA', 'Santé', 'TEBESSA', '767430', '', '686217', 'Directeur de la santé', '', '*Boulahbal Youcef Tébessa *Massar Tahar Tébessa        *Azaz Mabrouk Tébessa    * Slama Ismahane Tébessa    * Hamdadou Ridha Tébessa   * Achouri Ibrahim Tébessa   * Belamadi Salim Tébessa    * Messai Badis Tébessa ', '-Amélioration de la couverture sanitaire
-Amélioration des services et des conditions d’accueil de malades', '0.98', '0.894175365', '24 mois', '45808', '338', '82', 'Montant insufisant  pour prendre en charge le bloc opératoire et l\'impact de la transformation d\'un hopital psychiatrique à  un hopital général', 'Demande de réévaluation introduite au niveau du Ministère de la santé pour prendre en charge le bloc opératoire et l\'impact de la transformation d\'un hopital psychiatrique à  un hopital général', 'PEC-PSD En cours'),
	('Annaba', '12-Tebessa', 'PSD', '5', 'N 1 051 094 01 2012 000 012 24 003                                Travaux de renforcement de l\'alimentation en eau potable de la ville de chéria à partir du champ captant d\'El Malabiod (W-Tébessa)
', 'Hydraulique', 'chéria ', '800000', '', '629049.1368', 'Directeur Des Ressources En Eau  (DRE)', '', '* ETP, FARES ABD EL HAKIM-
BIR EL ATER
* ETP, DJARAMO AMOR Khenchella        * ETP, BOUSBIA EL AYECH HACEN-
EL OUED
*  ETP, DJARAMO AMOR-Khenchella               * ETP, GHARBI RIDA- BRIKA', 'Amélioration de l’approvisionnement de la commune de Chéria en eau potable et amélioration de la fréquence horaire de distribution', '0.95', '0.786311421', '12 mois', 'Mars 2025', '60', '180', '/', '/', 'pogramme 2023                travaux de réalisation en cours '),
	('Annaba', '12-Tebessa', 'PSD', '6', ' N 1 051 094 01 2012 000 012 24 014                          Réalisation d’une conduite transfert d’eau potable à partir du barrage OULGET MELLEGUE  vers la commune d’ EL OUENZA y compris stockage ,équipement , amenée d’énergie et suivi
', 'Hydraulique', 'EL OUENZA', '600000', '', '139129.2017', 'Directeur Des Ressources En Eau (DRE)', '', '*ETP, BOUSBIA EL AYECH HACEN- 
EL OUED       * ETP M’ZAHDIA NABIL –SOUK AHRAS    * ETP- EL KMINE MORAD Khenchella * ETP HYDRO-TASSILI- Khenchella   * ETP NASRAT ALI EL OUED,', 'Amélioration de l’approvisionnement de la commune d’El ouenza en eau potable et amélioration de la fréquence horaire de distribution', '0.9', '0.231882003', '04 mois', 'Mars 2026', '20', '45', '* indisponibilité des équipements hydromécaniques "" pompes "'),
	('* Terrain rocheux très dur  ', '', '', '', '', '', ''),
	('', '* indisponibilité des équipements hydromécaniques "" pompes "', '', '', '', '', ''),
	('* Terrain rocheux très dur  ', '', '', '', '', '', ''),
	('', 'pogramme 2024                travaux de réalisation en cours', '', '', '', '', ''),
	('Annaba', '12-Tebessa', 'PSD', '7', 'Raccordement des Rejets des  eaux usées vers la STEP de la ville de Tébessa, Y compris la Réalisation de deux Stations de relevages', 'Hydraulique', 'Tébessa-Hammamet Morssot et Boulhafdyr et BirD’heb', '600000', '', '0', 'Directeur Des Ressources En Eau (DRE)', '', '*Marchés de réalisation au niveau du CMW pour approbation pour les 05 premiers lots et les deux derniers lots ont été déclarés infructueuses ', '*augmentation de la capacité de traitement de STEP de la ville de Tébessa, lutte contre les maladies transmissibles par voie hydrique et protection des eaux souterraines de la nappe stratégique Tébessa-Hammamet Morssot contre la contamination.
* augmentation de la superficie de terres irriguées par l\'utilisation des eaux usées épurées.
', '0', '0', '07 mois', '45992', '150', '60', '/', '/', 'pogramme 2024                *Marchés de réalisation au niveau du CMW pour approbation pour les 05 premiers lots et les deux derniers lots ont été déclarés infructueuses 
"" demande de réévaluation de l\'opération ""'),
	('Annaba', '12-Tebessa', 'PSD', '8', 'Modernisation de la RN 88 sur 27.5 Kms du PK 183 au PK 210+500 (entre Ouenza– El-Aouinet) (W.Tébessa)', ' Travaux Publics', 'Ouenza– El-Aouinet', '1200000', '', '302251', 'Directeur des Travaux Publics (DTP)', '', 'SARL SOTRAMA
 -Tébessa-
EPTR SUD EST -Batna-
EURL Boughazala
 -El Oued-', '* Amélioration de la Sécurité Routière
* Réduction du Temps de Trajet
* Amélioration du Confort des Usagers', '0.8', '0.251875833', '12 mois', 'Juin 2025', '80', '120', 'Pénurie de matériaux utilisés dans la construction des remblais et de corps couches de la chaussée, en particulier en ce qui concerne les matériaux TVN, GNT et TVC, ', 'Les dossiers concernant les autorisations d\'exploitation ont été déposés auprès des autorités compétentes, l\'autorisation a été accordée   et le problème a été résolu', 'Programme 2024'),
	('Annaba', '12-Tebessa', 'PSD', '9', 'Etude, suivi et réalisation des travaux de VRD primaires et secondaires à travers la Wilaya de Tébessa -Programme 2024-', 'Habitat et Urbanisme', 'Boulhef dyr- tebessa', '1000000', '', '215431', 'Directeur de l\'urbanisme(DUAC)', '', 'Tagoug-A- ZARIATA -SOTRAMA', 'création de nouveaux noyaux urbains', '0.35', '21.5431', '13 mois', '46023', '200', '50', 'remblais en grande masse', 'volontariat', 'programme 2024 en cours '),
	('Annaba', '12-Tebessa', 'PSD', '10', 'S 1 021 080 02 4812 000 012 18 003                               Suivi et réalisation des travaux de VRD des lotissements créés dans le cadre de développement de l\'offre foncière publique dans les wilayas des hauts plateaux - prog,2018 - wilaya de Tébessa', 'Habitat et Urbanisme', 'Tebessa, Cheria, Thlidjen, Ouanza, Aouinett,Kouif,Bir Ater,Bir Dheb,Negrine ,Ferkane,Gueriguer,El Hammamet,Oum Ali', '2000000', '', '691349', 'Directeur de l\'urbanisme(DUAC)', '', 'Sotrama,Isra, Boughrara, Younssi,Bohlal, Djedaoune, Batymide,TayamouneMenzer,Laychaoui,Nawres', 'Création des Lotissements', '0.5', '34.56745', '12Mois', '45717', '430', '70', 'Oposition des citoyens,Remblai grand masse ,Construction illicite', 'Volontariat,,et resolution des probleme d\'oposition avec les citoyens ', 'PEC-PSD                   en cours '),
	('Annaba', '12-Tebessa', 'PSD', '11', 'S 1 021 080 02 4812 000 012 14 009                             Résorption du déficit en VRD à travers les communes de la wilaya (1ère tranche)', 'Habitat et Urbanisme', 'Tebessa', '6250000', '', '5665358', 'Directeur de l\'urbanisme(DUAC)', '', 'BOUHLEL', 'amélioration urbaine des sites anciens et amélioration  du cadre de vie de la population', '0.95', '90.645728', '06 mois', '45901', '20', '10', '/', '/', 'PEC-PSD                    en cours '),
	('Annaba', '12-Tebessa', 'PSD', '12', 'S 1 021 079 02 4812 000 012 14 001                              Etude et réalisation de 1.000 logements publics locatifs', 'Haitat et urbanisme ', ' BOULHEF- DYR', '3150000', '', '2615012', 'Directeur du logement', '', 'ETP ACHI SALIM BATNA
SARL SOTRAMA TEBESSA
', '', '0.95', '0.83016254', '27 MOIS', 'Mai 2025', '140', '', '/', '/', '  PEC-PSD  Achevée'),
	('Annaba', '12-Tebessa', 'PSD', '13', 'PC 721 2 262 112 14 02                                                      VRD DES LOTISSMENTS SOCIAUX', 'Haitat et urbanisme ', 'Bir el ater – Cheria - El kouif - El Ouenza – Negrine – 
Safsaf El Ouesra - Tébessa
', '750000', '', '643495', 'Directeur du logement', '', ' SARL soal tphf  Houam abdelKader
 Mesnadi belgacem
 Allala  lazhar
 Allala soufiane
 DJEDAOUNE MOHAMED
 slimi mohammed
 RAR  brahmi kamel
 Djadoune mohammed
 Belmadi salim
 Harrache abdelhaffid
 AIT IDIR  FAOUZI
 Laychaoui abdellatif soltane
 Bouakkaz khaled
 SARL tayamoune
 Harrache abdelhafid
 Laadjal seifeddine
 SARL BAMA INVEST 
 SARL Tayamoune
 Djadoune mohammed
 SARL B,CO,REAL 
 SARL el kahina
', 'amélioration  du cadre de vie de la population', '0.91', '0.857993333', '5 mois', 'Avril 2025', '467', '', ' /', '/', ' PEC-PSD                  en cours '),
	('Annaba', '12-Tebessa', 'PSD', '14', 'S1 005 017 02 4812 000 012 06 015                                  ETUDE, REALISATION ET EQUIPEMENT D\'UN POSTE FRONTALIER MIXTE POLICE - DOUANE A EL-MERIDJ', 'Ifrastructures  administratives (sureté nationale)', 'EL-MERIDJ', '268000', '', '358', 'Directeur de l\'administration locale(DAL) ', '', 'Etude en cours ( BET Djouini Med Taha)', 'projet stratégique s\'inscrivant dans le cadre du développement économique dans les zones frontalières(coopération bilatéral Algéro-Tunisienne)', '0.05', '0.001335821', '24 mois', '/', '/', '/', 'Montant insufisant   pour prendre en charge l\'impact de la modification de l\'aspect en poste  commercial', 'demande de réévaluation  d\'un montant de 1 605 000 000 DA introduite au niveau du Ministère de l\'intérieur et des collectivités locales suite au dégel de l\'opération  pour prendre en charge l\'impact de la modification de l\'aspect en poste  commercial', 'PEC-PSD                    Etude en cours '),
	('Annaba', '12-Tebessa', 'PSC', '1', 'Electrification rurale', 'Energie', 'A travers les communes de  la wilaya', '5866667', '', '', 'Ministère de l\'énergie et des mines', '', 'SONELGAZ', 'Amélioration du niveau de vie des citoyens ', '0.98', '', '', '46022', '404', '', '- Retard dans l’octroi des autorisations par les APC.
- Retard de transmission des plans par les APC
- Les
Oppositions répétées aux travaux par les citoyens
', '- Plusieurs écrits transmis aux APC pour les transmissions des plans et les autorisations.
-Programmation Des sorties sur sites pour étudier et résoudre les oppositions
', 'Programme complémentaire centralisé géré par SONELGAZ'),
	('Annaba', '12-Tebessa', 'PSC', '2', 'Raccordement des agglomérations secondaires et quartiers et lotissement sociaux en Gaz naturel QLS/Gaz', 'Energie', 'A travers les communes de  la wilaya', '4933333', '', '', 'Ministère de l\'énergie et des mines', '', 'SONELGAZ', 'Amélioration du niveau de vie des citoyens ', '0.98', '', '', '46022', '136', '', '- Retard dans l’octroi des autorisations par les APC.
- Retard de transmission des plans par les APC
- Les
Oppositions répétées aux travaux par les citoyens
', '- Plusieurs écrits transmis aux APC pour les transmissions des plans et les autorisations.
-Programmation Des sorties sur sites pour étudier et résoudre les oppositions
', 'Programme complémentaire centralisé géré par SONELGAZ'),
	('Annaba', '12-Tebessa', 'PSC', '3', 'Electricité pour les zones d\'ombre', 'Energie', 'A travers les communes de  la wilaya', '2500000', '', '', 'Ministère de l\'énergie et des mines', '', 'SONELGAZ', 'Amélioration du niveau de vie des citoyens ', '0.82', '', '', '46022', '252', '', '- Retard dans l’octroi des autorisations par les APC.
- Retard de transmission des plans par les APC
- Les
Oppositions répétées aux travaux par les citoyens
', '- Plusieurs écrits transmis aux APC pour les transmissions des plans et les autorisations.
-Programmation Des sorties sur sites pour étudier et résoudre les oppositions
', 'Programme complémentaire centralisé géré par SONELGAZ'),
	('Annaba', '12-Tebessa', 'PSC', '4', 'Gaz naturel  pour les zones d\'ombre', 'Energie', 'A travers les communes de  la wilaya', '1500000', '', '', 'Ministère de l\'énergie et des mines', '', 'SONELGAZ', 'Amélioration du niveau de vie des citoyens ', '0.96', '', '', '46022', '228', '', '- Retard dans l’octroi des autorisations par les APC.
- Retard de transmission des plans par les APC
- Les
Oppositions répétées aux travaux par les citoyens
', '- Plusieurs écrits transmis aux APC pour les transmissions des plans et les autorisations.
-Programmation Des sorties sur sites pour étudier et résoudre les oppositions
', 'Programme complémentaire centralisé géré par SONELGAZ');