import { ArrowLeft, AlertTriangle, Shield } from 'lucide-react';

interface Props {
  page: 'mentions_legales' | 'cgv' | 'cgu' | 'confidentialite';
  onBack: () => void;
}

const PAGE_TITLES: Record<Props['page'], string> = {
  mentions_legales: 'Mentions légales',
  cgv: 'Conditions Générales de Vente',
  cgu: "Conditions Générales d'Utilisation",
  confidentialite: 'Politique de Confidentialité',
};

function WarningBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
      <p>
        Ce document est un modèle fourni à titre indicatif. Il doit être révisé
        et validé par un professionnel du droit avant toute utilisation en
        production.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-ink-100 dark:border-ink-700 pt-4 mt-4">
      <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-100 mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-base font-medium text-ink-700 dark:text-ink-200 mb-1">{title}</h3>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed mt-1">{children}</p>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1 text-sm text-ink-600 dark:text-ink-300 mt-1">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function Placeholder() {
  return <span className="text-amber-600 dark:text-amber-400 font-medium">[À compléter]</span>;
}

function MentionsLegales() {
  return (
    <>
      <Section title="Éditeur du site">
        <P>
          CareBalance SAS — Société par actions simplifiée au capital de <Placeholder />
        </P>
        <UL
          items={[
            'Siège social : [Adresse à compléter]',
            'SIRET : [À compléter]',
            'RCS : [À compléter]',
            'Numéro de TVA : [À compléter]',
            'Directeur de la publication : [À compléter]',
            'Contact : support@carebalance.fr',
          ]}
        />
      </Section>

      <Section title="Hébergement">
        <P>
          L'application est hébergée par Supabase Inc., 970 Toa Payoh North,
          Singapore 318992. Pour un déploiement en production avec des données
          réelles de santé, un hébergeur certifié HDS (Hébergeur de Données de
          Santé) sera requis conformément à l'article L.1111-8 du Code de la
          santé publique.
        </P>
      </Section>

      <Section title="Propriété intellectuelle">
        <P>
          L'ensemble des contenus, textes, images, graphismes, logos, icônes et
          logiciels présents sur la plateforme CareBalance sont la propriété
          exclusive de CareBalance SAS ou de ses partenaires et sont protégés
          par les lois françaises et internationales relatives à la propriété
          intellectuelle. Toute reproduction, représentation, modification ou
          exploitation non autorisée est strictement interdite.
        </P>
      </Section>

      <Section title="Limitation de responsabilité">
        <P>
          CareBalance SAS s'efforce d'assurer l'exactitude des informations
          diffusées mais ne peut garantir l'absence d'erreurs ou d'omissions.
          L'utilisation de la plateforme se fait sous la responsabilité de
          l'utilisateur. CareBalance ne saurait être tenu responsable des
          dommages directs ou indirects résultant de l'utilisation de la
          plateforme.
        </P>
      </Section>

      <Section title="Loi applicable">
        <P>
          Les présentes mentions légales sont soumises au droit français. Tout
          litige sera soumis à la compétence exclusive des tribunaux du ressort
          du siège social de CareBalance SAS.
        </P>
      </Section>
    </>
  );
}

function CGV() {
  return (
    <>
      <Section title="Article 1 — Objet">
        <P>
          Les présentes Conditions Générales de Vente régissent les relations
          contractuelles entre CareBalance SAS et tout client professionnel
          utilisant la plateforme CareBalance de coordination d'aide à domicile.
        </P>
      </Section>

      <Section title="Article 2 — Inscription et accès au service">
        <P>
          L'accès à la plateforme nécessite la création d'un compte. Le client
          s'engage à fournir des informations exactes et à maintenir la
          confidentialité de ses identifiants. L'accès est accordé pour la durée
          de l'abonnement souscrit.
        </P>
      </Section>

      <Section title="Article 3 — Tarification">
        <P>
          Les tarifs applicables sont définis dans la grille tarifaire en vigueur
          communiquée au client lors de la souscription. <Placeholder /> — Grille tarifaire à définir.
        </P>
        <P>
          Les prix sont exprimés en euros hors taxes. La TVA applicable sera
          ajoutée au taux en vigueur.
        </P>
      </Section>

      <Section title="Article 4 — Durée et résiliation">
        <P>
          L'abonnement est souscrit pour une durée initiale définie dans le
          contrat. Il est renouvelable par tacite reconduction. Chaque partie
          peut résilier le contrat avec un préavis de trois mois avant la date
          d'échéance, par lettre recommandée avec accusé de réception.
        </P>
      </Section>

      <Section title="Article 5 — Responsabilités">
        <P>
          CareBalance s'engage à mettre en œuvre les moyens nécessaires pour
          assurer la disponibilité et la sécurité de la plateforme. CareBalance
          ne saurait être tenu responsable des décisions prises par les
          utilisateurs sur la base des informations affichées dans
          l'application. La plateforme est un outil d'aide à la coordination et
          ne se substitue en aucun cas au jugement professionnel.
        </P>
      </Section>

      <Section title="Article 6 — Données personnelles">
        <P>
          Le traitement des données personnelles est détaillé dans la Politique
          de Confidentialité accessible depuis l'application. Le client reconnaît
          avoir pris connaissance de cette politique et l'accepte.
        </P>
      </Section>

      <Section title="Article 7 — Droit de rétractation">
        <P>
          Conformément aux articles L.221-18 et suivants du Code de la
          consommation, le client professionnel ne bénéficie pas du droit de
          rétractation. Pour les consommateurs, un délai de rétractation de
          14 jours à compter de la souscription est applicable.
        </P>
      </Section>

      <Section title="Article 8 — Modifications">
        <P>
          CareBalance se réserve le droit de modifier les présentes CGV. Les
          clients seront informés de toute modification au moins 30 jours avant
          son entrée en vigueur. La poursuite de l'utilisation vaut acceptation
          des nouvelles conditions.
        </P>
      </Section>

      <Section title="Article 9 — Loi applicable">
        <P>
          Les présentes CGV sont soumises au droit français. En cas de litige,
          les parties s'engagent à rechercher une solution amiable. À défaut,
          les tribunaux compétents seront ceux du siège social de CareBalance
          SAS.
        </P>
      </Section>
    </>
  );
}

function CGU() {
  return (
    <>
      <Section title="Article 1 — Objet et acceptation">
        <P>
          Les présentes Conditions Générales d'Utilisation définissent les
          modalités d'accès et d'utilisation de la plateforme CareBalance.
          L'utilisation de la plateforme implique l'acceptation pleine et
          entière des présentes CGU.
        </P>
      </Section>

      <Section title="Article 2 — Description du service">
        <P>CareBalance est une plateforme de coordination d'aide à domicile permettant :</P>
        <UL
          items={[
            'La coordination des interventions à domicile',
            'Le suivi des parcours de soins (hôpital → domicile)',
            'La gestion du planning et des intervenants',
            'Les transmissions entre professionnels',
            "L'information des familles autorisées",
            "Le suivi de l'activité et des indicateurs",
          ]}
        />
      </Section>

      <Section title="Article 3 — Accès et inscription">
        <P>
          L'accès à la plateforme est réservé aux utilisateurs disposant d'un
          compte créé par un administrateur ou via le formulaire d'inscription.
          Chaque utilisateur se voit attribuer un rôle déterminant ses droits
          d'accès.
        </P>
      </Section>

      <Section title="Article 4 — Obligations des utilisateurs">
        <P>L'utilisateur s'engage à :</P>
        <UL
          items={[
            'Fournir des informations exactes et à jour',
            'Maintenir la confidentialité de ses identifiants',
            'Utiliser la plateforme dans un cadre professionnel conforme à sa mission',
            'Ne pas communiquer ses accès à des tiers non autorisés',
            'Respecter la confidentialité des données des bénéficiaires',
            'Signaler immédiatement tout accès non autorisé ou incident de sécurité',
          ]}
        />
      </Section>

      <Section title="Article 5 — Rôles et responsabilités">
        <Sub title="Administrateur">
          <P>
            Gestion des comptes, configuration de la plateforme, attribution des
            rôles et accès à l'ensemble des fonctionnalités.
          </P>
        </Sub>
        <Sub title="Directeur">
          <P>
            Supervision de l'activité, accès aux indicateurs, tableaux de bord
            et outils de décision.
          </P>
        </Sub>
        <Sub title="Coordinateur">
          <P>
            Gestion des parcours de soins, planification des interventions,
            traitement des demandes d'aide et transmissions.
          </P>
        </Sub>
        <Sub title="Salarié terrain (intervenant)">
          <P>
            Consultation de son planning, signalement de difficultés, saisie des
            transmissions et du travail invisible.
          </P>
        </Sub>
        <Sub title="Professionnel de santé">
          <P>
            Accès aux informations de suivi des bénéficiaires concernés,
            transmissions médicales et parcours de sortie d'hospitalisation.
          </P>
        </Sub>
        <Sub title="Proche / Famille">
          <P>
            Consultation des passages effectués et des informations partagées par
            le service, dans la limite des autorisations accordées.
          </P>
        </Sub>
      </Section>

      <Section title="Article 6 — Contenu et données">
        <P>
          Les utilisateurs restent propriétaires des données qu'ils saisissent
          dans la plateforme. CareBalance ne peut utiliser ces données qu'aux
          fins décrites dans la Politique de Confidentialité. En cas de
          résiliation, les données sont restituables sur demande dans un format
          standard.
        </P>
      </Section>

      <Section title="Article 7 — Interdictions">
        <P>Il est strictement interdit de :</P>
        <UL
          items={[
            'Extraire ou collecter systématiquement les données de la plateforme (scraping)',
            "Tenter d'accéder à des données ou fonctionnalités non autorisées",
            'Utiliser la plateforme à des fins frauduleuses',
            'Introduire des logiciels malveillants',
            "Perturber le fonctionnement de l'application",
          ]}
        />
      </Section>

      <Section title="Article 8 — Disponibilité">
        <P>
          CareBalance s'engage à assurer une disponibilité maximale de la
          plateforme. Des interruptions pour maintenance pourront intervenir,
          avec un préavis raisonnable. CareBalance ne peut être tenu responsable
          des interruptions liées à des événements de force majeure.
        </P>
      </Section>

      <Section title="Article 9 — Loi applicable">
        <P>
          Les présentes CGU sont régies par le droit français. En cas de litige
          non résolu à l'amiable, les tribunaux compétents seront ceux du siège
          social de CareBalance SAS.
        </P>
      </Section>
    </>
  );
}

function Confidentialite() {
  return (
    <>
      <div className="flex items-center gap-2 mt-2">
        <Shield size={20} className="text-brand-500" />
        <span className="text-sm font-medium text-brand-600 dark:text-brand-300">
          Conformité RGPD — Règlement (UE) 2016/679
        </span>
      </div>

      <Section title="1. Responsable du traitement">
        <P>
          CareBalance SAS — <Placeholder /> (adresse du siège social).
          Contact : support@carebalance.fr.
          Délégué à la Protection des Données (DPO) : <Placeholder />.
        </P>
      </Section>

      <Section title="2. Données collectées">
        <Sub title="Données d'identification">
          <P>Nom, prénom, adresse e-mail, numéro de téléphone, identifiant de compte.</P>
        </Sub>
        <Sub title="Données professionnelles">
          <P>Rôle, qualification, secteur d'intervention, organisme de rattachement.</P>
        </Sub>
        <Sub title="Données de santé des bénéficiaires">
          <P>
            Alertes médicales, pathologies, niveaux d'autonomie, comptes-rendus
            d'hospitalisation, plans d'aide, évaluations des besoins,
            transmissions de soins. Ces données sont considérées comme des
            données sensibles au sens de l'article 9 du RGPD.
          </P>
        </Sub>
        <Sub title="Données de localisation">
          <P>Adresses d'intervention des bénéficiaires.</P>
        </Sub>
        <Sub title="Données de connexion">
          <P>Journaux de connexion, adresse IP, durée de session, appareil utilisé.</P>
        </Sub>
      </Section>

      <Section title="3. Finalités du traitement">
        <UL
          items={[
            'Coordination des soins et interventions à domicile',
            'Gestion du planning et des affectations',
            'Suivi des parcours de soins (hôpital → domicile)',
            'Communication entre professionnels (transmissions)',
            'Information des familles autorisées sur les passages',
            "Analyse de l'activité et amélioration du service",
            'Gestion administrative des comptes et accès',
          ]}
        />
      </Section>

      <Section title="4. Base légale">
        <UL
          items={[
            "Exécution contractuelle : gestion des comptes, fourniture du service",
            "Intérêt légitime : amélioration de la plateforme, prévention des fraudes",
            "Consentement : données non strictement nécessaires au service",
            "Obligation légale : conservation des données de santé (Code de la santé publique)",
          ]}
        />
      </Section>

      <Section title="5. Durée de conservation">
        <UL
          items={[
            'Données de santé : 20 ans après la dernière intervention (article R.1112-7 du Code de la santé publique)',
            'Données de compte : 3 ans après la dernière connexion',
            'Journaux de connexion : 1 an',
            'Données de facturation : 10 ans (obligations comptables)',
          ]}
        />
      </Section>

      <Section title="6. Destinataires des données">
        <P>Les données sont accessibles uniquement par :</P>
        <UL
          items={[
            "L'équipe CareBalance (dans la limite de leurs fonctions)",
            'Les professionnels autorisés selon leur rôle',
            'Les sous-traitants techniques (Supabase — hébergement et base de données)',
          ]}
        />
        <P>
          Aucune donnée n'est vendue ni communiquée à des tiers à des fins
          commerciales.
        </P>
      </Section>

      <Section title="7. Transferts hors Union Européenne">
        <P>
          L'hébergement des données est assuré par Supabase Inc. Des transferts
          de données hors de l'Union Européenne peuvent intervenir dans le cadre
          de cet hébergement, encadrés par des clauses contractuelles types
          conformes aux exigences de la Commission Européenne.
        </P>
      </Section>

      <Section title="8. Droits des personnes">
        <P>Conformément au RGPD, vous disposez des droits suivants :</P>
        <UL
          items={[
            "Droit d'accès : obtenir une copie de vos données personnelles",
            'Droit de rectification : corriger des données inexactes',
            "Droit à l'effacement : demander la suppression de vos données",
            'Droit à la portabilité : recevoir vos données dans un format structuré',
            'Droit à la limitation : restreindre le traitement de vos données',
            "Droit d'opposition : vous opposer au traitement de vos données",
          ]}
        />
        <P>
          Pour exercer ces droits, contactez notre DPO à l'adresse :
          dpo@carebalance.fr. Nous répondrons dans un délai de 30 jours. En cas
          de désaccord, vous pouvez introduire une réclamation auprès de la CNIL
          (Commission Nationale de l'Informatique et des Libertés).
        </P>
      </Section>

      <Section title="9. Cookies et traceurs">
        <P>
          La plateforme utilise uniquement des cookies techniques strictement
          nécessaires au fonctionnement du service (authentification, session).
          Aucun cookie marketing, publicitaire ou de suivi n'est utilisé.
        </P>
      </Section>

      <Section title="10. Sécurité des données">
        <P>CareBalance met en œuvre les mesures suivantes :</P>
        <UL
          items={[
            'Chiffrement des communications (HTTPS/TLS)',
            'Chiffrement des données au repos',
            "Contrôle d'accès basé sur les rôles (RBAC)",
            'Politique de sécurité des mots de passe',
            'Journalisation des accès',
            'Audits de sécurité réguliers',
          ]}
        />
      </Section>

      <Section title="11. Notification en cas de violation">
        <P>
          En cas de violation de données à caractère personnel présentant un
          risque pour les droits et libertés des personnes, CareBalance
          s'engage à notifier la CNIL dans un délai de 72 heures et à informer
          les personnes concernées dans les meilleurs délais.
        </P>
      </Section>

      <Section title="12. Hébergement des données de santé">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mt-2">
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            Information importante
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Pour un déploiement en production avec des données réelles de santé,
            la réglementation française impose le recours à un hébergeur certifié
            HDS (Hébergeur de Données de Santé), conformément à l'article
            L.1111-8 du Code de la santé publique. La configuration actuelle
            (Supabase) est adaptée au développement et à la démonstration mais
            devra être migrée vers une infrastructure certifiée HDS avant toute
            utilisation avec des données de santé réelles.
          </p>
        </div>
      </Section>
    </>
  );
}

const CONTENT_MAP: Record<Props['page'], () => JSX.Element> = {
  mentions_legales: MentionsLegales,
  cgv: CGV,
  cgu: CGU,
  confidentialite: Confidentialite,
};

export default function LegalPages({ page, onBack }: Props) {
  const Content = CONTENT_MAP[page];

  return (
    <div className="px-4 pt-5 pb-6 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-ink-500 dark:text-ink-300 tap mb-4"
      >
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-sm border border-ink-100 dark:border-ink-700">
        <WarningBanner />

        <h1 className="text-2xl font-bold text-ink-900 dark:text-white mt-4">
          {PAGE_TITLES[page]}
        </h1>

        <Content />

        <div className="border-t border-ink-100 dark:border-ink-700 pt-4 mt-6">
          <p className="text-xs text-ink-400 dark:text-ink-500">
            Dernière mise à jour : 31 août 2026
          </p>
        </div>
      </div>
    </div>
  );
}
