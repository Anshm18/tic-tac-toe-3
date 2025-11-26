import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_HOST}/user/verifyToken`,{
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then((res)=>{
        localStorage.setItem("username", res.data.username);
        console.log("Token is valid");
    }).catch((err)=>{
        console.log("Token is invalid");
        return (<Navigate to="/" replace />);
    });
    }, []);

    if (!token) {
        return (<Navigate to="/" replace />);
    }

    return children;
}
