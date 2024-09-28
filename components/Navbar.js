import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Web3 from 'web3';
import dotenv from "dotenv"
dotenv.config()

const Navbar = () => {
  const [showDocVault, setShowDocVault] = useState(false);
  const [address, setAddress] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedAddress = localStorage.getItem('address');
    if (storedAddress) {
      setAddress(storedAddress);
      setShowDocVault(true);
    }

    if (typeof window !== "und  efined" && typeof window.ethereum !== "undefined") {
      // Listen for account changes (e.g., user disconnects or switches accounts)
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // No accounts means user has disconnected
      localStorage.removeItem('address');
      setAddress(null);
      setShowDocVault(false);
    } else {
      // User switched accounts
      const newAddress = accounts[0];
      localStorage.setItem('address', newAddress);
      setAddress(newAddress);
      setShowDocVault(true);
    }
  };

  const handleConnectClick = async () => {
    let web3;

    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      // Request account access if MetaMask is present
      await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
    } else {
      // Fallback provider for users without MetaMask
      const provider = new Web3.providers.HttpProvider(
        process.env.sepolia
      );
      web3 = new Web3(provider);
    }

    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        const userAddress = accounts[0];
        localStorage.setItem('address', userAddress);
        setAddress(userAddress);
        setShowDocVault(true);
      } else {
        console.log("No accounts found.");
      }
    } catch (error) {
      console.error("Something went wrong:", error);
    }
  };

  const handleDisconnectClick = () => {
    // Clear address from local storage and reset state
    localStorage.removeItem('address');
    setAddress(null);
    setShowDocVault(false);
  };

  const handleNavClick = (tag) => {
    if (tag === "home") {
      router.push("/");
    } else if (tag === "Doc Vault") {
      if (address) {
        router.push(`/vault/${address}`);
      }
    } else if (tag === "upload") {
      router.push("/form");
    }
  };

  return (
    <header className="navbar d-flex align-items-center fixed-top">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <a className="logo d-flex align-items-center me-auto me-xl-0">
          <h1 className="sitename">DocTrac</h1>
          <span style={{ color: "orange" }}>.</span>
        </a>

        <nav className="navmenu">
          <ul className="d-flex list-unstyled mb-0">
            <li className="me-3">
              <button
                className="btn"
                onClick={() => handleNavClick("home")}
                aria-label="Home"
              >
                Home
              </button>
            </li>
            {showDocVault && (
              <li className="me-3">
                <button
                  className="btn"
                  onClick={() => handleNavClick("Doc Vault")}
                  aria-label="Doc Vault"
                >
                  Doc Vault
                </button>
              </li>
            )}
            <li className="me-3">
              <button
                className="btn"
                onClick={() => handleNavClick("upload")}
                aria-label="Upload"
              >
                Upload
              </button>
            </li>
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list" aria-label="Toggle Navigation"></i>
        </nav>

        {address ? (
          <div className="profile-icon-container">
            <i
              className="bi bi-person-circle"
              style={{
                marginRight:"24px",
                fontSize: '1.8rem',
                color: '#F0F8FF', // Custom color for the profile icon
                cursor: 'pointer'
              }}
               // Clicking on profile icon disconnects
            ></i>
          </div>
        ) : (
          <button
            className="btn-getstarted"
            onClick={handleConnectClick}
            aria-label="Connect"
            style={{
              backgroundColor: "#FF5733",  // Custom background color
              color: "#fff",                // White text color
              border: "none",               // Remove border
              padding: "10px 20px",
              borderRadius: "5px",          // Rounded corners
              cursor: "pointer",
            }}
          >
            Connect
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
