import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/ui/Legal';
import { LEGAL, contactEmail } from '@/lib/config';
import { LegalValue } from '@/components/ui/LegalDetails';

export const metadata: Metadata = {
  title: 'Πολιτική Απορρήτου',
  description: 'Ποια στοιχεία σας κρατάμε, γιατί, πού και για πόσο — και τι δικαιώματα έχετε.',
  alternates: { canonical: '/privacy' },
};

const email = (
  <a href={`mailto:${contactEmail()}`} className="border-b border-ink/30 text-ink hover:border-ink">
    {contactEmail()}
  </a>
);

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="ΝΟΜΙΚΑ" title="Πολιτική Απορρήτου" updated="Οκτώβριος 2026">
      <p className="text-[15px] leading-relaxed text-ink/80">
        Εδώ εξηγούμε με απλά λόγια τι κάνουμε με τα στοιχεία που μας δίνετε όταν στέλνετε τη φόρμα, σύμφωνα με τον Γενικό
        Κανονισμό Προστασίας Δεδομένων (ΕΕ) 2016/679 (GDPR) και την ελληνική νομοθεσία.
      </p>

      <LegalSection n="01" title="Ποιοι είμαστε">
        <p>
          Υπεύθυνοι για τα στοιχεία σας είμαστε δύο άτομα: ο {LEGAL.controllerA} και ο {LEGAL.controllerB}. Δεν έχουμε
          ακόμα εταιρεία, γι’ αυτό ευθυνόμαστε προσωπικά, ο καθένας μας. <LegalValue field="city" before="Πόλη: " after=". " />
          Για οτιδήποτε αφορά τα στοιχεία σας, γράψτε μας στο {email}.
        </p>
      </LegalSection>

      <LegalSection n="02" title="Τι στοιχεία συλλέγουμε">
        <p>
          <strong className="font-semibold text-ink">Όσα γράφετε στη φόρμα:</strong> ονοματεπώνυμο, κινητό, email και
          επιχείρηση / κλάδο. Προαιρετικά: τι σας κάνει να ψάχνετε τώρα και τον τζίρο του τελευταίου 12μήνου.
        </p>
        <p>
          <strong className="font-semibold text-ink">Όσα προκύπτουν από τη χρήση του site:</strong> αν χρησιμοποιήσατε
          τον υπολογιστή ROI, τα νούμερα που βάλατε και το αποτέλεσμά τους· ο κλάδος που είδατε· από πού ήρθατε (η πηγή και
          η καμπάνια του συνδέσμου) και σε ποια σελίδα μπήκατε.
        </p>
        <p>Δεν ζητάμε ποτέ στοιχεία πληρωμής μέσω του site και δεν συλλέγουμε ευαίσθητα προσωπικά δεδομένα.</p>
      </LegalSection>

      <LegalSection n="03" title="Γιατί τα χρησιμοποιούμε">
        <p>
          Για δύο πράγματα: για να σας καλέσουμε σχετικά με το αίτημά σας και για να σας στείλουμε το email επιβεβαίωσης.
          Δεν τα πουλάμε και δεν τα δίνουμε σε τρίτους για διαφημίσεις.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Με ποια νομική βάση">
        <p>
          Για τη φόρμα: το <em>αίτημά σας</em>. Εσείς ζητάτε να σας καλέσουμε και εμείς κάνουμε ό,τι χρειάζεται γι’ αυτό
          (άρθρο 6 παρ. 1 στοιχ. β΄ GDPR). Για τα cookies στατιστικών και διαφήμισης: μόνο η <em>συγκατάθεσή σας</em>
          (άρθρο 6 παρ. 1 στοιχ. α΄), που μπορείτε να ανακαλέσετε όποτε θέλετε.
        </p>
      </LegalSection>

      <LegalSection n="05" title="Πού αποθηκεύονται και ποιος τα επεξεργάζεται">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong className="font-semibold text-ink">Vercel</strong> — φιλοξενεί τον ιστότοπο· η φόρμα περνά από τους
            διακομιστές του.
          </li>
          <li>
            <strong className="font-semibold text-ink">Google</strong> (Google Sheets και Gmail) — εκεί αποθηκεύεται το
            αίτημά σας και από εκεί στέλνουμε το email επιβεβαίωσης. Έχουν πρόσβαση μόνο οι δύο μας.
          </li>
          <li>
            <strong className="font-semibold text-ink">Εργαλεία στατιστικών</strong> (Google Analytics, Meta Pixel,
            Microsoft Clarity) — φορτώνουν μόνο αν τα αποδεχτείτε στο banner των cookies. Αν δεν συναινέσετε, δεν φορτώνεται
            κανένα.
          </li>
        </ul>
        <p>
          Μερικοί από αυτούς τους παρόχους μπορεί να επεξεργάζονται δεδομένα και εκτός Ευρωπαϊκού Οικονομικού Χώρου, με βάση
          τις Τυποποιημένες Συμβατικές Ρήτρες της Ευρωπαϊκής Επιτροπής.
        </p>
      </LegalSection>

      <LegalSection n="06" title="Πόσο καιρό τα κρατάμε">
        <p>
          Αν δεν ξεκινήσουμε συνεργασία, κρατάμε τα στοιχεία σας <strong className="font-semibold text-ink">12 μήνες</strong>
          και μετά τα διαγράφουμε. Αν ξεκινήσουμε, θα σας ενημερώσουμε χωριστά για τα στοιχεία του έργου.
        </p>
      </LegalSection>

      <LegalSection n="07" title="Τα δικαιώματά σας">
        <p>
          Μπορείτε να ζητήσετε να δείτε τι στοιχεία έχουμε για εσάς (πρόσβαση), να τα διορθώσουμε, να τα διαγράψουμε ή να
          αντιταχθείτε στην επεξεργασία τους. Στείλτε μας email στο {email} και σας απαντάμε μέσα σε ένα μήνα.
        </p>
      </LegalSection>

      <LegalSection n="08" title="Αν θέλετε να παραπονεθείτε">
        <p>
          Έχετε δικαίωμα να κάνετε καταγγελία στην Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα (www.dpa.gr).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
