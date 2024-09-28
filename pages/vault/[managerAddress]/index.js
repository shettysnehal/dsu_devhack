import React from 'react';
import { useRouter } from 'next/router';
import {
  ItemMeta,
  ItemImage,
  ItemHeader,
  ItemGroup,
  ItemContent,
  Item,
} from 'semantic-ui-react';
import Factory from '../../../ethereum/Factory'; 
import Navbar from '@/components/Navbar';
import Footer from "../../../components/Footer";

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width:'auto',
  background: `url('/Desktop - 9.png') no-repeat center center`, // Use template literals
  backgroundSize: 'cover', // Optional: ensures the background covers the entire container
  color: '#e0e0e0',
  padding: '50px',
};


const contentStyle = {
  flex: 1,
};

const itemContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between', 
  gap: '20px',
  marginTop : "29px"
};

const itemStyle = {
  backgroundColor: '#0a0617',
  border: '2px solid #62858d', 
  borderRadius: '8px', 
  padding: '15px',
  cursor: 'pointer', 
  transition: 'background-color 0.3s',
  width: 'calc(50% - 20px)', 
  height:"150px"
};

const itemHoverStyle = {
  backgroundColor: '#1B3358', 
};

const itemHeaderStyle = {
  color: '#ffffff', 
  textDecoration: 'none',
  fontSize:"20px" 
};

const itemMetaStyle = {
  color: '#b0b0b0',
  fontSize:"18px",
  marginTop:"17px"
};

const Uploads = ({ uploads, managerAddress }) => {
  const router = useRouter();

  const ItemList = ({ uploads }) => (
    <div style={itemContainerStyle}>
      {uploads.map((upload, index) => (
        <Item
          key={index}
          style={itemStyle}
          onClick={() => router.push(`/vault/${managerAddress}/${upload.uploadAddress}`)}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = itemHoverStyle.backgroundColor}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = itemStyle.backgroundColor}
        >
         
          <ItemContent>
            <ItemHeader style={itemHeaderStyle}>{upload.uploadAddress}</ItemHeader>
            <ItemMeta style={itemMetaStyle}>{upload.name}</ItemMeta>
          </ItemContent>
        </Item>
      ))}
    </div>
  );

  return (
    <>
    <Navbar/>
    <div style={containerStyle}>
     
      <div style={contentStyle}>
        <ItemList uploads={uploads} />
      </div>
     
    </div>
     <Footer /></>
    
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
  const { managerAddress } = context.params; 
  let uploads = [];

  try {
    uploads = await Factory.methods.getUploadsByUploader(managerAddress).call();
    console.log('Server-side uploads data:', uploads);
    uploads = convertBigIntToString(uploads);

  } catch (error) {
    console.error('Error in getServerSideProps:', error);
  }

  return {
    props: {
      uploads,
      managerAddress
    },
  };
}

export default Uploads;
