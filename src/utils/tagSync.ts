import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const saveTagTaxonomyToFirestore = async (userId: string, tags: string[], categories: any[]) => {
  if (!userId) return;
  try {
    const docRef = doc(db, "users", userId, "settings", "tagTaxonomy");
    await setDoc(docRef, {
      tags,
      categories,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Error syncing tag taxonomy to Firestore:", err);
  }
};

export const loadTagTaxonomyFromFirestore = async (userId: string): Promise<{ tags: string[]; categories: any[] } | null> => {
  if (!userId) return null;
  try {
    const docRef = doc(db, "users", userId, "settings", "tagTaxonomy");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        tags: data.tags || [],
        categories: data.categories || []
      };
    }
  } catch (err) {
    console.error("Error loading tag taxonomy from Firestore:", err);
  }
  return null;
};
