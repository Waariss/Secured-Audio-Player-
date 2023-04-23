import React, {useState, useEffect, useRef} from 'react'
import CryptoJS from 'crypto-js';
import './Test.css';

function Test() {
    const [page, setPage] = useState(1);
    const [enaudioFile, setenAudioFile] = useState(null);
    const [deaudioFile, setdeAudioFile] = useState(null);
    const [encrptedData, setEncrptedData] = useState("");
    const [decrptedData, setDecrptedData] = useState("");
    const [encryptedFile, setEncryptedFile] = useState(null);
    const [decryptedFile, setDecryptedFile] = useState(null);
    const [originalFileName, setOriginalFileName] = useState("");
    const [userSecret, setUserSecret] = useState("");
    const [activeSecret, setActiveSecret] = useState("");
    const [showSecret, setShowSecret] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [downloadKey, setDownloadKey] = useState(false);
    const [selectedKeyLength, setSelectedKeyLength] = useState(16);

    const showAlertForInvalidKeyLength = () => {
      alert("The key must be of length 16, 24, or 32 characters.");
    };
    

    const handleUserSecret = (e) => {
      const keyLength = e.target.value.length;
      setUserSecret(e.target.value);
      if (keyLength === 16 || keyLength === 24 || keyLength === 32) {
        setButtonDisabled(false);
      } else {
        setButtonDisabled(true);
      }
    };
  
    const handleRandomGen = () => {
      const randomSecret = generateSecretPass(selectedKeyLength);
      setDownloadKey(true);
      const element = document.createElement("a");
      const file = new Blob([randomSecret], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "key.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };

    const handleClickEncrypt = () => {
      if (buttonDisabled) {
        showAlertForInvalidKeyLength();
      } else {
        setPage(2);
        setEncrptedData(true);
        setDecrptedData(false);
      }
    };
    
    const handleClickDecrypt = () => {
      if (buttonDisabled) {
        showAlertForInvalidKeyLength();
      } else {
        setPage(2);
        setEncrptedData(false);
        setDecrptedData(true);
      }
    };

    const generateSecretPass = (length) => {
      const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+{}[];:,.<>?';
      const randomValues = new Uint8Array(length);
      crypto.getRandomValues(randomValues);
      let result = '';
      for (let i = 0; i < length; i++) {
        result += charset[randomValues[i] % charset.length];
      }
      return result;
    };    
    
    const handleEncrypt = () => {
      const reader = new FileReader();
      reader.readAsDataURL(enaudioFile);
      reader.onload = async () => {
        const base64Data = reader.result.split(",")[1];
        const middle = Math.floor(base64Data.length / 2);
        const s1 = base64Data.substr(0, middle);
        const s2 = base64Data.substr(middle);
        const encrypted1 = CryptoJS.AES.encrypt(s1, activeSecret).toString();
        const encrypted2 = CryptoJS.AES.encrypt(s2, activeSecret).toString();
        const encryptedData = encrypted1 + encrypted2;
        const encryptedBlob = new Blob([encryptedData], { type: enaudioFile.type });
        const encryptedFile = new File([encryptedBlob], `${enaudioFile.name}.encrypted`, { type: enaudioFile.type });
        setEncryptedFile(encryptedFile);
        setOriginalFileName(enaudioFile.name);
        console.log(encryptedFile);
        console.log("File successfully encrypted!");
        setPage(3);
      };
    };
  
    const handleEncryptdownload = () => {
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(encryptedFile);
        downloadLink.download = `${enaudioFile.name}.encrypted`;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setEncryptedFile(null);
        setPage(1);
    };      
  
    const handleDecrypt = () => {
      const reader = new FileReader();
      reader.readAsText(deaudioFile);
      reader.onload = async () => {
        const encryptedData = reader.result;
        const middle = Math.floor(encryptedData.length / 2);
        const encrypted1 = encryptedData.substr(0, middle);
        const encrypted2 = encryptedData.substr(middle);
        const decrypted1 = CryptoJS.AES.decrypt(encrypted1,activeSecret).toString(CryptoJS.enc.Utf8);
        const decrypted2 = CryptoJS.AES.decrypt(encrypted2,activeSecret).toString(CryptoJS.enc.Utf8);
        const decryptedData = decrypted1 + decrypted2;
        const base64Data = `data:${deaudioFile.type};base64,${decryptedData}`;
        const binaryData = atob(decryptedData);
        const byteArray = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          byteArray[i] = binaryData.charCodeAt(i);
        }
        const decryptedBlob = new Blob([byteArray.buffer], { type: deaudioFile.type });
        const originalFileExtension = deaudioFile.name.split(".").pop().split("-")[0];
        const decryptedFileName = `${deaudioFile.name.split(".")[0]}.${originalFileExtension}`;
        const decryptedFile = new File([decryptedBlob], decryptedFileName, { type: deaudioFile.type });
        setDecryptedFile(decryptedFile);
        console.log(decryptedFile);
        console.log("File successfully decrypted!");
        setPage(4);
      };
    };    

    const handleDecryptdownload = () => {
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(decryptedFile);
      downloadLink.download = originalFileName;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setDecryptedFile(null);
      setPage(1);
    };
    const handlePlayAudio = () => {
      const audioElement = document.querySelector('audio');
      audioElement.play();
    }

    const AudioPlayer = ({ decryptedFile }) => {
      const [url, setUrl] = useState(null);
    
      useEffect(() => {
        if (decryptedFile && !url) {
          const url = URL.createObjectURL(decryptedFile);
          setUrl(url);
        }
    
        return () => {
          if (url) {
            URL.revokeObjectURL(url);
          }
        };
      }, [decryptedFile, url]);
    
      const renderAudioPlayerContent = () => {
        if (url) {
          return (
            <div className="audio-player">
              <audio controls preload="auto" onClick={handlePlayAudio}>
                <source src={url} type={decryptedFile.type} />
              </audio>
            </div>
          );
        } else {
          return <div>Decrypted file is not available.</div>;
        }
      };
    
      return <>{renderAudioPlayerContent()}</>;
    };    
    
  return (
    <>
    <div className="container">
      <h1>Secure Audio Player</h1>
      {page === 1 ? (
        <div className="input-section">
          <div className="input-group">
            <label htmlFor="secret">Enter your Secret Key:</label>
            <input
              type={showSecret ? 'text' : 'password'}
              id="secret"
              value={userSecret}
              onChange={handleUserSecret}
            />
            <button onClick={() => setShowSecret(!showSecret)}>
              {showSecret ? 'Hide' : 'Show'}
            </button>
          </div>
          <a>Secret Key length must be 16, 24, or 32 characters </a>
          <div className="input-group">
            <button onClick={handleRandomGen}>Generate Random Key</button>
          </div>
          <div className="input-group">
            <label htmlFor="keyLength">Select Key length:</label>
            <select
              id="keyLength"
              value={selectedKeyLength}
              onChange={(e) =>
                setSelectedKeyLength(parseInt(e.target.value, 10))
              }
            >
              <option value="16">16 characters</option>
              <option value="24">24 characters</option>
              <option value="32">32 characters</option>
            </select>
          </div>
          <div className="button-group">
            <button onClick={handleClickEncrypt} disabled={buttonDisabled}>
              Encrypt
            </button>
            <button onClick={handleClickDecrypt} disabled={buttonDisabled}>
              Decrypt
            </button>
          </div>
        </div>
      ) : null}
      {page === 2 ? (
          <div>
            {encrptedData ? (
              <>
                <div>
                  <input type="file" accept=".wav, .mp3" onChange={(e) => { setenAudioFile(e.target.files[0]); } } />
                  <button onClick={handleEncrypt}>Encrypt</button>
                </div>
                <a>*Support only .mp3, .wav file type*</a>
              </>
            ) : null}
            {decrptedData ? (
              <>
                <div>
                  <input type="file" accept=".encrypted" onChange={(e) => { setdeAudioFile(e.target.files[0]);}} />
                  <button onClick={handleDecrypt}>Decrypt</button>
                </div>
                <a>*Support only .encrypted file type encrypted by this tool*</a>
              </>
            ) : null}
          </div>
        ) : null}
        {page === 3 ? (
          <>
            <div>
              <button onClick={handleEncryptdownload}>Download</button>
            </div>
            <a>Click to download the encrypted file</a>
          </>
        ) : null}
        {page === 4 ? (
          <>
            <a>Here is the decrypted audio</a>          
            <div>
                <AudioPlayer decryptedFile={decryptedFile} />
                <button onClick={handleDecryptdownload}>Download</button>
            </div>
            <a>Click to download the decrypted file</a>
          </>
        ) : null}
    </div>
    </>
  )
}

export default Test