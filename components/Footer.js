import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <p>© Team NexElite Inc. All rights reserved.</p>
        </div>


        <div className="footer-section">
          <h3>Follow Us</h3>
          <p>Stay connected through our social media channels.</p>
          <div className="footer-social-icons">
          <a href="https://facebook.com"><FaFacebook size={24} /></a>
            <a href="https://twitter.com"><FaTwitter size={24} /></a>
            <a href="https://instagram.com"><FaInstagram size={24} /></a>
            <a href="https://linkedin.com"><FaLinkedin size={24} /></a>
            <a href="https://github.com"><FaGithub size={24} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
