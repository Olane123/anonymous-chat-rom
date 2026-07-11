import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "@/app/lib/firebase";
import { updateProfile } from "firebase/auth"

export async function Registration(username, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(Auth, username, password);
        await updateProfile(userCredential.user, {displayName: username})
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

export async function Login(username, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(Auth, username, password);
        await updateProfile(userCredential.user, {displayName: username})
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}
