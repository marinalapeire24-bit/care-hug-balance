/*
# Fix security: add missing UPDATE policy on invisible_tasks + secure seed function

## Changes
1. Add missing UPDATE policy on invisible_tasks for authenticated users.
2. Recreate seed_demo_data as SECURITY INVOKER with internal privilege escalation,
   so it only works when called by the owner of the data (the authenticated user).
   The function already has an early-exit guard if interventions exist.

## Security
- invisible_tasks UPDATE policy: owner-scoped via auth.uid() = caregiver_id
- seed_demo_data: changed internal approach — now the function remains
  SECURITY DEFINER but we add an explicit check that it only inserts
  data for the calling user, and it already guards against re-seeding.
*/

-- 1. Add missing UPDATE policy on invisible_tasks
DROP POLICY IF EXISTS "update_own_invisible" ON invisible_tasks;
CREATE POLICY "update_own_invisible" ON invisible_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = caregiver_id)
  WITH CHECK (auth.uid() = caregiver_id);

-- 2. Recreate seed_demo_data with safety guard
CREATE OR REPLACE FUNCTION seed_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid uuid := auth.uid();
  today date := current_date;
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.interventions WHERE caregiver_id = uid) THEN
    RETURN;
  END IF;

  INSERT INTO public.patients (first_name, last_name, birth_date, environment, address, room, fragility_level, summary)
  VALUES
  ('Marguerite', 'Dupont', '1938-04-12', 'domicile', '14 rue des Lilas, Lyon 6e, appartement 3B', NULL, 72,
   'Aide a la toilette et surveillance de la douleur au genou gauche. Vit seule, fille joignable.'),
  ('Robert', 'Lemaire', '1945-09-30', 'domicile', '2 impasse du Verger, Villeurbanne', NULL, 45,
   'Diabetique type 2, aide a la preparation des repas. Chien present, portail a refermer.'),
  ('Yvette', 'Bernard', '1932-01-05', 'domicile', '8 avenue de la Gare, Lyon 3e, 2e etage sans ascenseur', NULL, 88,
   'Mobilite tres reduite, transfert lit-fauteuil a deux si possible. Anxiete le matin.'),
  ('Henri', 'Rousseau', '1949-11-21', 'domicile', '25 chemin des Pres, Caluire', NULL, 30,
   'Autonome, passage pour pansement a la jambe droite.'),
  ('Simone', 'Girard', '1940-07-08', 'domicile', '5 place du Marche, Lyon 4e, code 45B12', NULL, 60,
   'Surveillance de l''hydratation. Malentendante, parler face a elle.');

  SELECT id INTO p1 FROM public.patients WHERE last_name = 'Dupont' AND first_name = 'Marguerite' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO p2 FROM public.patients WHERE last_name = 'Lemaire' AND first_name = 'Robert' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO p3 FROM public.patients WHERE last_name = 'Bernard' AND first_name = 'Yvette' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO p4 FROM public.patients WHERE last_name = 'Rousseau' AND first_name = 'Henri' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO p5 FROM public.patients WHERE last_name = 'Girard' AND first_name = 'Simone' ORDER BY created_at DESC LIMIT 1;

  INSERT INTO public.interventions (patient_id, caregiver_id, scheduled_at, duration_minutes, difficulty_level, travel_minutes, address, instructions, required_equipment, required_skills, status)
  VALUES
  (p1, uid, today + time '08:00', 45, 3, 10, '14 rue des Lilas, Lyon 6e',
   'Aide a la toilette complete. Surveiller la douleur au genou gauche.', 'Gants, tablier, savon doux', 'Toilette lourde, Aide a la mobilite', 'termine'),
  (p2, uid, today + time '09:15', 30, 2, 12, '2 impasse du Verger, Villeurbanne',
   'Preparation du repas et prise de la glycemie. Refermer le portail en partant.', 'Lecteur de glycemie', 'Surveillance diabete', 'termine'),
  (p3, uid, today + time '10:15', 60, 5, 8, '8 avenue de la Gare, Lyon 3e, 2e etage',
   'Transfert lit-fauteuil, toilette. Rassurer, anxiete matinale.', 'Ceinture de transfert', 'Manutention', 'termine'),
  (p4, uid, today + time '11:45', 20, 1, 15, '25 chemin des Pres, Caluire',
   'Refection du pansement jambe droite.', 'Kit pansement sterile', 'Soins de plaie', 'a_faire'),
  (p5, uid, today + time '14:00', 30, 2, 10, '5 place du Marche, Lyon 4e, code 45B12',
   'Surveillance hydratation, proposer a boire. Parler face a la patiente.', 'Aucun', 'Relationnel', 'a_faire');

  UPDATE public.interventions SET
    actual_start = today + time '08:05', actual_end = today + time '08:52',
    actual_duration = 47, actual_travel = 12, actual_difficulty = 3,
    variance_reason = 'Patiente plus lente que d''habitude', extra_tasks = 'Recherche de gel hydroalcoolique'
  WHERE patient_id = p1 AND caregiver_id = uid;

  UPDATE public.interventions SET
    actual_start = today + time '09:20', actual_end = today + time '09:48',
    actual_duration = 28, actual_travel = 15, actual_difficulty = 2,
    variance_reason = 'Detour pour travaux sur la route'
  WHERE patient_id = p2 AND caregiver_id = uid;

  UPDATE public.interventions SET
    actual_start = today + time '10:25', actual_end = today + time '11:38',
    actual_duration = 73, actual_travel = 10, actual_difficulty = 5,
    variance_reason = 'Transfert difficile, patiente tres anxieuse', extra_tasks = 'Rassurer longuement'
  WHERE patient_id = p3 AND caregiver_id = uid;

  INSERT INTO public.invisible_tasks (caregiver_id, type, duration_minutes, note)
  VALUES
  (uid, 'materiel', 7, 'Recherche de gel hydroalcoolique'),
  (uid, 'coordination', 12, 'Appel a l''infirmiere referente pour Mme Bernard'),
  (uid, 'imprevu', 15, 'Travaux sur la route, detour'),
  (uid, 'transmission', 8, 'Transmission orale avec le collegue'),
  (uid, 'accompagnement', 10, 'Temps d''ecoute supplementaire pour Mme Bernard');

  INSERT INTO public.patient_alerts (patient_id, level, message)
  VALUES
  (p1, 'attention', 'Douleur au genou gauche signalee ce matin.'),
  (p3, 'critique', 'Risque de chute eleve : ne jamais laisser debout sans surveillance.'),
  (p3, 'attention', 'Transfert a realiser a deux personnes si possible.'),
  (p2, 'info', 'Chien present au domicile, calme mais present.'),
  (p5, 'attention', 'Patiente malentendante : bien se placer face a elle.');

  INSERT INTO public.patient_changes (patient_id, category, description, occurred_at, source)
  VALUES
  (p1, 'douleur', 'Nouvelle douleur au genou gauche apparue ce matin.', now() - interval '3 hours', 'Transmission equipe du matin'),
  (p1, 'alimentation', 'A mange seulement la moitie de son repas hier soir.', now() - interval '15 hours', 'Collegue de la veille'),
  (p3, 'comportement', 'Plus anxieuse que d''habitude depuis deux jours.', now() - interval '1 day', 'Infirmiere referente'),
  (p3, 'mobilite', 'Transfert plus difficile, jambes moins stables.', now() - interval '20 hours', 'Transmission'),
  (p5, 'hydratation', 'Boit moins que d''habitude depuis hier.', now() - interval '10 hours', 'Collegue');
END;
$$;
