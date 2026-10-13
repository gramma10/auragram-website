import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/ui/Legal';
import { BRAND, LEGAL, contactEmail } from '@/lib/config';
import { LegalValue } from '@/components/ui/LegalDetails';

export const metadata: Metadata = {
  title: 'Όροι Χρήσης',
  description: 'Οι όροι χρήσης του ιστότοπου.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="ΝΟΜΙΚΑ" title="Όροι Χρήσης" updated="Οκτώβριος 2026">
      <p className="text-[15px] leading-relaxed text-ink/80">
        Αυτοί οι όροι αφορούν μόνο τη χρήση του ιστότοπου της {BRAND.name}. Χρησιμοποιώντας τον, συμφωνείτε με τα παρακάτω.
      </p>

      <LegalSection n="01" title="Ποιοι είμαστε">
        <p>
          Ο ιστότοπος ανήκει στον {LEGAL.controllerA} και τον {LEGAL.controllerB}, που ενεργούν ως φυσικά πρόσωπα — δεν έχουμε
          ακόμα εταιρεία. <LegalValue field="city" before="Πόλη: " after=". " />
          Επικοινωνία:{' '}
          <a href={`mailto:${contactEmail()}`} className="border-b border-ink/30 hover:border-ink">
            {contactEmail()}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n="02" title="Τι είναι ο ιστότοπος">
        <p>
          Ο ιστότοπος παρουσιάζει τις υπηρεσίες μας και σας επιτρέπει να μας στείλετε ένα αίτημα επικοινωνίας. Η αποστολή
          της φόρμας δεν δημιουργεί σύμβαση ούτε υποχρέωση για κανέναν από τους δύο. Πώς χειριζόμαστε τα στοιχεία σας
          εξηγείται στην Πολιτική Απορρήτου.
        </p>
      </LegalSection>

      <LegalSection n="03" title="Εκτιμήσεις και τιμές">
        <p>
          Οι υπολογισμοί του εργαλείου ROI είναι εκτιμήσεις με βάση τις παραδοχές που αναγράφονται δίπλα στο εργαλείο. Δεν
          αποτελούν πρόβλεψη ή εγγύηση αποτελέσματος. Οι τιμές που αναφέρονται στον ιστότοπο είναι ενδεικτικές και δεν
          αποτελούν δεσμευτική προσφορά.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Περιεχόμενο και πνευματικά δικαιώματα">
        <p>
          Τα κείμενα, τα σχέδια και τα γραφικά του ιστότοπου ανήκουν σε εμάς. Μπορείτε να τα βλέπετε και να μοιράζεστε τον
          σύνδεσμο, αλλά όχι να τα αντιγράφετε ή να τα χρησιμοποιείτε εμπορικά χωρίς την άδειά μας.
        </p>
      </LegalSection>

      <LegalSection n="05" title="Ευθύνη">
        <p>
          Προσπαθούμε ο ιστότοπος να λειτουργεί σωστά και οι πληροφορίες του να είναι ακριβείς, αλλά τον παρέχουμε «ως έχει»,
          χωρίς εγγύηση ότι θα είναι πάντα διαθέσιμος ή χωρίς λάθη. Δεν ευθυνόμαστε για διακοπές υπηρεσιών τρίτων που
          χρησιμοποιεί ο ιστότοπος.
        </p>
      </LegalSection>

      <LegalSection n="06" title="Εφαρμοστέο δίκαιο">
        <p>
          Εφαρμόζεται το ελληνικό δίκαιο. Για κάθε διαφορά προσπαθούμε πρώτα να τα βρούμε φιλικά· αν δεν γίνει, αρμόδια
          είναι τα ελληνικά δικαστήρια.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
