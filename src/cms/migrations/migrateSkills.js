import { collection, getDocs, addDoc } from "firebase/firestore";
import { skills } from "../../data/portfolioData.js";
import { db } from "../../services/firebase.js";

export async function migrateSkills() {
  console.log("Starting Skills migration...");
  
  const skillsCollection = collection(db, "skills");
  
  // 1. Fetch existing skills to prevent duplicates
  const existingSnapshot = await getDocs(skillsCollection);
  const existingNames = new Set();
  existingSnapshot.forEach(doc => {
    existingNames.add(doc.data().name);
  });
  
  console.log(`Found ${existingNames.size} existing skills in Firestore.`);

  let addedCount = 0;
  let orderIndex = 0;

  // 2. Migrate categories
  for (const category of skills.categories) {
    for (const skill of category.skills) {
      if (!existingNames.has(skill.name)) {
        await addDoc(skillsCollection, {
          name: skill.name,
          category: category.title,
          categoryIcon: category.icon,
          percent: skill.percent,
          isCircular: false,
          circularSub: "",
          order: orderIndex++
        });
        existingNames.add(skill.name);
        addedCount++;
        console.log(`Added regular skill: ${skill.name}`);
      } else {
        console.log(`Skipped existing skill: ${skill.name}`);
      }
    }
  }

  // 3. Migrate circular skills
  for (const skill of skills.circularSkills) {
    // If the skill already exists in regular categories, we can just update it, 
    // but the prompt implies separating them or adding if not exists. 
    // Wait, circular skills in portfolioData have `label` as name. 
    const skillName = skill.label;
    
    if (!existingNames.has(skillName)) {
      await addDoc(skillsCollection, {
        name: skillName,
        category: "Top Skills", // Default category for circular if not present
        categoryIcon: skill.icon,
        percent: skill.percent,
        isCircular: true,
        circularSub: skill.sub,
        order: orderIndex++
      });
      existingNames.add(skillName);
      addedCount++;
      console.log(`Added circular skill: ${skillName}`);
    } else {
      console.log(`Skipped existing circular skill: ${skillName}`);
      // Ideally we would update the existing one to be isCircular = true, but let's keep it simple.
    }
  }

  console.log(`Migration complete. Added ${addedCount} new skills.`);
}
