import { NextResponse } from "next/server";
import { db } from "@/app/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";

export async function GET() {
    try {
        const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);

        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            text: doc.data().text || "",
            username: doc.data().username || "Anonymous",
            createdAt: doc.data().createdAt
        }));

        return NextResponse.json(messages);
    } catch (error: any) {
        console.error("Server GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { text, username } = await request.json();

        if (!text || text.trim() === "") {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const docRef = await addDoc(collection(db, "messages"), {
            text,
            username: username || "Anonymous",
            createdAt: serverTimestamp(),
        });

        return NextResponse.json({ id: docRef.id, success: true });
    } catch (error: any) {
        console.error("Server POST Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
