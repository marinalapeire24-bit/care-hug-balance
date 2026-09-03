/*
# CareBalance — Données de démonstration fictives (Phase 1)

## Description
Crée une fonction sécurisée qui remplit le compte du soignant connecté
avec des patients, interventions, alertes et changements FICTIFS, afin
que l'application soit immédiatement utilisable après inscription.

## 1. Fonction
- `seed_demo_data()` : SECURITY DEFINER, exécutée par l'utilisateur connecté.
  - Ne fait rien si le soignant a déjà des interventions (idempotente).
  - Insère plusieurs patients fictifs et leurs interventions du jour,
    attribuées à `auth.uid()`, avec quelques alertes et changements récents.

## 2. Sécurité
- La fonction utilise `auth.uid()` : elle ne peut créer des données que
  pour l'utilisateur qui l'appelle.
- Droit d'exécution accordé au rôle `authenticated` uniquement.

## 3. Notes importantes
1. Toutes les données sont fictives (aucune donnée réelle de santé).
2. La fonction est rejouable sans créer de doublons.
*/

CREATE OR REPLACE FUNCTION seed_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  today date := current_date;
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
BEGIN
  IF uid IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM interventions WHERE caregiver_id = uid) THEN
    RETURN;
  END IF;

  INSERT INTO patients (first_name, last_name, birth_date, environment, address, room, fragility_level, summary)
  VALUES
    ('Marguerite', 'Dupont', '1938-04-12', 'domicile', '14 rue des Lilas, appartement 3B', NULL, 72,
     'Aide à la toilette et surveillance de la douleur au genou gauche. Vit seule, fille joignable.'),
    ('Robert', 'Lemaire', '1945-09-30', 'domicile', '2 impasse du Verger, maison avec portail', NULL, 45,
     'Diabétique, aide à la préparation des repas. Chien présent, portail à refermer.'),
    ('Yvette', 'Bernard', '1932-01-05', 'domicile', '8 avenue de la Gare, 2e étage sans ascenseur', NULL, 88,
     'Mobilité très réduite, transfert lit-fauteuil à deux si possible. Anxiété le matin.'),
    ('Henri', 'Rousseau', '1949-11-21', 'domicile', '25 chemin des Prés', NULL, 30,
     'Autonome, passage pour pansement à la jambe droite. Préfère les visites en fin de matinée.'),
    ('Simone', 'Girard', '1940-07-08', 'domicile', '5 place du Marché, code 45B12', NULL, 60,
     'Surveillance de l''hydratation. Malentendante, parler face à elle.')
  RETURNING id INTO p1;

  SELECT id INTO p1 FROM patients WHERE last_name = 'Dupont' AND first_name = 'Marguerite' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO p2 FROM patients WHERE last_name = 'Lemaire' AND first_name = 'Robert' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO p3 FROM patients WHERE last_name = 'Bernard' AND first_name = 'Yvette' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO p4 FROM patients WHERE last_name = 'Rousseau' AND first_name = 'Henri' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO p5 FROM patients WHERE last_name = 'Girard' AND first_name = 'Simone' ORDER BY created_at DESC LIMIT 1;

  INSERT INTO interventions (patient_id, caregiver_id, scheduled_at, duration_minutes, difficulty_level, travel_minutes, address, instructions, required_equipment, required_skills, status)
  VALUES
    (p1, uid, today + time '08:00', 45, 3, 10, '14 rue des Lilas, appartement 3B',
     'Aide à la toilette complète. Surveiller la douleur au genou gauche et la température.', 'Gants, gel hydroalcoolique', 'Aide à la toilette', 'a_faire'),
    (p2, uid, today + time '09:15', 30, 2, 12, '2 impasse du Verger',
     'Préparation du repas et prise de la glycémie. Refermer le portail en partant.', 'Lecteur de glycémie', 'Surveillance diabète', 'a_faire'),
    (p3, uid, today + time '10:15', 60, 5, 8, '8 avenue de la Gare, 2e étage',
     'Transfert lit-fauteuil, toilette. Rassurer, anxiété matinale. Escalier sans ascenseur.', 'Ceinture de transfert', 'Manutention', 'a_faire'),
    (p4, uid, today + time '11:45', 20, 1, 15, '25 chemin des Prés',
     'Réfection du pansement jambe droite. Vérifier absence de rougeur.', 'Kit pansement stérile', 'Soins de plaie', 'a_faire'),
    (p5, uid, today + time '14:00', 30, 2, 10, '5 place du Marché, code 45B12',
     'Surveillance hydratation, proposer à boire. Parler face à la patiente (malentendante).', 'Aucun', 'Relationnel', 'a_faire');

  INSERT INTO patient_alerts (patient_id, level, message)
  VALUES
    (p1, 'attention', 'Douleur au genou gauche signalée ce matin, à surveiller.'),
    (p3, 'critique', 'Risque de chute élevé : ne jamais laisser debout sans surveillance.'),
    (p3, 'attention', 'Transfert à réaliser à deux personnes si possible.'),
    (p2, 'info', 'Chien présent au domicile, calme mais présent.'),
    (p5, 'attention', 'Patiente malentendante : bien se placer face à elle.');

  INSERT INTO patient_changes (patient_id, category, description, occurred_at, source)
  VALUES
    (p1, 'douleur', 'Nouvelle douleur au genou gauche apparue ce matin.', now() - interval '3 hours', 'Transmission équipe du matin'),
    (p1, 'alimentation', 'A mangé seulement la moitié de son repas hier soir.', now() - interval '15 hours', 'Collègue de la veille'),
    (p3, 'comportement', 'Plus anxieuse que d''habitude depuis deux jours.', now() - interval '1 day', 'Infirmière référente'),
    (p3, 'mobilite', 'Transfert plus difficile, jambes moins stables.', now() - interval '20 hours', 'Transmission'),
    (p5, 'hydratation', 'Boit moins que d''habitude depuis hier.', now() - interval '10 hours', 'Collègue');
END;
$$;

REVOKE ALL ON FUNCTION seed_demo_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION seed_demo_data() TO authenticated;
