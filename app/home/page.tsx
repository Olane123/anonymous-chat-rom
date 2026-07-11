"use client"

import styles from "./home.module.css"
import Image from "next/image";
import PersonIcon from "@/public/person.svg"
import { useEffect, useState, useRef } from "react";
import {Auth} from "@/app/lib/firebase";
import {onAuthStateChanged, updateProfile} from "firebase/auth"

interface Message {
    id: string;
    text: string;
    username: string;
    createdAt?: { seconds: number; nanoseconds: number };
}

export default function Home() {
    const [isOpen, setProfileSettingsVisible] = useState<boolean>(false)
    const [currentUserName, setCurrentUserName] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleProfileVisible = () => {
        setProfileSettingsVisible(!isOpen)

        if (!isOpen && currentUserName.trim() === "")
        {
            setCurrentUserName("Anonymous")
        }
    }

    const changeUsername = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setCurrentUserName(newName);
        localStorage.setItem("username", newName);

        if (Auth.currentUser) {
            try {
                await updateProfile(Auth.currentUser, { displayName: newName });
            } catch (err) {
                console.error("Не удалось обновить displayName в Firebase:", err);
            }
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
            console.error("Ошибка при получении сообщений через API:", error);
        }
    };

    useEffect(() => {
        fetchMessages();

        const interval = setInterval(fetchMessages, 3000);

        return () => clearInterval(interval);
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(Auth, (user) => {
            if (user && user.displayName) {
                const username = user.displayName
                const processedText = username.replace('@my-app.com', '');
                setCurrentUserName(processedText);
            } else {
                const savedName = localStorage.getItem("username");
                if (savedName) {
                    setCurrentUserName(savedName);
                }
            }
        });

        return () => unsubscribe();
    }, []);

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
                throw new Error(errText || "Ошибка сервера");
            }

            const newMessage: Message = {
                id: Date.now().toString(),
                text: input,
                username: senderName,
                createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
            };

            setMessages((prev) => [...prev, newMessage]); // Обновляем экран сразу
            setInput("");
        }
        catch (error: any) {
            console.error("Client fetch error:", error);
            alert("Не удалось отправить: " + error.message);
        }
    }

    return (
        <>
            <Image src={PersonIcon} alt={"profile"} width={48} height={48} className={styles.profileSettingsBtn} onClick={toggleProfileVisible}/>

            {
                isOpen && (
                    <div className={styles.profileSettings}>
                        <h1>Profile Settings</h1>
                        <input
                            type={"text"}
                            placeholder={"Type your username"}
                            value={currentUserName}
                            maxLength={10}
                            onChange={changeUsername}
                        />
                    </div>
                )
            }

            <div className={styles.messagesContainer}>
                {messages.map((msg) => (
                    <div key={msg.id} className={styles.message}>
                        <strong>{msg.username}: </strong> {msg.text}{" "}
                        <div className={styles.dateTime}>
                            {msg.createdAt?.seconds &&
                                new Date(msg.createdAt.seconds * 1000).toLocaleString()
                            }
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessages} className={styles.inputContainer}>
                <textarea
                    rows={1}
                    placeholder={"Type message"}
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
