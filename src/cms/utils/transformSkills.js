/**
 * Transforms a flat array of skill documents from Firestore into 
 * the nested format expected by the public Skills section.
 * 
 * @param {Array} firestoreSkills - The raw array of skills from Firestore
 * @returns {Object} { circularSkills, categories }
 */
export const transformSkills = (firestoreSkills = []) => {
  const circularSkills = [];
  const categoriesMap = new Map();

  firestoreSkills.forEach(skill => {
    // 1. Process Circular Skills
    if (skill.isCircular) {
      circularSkills.push({
        icon: skill.categoryIcon || 'fas fa-star',
        percent: skill.percent || 0,
        label: skill.name,
        sub: skill.circularSub || '',
        order: skill.order || 0
      });
    } else {
      // 2. Process Categorized Skills
      const catName = skill.category || 'Other';
      const skillOrder = skill.order || 0;

      if (!categoriesMap.has(catName)) {
        categoriesMap.set(catName, {
          title: catName,
          icon: skill.categoryIcon || 'fas fa-code',
          skills: [],
          order: skillOrder
        });
      }
      
      const category = categoriesMap.get(catName);
      category.skills.push({
        name: skill.name,
        percent: skill.percent || 0,
        order: skillOrder
      });
      
      // Category order should be the minimum of its skills' orders
      if (skillOrder < category.order) {
        category.order = skillOrder;
      }

      // Update icon if the first one was generic but this one has one
      if (skill.categoryIcon && category.icon === 'fas fa-code') {
        category.icon = skill.categoryIcon;
      }
    }
  });

  // Sort circular skills by order
  circularSkills.sort((a, b) => a.order - b.order);

  // Convert map to array and sort categories and their inner skills deterministically
  const categories = Array.from(categoriesMap.values()).sort((a, b) => {
    if (a.order === b.order) {
      return a.title.localeCompare(b.title);
    }
    return a.order - b.order;
  });
  categories.forEach(cat => {
    cat.skills.sort((a, b) => a.order - b.order);
  });

  return { circularSkills, categories };
};
