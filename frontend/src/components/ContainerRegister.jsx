import {toast} from 'react-toastify';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Container.css';
import { useEffect } from 'react';
import axios from 'axios';


export default function ContainerRegister() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUserName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [shouldRegister, setShouldRegister] = useState(false);
    const navigate = useNavigate();

    const handleRegister = () => {
        if(!username || !email || !password || !confirmPassword){
            toast.error("All fields are required");
            return;
        }
        if(username.length < 3){
            toast.error("Username must be at least 3 characters long");
            return;
        }
        if(password !== confirmPassword){
            toast.error("Passwords do not match");
            return;
        }
        if(!email.includes('@')){
            toast.error("Invalid email address");
            return;
        }
        if(password.length < 6 ){
            toast.error("Password must be at least 6 characters long");
            return;
        }
        setShouldRegister(true);
    }
    useEffect(() => {
        if (!shouldRegister) return;
        axios.post(`${import.meta.env.VITE_HOST}/user/register`, {
            username,
            email,
            password
        }).then((response) => {
            localStorage.setItem("token", response.data.token);
            toast.success("Registration successful!");
            navigate('/');
        }).catch((error) => {
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Registration failed. Please try again.");
            }
        }).finally(() => {
            setShouldRegister(false);
        });
    }, [shouldRegister]);


    return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <h1 className='mb-4 text-center textColor'>Register</h1>
            <div className="p-4 shadow rounded customContainer">
                <h2 className="mb-4">Email:</h2>
                <input onChange={(e)=>setEmail(e.target.value)} type="email" className="form-control mb-3" placeholder="Enter your email" />
                <h2 className="mb-4">Username:</h2>
                <input onChange={(e)=>setUserName(e.target.value)} type="text" className="form-control mb-3" placeholder="Enter your username" />
                <h2 className="mb-4">Password:</h2>
                <input onChange={(e)=>setPassword(e.target.value)} type="password" className="form-control mb-3" placeholder="Enter your password" />
                <h2  className="mb-4">Confirm Password:</h2>
                <input onChange={(e)=>setConfirmPassword(e.target.value)} type="password" className="form-control mb-3" placeholder="Enter your password" />
                <button onClick={handleRegister} className="btn btn-primary w-100 mt-3 customBtn">Register</button>
            </div>
          </div>
        )
}