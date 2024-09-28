import React, { useEffect } from 'react';
import web3 from "../../../../../ethereum/web3";
import upload from "../../../../../ethereum/upload";
import crypto from 'crypto';

// Encrypt the token using AES


export async function getServerSideProps(context) {
    const { uploadAddress, token } = context.query;

    if (!uploadAddress || !token) {
        return {
            props: {
                error: 'Missing uploadAddress or token',
            },
        };
    }

    return {
        props: {
            uploadAddress,
            token,
        },
    };
}

export default function Index({ uploadAddress, token, error }) {
    useEffect(() => {
        const approveToken = async () => {
            if (error) {
                console.error(error);
                return;
            }

            try {
                const accounts = await web3.eth.getAccounts();
                const Upload = upload(uploadAddress);
                
                // Encrypt the token before sending it to the blockchain
               

                // Send encrypted token to the blockchain
                const response = await Upload.methods.authorize(token).send({ from: accounts[0] });
                console.log(response);
                console.log('Token approved successfully with encryption.');
            } catch (err) {
                console.error('Error interacting with contract:', err);
            }
        };

        approveToken();
    }, [uploadAddress, token, error]);

    return (
        <div>
            <p>Approved {token} ...</p>
        </div>
    );
}
