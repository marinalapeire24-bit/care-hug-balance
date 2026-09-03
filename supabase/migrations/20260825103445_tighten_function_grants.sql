/*
# CareBalance — Renforcement des droits sur les fonctions (Phase 1)

## Description
Restreint l'exécution des fonctions internes. La fonction de création
de profil est un déclencheur : elle ne doit être appelable par personne
via l'API. La fonction de démonstration reste réservée aux utilisateurs
connectés et ne peut agir que sur leurs propres données.

## Sécurité
- `handle_new_user()` : exécution retirée à tous les rôles API (anon, authenticated).
- `seed_demo_data()` : exécution retirée à `anon`, conservée pour `authenticated`.
*/

REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION seed_demo_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION seed_demo_data() TO authenticated;
