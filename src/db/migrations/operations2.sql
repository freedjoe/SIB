CREATE TABLE IF NOT EXISTS operations (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	-- Liens relationnels
	action_id UUID REFERENCES actions(id),
	program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
	wilaya_id UUID REFERENCES wilayas(id),
	budget_title_id UUID REFERENCES budget_titles(id),
	portfolio_program TEXT,
	program_type TEXT,
	-- Informations générales
	code TEXT,
	name TEXT,
	description TEXT,
	province TEXT,
	municipality TEXT,
	location TEXT,
	beneficiary TEXT,
	project_owner TEXT,
	regional_budget_directorate TEXT,
	individualization_number TEXT,
	notification_year TEXT,
	inscription_date DATE,
	-- Durée du projet
	start_year INTEGER,
	end_year INTEGER,
	start_order_date TEXT,
	completion_date TEXT,
	delay NUMERIC,
	-- Données financières
	initial_ae NUMERIC,
	current_ae NUMERIC,
	allocated_ae NUMERIC,
	committed_ae NUMERIC,
	consumed_ae NUMERIC,
	allocated_cp NUMERIC,
	notified_cp NUMERIC,
	consumed_cp NUMERIC,
	cumulative_commitments NUMERIC,
	cumulative_payments NUMERIC,
	-- Suivi de l’exécution
	physical_rate NUMERIC,
	-- Taux d’avancement physique (%)
	financial_rate NUMERIC,
	-- Taux de consommation financière (%)
	recent_photos TEXT [],
	-- Liste des URLs ou chemins d’accès
	observations TEXT,
	-- Contraintes, remarques, etc.
	-- Suivi du projet
	execution_mode TEXT CHECK (execution_mode IN ('state', 'delegation', 'PPP')),
	project_status TEXT CHECK (
		project_status IN (
			'not_started',
			'planned',
			'in_progress',
			'completed',
			'on_hold',
			'suspended',
			'delayed',
			'canceled',
			'completely_frozen',
			'partially_frozen'
		)
	),
	status TEXT CHECK (
		status IN (
			'draft',
			'submitted',
			'reviewed',
			'approved',
			'rejected',
			'archived'
		)
	) DEFAULT 'draft'
);
INSERT INTO operations (
		wilaya_id,
		portfolio_id,
		program_id,
		regional_budget_directorate,
		name,
		municipality,
		inscription_date,
		delay,
		current_ae,
		committed_ae,
		cumulative_payments,
		financial_rate,
		physical_rate,
		project_status,
		status,
		observations
	)
VALUES (
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Evitement de la ville de Boumerdes CW 146- RN 24 sur 10 Kms (lot route et lot ouvrage d’art)',
		'',
		'',
		'0',
		'8400000.000',
		'8188286.163',
		'7337675.353',
		'0.00',
		'90.00',
		'En cours',
		'approved',
		'Travaux en cours'
	),
	(
		'3fc167b8-53ad-4bde-9fa8-c17a4c36dda1',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Réalisation et équipement d’un centre anti cancer de 120 lits',
		'',
		'',
		'0',
		'5550000.000',
		'5549952.520',
		'4113061.577',
		'0.00',
		'75.00',
		'En cours',
		'approved',
		''
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'07bbd7d0-1ed0-4a45-88f4-b35d4570d3be',
		'd7f7dca0-098f-41b3-8824-d2527139e127',
		'Alger',
		'Réalisation de 6.000 places pédagogiques à Boumerdes',
		'',
		'',
		'0',
		'2310000.000',
		'0.000',
		'0.000',
		'0.00',
		'0.00',
		'Gelée',
		'approved',
		'Gelée par Décision N°5508 du 19/10/2015'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'07bbd7d0-1ed0-4a45-88f4-b35d4570d3be',
		'd7f7dca0-098f-41b3-8824-d2527139e127',
		'Alger',
		'Réalisation de 4.000 places pédagogiques à Boumerdes',
		'',
		'',
		'0',
		'3740000.000',
		'3052865.961',
		'1978724.529',
		'0.00',
		'70.00',
		'En cours',
		'approved',
		'Travaux en cours'
	),
	(
		'5d86e459-ae61-4be6-8b06-2ae57f8cdd68',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		NULL,
		'Alger',
		'Réalisation du dédoublement de la RN 23 sur 15 km entre Ain Osmane et Djedar',
		'Oued Morra',
		'',
		'0',
		'3500000.000',
		'0.000',
		'0.000',
		'100.00',
		'100.00',
		'Travaux achevés',
		'approved',
		'Travaux achevés'
	),
	(
		'5d86e459-ae61-4be6-8b06-2ae57f8cdd68',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		NULL,
		'Alger',
		'Réalisation de dédoublement de la RN 23 du PK 397 au PK 368 sur 29 Km à El Hadjeb (Laghouat)',
		'Laghouat/ Tadjmout',
		'',
		'0',
		'2250000.000',
		'0.000',
		'0.000',
		'35.00',
		'17.00',
		'Travaux en cours',
		'approved',
		'Travaux en cours'
	),
	(
		'5d86e459-ae61-4be6-8b06-2ae57f8cdd68',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		NULL,
		'Alger',
		'Réalisation et Équipement d’un hôpital Psychiatrique de 120 lits de Laghouat',
		'Laghouat',
		'',
		'0',
		'2671000.000',
		'0.000',
		'0.000',
		'100.00',
		'100.00',
		'Opération achevée',
		'approved',
		'Opération achevée'
	),
	(
		'5d86e459-ae61-4be6-8b06-2ae57f8cdd68',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		NULL,
		'Alger',
		'Réalisation et équipement d’un centre anti-cancer à Laghouat',
		'Laghouat',
		'',
		'0',
		'8158300.000',
		'0.000',
		'0.000',
		'100.00',
		'100.00',
		'Acquisition des accélérateurs en cours',
		'approved',
		'Acquisition des accélérateurs en cours'
	),
	(
		'5d86e459-ae61-4be6-8b06-2ae57f8cdd68',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		NULL,
		'Alger',
		'',
		'',
		'',
		'0',
		'0.000',
		'0.000',
		'0.000',
		'95.00',
		'89.00',
		'',
		'approved',
		''
	),
	(
		'5d86e459-ae61-4be6-8b06-2ae57f8cdd68',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		NULL,
		'Alger',
		'Étude, suivi ,et réalisation et équipement d’un Hôpital de 60 lits à Bellil Hassi R’mel',
		'Bellil Hassi R’mel',
		'',
		'0',
		'2720000.000',
		'0.000',
		'0.000',
		'85.00',
		'80.00',
		'Travaux en cours ',
		'approved',
		'Travaux en cours '
	),
	(
		'5d86e459-ae61-4be6-8b06-2ae57f8cdd68',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		NULL,
		'Alger',
		'Étude, suivi , réalisation et équipement d’un Hôpital de 60 lits à Ain Madhi',
		'Ain Madhi',
		'',
		'0',
		'2500000.000',
		'0.000',
		'0.000',
		'2.00',
		'1.00',
		'Etude achevée travaux réalisation en cours',
		'approved',
		'Etude achevée travaux réalisation en cours'
	),
	(
		'5d86e459-ae61-4be6-8b06-2ae57f8cdd68',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		NULL,
		'Alger',
		'Réalisation de la Station d’épuration (parachèvement des travaux )',
		'Aflou',
		'',
		'0',
		'2550000.000',
		'0.000',
		'0.000',
		'98.00',
		'70.00',
		'Travaux en cours (réévaluation accordée en 2025 avec un montant 150000000 da)',
		'approved',
		'Travaux en cours (réévaluation accordée en 2025 avec un montant 150000000 da)'
	),
	(
		'5d86e459-ae61-4be6-8b06-2ae57f8cdd68',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		NULL,
		'Alger',
		'',
		'',
		'',
		'0',
		'0.000',
		'0.000',
		'0.000',
		'0.00',
		'0.00',
		'',
		'approved',
		''
	),
	(
		'5d86e459-ae61-4be6-8b06-2ae57f8cdd68',
		'a59f4b88-dcd7-4115-8352-32a62b631e28',
		NULL,
		'Alger',
		'Etude d’adaptation, suivi, contrôle et travaux de réalisation et équipement 08 centres de proximités pour stockage des céréales au niveau de la wilaya de Laghouat',
		'Laghouat/ Aflou/ brida/oued morra/sidi makhlouf/gueltet sisi saad/ ben nacer ben chohra / tadjmout',
		'',
		'0',
		'2023771.424',
		'0.000',
		'0.000',
		'50.00',
		'1.00',
		'',
		'approved',
		''
	),
	(
		'5d86e459-ae61-4be6-8b06-2ae57f8cdd68',
		'acda81a5-9096-43e4-9f7b-b6323753da92',
		NULL,
		'Alger',
		'Réalisation de Mosquée Pole de Laghouat',
		'Laghouat',
		'',
		'0',
		'2953000.000',
		'0.000',
		'0.000',
		'95.00',
		'72.00',
		'en cours l’achèvement minaret + coupole salle - d’ablution et VRD.',
		'approved',
		'en cours l’achèvement minaret + coupole salle - d’ablution et VRD.'
	),
	(
		'dbda05ca-7f33-4f00-a020-fcf490d7463e',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		NULL,
		'Alger',
		'Construction d’un barrage de Souk N’tleta',
		'Le site est situé sur l’Oued Bouguedoura à 8 Km au sud de la ville Draa Ben Khedda ( commune de Tadmait )',
		'',
		'40',
		'32226000.000',
		'0.000',
		'23524980.000',
		'0.00',
		'0.00',
		'',
		'approved',
		'  Présence des habitations sur les sites des travaux ;
  AE insuffisante
 '
	),
	(
		'dbda05ca-7f33-4f00-a020-fcf490d7463e',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		NULL,
		'Alger',
		'Réalisation de la station de dessalement de l’eau de mer Tamdat Ougemoune de capacité 60 000 m3/j; ',
		'Le site est situé à Iflissen ',
		'',
		'8',
		'12543752.189',
		'0.000',
		'0.000',
		'0.00',
		'0.00',
		'',
		'approved',
		'Impact du projet Renforcement de l’AEP des communes côtières. Population touchée par le projet 190 000 habitants,'
	),
	(
		'dbda05ca-7f33-4f00-a020-fcf490d7463e',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		NULL,
		'Alger',
		'Réalisation de la pénétrante autoroutière reliant la ville de Tizi Ouzou vers l’autoroute Est/Ouest sur 48 Kms dont 36 Kms dans la wilaya de Tizi Ouzou ; ',
		'Tizi Ouzou ',
		'',
		'72',
		'130800000.000',
		'0.000',
		'76882000.000',
		'0.00',
		'0.00',
		'',
		'approved',
		'Construction et habitation (délogement) ; Réseaux divers: 93 (Lignes électriques , dont 01 de haute tension HT, Gaz ; Fibres Optiques etc.).'
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Réalisation de l’évitement de Meftah sur 17 Km avec l’accès au nouveau pôle urbain de Safsaf',
		'',
		'',
		'0',
		'5900000.000',
		'5771602.000',
		'5428259.000',
		'0.00',
		'99.00',
		'',
		'approved',
		''
	),
	(
		'3fc167b8-53ad-4bde-9fa8-c17a4c36dda1',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'7a885841-adf1-48f3-b7bc-f33ea87a1c0b',
		'Alger',
		'Réalisation, équipement et exploitation de la station d’épuration des eaux ussées de la ville de Berrouaghia pour 100.000 eq/hab (y compris étude d’exécution)',
		'',
		'',
		'0',
		'2800000.000',
		'1987035.779',
		'296331.090',
		'0.00',
		'15.00',
		'En cours',
		'approved',
		''
	),
	(
		'3fc167b8-53ad-4bde-9fa8-c17a4c36dda1',
		'a59f4b88-dcd7-4115-8352-32a62b631e28',
		'159be777-694a-4fb4-8173-6c3e196506b6',
		'Alger',
		'Etue d’adaptation, suivi, contrôle et travaux de réalisation et équipement de 12 centre de proximité pour le stockage intermédiaire des céréales au niveaux de la wilaya de Médéa  ',
		'',
		'',
		'0',
		'3035657.136',
		'2655436.763',
		'570295.615',
		'0.00',
		'67.00',
		'En cours',
		'approved',
		''
	),
	(
		'3fc167b8-53ad-4bde-9fa8-c17a4c36dda1',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Dédoublement de la RN18 entre Sidi Naamane et Beni Slimane sur 23 Km (Pk83 au PK 106)',
		'',
		'',
		'0',
		'8000000.000',
		'6376600.513',
		'1500620.666',
		'0.00',
		'67.00',
		'En cours',
		'approved',
		''
	),
	(
		'3fc167b8-53ad-4bde-9fa8-c17a4c36dda1',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Réalisation du contournement nord de la ville de Médéa sur 11 kms',
		'',
		'',
		'0',
		'3750000.000',
		'3335589.915',
		'3098229.664',
		'0.00',
		'85.00',
		'En cours',
		'approved',
		''
	),
	(
		'3fc167b8-53ad-4bde-9fa8-c17a4c36dda1',
		'07bbd7d0-1ed0-4a45-88f4-b35d4570d3be',
		'd7f7dca0-098f-41b3-8824-d2527139e127',
		'Alger',
		'Viabilisation et aménagement du site universitaire Ouzera',
		'',
		'',
		'0',
		'2500000.000',
		'2479731.278',
		'2434168.000',
		'0.00',
		'100.00',
		'Achevée',
		'approved',
		'Achevée'
	),
	(
		'3fc167b8-53ad-4bde-9fa8-c17a4c36dda1',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Etude, suivi, réalisation et équipement d’un complèxe mère et enfant à Médéa',
		'',
		'',
		'0',
		'3200000.000',
		'2815424.441',
		'194883.289',
		'0.00',
		'10.00',
		'En cours',
		'approved',
		''
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'a59f4b88-dcd7-4115-8352-32a62b631e28',
		'e3774eeb-7ad3-40d0-9c42-de3abd5fadb6',
		'Alger',
		'Etude d’adaptation suivi, contrôle et travaux de realisation et equipement de 08 centres de proximite pour le stokage intermediare des cereales au niveau de la wilaya de bouira ',
		'',
		'',
		'0',
		'2023771.424',
		'2004612.622',
		'633165.142',
		'0.00',
		'35.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'c3f402e9-6d52-410c-9fd3-ce933cd2732f',
		'11936b31-46c5-4b06-8bfa-2854d677ae5f',
		'Alger',
		'Etude, réalisation et équipement d’un établissement de prévention et réadaptation de 300 détenus à Issers',
		'',
		'',
		'0',
		'2200000.000',
		'702335.675',
		'675969.306',
		'0.00',
		'45.00',
		'à l’arrêt',
		'approved',
		'Travaux à l’arrêt depuis le 29/08/2022, résiliation à l’amiable du marché est en cours.'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'111358bf-f817-4903-8516-8e80250816a9',
		'Alger',
		'Raccordement aval de la station de dessalement d’eau de mer cap djinet',
		'La wilaya de Boumerdes',
		'',
		'0',
		'20000000.000',
		'0.000',
		'0.000',
		'87.00',
		'98.00',
		'',
		'approved',
		'Travaux  en voie d’achèvement                                               *aménagement extérieur en cours                   *rinçage des conduites en cours'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'111358bf-f817-4903-8516-8e80250816a9',
		'Alger',
		'Raccordement des systèmes d’AEP de la wilya de Boumerdes Dellys-Boudouaou-Hammadi au SPET.',
		'',
		'',
		'0',
		'2600000.000',
		'2571314.007',
		'2570938.047',
		'0.00',
		'100.00',
		'Achevée',
		'approved',
		'A clôturer '
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'111358bf-f817-4903-8516-8e80250816a9',
		'Alger',
		'Alimentation en eau potable de la zone Sud Est de la wilaya de Boumerdes à partir du système de dessalement d’eau de mer (SDEM) de cap Djinet',
		'',
		'',
		'0',
		'3750000.000',
		'3639861.637',
		'3392146.168',
		'0.00',
		'96.00',
		'En Cours',
		'approved',
		'09 lots achevés, 01 lot en cours de réalisation.'
	),
	(
		'dbda05ca-7f33-4f00-a020-fcf490d7463e',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		NULL,
		'Alger',
		'Etude d’adaptation, suivi et réalisation d’un CHU 500 lits à Tizi Ouzou; ',
		'OUED FALLI',
		'',
		'0',
		'26300000.000',
		'0.000',
		'0.000',
		'0.00',
		'0.00',
		'',
		'approved',
		'Ce projet constitue un objectif stratégique qui assurera: Une distribution de soins spécialisés à l’échelon régional et placera la Wilaya de Tizi Ouzou en pôle médical d’excellence ;Des soins de haut niveau en matière des services de santé, basés sur les nouvelles techniques de chirurgie, de médecine et d’explorations ;Un meilleur accès de la population à des soins hautement spécialisés ;Accroitre la recherche médicale et privilégier davantage les spécialités innovantes ;'
	),
	(
		'c0c4a3d4-39df-4bfb-b354-854bb334b614',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Suivi et réalisation du dédoublement de la RN46 commune de Charef  vers Chef lieu  de la Wilaya de Djelfa du PK00 au PK60 sur 60Km (Wilaya Djelfa)',
		'',
		'',
		'0',
		'12000000.000',
		'0.000',
		'0.000',
		'0.00',
		'0.00',
		'',
		'approved',
		'En cours d’individualisation '
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Contrôle;suivi et réalisation du contournement Sud de la ville nouvelle de Bouinane entre pk 4+000 (Rn 29-CW 116 Sidi Sarhane )',
		'',
		'',
		'0',
		'3000000.000',
		'1699931.000',
		'439863.000',
		'0.00',
		'25.00',
		'',
		'approved',
		''
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Réalisation, contrôle et suivi du dédoublement de la RN29 entre Bouinan et l’université de Blida y compris l’évitement de la ville Soumaa ""linéaire 5,9 km"" (W.Blida)',
		'',
		'',
		'0',
		'3000000.000',
		'2160908.000',
		'749639.000',
		'0.00',
		'95.00',
		'',
		'approved',
		''
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Réalisation et équipement d’un complexe mère-enfant de 80 lits à Boumerdes',
		'',
		'',
		'0',
		'2900000.000',
		'8390.285',
		'4445.816',
		'0.00',
		'0.00',
		'Non lancée',
		'approved',
		' Dossier d’étude déposé  au niveau du ministère de la santé pour approbation'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Réalisation d’un hopital général de 120 lits à Boudouaou',
		'',
		'',
		'0',
		'2110000.000',
		'1516941.022',
		'1069818.330',
		'0.00',
		'85.00',
		'à l’arrêt',
		'approved',
		'Travaux à l’arrêt depuis 22/03/2020, motif approbation de l’avenant n°05 auprès  de la commission sectorielle,'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Réalisation d’un hopital de 240 lits à Boumerdes',
		'',
		'',
		'0',
		'5520000.000',
		'5518318.479',
		'2562608.454',
		'0.00',
		'80.00',
		'En cours',
		'approved',
		'Travaux en cours'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Etude, suivi et réalisation d’un hopital de 120 lits à Khemis El khechna',
		'',
		'',
		'0',
		'1700000.000',
		'3156.203',
		'1596.203',
		'0.00',
		'0.00',
		'Non lancée ',
		'approved',
		' Dossier d’étude déposé  au niveau du ministère de la santé pour approbation'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Etude, suivi et réalisation d’un hopital de 120 lits à Khemis El khechna',
		'',
		'',
		'0',
		'1700000.000',
		'3156.203',
		'1596.203',
		'0.00',
		'0.00',
		'Non lancée ',
		'approved',
		' Dossier d’étude déposé  au niveau du ministère de la santé pour approbation'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Réalisation et équipement d’une maternité de 60 lits à Bordj-Ménaiel',
		'',
		'',
		'0',
		'1600000.000',
		'1442450.339',
		'227372.043',
		'0.00',
		'30.00',
		'En cours',
		'approved',
		'Travaux en cours'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Réalisation et équipement d’un complexe mère-enfant de 80 lits à Boumerdes',
		'',
		'',
		'0',
		'2900000.000',
		'8390.285',
		'4445.816',
		'0.00',
		'0.00',
		'Non lancée',
		'approved',
		' Dossier d’étude déposé  au niveau du ministère de la santé pour approbation'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Réalisation d’un hopital de 240 lits à Boumerdes',
		'',
		'',
		'0',
		'5520000.000',
		'5518318.479',
		'2562608.454',
		'0.00',
		'80.00',
		'En cours',
		'approved',
		'Travaux en cours'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Réalisation d’un hopital général de 120 lits à Boudouaou',
		'',
		'',
		'0',
		'2110000.000',
		'1516941.022',
		'1069818.330',
		'0.00',
		'85.00',
		'à l’arrêt',
		'approved',
		'Travaux à l’arrêt depuis 22/03/2020, motif approbation de l’avenant n°05 auprès  de la commission sectorielle,'
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'111358bf-f817-4903-8516-8e80250816a9',
		'Alger',
		'Réalisation et interrconnection des systèmes d’adduction d’eau potable à travers les communes de : Meftah, Larbaa, Boufarik, Chebli Beni Tamou, Bouarfa, Chiffa, Mouzaia, Ain Romana et El Affroun sur linéaire de 9,5 Kms (W Blida )',
		'',
		'',
		'0',
		'200000.000',
		'193424.000',
		'192267.000',
		'0.00',
		'96.00',
		'',
		'approved',
		''
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Etude, suivi et réalisation d’un hopital de 60 lits à Baghlia',
		'',
		'',
		'0',
		'1743638.000',
		'105475.682',
		'27361.352',
		'0.00',
		'0.00',
		'Non lancée ',
		'approved',
		' Dossier d’étude déposé  au niveau du ministère de la santé pour approbation'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Dédoublement de la RN24 entre Figuier (Boumerdes) et Oued Issers sur 15 Kms',
		'',
		'',
		'0',
		'1753614.000',
		'1688998.418',
		'1623094.899',
		'0.00',
		'100.00',
		'Achevée',
		'approved',
		'A clôturer '
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Evitement de la ville de Boumerdes:lot route et lot ouvrages d’art sur 4,9 Kms',
		'',
		'',
		'0',
		'4216500.000',
		'4119821.851',
		'4042541.510',
		'0.00',
		'100.00',
		'Achevée',
		'approved',
		'A clôturer '
	),
	(
		'eb304359-1693-41f7-8c8a-8cd766945b09',
		'577320eb-2929-4d49-8d42-c320aafd5e27',
		'7371d894-6c81-41b2-9226-4c657d19883a',
		'Alger',
		'Etude, suivi, acquisition des biens immobiliers et des parcelles de terrains, travaux de restauration et de mise en valeur du secteur sauvegardé de la Casbah d’Alger (2ème tranche)',
		'Casbah',
		'42803',
		'0',
		'17867591.000',
		'1922185.499',
		'563080.167',
		'3.15',
		'17.00',
		'En cours',
		'approved',
		'Travaux en cours opération transférer à la DARQ '
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Réalisation et équipement d’une maternité de 60 lits à Bordj-Ménaiel',
		'',
		'',
		'0',
		'1600000.000',
		'1442450.339',
		'227372.043',
		'0.00',
		'30.00',
		'En cours',
		'approved',
		'Travaux en cours'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'ed9b49d6-9b26-450b-8b86-a138b5c0f620',
		'Alger',
		'Etude, suivi et réalisation d’un hopital de 60 lits à Baghlia',
		'',
		'',
		'0',
		'1743638.000',
		'105475.682',
		'27361.352',
		'0.00',
		'0.00',
		'Non lancée ',
		'approved',
		' Dossier d’étude déposé  au niveau du ministère de la santé pour approbation'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'7a885841-adf1-48f3-b7bc-f33ea87a1c0b',
		'Alger',
		'Réalisation de la station d’Epuration des eaux usées des villes de Boudouaou,  Boudouaou El Bahri et Kherrouba
',
		'Boudouaou,  Boudouaou El Bahri et Kherrouba
',
		'',
		'0',
		'4200000.000',
		'0.000',
		'0.000',
		'0.00',
		'0.00',
		'',
		'approved',
		' projet attribué,  PDM en cours de la levée des réserves                                           Déclassement de l’assiette  en cours
'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'7a885841-adf1-48f3-b7bc-f33ea87a1c0b',
		'Alger',
		'realisation de la station d’epuration du bassin versant de ouled haddadj',
		'ouled moussa ,ouled heddadj boudouaou',
		'',
		'0',
		'5177000.000',
		'0.000',
		'0.000',
		'0.00',
		'0.00',
		'',
		'approved',
		'CDC en cours de la levée des réserves                                           Déclassement de l’assiette  en cours
'
	),
	(
		'29956f0b-77bf-4790-9d28-8020a365695d',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'7a885841-adf1-48f3-b7bc-f33ea87a1c0b',
		'Alger',
		'Etude et réalisation d’une station d’épuration du parc industriel de Larbaatche   ',
		'parc industriel de Larbaatche   ',
		'',
		'0',
		'1900000.000',
		'0.000',
		'0.000',
		'20.00',
		'20.00',
		'',
		'approved',
		'travaux  a l’arrêt (ODS d’arrêt)'
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Réalisation du dédoublement de la RN8 entre Sour El Ghozlane et limite de wilaya de M’Sila sur 32 Km (1ere tranche sur 17 Km) (wilaya de bouira)',
		'',
		'',
		'0',
		'4000000.000',
		'2649570.830',
		'960980.727',
		'0.00',
		'35.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Raccordement vers l’autoroute est-ouest, dédoublement de la route reliant l’échangeur Est de Bouira à la ville de Sour El Ghozlanesur 23 Kms',
		'',
		'',
		'0',
		'5813000.000',
		'5732396.000',
		'5570823.000',
		'0.00',
		'97.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Réalisation de l’évitement Est de la ville de Bouira sur 10 Kms',
		'',
		'',
		'0',
		'3715000.000',
		'3711941.590',
		'3707512.086',
		'99.00',
		'0.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'eb304359-1693-41f7-8c8a-8cd766945b09',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Radiale Oued Ouchaiah-liaison RN 38 -Benghazi',
		'Baraki- Gué de constantine',
		'40727',
		'71',
		'13400000.000',
		'13258054.143',
		'12588559.164',
		'93.94',
		'99.00',
		'En cours',
		'approved',
		'projet achevé , reste aménagement des accès limitrophes .'
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'0e5fa12c-8a4b-4faf-984a-c19bb5a9765d',
		'Alger',
		'Réalisation du dédoublement du CW127 entre RN5 et Sour El Ghozlane sur 08 Km du PK 0+000 au PK 08+000',
		'',
		'',
		'0',
		'1770127.000',
		'1718151.715',
		'1650832.000',
		'0.00',
		'96.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'111358bf-f817-4903-8516-8e80250816a9',
		'Alger',
		'Aménagement aval d’alimentation en eau potable du système du barrage Koudiat Acerdoune des centres de : Bouderbala, Kadiria,Aomar,Djebahia et Lakhdaria',
		'',
		'',
		'0',
		'1100000.000',
		'1096253.236',
		'892983.168',
		'0.00',
		'95.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'111358bf-f817-4903-8516-8e80250816a9',
		'Alger',
		'Réalisation des ouvrages de stockage à travers la wilaya y compris leurs raccordements',
		'',
		'',
		'0',
		'1000000.000',
		'961564.055',
		'803878.776',
		'0.00',
		'95.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'a59f4b88-dcd7-4115-8352-32a62b631e28',
		'159be777-694a-4fb4-8173-6c3e196506b6',
		'Alger',
		'Etude d’adaptation, suivi, contôle et travaux de réalisation et équipement de 06 centres de proximité pour le stockage intermédiaire des céréales au niveau de la wilay de Blida',
		'',
		'',
		'0',
		'1517829.000',
		'1316051.000',
		'725356.000',
		'0.00',
		'85.00',
		'',
		'approved',
		''
	),
	(
		'eb304359-1693-41f7-8c8a-8cd766945b09',
		'584503c4-9f64-4cad-809f-5d6c44fe4cbb',
		'29bd4ef2-e3e6-4aa4-8b1a-863e48d45a91',
		'Alger',
		'Travaux de protection et d’aménagement de la bande côtière (promenade et plage de la baie d’Alger, 1ere tranche)- Etude et réalisation',
		'Hussein Dey - Belouazded',
		'41031',
		'101',
		'24450000.000',
		'24282957.478',
		'23938306.589',
		'97.91',
		'100.00',
		'Achevée',
		'approved',
		'Travaux achevés, reste apurement financier (avenant n°09 de réajustement au niveau de la commission sectorielle, levée de réserves en cours- avenant de réajustement pour prolongement de rejets en cours de préparation- demande de réévaluation de 1,5 milliard DA pour couvrir la situation n° 01 et définitive après validation du Monsieur le PM) . '
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'acda81a5-9096-43e4-9f7b-b6323753da92',
		'42a1cf43-452a-43bd-ba3e-f0e2191c811c',
		'Alger',
		'Etude suivi réalisation et équipement d’une mosquée pole à Blida ',
		'',
		'',
		'0',
		'1000000.000',
		'989297.000',
		'199422.000',
		'0.00',
		'35.00',
		'',
		'approved',
		''
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'780b3bde-9fd8-468d-8a3a-d108007e392c',
		'Alger',
		'Réalisation, équipement, éléctrification et raccordement de 25 forages (6800 ml ) à travers les communes de : Grand Blida, Meftah, Larbaa, Bougara, Chebli, Soumaa, Béni Mered, Mouzaia, Oued El Alleug, Ouled Slama, Boufarik, El Affroun, Ben Khelil, Chiffa et Ain Romana (W Blida) ',
		'',
		'',
		'0',
		'900000.000',
		'747749.000',
		'554326.000',
		'0.00',
		'99.00',
		'',
		'approved',
		''
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'780b3bde-9fd8-468d-8a3a-d108007e392c',
		'Alger',
		'Réalisation de 07 sept forages y compris équipement et électrification au niveau de la wilaya de Blida .',
		'',
		'',
		'0',
		'200000.000',
		'162512.000',
		'147833.000',
		'0.00',
		'99.00',
		'',
		'approved',
		''
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'7a885841-adf1-48f3-b7bc-f33ea87a1c0b',
		'Alger',
		'Étude, réalisation et équipement de station d’épuration des eaux usées de la ville de Ain Bessem (y compris raccordement)',
		'',
		'',
		'0',
		'2500000.000',
		'2487357.357',
		'1054772.000',
		'0.00',
		'35.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'eb304359-1693-41f7-8c8a-8cd766945b09',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'7a885841-adf1-48f3-b7bc-f33ea87a1c0b',
		'Alger',
		'Aménagement de l’Oued El Harrach- Travaux et suivi',
		'Mohammadia, El Harrach, Baraki, Sidi Moussa, Hussein Dey, Bourouba, Gué de Constantine, Saoula, Birtouta et Ouled Chebel.',
		'41064',
		'82',
		'48980888.000',
		'48561355.460',
		'46595777.233',
		'95.13',
		'98.00',
		'En cours',
		'approved',
		'Mise en demeure N°02 publiée dans le journal Algérie Aujourd’hui le 21/01/2025.'
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'7a885841-adf1-48f3-b7bc-f33ea87a1c0b',
		'Alger',
		'Réalisation de la station d’épuration des eaux usées des communes de Larbâa, Bougara et Ouled Slama y compris collecteurs (W, Blida)',
		'',
		'',
		'0',
		'5000000.000',
		'0.000',
		'0.000',
		'0.00',
		'0.00',
		'',
		'approved',
		'Programme 2025'
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'7a885841-adf1-48f3-b7bc-f33ea87a1c0b',
		'Alger',
		'Réalisation de la station d’épuration des eaux usées de Meftah et le pole urbain de Safsaf y compris collecteurs (W, Blida)',
		'',
		'',
		'0',
		'3500000.000',
		'0.000',
		'0.000',
		'0.00',
		'0.00',
		'',
		'approved',
		'Programme 2025'
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'd0bf1234-a5a2-4f01-8fe0-0cae5ceabc57',
		'7a885841-adf1-48f3-b7bc-f33ea87a1c0b',
		'Alger',
		'Réalisation de la station d’épuration de la ville nouvelle de Bouinan (wilaya de Blida)',
		'',
		'',
		'0',
		'5494000.000',
		'0.000',
		'0.000',
		'0.00',
		'25.00',
		'',
		'approved',
		'dégelée en date du 10/12/2020 (gestion ONA)'
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'b536f770-c6d3-41ac-87f6-a881d33709a4',
		'8f6959ca-221d-4728-9195-328cbf0c19c7',
		'Alger',
		'Réalisation d’une zone industrielle à Oued El Berdi wilaya de Bouira sur 193 Ha (tranche 2)',
		'',
		'',
		'0',
		'1500000.000',
		'1492019.983',
		'1450673.427',
		'0.00',
		'100.00',
		'',
		'approved',
		''
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'b536f770-c6d3-41ac-87f6-a881d33709a4',
		'8f6959ca-221d-4728-9195-328cbf0c19c7',
		'Alger',
		'Réalisation d’une zone industrielle à Dirah,wilaya de Bouira sur 250 Ha',
		'',
		'',
		'0',
		'2500000.000',
		'1833365.296',
		'1470926.750',
		'0.00',
		'90.00',
		'',
		'approved',
		''
	),
	(
		'eb304359-1693-41f7-8c8a-8cd766945b09',
		'349243fb-eb50-4240-a1ff-b6525ff16500',
		'ca336b31-7546-4782-9bd4-7a16945b570a',
		'Alger',
		'Etude et réalisation de 5000 logements locatifs (y compris viabilisation et les réservations pour les locaux commerciaux)',
		'Ain Benian, Saoula et Beni Messous',
		'37432',
		'0',
		'16117420.000',
		'14444734.858',
		'12355378.156',
		'76.66',
		'44.00',
		'à l’arrêt',
		'approved',
		'3600 logts achevés,1000 logt Ain Benian à 54% (résiliation avec l’entreprise BATIGEC le 24/10/2019.reprise du cahier des charges après 3 AAO infructueux), 150 logt Saoula à 32 % (affaire en justice contentieux suite à une résiliation),250 logt Sidi Youcef à 44 % (résiliation avec l’entreprise BATIGEC le 29/09/2019 reprise des travaux avec l’entreprise SNC NAAS)'
	),
	(
		'eb304359-1693-41f7-8c8a-8cd766945b09',
		'07bbd7d0-1ed0-4a45-88f4-b35d4570d3be',
		'cf9db9f4-84b1-4643-b3d9-e0a26c825b6d',
		'Alger',
		'Étude et réalisation de nouvelles résidences universitaires 18 000 lits: (4000 lits à Ouled Fayet II; 4000 lits à El Alia; 4000 lits à El Djorf; 3000 lits à Said Hamdine; 3000 lits à Ziania) avec dépendances',
		'Ouled Fayet,El Djorf,Said Hamdine, Benknoun',
		'38717',
		'0',
		'10789000.000',
		'10468489.869',
		'10270308.712',
		'95.19',
		'100.00',
		'Achevée',
		'approved',
		'Travaux achevés'
	),
	(
		'eb304359-1693-41f7-8c8a-8cd766945b09',
		'07bbd7d0-1ed0-4a45-88f4-b35d4570d3be',
		'cf9db9f4-84b1-4643-b3d9-e0a26c825b6d',
		'Alger',
		'Étude et réalisation résidences universitaires de 11.000 lits à Sidi Abdallah avec dépendances à sidi abdellah',
		'Sidi Abdallah',
		'41841',
		'0',
		'15920000.000',
		'15903704.166',
		'14384685.092',
		'90.36',
		'100.00',
		'Achevée',
		'approved',
		'Travaux achevés, Projet réceptionné le 19-06-2023'
	),
	(
		'eb304359-1693-41f7-8c8a-8cd766945b09',
		'07bbd7d0-1ed0-4a45-88f4-b35d4570d3be',
		'd7f7dca0-098f-41b3-8824-d2527139e127',
		'Alger',
		'Réalisation de 20.000 places pédagogiques avec dépendances à Sidi Abdallah',
		'Sidi Abdallah',
		'41423',
		'0',
		'25411055.000',
		'25385758.719',
		'21196181.722',
		'87.16',
		'100.00',
		'Achevée',
		'approved',
		'Travaux achevés, projet réceptionné'
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Réalisation et équipement d’un Hôpital 80 lits à Bordj Okhriss ',
		'',
		'',
		'0',
		'2730000.000',
		'603770.766',
		'563379.127',
		'0.00',
		'35.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Suivi, Réalisation et équipement d’un hôpital 120 lits à Ain Bessem',
		'',
		'',
		'0',
		'2000000.000',
		'1070656.744',
		'819399.511',
		'0.00',
		'70.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Suivi, réalisation et équipement d’un complexe mère et enfant (CME) à Bouira',
		'',
		'',
		'0',
		'3400000.000',
		'124623.525',
		'13449.513',
		'0.00',
		'2.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'05594ee8-281e-4a5a-8bea-1549aedc6bec',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Réalisation et équipement d’un hôpital 120 lits à M’chedallah',
		'',
		'',
		'0',
		'4448000.000',
		'3958952.835',
		'833517.227',
		'0.00',
		'35.00',
		'EN COURS',
		'approved',
		''
	),
	(
		'b9dcb774-bea9-4b1e-b616-2f16875d2bd9',
		'2cf652c6-536b-4683-9e91-e0775f766873',
		'de6e12ab-14b8-4d14-b15e-241fddac3295',
		'Alger',
		'Etude, suivi,Aménagement et extension du service des maladies infectieuses de L’EPH boufarik ""Wilaya de blida ""',
		'',
		'',
		'0',
		'250000.000',
		'27688.000',
		'478.000',
		'0.00',
		'0.00',
		'',
		'approved',
		''
	),
	(
		'eb304359-1693-41f7-8c8a-8cd766945b09',
		'7f2a3da1-99a0-4dc5-8589-5b8490785e7c',
		'e52d6d24-e857-4877-a034-da14de28e3e4',
		'Alger',
		'Sécurité publique au niveau de la capitale et réhabilitation du système de la vidéo surveillance',
		'ATW',
		'39813',
		'0',
		'16108000.000',
		'15142080.705',
		'10670180.697',
		'66.24',
		'57.00',
		'En cours',
		'approved',
		'Travaux en cours, pour la mise à niveau de 1736 caméras, reste la 2ème tranche : travaux de mats, électricité et fibre optique en cours. Conformément à l’envoi émanant du MICLAT n° 11970 du 04/11/2024, un accord préalable pour réévaluer l’opération d’un montant de 1,5 milliard de DA au titre de l’exercice 2025, alors que la demande d’inscription de la nouvelle opération de vidéosurveillance d’un montant de 7,5 milliards DA na pas abouti pour 2025 avec possibilité d’étude de la demande dans le cadre des projets des lois de finances des années à venir ).'
	);