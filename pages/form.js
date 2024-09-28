import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '@/components/Navbar';
import web3 from "../ethereum/web3";
import { useRouter } from 'next/router';
import Factory from "../ethereum/Factory";
import axios from 'axios';
import Footer from '@/components/Footer';

const SignUpComponent = ({ setShowSignUp }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loadingSendOtp, setLoadingSendOtp] = useState(false); // Loader for sending OTP
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false); // Loader for verifying OTP
  const router = useRouter();

  const handleSendOtp = async () => {
    setLoadingSendOtp(true); // Start loader for sending OTP
    try {
      const accounts = await web3.eth.getAccounts();
      const response = await axios.post("/api/sendotp", { email: email });
      const otp = response.data.otp;

      // Save OTP on blockchain
      await Factory.methods.setOtpForEmail(email, otp).send({ from: accounts[0] });

      alert(`OTP sent to blockchain and email`);
      console.log("OTP sent to blockchain and email");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP.");
    } finally {
      setLoadingSendOtp(false); // Stop loader
    }
  };

  const handleVerifyOtp = async () => {
    setLoadingVerifyOtp(true); // Start loader for verifying OTP
    try {
      const accounts = await web3.eth.getAccounts();
      const blockchainOtp = await Factory.methods.getOtpForEmail(email).call();
      console.log(blockchainOtp);

      // Compare the OTPs
      if (Number(blockchainOtp) === Number(otp)) {
        alert("OTP verified successfully!");
        console.log("OTP verified");
        await handleSetEmail(); 
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Failed to verify OTP.");
    } finally {
      setLoadingVerifyOtp(false); // Stop loader
    }
  };

  const handleSetEmail = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      await Factory.methods.setEmail(email).send({ from: accounts[0] });
      alert("Email successfully registered!");
      console.log("Email successfully registered!");
      localStorage.setItem("email", email);
      router.push("/upload");
    } catch (error) {
      console.error("Error setting email:", error);
      alert("Failed to register email.");
    }
  };


  return (
    <>
      <Navbar />
      <section style={{ background: `url('/Desktop - 9.png') no-repeat center center`,backgroundSize: 'cover', color: 'white',width:'auto', minHeight: '100vh' }}>
        <div className="px-4 py-5 px-md-5 text-center text-lg-start">
          <div className="container" style={{paddingTop:'75px',paddingLeft:'195px'}}>
            <div className="row gx-lg-5 align-items-center">
              <div className="col-lg-6 mb-5 mb-lg-0">
                <h1 className="my-5 display-3 fw-bold ls-tight">
                  Create Your Account <br/>
                  <span className="text-orange">Join us today</span>
                </h1>
                <p style={{ color: 'hsl(0, 0%, 80%)' }}>
                  Enter your email and OTP to complete the registration.
                </p>
              </div>

              <div className="col-lg-6 mb-5 mb-lg-0">
                  
                    <form>
                      <div className="form-outline mb-4">
                      
                        <input
                          type="email"
                          id="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="Enter your email"
                          style={{ backgroundColor: 'white', color: '#444', border: '2px solid #444', borderRadius:'20px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary mt-2"
                          style={{ backgroundColor: "#ff8400", border: "none", marginTop: "30px" }}
                          onClick={handleSendOtp}
                          disabled={loadingSendOtp} // Disable button while loading
                        >
                          {loadingSendOtp ? "Sending..." : "Send OTP"}
                        </button>
                      </div>
                      <div className="form-outline mb-4">
                        <input
                          type="text"
                          id="otp"
                          className="form-control"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          placeholder="Enter OTP"
                          style={{ backgroundColor: 'white', color: '#444', border: '2px solid #444', borderRadius: '20px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary mt-2"
                          style={{ backgroundColor: "#ff8400", border: "none" }}
                          onClick={handleVerifyOtp}
                          disabled={loadingVerifyOtp} // Disable button while loading
                        >
                          {loadingVerifyOtp ? "Verifying..." : "Verify"}
                        </button>
                      </div>
                      <div className="text-center mt-4">
                        
                      </div>
                    </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default SignUpComponent;
