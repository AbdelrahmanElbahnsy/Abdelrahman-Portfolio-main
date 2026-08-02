import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { about } from '../../data/portfolioData.js';

export const migrateAbout = async () => {
  try {
    const aboutRef = doc(db, 'about', 'main');
    
    // Check if migration already happened
    const snap = await getDoc(aboutRef);
    if (snap.exists()) {
      console.log('[CMS MIGRATION] About data already migrated. Skipping.');
      return;
    }

    const aboutData = {
      subtitle: about.subtitle || '',
      title: about.title || '',
      lead: about.lead || '',
      paragraphsJson: JSON.stringify(about.paragraphs || []),
      badgesJson: JSON.stringify(about.badges || []),
      terminalItemsJson: JSON.stringify(about.terminalItems || []),
      createdAt: new Date()
    };
    
    await setDoc(aboutRef, aboutData);
    console.log('[CMS MIGRATION] About data successfully migrated to Firestore.');
  } catch (error) {
    console.error('[CMS MIGRATION] Error migrating About data:', error);
  }
};
