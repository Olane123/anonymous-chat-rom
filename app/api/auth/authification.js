import { db, Auth } from "@/app/lib/firebase";
import { doc, runTransaction } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";

export async function Registration(email, password, username) {
    const cleanedName = username.trim();

    if (!cleanedName) return { user: null, error: "The name cannot be empty." };
    if (cleanedName.toLowerCase() === "anonymous") return { user: null, error: "This name is reserved." };

    const usernameRef = doc(db, "usernames", cleanedName.toLowerCase());

    try {
        let firebaseUser = null;

        await runTransaction(db, async (transaction) => {
            const docSnap = await transaction.get(usernameRef);

            if (docSnap.exists()) {
                throw new Error("This username is already taken by another user.");
            }
            const userCredential = await createUserWithEmailAndPassword(Auth, email, password);
            firebaseUser = userCredential.user;

            transaction.set(usernameRef, { uid: firebaseUser.uid });
        });

        if (firebaseUser) {
            await updateProfile(firebaseUser, { displayName: cleanedName });
            return { user: firebaseUser, error: null };
        }

        return { user: null, error: "Unknown error during registration" };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

export async function Login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(Auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

export async function updateUniqueUsername(newUsername) {
    const user = Auth.currentUser;
    if (!user) return { success: false, error: "You are not logged in." };

    const cleanedName = newUsername.trim();
    if (!cleanedName) return { success: false, error: "The name cannot be empty." };
    if (cleanedName.toLowerCase() === "anonymous") return { success: false, error: "The name 'Anonymous' is reserved." };

    const oldUsername = user.displayName ? user.displayName.replace('@my-app.com', '') : "";

    if (oldUsername === cleanedName) return { success: true };

    const newUsernameRef = doc(db, "usernames", cleanedName.toLowerCase());

    try {
        await runTransaction(db, async (transaction) => {
            const docSnap = await transaction.get(newUsernameRef);

            if (docSnap.exists()) {
                throw new Error("This name is already taken by another user.");
            }

            transaction.set(newUsernameRef, { uid: user.uid });

            if (oldUsername && oldUsername.toLowerCase() !== "anonymous") {
                const oldUsernameRef = doc(db, "usernames", oldUsername.toLowerCase());
                transaction.delete(oldUsernameRef);
            }
        });

        await updateProfile(user, { displayName: cleanedName });

        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: error.message };
    }
}