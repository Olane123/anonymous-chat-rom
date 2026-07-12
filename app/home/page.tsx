"use client"

import styles from "./home.module.css"
import Image from "next/image";
import PersonIcon from "@/public/person.svg"
import { useEffect, useState, useRef } from "react";
import { Auth } from "@/app/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { updateUniqueUsername } from "@/app/api/auth/authification";

interface Message {
    id: string;
    text: string;
    username: string;
    createdAt?: { seconds: number; nanoseconds: number };
}

export default function Home() {
    const router = useRouter();

    const [isOpen, setProfileSettingsVisible] = useState<boolean>(false)
    const [currentUserName, setCurrentUserName] = useState<string>("Anonymous")
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [editName, setEditName] = useState<string>("")
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [usernameError, setUsernameError] = useState<string | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleProfileVisible = () => {
        if (!isOpen) {
            setEditName(currentUserName === "Anonymous" ? "" : currentUserName);
            setUsernameError(null);
        }
        setProfileSettingsVisible(!isOpen)
    }

    const handleSaveUsername = async () => {
        if (!editName.trim()) {
            setUsernameError("The name cannot be empty.");
            return;
        }
        setIsSaving(true);
        setUsernameError(null);

        const result = await updateUniqueUsername(editName);
        if (result.success) {
            setCurrentUserName(editName);
            localStorage.setItem("username", editName);
            setUsernameError(null);
            alert("The name has been successfully changed and saved!");
        } else {
            setUsernameError(result.error);
        }
        setIsSaving(false);
    }

    const handleLogout = async () => {
        try {
            await signOut(Auth);
            localStorage.removeItem("username");
            router.push("/");
        } catch (error) {
            console.error("Error on exit:", error);
        }
    }

    const fetchMessages = async () => {
        try {
            const response = await fetch("/api/messages");
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error retrieving messages via the API:", error);
        }
    };

    useEffect(() => {
        if (isLoading) return;
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [isLoading])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(Auth, (user) => {
            if (user) {
                if (user.displayName) {
                    const username = user.displayName;
                    const processedText = username.replace('@my-app.com', '');
                    setCurrentUserName(processedText);
                }
                setIsLoading(false);
            } else {
                localStorage.removeItem("username");
                router.push("/");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const sendMessages = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault()
        if (input.trim() === "") return;

        const senderName = currentUserName.trim() || "Anonymous";

        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: input,
                    username: senderName,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Server error");
            }

            const newMessage: Message = {
                id: Date.now().toString(),
                text: input,
                username: senderName,
                createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
            };

            setMessages((prev) => [...prev, newMessage]);
            setInput("");
        }
        catch (error: any) {
            console.error("Client fetch error:", error);
            alert("Failed to send: " + error.message);
        }
    }

    if (isLoading) {
        return (
            <div className={styles.loadingContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h2>Loading chat room...</h2>
            </div>
        );
    }

    return (
        <>
            <Image src={PersonIcon} alt="profile" width={48} height={48} className={styles.profileSettingsBtn} onClick={toggleProfileVisible}/>

            {isOpen && (
                <div className={styles.profileSettings}>
                    <h1>Profile Settings</h1>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Type your username"
                            value={editName}
                            maxLength={10}
                            disabled={isSaving}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                    </div>
                    <button onClick={handleSaveUsername} disabled={isSaving} className={styles.saveBtn} style={{ }}>
                        {isSaving ? "Checking..." : "Save"}
                    </button>
                    {usernameError && (
                        <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{usernameError}</p>
                    )}
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        Logout
                    </button>
                </div>
            )}

            <div className={styles.messagesContainer}>
                {messages.map((msg) => (
                    <div key={msg.id} className={styles.message}>
                        <strong>{msg.username}: </strong> {msg.text}{" "}
                        <div className={styles.dateTime}>
                            {msg.createdAt?.seconds && new Date(msg.createdAt.seconds * 1000).toLocaleString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessages} className={styles.inputContainer}>
                <textarea
                    rows={1}
                    placeholder="Type message"
                    className={styles.textInput}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessages(e);
                        }
                    }}
                />
                <button type="submit" className={styles.sendBtn}>Send</button>
            </form>
        </>
    );
}
