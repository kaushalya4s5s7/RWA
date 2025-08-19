import axios from 'axios';

const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.ipfs.io/ipfs/"
];
const PINATA_API_KEY = "9d596c5fe6cba22a5f7c";
const PINATA_API_SECRET = "2f2f8499c1567429943b0b54af3cc85ae2bf8cd73ac78aab4867e7ae552a0310";

export const fetchIPFSContent = async (uri: string) => {
  try {
    if (!uri.startsWith('ipfs://')) {
      console.log('Not an IPFS URI:', uri);
      return null;
    }
    
    const hash = uri.replace('ipfs://', '');
    console.log('Fetching IPFS content for hash:', hash);
    
    // Try multiple gateways
    for (const gateway of IPFS_GATEWAYS) {
      try {
        const response = await fetch(`${gateway}${hash}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!response.ok) {
          console.log(`Gateway ${gateway} failed with status:`, response.status);
          continue;
        }
        
        const data = await response.json();
        console.log('Successfully fetched IPFS content:', data);
        return data;
      } catch (error) {
        console.log(`Gateway ${gateway} failed:`, error);
        continue;
      }
    }
    
    console.log('All IPFS gateways failed for hash:', hash);
    return null;
  } catch (error) {
    console.error('Error fetching IPFS content:', error);
    return null;
  }
};

export const uploadJSONToIPFS = async (jsonData: any): Promise<string> => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data: jsonData,
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
        'Content-Type': 'application/json',
      },
    });

    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
      throw new Error(`IPFS upload failed: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const uploadFileToIPFS = async (
  file: File,
  metadata: Record<string, any>
): Promise<string> => {
  try {
    // First upload the file
    const formData = new FormData();
    formData.append('file', file);

    // Add pinata metadata for file with only simple key-values
    const pinataMetadata = JSON.stringify({
      name: metadata.name || 'Asset File',
      keyvalues: {
        name: metadata.name || '',
        description: metadata.description || '',
        assetType: metadata.attributes?.[0]?.value || '',
        priceToken: metadata.attributes?.[1]?.value || '',
        earnXP: metadata.attributes?.[2]?.value || ''
      }
    });
    formData.append('pinataMetadata', pinataMetadata);

    // Upload file first
    const fileResponse = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      data: formData,
      maxBodyLength: Infinity,
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
      },
    });

    const fileHash = fileResponse.data.IpfsHash;

    // Prepare metadata with file hash
    const metadataWithFile = {
      ...metadata,
      image: `ipfs://${fileHash}`,
    };

    // Upload metadata JSON directly using pinJSONToIPFS
    const jsonResponse = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data: metadataWithFile,
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
        'Content-Type': 'application/json',
      },
    });

    return `ipfs://${jsonResponse.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
      throw new Error(`IPFS upload failed: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const uploadImageToIPFS = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Add simple pinata metadata for the image file
    const pinataMetadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: 'image',
        fileName: file.name
      }
    });
    formData.append('pinataMetadata', pinataMetadata);

    // Upload image file directly to IPFS
    const response = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      data: formData,
      maxBodyLength: Infinity,
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
      },
    });

    // Return the direct IPFS URI for the image
    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
      throw new Error(`Image upload failed: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getIpfsUrl = (hash: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};