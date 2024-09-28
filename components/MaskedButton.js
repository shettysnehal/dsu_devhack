import React, { useState } from 'react';
import upload from "../ethereum/upload";

const MyComponent = (props) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const Upload = upload(props.address);
    let cid;

    setLoading(true); 

    try {
      try {
        console.log(props.address);
        cid = await Upload.methods.getCid().call();
        console.log(cid);
      } catch (e) {
        console.log(e);
      }

      const response = await fetch('http://localhost:5000/process_image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'  
        },
        body: new URLSearchParams({
          'cid': cid,
          'managerAddress': props.managerAddress,
          'uploadAddress': props.address
        })  
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();

    
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'masked_document.pdf'; 

      
      document.body.appendChild(link);
      link.click();

    
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div>
      <button
        style={{
          color: "black",
          width: '200px',
          height: '60px',
          position: 'relative', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        className="button"
        onClick={handleGenerate}
        disabled={loading} 
      >
        {loading ? (
          <div className="spinner"></div> 
        ) : (
          'Generate Masked PDF'
        )}
      </button>

      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1); /* Light border */
          border-left-color: black; /* Dark border for the spinner */
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
          position: absolute;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MyComponent;
