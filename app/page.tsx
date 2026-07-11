"use client"

import styles from "./welcome.module.css"
import { Registration, Login } from "@/app/api/auth/authification";
import {useState} from "react";
import {useRouter} from "next/navigation";

export default function WelcomePage() {
    const [currentOpenPage, setOpenPage] = useState("welcomePage")

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const router = useRouter();

    const changeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value + "@my-app.com")
    }

    const changePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const submitRegistration = async(e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!username.trim() && !password.trim())
        {
            alert("Please fill out all fields")
        }

        const {user, error} = await Registration(username, password)

        if (error)
        {
            alert(error.message)
        }

        alert("Registration successfully " + username + "" + password)

        router.push("/home")
    }

    const submitLogin = async(e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!username.trim() && !password.trim())
        {
            alert("Please fill out all fields")
        }

        const {user, error} = await Login(username, password)

        if (error)
        {
            alert(error)
            return
        }

        alert("Registration successfully")
        router.push("/home")
    }

    return (
        <>
            <h1 className={styles.header}>Anonymous Chat Room</h1>

            {
                currentOpenPage === "welcomePage" && (
                    <div className={`${currentOpenPage === "welcomePage" ? styles.welcomeContainer : ""}`}>
                        <input type={"button"} value={"Register"} onClick={() => {setOpenPage("registerPage")}} />
                        <input type={"button"} value={"Login"} onClick={() => {setOpenPage("loginPage")}} />
                    </div>
                )
            }

            {
                currentOpenPage === "registerPage" && (
                    <div className={styles.registerActive}>
                        <input type={"text"} placeholder={"Type your username"} maxLength={10} onChange={changeUsername}/>
                        <input type={"password"} placeholder={"Type your password"} onChange={changePassword}/>

                        <input type={"button"} value={"Submit Registration"} onClick={  submitRegistration}/>
                        <input type={"button"} value={"Back"} onClick={() => setOpenPage("welcomePage")}/>
                    </div>
                )
            }

            {
                currentOpenPage === "loginPage" && (
                    <div className={styles.loginActive}>
                        <input type={"text"} placeholder={"Type your username"} maxLength={10} onChange={changeUsername}/>
                        <input type={"password"} placeholder={"Type your password"} onChange={changePassword}/>

                        <input type={"button"} value={"Submit Login"} onClick={submitLogin}/>
                        <input type={"button"} value={"Back"} onClick={() => setOpenPage("welcomePage")}/>
                    </div>
                )
            }
        </>
    )
}