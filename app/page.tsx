"use client"

import styles from "./welcome.module.css"
import { Registration, Login } from "@/app/api/auth/authification";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
    const [currentOpenPage, setOpenPage] = useState("welcomePage")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter();

    const changeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value.trim())
    }

    const changePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const submitRegistration = async (e: React.FormEvent | React.MouseEvent) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!username || !password) {
            alert("Please fill out all fields");
            return;
        }

        const generatedEmail = `${username.toLowerCase()}@my-app.com`;
        const { error } = await Registration(generatedEmail, password, username)

        if (error) {
            alert(error);
            return;
        }

        localStorage.setItem("username", username);
        alert("Registration successfully completed!");
        router.push("/home");
    }

    const submitLogin = async (e: React.FormEvent | React.MouseEvent) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!username || !password) {
            alert("Please fill out all fields");
            return;
        }

        const generatedEmail = `${username.toLowerCase()}@my-app.com`;
        const { error } = await Login(generatedEmail, password);

        if (error) {
            if (error.includes("invalid-credential")) {
                alert("Неверное имя пользователя или пароль");
            } else {
                alert(error);
            }
            return;
        }

        localStorage.setItem("username", username);
        alert("Logged in successfully!");
        router.push("/home");
    }

    return (
        <>
            <h1 className={styles.header}>Anonymous Chat Room</h1>

            {currentOpenPage === "welcomePage" && (
                <div className={styles.welcomeContainer}>
                    <input type="button" value="Register" onClick={() => setOpenPage("registerPage")} />
                    <input type="button" value="Login" onClick={() => setOpenPage("loginPage")} />
                </div>
            )}

            {currentOpenPage === "registerPage" && (
                <div className={styles.registerActive}>
                    <input type="text" placeholder="Type your username" maxLength={10} value={username} onChange={changeUsername}/>
                    <input type="password" placeholder="Type your password" value={password} onChange={changePassword}/>
                    <input type="button" value="Submit Registration" onClick={submitRegistration}/>
                    <input type="button" value="Back" onClick={() => { setOpenPage("welcomePage"); setUsername(""); setPassword(""); }}/>
                </div>
            )}

            {currentOpenPage === "loginPage" && (
                <div className={styles.loginActive}>
                    <input type="text" placeholder="Type your username" maxLength={10} value={username} onChange={changeUsername}/>
                    <input type="password" placeholder="Type your password" value={password} onChange={changePassword}/>
                    <input type="button" value="Submit Login" onClick={submitLogin}/>
                    <input type="button" value="Back" onClick={() => { setOpenPage("welcomePage"); setUsername(""); setPassword(""); }}/>
                </div>
            )}
        </>
    )
}