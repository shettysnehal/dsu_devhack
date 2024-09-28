import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "aos/dist/aos.css";
import AOS from "aos";
import Navbar from "../components/Navbar";
import { Web3 } from "web3";
import Footer from "../components/Footer";
import Image from "next/image";
const dotenv = require("dotenv")
dotenv.config()

export default function IndexPage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);
  const handleConnectClick = async (event) => {
    let web3;
    console.log("Connect Clicked!");
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      console.log(1);
      window.ethereum.request({ method: "eth_requestAccounts" });

      web3 = new Web3(window.ethereum);
    } else {
      const provider = new Web3.providers.HttpProvider(
        process.env.sepolia
      );
      web3 = new Web3(provider);
    }

    await web3.eth.getAccounts(function (error, result) {
      console.log(result);
      if (error) {
        console.log("something went wrong ");
      }
    });
  };

  return (
    <>
      <Navbar />
      <main className="main">
        <section id="hero" className="hero section ">
          

          <div className="container">
            <div className="row">
              <div className="col-lg-10">
                <h1 data-aos="fade-up" data-aos-delay="100">
                  Discover DocTrac and Safeguard your Documents
                </h1>
                <p data-aos="fade-up" data-aos-delay="200">
                Experience unparalleled security and seamless access with our digital vault
                </p>
              </div>
              <div className="col-lg-5" data-aos="fade-up" data-aos-delay="300">
              
                  <input
                    type="submit"
                    value="Launch"
                    className="upload-submit"
                    onClick={handleConnectClick}
                  />
                  <div className="error-message"></div>
                
              </div>
            </div>
          </div>
              {/*   <div className="sideImage">
                  <Image
                    src="/image 10.png" // Update to your image path
                    alt="Right Side Image"
                    width={500}
                    height={500}
                    priority // Ensures the image loads immediately
                  />
                </div> */}

        </section>
      </main>

      <Footer />
    </>
  );
}
