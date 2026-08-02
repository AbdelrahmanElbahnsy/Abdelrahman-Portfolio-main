import { personalInfo } from '../../data/portfolioData.js';
import { db } from '../../services/firebase.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const migrateHero = async () => {
  try {
    const heroRef = doc(db, 'hero', 'main');
    
    // Check if it already exists
    const snap = await getDoc(heroRef);
    if (snap.exists()) {
      console.log('Hero data already migrated.');
      return;
    }

    const heroData = {
      firstName: personalInfo.firstName.trim(),
      lastName: personalInfo.lastName.trim(),
      badge: personalInfo.badge.trim(),
      roles: personalInfo.roles.join(', '),
      description: personalInfo.description.trim(),
      portrait: personalInfo.portrait,
      cvUrl: personalInfo.cvUrl,
      availabilityStatus: personalInfo.availabilityStatus || 'Available for Opportunities',
      cta1: 'Download CV',
      cta2: 'Contact Me',
      createdAt: new Date()
    };

    await setDoc(heroRef, heroData);
    console.log('Hero data successfully migrated to Firestore.');
  } catch (error) {
    console.error('Error migrating Hero data:', error);
  }
};
