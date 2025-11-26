import { toast } from 'react-toastify';
import { useState,useEffect } from 'react';
import '../css/Container.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ContainerLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shouldLogin, setShouldLogin] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        if(!email || !password ){
            toast.error("All fields are required");
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

        setShouldLogin(true);
    }
    useEffect(() => {
        if(!shouldLogin) return;
        axios.post(`${import.meta.env.VITE_HOST}/user/login`, {
            email,
            password
        }).then((response) => {
            localStorage.setItem("token", response.data.token);
            navigate('/console');
            toast.success("Login successful!");
        }).catch((error) => {
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Login failed. Please try again.");
            }
        }).finally(() => {
            setShouldLogin(false);
        });
    }, [shouldLogin]);

    return (
          <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <h1 className='mb-4 text-center textColor'>LOGIN</h1>
            <div className="p-4 shadow rounded customContainer">
                <h2 className="mb-4">Email:</h2>
                <input onChange={(e)=>setEmail(e.target.value)} type="email" className="form-control mb-3" placeholder="Enter your email" />
                <h2 className="mb-4">Password:</h2>
                <input onChange={(e)=>setPassword(e.target.value)} type="password" className="form-control mb-3" placeholder="Enter your password" />
                <button onClick={handleLogin} className="btn btn-primary w-100 mt-3 customBtn">Login</button>
                <h6>if you are not login then<a href="/register" style={{color:"#9DB2BF"}}>  register</a></h6>
            </div>
          </div>
        );  
}