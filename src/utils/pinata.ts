import axios from 'axios';

const PINATA_API_KEY = "9d596c5fe6cba22a5f7c";
const PINATA_API_SECRET = "2f2f8499c1567429943b0b54af3cc85ae2bf8cd73ac78aab4867e7ae552a0310";

export const uploadToPinata = async (
  file: File,
  metadata: Record<string, any>
): Promise<string> => {
  try {
    // First upload the image
    const formData = new FormData();
    formData.append('file', file);

    // Add pinata metadata for image with only simple key-values
    const pinataMetadata = JSON.stringify({
      name: metadata.name || 'Asset Image',
      keyvalues: {
        name: metadata.name || '',
        description: metadata.description || '',
        assetType: metadata.attributes?.[0]?.value || '',
        priceToken: metadata.attributes?.[1]?.value || '',
        earnXP: metadata.attributes?.[2]?.value || ''
      }
    });
    formData.append('pinataMetadata', pinataMetadata);

    // Upload image first
    const imageResponse = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      data: formData,
      maxBodyLength: Infinity,
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
      },
    });

    const imageHash = imageResponse.data.IpfsHash;

    // Prepare metadata with image hash
    const metadataWithImage = {
      ...metadata,
      image: `ipfs://${imageHash}`,
    };

    // Upload metadata JSON directly using pinJSONToIPFS
    const jsonResponse = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data: metadataWithImage,
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
        'Content-Type': 'application/json',
      },
    });

    return jsonResponse.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
      throw new Error(`Pinata upload failed: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getIpfsUrl = (hash: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};