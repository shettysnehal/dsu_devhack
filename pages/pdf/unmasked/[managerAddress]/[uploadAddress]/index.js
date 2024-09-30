import axios from 'axios';
import { useEffect, useState } from 'react';
import crypto from 'crypto';
import cookie from 'cookie';
import Upload from "../../../../../ethereum/upload";
import factory from "../../../../../ethereum/Factory";




// Server-side props to check for the token and authorization status
export async function getServerSideProps(context) {
  const { managerAddress, uploadAddress } = context.params;
  const { req, res } = context;
  let token;

  const upload = Upload(uploadAddress);

  try {
    const isDeleted = await upload.methods.isDeleted().call();

    if (isDeleted) {
      res.send("File has been deleted.");
      return { props: {} };
    }

    const cookies = cookie.parse(req.headers.cookie || '');
    token = cookies.useraddress;

    

    if (!token) {
      const mail = await factory.methods.getEmail(managerAddress).call();

      if (mail) {
        token = crypto.randomBytes(32).toString('hex');
        res.setHeader('Set-Cookie', cookie.serialize('useraddress', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 3600,
          path: '/',
          sameSite: 'Strict'
        }));

        return {
          props: {
            mail,
            token,
            managerAddress,
            uploadAddress
          }
        };
      } else {
        res.send("mail-not-found");
        return { props: {} };
      }
    } else {
      
      const checkifAuthorized = await upload.methods.isApproved(token).call();

      if (checkifAuthorized) {
        const cid = await upload.methods.getCid().call();
        const imageUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
        return {
          props: { imageUrl }
        };
      } else {
        res.send("not-authorized");
        return { props: {} };
      }
    }
  } catch (error) {
    console.error(error);
    res.send("error");
    return { props: {} };
  }
}

// Client-side logic to handle user input and geolocation
const Page = ({ imageUrl, mail, token, managerAddress, uploadAddress }) => {
  const [userName, setUserName] = useState('');
  const [location, setLocation] = useState({ latitude: '', longitude: '' });

  // Function to get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error retrieving location:', error);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Submit the authorization request
  const submitAuthorization = async () => {
    if (!userName || !location.latitude || !location.longitude) {
      alert('Please enter your name and allow location access.');
      return;
    }

    try {
      console.log(`mail is ${mail}`)
      const response = await axios.get("/api/sendMailForAuthorization", {
        params: {
          mail,
          token,
          managerAddress,
          uploadAddress,
          userName,
          location
        }
      });

      if (response.data) {
        alert('Authorization request sent successfully.');
      } else {
        alert('Failed to send the authorization request.');
      }
    } catch (error) {
      console.error('Error sending authorization request:', error);
    }
  };

  useEffect(() => {
    getUserLocation();  // Fetch user's location when component mounts
  }, []);

  return (
    <div>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Image"
          style={{ width: '800px', height: '1000px' }}
        />
      ) : (
        <div>
          <h2>Authorization Required</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{width:'auto'}}
          />
          <button onClick={submitAuthorization}>Submit Authorization</button>
        </div>
      )}
    </div>
  );
};

export default Page;
