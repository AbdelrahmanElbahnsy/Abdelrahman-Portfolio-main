import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDA9yTl8zFoZ8zxZPkTBydd23yuaJbhV0E",
  authDomain: "abdelrahman-portfolio-62abe.firebaseapp.com",
  projectId: "abdelrahman-portfolio-62abe",
  storageBucket: "abdelrahman-portfolio-62abe.firebasestorage.app",
  messagingSenderId: "591841366575",
  appId: "1:591841366575:web:f0f91e5eda2000bb3d6cda"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const skillsToAdd = [
  { name: "AWS", category: "Cloud Platform", categoryIcon: "", percent: 0, isCircular: false, circularSub: "", order: 99 },
  { name: "EKS/AKS", category: "Containers & Orchestration", categoryIcon: "", percent: 0, isCircular: false, circularSub: "", order: 99 },
  { name: "Nginx", category: "Networking", categoryIcon: "", percent: 0, isCircular: false, circularSub: "", order: 99 },
  { name: "Git", category: "DevOps & CI/CD", categoryIcon: "", percent: 0, isCircular: false, circularSub: "", order: 99 },
  { name: "GitHub", category: "DevOps & CI/CD", categoryIcon: "", percent: 0, isCircular: false, circularSub: "", order: 99 },
];

async function seed() {
  const skillsRef = collection(db, 'skills');
  for (const skill of skillsToAdd) {
    await addDoc(skillsRef, skill);
    console.log(`Added ${skill.name}`);
  }
  console.log("Done");
  process.exit(0);
}

seed();
