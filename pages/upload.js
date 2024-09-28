import { useState, useEffect } from "react";
import Lighthouse from "@lighthouse-web3/sdk";
import web3 from "../ethereum/web3";
import Factory from "../ethereum/Factory";
import Navbar from "@/components/Navbar";
import Footer from "../components/Footer";

export default function UploadForm() {
  const [cid, setCid] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    datetime: "",
  });
  let retrievedCid;

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setIsAuthorized(true);
    } else {
      alert("Access denied.");
    }
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) return alert("Please choose a file.");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const conversionResponse = await fetch("http://localhost:5000/convert", {
        method: "POST",
        body: formData,
      });
      console.log(conversionResponse);

      if (!conversionResponse.ok) {
        throw new Error("Failed to convert PDF to image");
      }

      const conversionData = await conversionResponse.json();
      const imageBase64 = conversionData.images[0].data;

      const imageBlob = await fetch(
        `data:image/png;base64,${imageBase64}`
      ).then((res) => res.blob());

      const imageFile = new File([imageBlob], "converted_image.png", {
        type: "image/png",
      });
      try {
        const lighthouseResponse = await Lighthouse.upload(
          [imageFile],
          "b522f18b.ad7f0a65df7b4e638fce0605507a0f0c"
        );
        retrievedCid = lighthouseResponse.data.Hash;
        console.log(retrievedCid);
      } catch (e) {
        console.log(e);
      }

      setCid(retrievedCid);
      setFormVisible(true);

      const now = new Date();
      setFormData({
        ...formData,
        year: now.getFullYear(),
        datetime: now.toISOString(),
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to upload file.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFinish = async () => {
    if (!cid) return alert("CID is not set. Please upload a file first.");
  
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
  
      const gasLimit = 200000; // Set the desired gas limit here
  
      const result = await Factory.methods
        .createUpload(cid, formData.datetime, formData.year, formData.name)
        .send({ from: account, gas: gasLimit });
  
      alert("Transaction successful!");
      console.log(result);
    } catch (error) {
      console.error("Blockchain function failed:", error);
      alert("Failed to interact with the blockchain.");
    }
  };
  

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <form style={styles.form} onSubmit={handleFileUpload}>
          <input
            type="file"
            name="file"
            accept="application/pdf"
            style={styles.fileInput}
          />
          <button type="submit" style={styles.uploadButton}>
            Upload
          </button>
        </form>

        {formVisible && (
          <div style={styles.formContainer}>
            <form style={styles.innerForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter file name"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Year</label>
                <input
                  type="text"
                  value={formData.year}
                  readOnly
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>DateTime</label>
                <input
                  type="text"
                  value={formData.datetime}
                  readOnly
                  style={styles.input}
                />
              </div>
            </form>
            <button onClick={handleFinish} style={styles.finishButton}>
              Finish
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    height: "100vh",
    marginTop: "30px",
    backgroundColor: "#2a2a2a",
    padding: "20px",
  },
  form: {
    marginTop: "80px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  fileInput: {
    marginBottom: "20px",
  },
  uploadButton: {
    marginTop: "30px",
    color: "black",
    backgroundColor: "f0f0f0",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  formContainer: {
    marginTop: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  innerForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "300px",
  },
  finishButton: {
    marginTop: "20px",
    color: "black",
    backgroundColor: "f0f0f0",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
