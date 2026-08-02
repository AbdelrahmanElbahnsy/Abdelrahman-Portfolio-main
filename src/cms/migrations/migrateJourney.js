import { journey } from '../../data/portfolioData.js';
import { db } from '../../services/firebase.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const migrateJourney = async () => {
  try {
    const journeyCol = collection(db, 'journey');
    
    // Check if migration already happened
    const snap = await getDocs(journeyCol);
    if (!snap.empty) {
      console.log('Journey data already migrated. Skipping.');
      return;
    }

    const phases = journey.phases || [];
    for (const phase of phases) {
      const journeyData = {
        title: phase.title,
        description: phase.description,
        order: phase.phase, // '01', '02', etc.
        technologies: phase.tags ? phase.tags.join(', ') : '',
        company: '',
        organization: '',
        date: '',
        badge: '',
        status: '',
        icon: '',
        color: '',
        createdAt: new Date()
      };
      
      await addDoc(journeyCol, journeyData);
    }
    
    console.log('Journey data successfully migrated to Firestore.');
  } catch (error) {
    console.error('Error migrating Journey data:', error);
  }
};
