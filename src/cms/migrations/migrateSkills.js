import { collection, getDocs, addDoc, doc, setDoc, getCountFromServer } from 'firebase/firestore';
import { skills } from "../../data/portfolioData.js";
import { db } from "../../services/firebase.js";


async function loggedSetDoc(docRef, data, options) {
  try {
    const res = await (options ? setDoc(docRef, data, options) : setDoc(docRef, data));
    console.log(`Collection path: ${docRef.parent.path}, Document ID: ${docRef.id}, Write result: SUCCESS, Returned ID: ${docRef.id}`);
    return res;
  } catch(e) {
    console.log(`Collection path: ${docRef.parent.path}, Document ID: ${docRef.id}, Write result: FAILED, Exception: ${e}`);
    throw e;
  }
}
async function loggedAddDoc(colRef, data) {
  try {
    const res = await addDoc(colRef, data);
    console.log(`Collection path: ${colRef.path}, Document ID: ${res.id}, Write result: SUCCESS, Returned ID: ${res.id}`);
    return res;
  } catch(e) {
    console.log(`Collection path: ${colRef.path}, Write result: FAILED, Exception: ${e}`);
    throw e;
  }
}

export async function migrateSkills() {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 };
  console.log("Starting Skills migration...");
  try {
    const skillsCollection = collection(db, "skills");
    
    const existingSnapshot = await getDocs(skillsCollection);
    const existingSkillsMap = {};
    existingSnapshot.forEach(docSnap => {
      existingSkillsMap[docSnap.data().name] = docSnap.id;
    });
    
    console.log(`Found ${Object.keys(existingSkillsMap).length} existing skills in Firestore.`);

    let orderIndex = 0;

    for (const category of skills.categories) {
      for (const skill of category.skills) {
        const skillData = {
          name: skill.name,
          category: category.title,
          categoryIcon: category.icon,
          percent: skill.percent,
          isCircular: false,
          circularSub: "",
          order: orderIndex++
        };
        
        if (existingSkillsMap[skill.name]) {
          await loggedSetDoc(doc(db, "skills", existingSkillsMap[skill.name]), skillData, { merge: true });
          result.updated++;
          console.log(`Updated regular skill: ${skill.name}`);
        } else {
          await loggedAddDoc(skillsCollection, skillData);
          result.created++;
          console.log(`Added regular skill: ${skill.name}`);
        }
      }
    }

    for (const skill of skills.circularSkills) {
      const skillName = skill.label;
      const skillData = {
        name: skillName,
        category: "Top Skills",
        categoryIcon: skill.icon,
        percent: skill.percent,
        isCircular: true,
        circularSub: skill.sub,
        order: orderIndex++
      };

      if (existingSkillsMap[skillName]) {
        await loggedSetDoc(doc(db, "skills", existingSkillsMap[skillName]), skillData, { merge: true });
        result.updated++;
        console.log(`Updated circular skill: ${skillName}`);
      } else {
        await loggedAddDoc(skillsCollection, skillData);
        result.created++;
        console.log(`Added circular skill: ${skillName}`);
      }
    }

    console.log(`Migration complete. Created ${result.created}, Updated ${result.updated} skills.`);
  } catch (error) {
    console.error('Skills Migration Failed:', error);
    result.failed++; result.error = error;
  }
  return result;
}
