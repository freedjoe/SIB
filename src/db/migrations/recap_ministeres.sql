CREATE TABLE "recap_ministeres" (
    "Ministere"	VARCHAR(512),
    "Nombre opération"	INT,
    " AE Engagée"	DOUBLE,
    " AE actuelle"	INT,
    "Column5"	VARCHAR(512),
    "DRB/wilaya_1"	VARCHAR(512),
    "Nombre opération_2"	INT,
    " AE Engagée_3"	DOUBLE,
    " AE actuelle_4"	INT
);

INSERT INTO "recap_ministeres" ("Ministere", "Nombre opération", " AE Engagée", " AE actuelle", "Column5", "DRB/wilaya_1", "Nombre opération_2", " AE Engagée_3", " AE actuelle_4") VALUES
	('005:Intérieur, Collectivités Locales et Aménagement du Territoire', '26', '39892560.36', '82470864', '', 'Total général', '734', '1492086457', '3748394281'),
	('006:Justice', '39', '50726264.16', '101179809', '', '024:Travaux Publics et Infrastructures de Base', '190', '499200524.4', '1295474808'),
	('007:Finances', '1', '2333195.79', '2354700', '', '027:Santé', '99', '183422135.2', '382821814'),
	('008:Energie, Mines et Energies Renouvelables', '12', '7200000', '256025000', '', '051:Hydraulique', '98', '208337076.7', '672865918.4'),
	('010:Affaires Religieuses et Wakfs', '7', '5600742.4', '13405400', '', '021:Habitat, Urbanisme et Ville', '75', '138981208', '236364008'),
	('011:Education Nationale', '10', '9331301.542', '15878263', '', '020:Agriculture, Développement Rural et Pêche', '51', '82558141.15', '109011457.8'),
	('012:Enseignement Supérieur et  Recherche Scientifique', '50', '131333838.8', '192128593', '', '012:Enseignement Supérieur et  Recherche Scientifique', '50', '131333838.8', '192128593'),
	('014:Culture et Arts', '2', '1922185.499', '19467591', '', '006:Justice', '39', '50726264.16', '101179809'),
	('015:Sports', '16', '16243732.95', '37513238', '', '019:Industrie et Production Pharmaceutique', '39', '41631114.43', '74034884.5'),
	('019:Industrie et Production Pharmaceutique', '39', '41631114.43', '74034884.5', '', '005:Intérieur, Collectivités Locales et Aménagement du Territoire', '26', '39892560.36', '82470864'),
	('020:Agriculture, Développement Rural et Pêche', '51', '82558141.15', '109011457.8', '', '015:Sports', '16', '16243732.95', '37513238'),
	('021:Habitat, Urbanisme et Ville', '75', '138981208', '236364008', '', 'Non indiqué par la wilaya', '13', '71589869.98', '93062632.42'),
	('022:Commerce Intérieur et Régulation du Marché National', '2', '1782565.86', '3280300', '', '008:Energie, Mines et Energies Renouvelables', '12', '7200000', '256025000'),
	('024:Travaux Publics et Infrastructures de Base', '190', '499200524.4', '1295474808', '', '011:Education Nationale', '10', '9331301.542', '15878263'),
	('025:Transports', '3', '', '157555000', '', '010:Affaires Religieuses et Wakfs', '7', '5600742.4', '13405400'),
	('027:Santé', '99', '183422135.2', '382821814', '', '025:Transports', '3', '', '157555000'),
	('030:Environnement et Qualité de la Vie', '1', '0', '3500000', '', '014:Culture et Arts', '2', '1922185.499', '19467591'),
	('051:Hydraulique', '98', '208337076.7', '672865918.4', '', '022:Commerce Intérieur et Régulation du Marché National', '2', '1782565.86', '3280300'),
	('Non indiqué par la wilaya', '13', '71589869.98', '93062632.42', '', '007:Finances', '1', '2333195.79', '2354700'),
	('Total général', '734', '1492086457', '3748394281', '', '030:Environnement et Qualité de la Vie', '1', '0', '3500000'),
	('', '', '', '', '0.258855586', '', '', '', '');