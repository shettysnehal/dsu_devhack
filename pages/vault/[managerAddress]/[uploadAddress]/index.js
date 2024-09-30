import React, { useState } from 'react';
import { Card, Button } from 'semantic-ui-react';
import { useRouter } from 'next/router'; 
import upload from '../../../../ethereum/upload';
import MaskedButton from "../../../../components/MaskedButton";
import web3 from "../../../../ethereum/web3";
import Navbar from '../../../../components/Navbar';
import Footer from "../../../../components/Footer";
import axios from 'axios';

const UploadDetails = ({ details, uploadAddress ,managerAddress}) => {
  const router = useRouter();
  const [cid, setCid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userFile, setUserFile] = useState(null);
  const [tampered, setTampered] = useState(false);
  const [PngHash, setPngHash] = useState(null); // To store PNG URL

  const containerStyle = {
    padding: '80px',
    background: `url('/Desktop - 9.png') no-repeat center center`,
    backgroundSize:"cover",
    color: '#e0e0e0', /* Light text color */
    minHeight: '100vh', /* Ensure container takes up full height */
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: "50px" /* Adjusted for better spacing */
  };
  
  const cardStyle = {
    backgroundColor: '#2a2a2a',
    border:'1px solid #62858d',
    borderRadius: '8px',
    color: '#e0e0e0',
    padding: '20px',
    width: '400px',
    height: '200px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px', /* Adjusted for better spacing */
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    
    ':hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.8)',
    }
  };
  
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    transition: 'transform 0.3s ease',
    
    ':hover': {
      transform: 'scale(1.02)',
    }
  };
  
  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: "#0a0617",
    gap: '20px',
    alignItems: 'center',
    width: 'auto',
    height: "90px",
  };
  
  const buttonStyle = {
    width: '200px',
    height: '60px',
    borderRadius: '5px',
    color: "black", /* Fixed width for buttons */
  };
  
  const items = [
    {
      header: 'Manager',
      description: 'The address of the upload manager.',
      meta: details[2],
    },
    {
      header: 'Upload Date',
      description: 'The date when the content was uploaded.',
      meta: details[0],
    },
    {
      header: 'Year',
      description: 'The year associated with the upload.',
      meta: details[1],
    },
    {
      header: 'Authorization Count',
      description: 'Number of authorizations for this upload.',
      meta: details[4],
    },
    {
      header: 'Upload Name',
      description: 'The name of the upload.',
      meta: details[3],
    }
  ];

  const cardHeaderStyle = {
    marginLeft: '17px',
    marginBottom: "18px",
    textAlign: "center",
    fontSize: '1.5em', /* Larger font size for the header */
    fontWeight: 'bold',
  };

  const cardMetaStyle = {
    fontSize: '0.9em',
    textAlign: "center",
    paddingLeft: "20px" /* Slightly larger font size for meta */
  };

  const cardDescriptionStyle = {
    fontSize: '1em',
    textAlign: "center", /* Default font size for description */
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUserFile(file);
  
    if (file && file.type === 'application/pdf') {
      convertPdfToPng(file); // Convert PDF to PNG and hash the PNG
    }
  };
  
  
  const checkForTampered = async () => {
    if (!userFile) {
        alert('Please upload a file to compare.');
        return;
    }

    setLoading(true);
    try {
        const uploadInstance = upload(uploadAddress);
        const retrievedCid = await uploadInstance.methods.getCid().call();
        const fetchedImageUrl = `https://gateway.lighthouse.storage/ipfs/${retrievedCid}`;

        // Fetch the image from the fetched URL
        const response = await axios.get(fetchedImageUrl, { responseType: 'blob' });
        const fetchedImageBlob = response.data;

        // Convert both images to Base64
        const uploadedImageBase64 = await convertToBase64(userFile);
        const fetchedImageBase64 = await convertToBase64(fetchedImageBlob);

        // Compare images
        if (uploadedImageBase64 === fetchedImageBase64) {
            setTampered(true);
            alert("Files are identical");
            console.log("done");
        } else {
            setTampered(false);
            alert("Files are not identical");
        }
    } catch (error) {
        console.error('Error during tampered check:', error);
    } finally {
        setLoading(false);
    }
};

// Function to convert a Blob or File to Base64
const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

  
  
  const handleDelete = async () => {
    const accounts = await web3.eth.getAccounts();
    const uploadInstance = upload(uploadAddress);
    const response = await uploadInstance.methods.setDeleted(true).send({ from: accounts[0] });
    console.log(response);
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const uploadInstance = upload(uploadAddress);
      const retrievedCid = await uploadInstance.methods.getCid().call(); // Blockchain call to retrieve CID
      
  
      // Construct the download URL based on the retrieved CID
      const downloadUrl = `https://gateway.lighthouse.storage/ipfs/${retrievedCid}`;
  
      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
  
      // Create a link element and trigger download
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = `${retrievedCid}.png`; // Use the CID as the file name
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
  
      // Clean up
      URL.revokeObjectURL(anchor.href);
    } catch (error) {
      console.error('Error fetching CID:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={containerStyle}>
        <div style={gridStyle}>
          {items.map((item, index) => (
            <Card key={index} style={cardStyle}>
              <Card.Content>
                <Card.Header style={cardHeaderStyle}>{item.header}</Card.Header>
                <Card.Meta style={cardMetaStyle}>{item.meta}</Card.Meta>
                <Card.Description style={cardDescriptionStyle}>{item.description}</Card.Description>
              </Card.Content>
            </Card>
          ))}
        </div>

        <div style={buttonContainerStyle}>
          {/* Download button */}
          <Button 
            inverted 
            color='orange' 
            onClick={handleDownload} 
            loading={loading}
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? 'Downloading...' : 'Download unmasked Image'}
          </Button>
          <MaskedButton address={uploadAddress} managerAddress={managerAddress} />
          <Button 
            inverted 
            color='orange' 
            onClick={handleDelete} 
            loading={loading}
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
          <input type="file" accept="application/pdf" style={{width:"160px",height:"60px"}} onChange={handleFileUpload} />
          <Button 
            inverted 
            color='orange' 
            onClick={checkForTampered} 
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? 'Checking...' : 'Check for tampered'}
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
};

function convertBigIntToString(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntToString(item));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertBigIntToString(value)])
    );
  }
  return obj;
}

export async function getServerSideProps(context) {
  const { uploadAddress, managerAddress } = context.params;
  console.log(uploadAddress);

  try {
    const uploadInstance = upload(uploadAddress);
    let details = await uploadInstance.methods.getDetails().call();

    details = convertBigIntToString(details);
    console.log(details);

    return {
      props: {
        details,
        uploadAddress: uploadAddress,
        managerAddress: managerAddress
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: { 
        details: {}, 
        uploadAddress: uploadAddress,
      },
    };
  }
}

export default UploadDetails;