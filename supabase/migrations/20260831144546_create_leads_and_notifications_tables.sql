-- =============================================================
-- Leads table — replaces in-memory leads.ts store
-- =============================================================
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  relationship text NOT NULL DEFAULT 'moi_meme',
  service_type text NOT NULL DEFAULT 'aide_a_domicile',
  urgency text NOT NULL DEFAULT 'pas_presse',
  situation text NOT NULL DEFAULT '',
  preferred_contact_time text,
  city text,
  status text NOT NULL DEFAULT 'nouveau',
  priority_score integer NOT NULL DEFAULT 0,
  qualification_note text NOT NULL DEFAULT '',
  assigned_to text,
  called_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_leads" ON leads FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_leads" ON leads FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "update_leads" ON leads FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "delete_leads" ON leads FOR DELETE
  TO authenticated USING (true);

-- Also allow anon to INSERT leads (public intake form, no auth needed)
GRANT INSERT (full_name, phone, email, relationship, service_type, urgency, situation, preferred_contact_time, city) ON leads TO anon;

-- anon policy for insert
CREATE POLICY "insert_leads_anon" ON leads FOR INSERT
  TO anon WITH CHECK (true);

-- =============================================================
-- Notifications table — real notification system
-- =============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role_target text,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  link_tab text,
  link_id text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR role_target = (SELECT role FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR role_target = (SELECT role FROM profiles WHERE id = auth.uid()))
  WITH CHECK (user_id = auth.uid() OR role_target = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Restrict notification update to read field only
REVOKE UPDATE ON notifications FROM authenticated;
GRANT UPDATE (read) ON notifications TO authenticated;

-- =============================================================
-- Seed some demo leads
-- =============================================================
INSERT INTO leads (full_name, phone, email, relationship, service_type, urgency, situation, city, status, priority_score, qualification_note, created_at)
VALUES
('Marie Lefèvre', '06 12 34 56 78', 'marie.lefevre@email.fr', 'parent', 'aide_a_domicile', 'urgent', 'Ma mère de 87 ans est sortie de l''hôpital après une fracture du col du fémur. Elle ne peut plus se lever seule.', 'Lyon', 'nouveau', 92, 'Urgence médicale post-hospitalisation', now() - interval '2 hours'),
('Philippe Durand', '06 98 76 54 32', NULL, 'moi_meme', 'soins_infirmiers', 'cette_semaine', 'Je suis diabétique et j''ai besoin de soins infirmiers quotidiens suite à une plaie au pied.', 'Villeurbanne', 'qualifie', 78, 'Soins infirmiers urgents — plaie diabétique', now() - interval '1 day'),
('Sophie Petit', '06 55 44 33 22', 'sophie.petit@gmail.com', 'conjoint', 'aide_a_domicile', 'ce_mois', 'Mon mari a la maladie d''Alzheimer. Il commence à avoir besoin d''aide pour la toilette et les repas.', 'Lyon 3', 'en_cours', 65, 'Accompagnement Alzheimer — besoin progressif', now() - interval '3 days'),
('Jean-Pierre Martin', '06 11 22 33 44', NULL, 'moi_meme', 'garde_nuit', 'urgent', 'Je vis seul, 92 ans. Chutes fréquentes la nuit. Ma fille est inquiète.', 'Caluire', 'nouveau', 88, 'Personne isolée — risque de chute élevé', now() - interval '6 hours'),
('Anne Moreau', '06 77 88 99 00', 'a.moreau@hotmail.fr', 'enfant', 'accompagnement_handicap', 'cette_semaine', 'Mon fils de 35 ans est en situation de handicap moteur. Il a besoin d''aide pour les actes de la vie quotidienne.', 'Bron', 'qualifie', 55, 'Handicap moteur — évaluation nécessaire', now() - interval '5 days'),
('Nathalie Bernard', '06 33 22 11 00', NULL, 'parent', 'aide_a_domicile', 'pas_presse', 'Mon père de 78 ans commence à perdre son autonomie. Il oublie ses médicaments et mange de moins en moins.', 'Lyon 8', 'a_rappeler', 42, 'Perte d''autonomie progressive — premier contact', now() - interval '7 days'),
('François Lambert', '06 44 55 66 77', 'f.lambert@orange.fr', 'moi_meme', 'transport', 'ce_mois', 'J''ai 68 ans, je ne conduis plus. J''ai besoin d''un transport pour mes rendez-vous médicaux 2 fois par semaine.', 'Tassin', 'converti', 35, 'Transport médical régulier', now() - interval '14 days'),
('Isabelle Roux', '06 88 77 66 55', NULL, 'parent', 'aide_a_domicile', 'urgent', 'Ma mère revient de l''hôpital demain. Elle a besoin d''une aide immédiate à domicile. Nous n''avons rien organisé.', 'Oullins', 'nouveau', 95, 'URGENCE — retour hôpital sans préparation', now() - interval '30 minutes');

-- Seed some demo notifications for the existing user
INSERT INTO notifications (user_id, type, title, message, link_tab, created_at)
VALUES
('0fe28a04-eb90-42d4-ab64-99e3b051e3a1', 'nouvelle_demande', 'Nouvelle demande urgente', 'Isabelle Roux a envoyé une demande urgente pour sa mère (retour hôpital demain).', 'leads', now() - interval '30 minutes'),
('0fe28a04-eb90-42d4-ab64-99e3b051e3a1', 'parcours', 'Blocage sur le parcours Dupont', 'Le matelas anti-escarres n''est pas disponible. Étape 7 bloquée.', 'pathway', now() - interval '1 day'),
('0fe28a04-eb90-42d4-ab64-99e3b051e3a1', 'transmission', 'Transmission urgente', 'Dr. Lambert a mis à jour l''ordonnance de Mme Dupont (anticoagulant + antalgiques).', 'pathway', now() - interval '2 hours');

INSERT INTO notifications (role_target, type, title, message, link_tab, created_at)
VALUES
('coordinateur', 'nouvelle_demande', 'Demande prioritaire', 'Jean-Pierre Martin, 92 ans, vit seul avec risque de chute élevé. Demande de garde de nuit.', 'leads', now() - interval '6 hours'),
('directeur', 'activite', 'Pic d''activité détecté', '3 nouvelles demandes urgentes en 24h. Capacité d''équipe à surveiller.', 'director', now() - interval '3 hours');
