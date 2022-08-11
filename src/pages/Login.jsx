import React, { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import profile from '../images/profile.png';
import logo from '../images/logo.png';
import * as ROUTES from '../constants/rootes';

import { ImFacebook2 as FacebookIcon } from "react-icons/im";
import { AiFillEye as EyeIcon } from "react-icons/ai";
import { AiFillEyeInvisible as EyeInvisibleIcon } from "react-icons/ai";
import { ImSpinner3 as SpinnerIcon } from "react-icons/im";

import { isValidEmail } from "../utility";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState('');
  const isInvalid = password === '' || email === '';

  const navigate = useNavigate();

  const { user, login } = useContext(AuthContext);

  if (user) navigate("/");

  const showError = (error) => {
    setErrorMsg(error);
    setTimeout(() => {
      setErrorMsg("");
    }, 3000);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) showError("Invalid email address");
    else if (password.length < 6)
      showError("Password must be at least 6 characters");
    if (isValidEmail(email) && password.length > 6) {
      setFormLoading(true);
      const user = await login(email, password);
      if (user) {
        setEmail("");
        setPassword("");
        setFormLoading(false);
      }
      if (!user)
        showError(
          "Sorry, your password was incorrect. Please double-check your password."
        );
    }
  };

  useEffect(() => {
    setDisabled(email.length > 0 && password.length > 0 ? false : true);
  }, [email, password]);

  return (
    <div className="container flex mx-auto max-w-screen-md items-center h-screen justify-center">
    <div className="flex w-3/5 ">
      <img className='' src={profile} alt="iPhone with Instagram app" />
    </div>
    <div className="flex flex-col w-2/5">
      <div className="flex flex-col items-center bg-white p-4 border border-gray-primary mb-4 rounded">
        <h1 className="flex justify-center w-full">
          <img src={logo} alt="Instagram" className="mt-2 w-6/12 mb-4" />
        </h1>
        <div className="">{error && <p className="mb-4 text-xs text-red-primary">{error}</p>}</div>
        <form onSubmit={submitForm} method="POST">
          <input
            aria-label="Enter your email address"
            type="text"
            placeholder="Email address"
            className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border border-gray-primary rounded mb-2"
            onChange={({ target }) => setEmail(target.value)}
            value={email}
          />
          <input
            aria-label="Enter your password"
            type="password"
            placeholder="Password"
            className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border border-gray-primary rounded mb-2"
            onChange={({ target }) => setPassword(target.value)}
            value={password}
          />
          <button
            disabled={isInvalid}
            type="submit"
            className={`bg-blue-500 text-white w-full rounded h-8 font-bold
          ${isInvalid && 'opacity-50'}`}
          >
            Login
          </button>
        </form>
      </div>
      <div className="flex justify-center items-center flex-col w-full bg-white p-4 rounded border border-gray-primary">
        <p className="text-sm">
          Don't have an account?{` `}
          <Link to={ROUTES.SIGN_UP} className="font-bold text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  </div>
  );
}

export default Login;
