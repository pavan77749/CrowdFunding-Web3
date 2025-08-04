"use client";

import React, { useState } from 'react';
import { Upload, ImageIcon, DollarSign, Tag, FileText, Rocket } from 'lucide-react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { PinataSDK } from "pinata";
import { BrowserProvider, Contract,parseEther} from 'ethers';
import ContractAbi from '../../../../CrowdFundingSmartContract/artifacts/contracts/CrowdFundingContract.sol/CampaignFactory.json';

export default function CreateCampaign() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredAmount: '',
    category: '',
    image: null
  });
  
  console.log(formData)

  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Technology',
    'Arts & Creativity',
    'Games',
    'Film & Video',
    'Music',
    'Publishing',
    'Food & Craft',
    'Fashion',
    'Health & Wellness',
    'Education',
    'Community',
    'Environment'
  ];

  // Initialize Pinata SDK
  const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY ,
  });



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 const uploadToIPFS = async (file) => {
  const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const data = new FormData();
  data.append("file", file);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: data,
    });

    const result = await response.json();
    console.log('Pinata upload result:', result);

    if (result.IpfsHash) {
      return {
        success: true,
        cid: result.IpfsHash,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        ipfsUrl: `https://ipfs.io/ipfs/${result.IpfsHash}`,
      };
    } else {
      return { success: false, error: "No IpfsHash returned" };
    }
  } catch (error) {
    return { success: false, error: error.message || "Failed to upload to IPFS" };
  }
};


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setIsUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Upload to IPFS via Pinata SDK
      const uploadResult = await uploadToIPFS(file);
      
      if (uploadResult.success) {
        setFormData(prev => ({
          ...prev,
          image: {
            file: file,
            cid: uploadResult.cid,
            name: file.name,
            size: file.size,
            mimeType: file.type,
            createdAt: new Date().toISOString(),
            gatewayUrl: uploadResult.gatewayUrl,
            ipfsUrl: uploadResult.ipfsUrl
          }
        }));
        
        console.log('Image uploaded to IPFS:', uploadResult);
        toast.success('Image uploaded successfully to IPFS!');
      } else {
        toast.error(`Failed to upload image: ${uploadResult.error}`);
        setImagePreview(null);
      }
      
      setIsUploading(false);
    }
  };

 const handleSubmit = async (e) => {
   e.preventDefault();
   setIsSubmitting(true);

   try {
     // Validate Empty Fields
     if (
       !formData.title.trim() ||
       !formData.description.trim() ||
       !formData.requiredAmount ||
       !formData.category.trim() ||
       !formData.image
     ) {
       toast.error('Please fill in all required fields');
       setIsSubmitting(false);
       return;
     }

     // Validate Required Amount is a Positive Number
     if (isNaN(formData.requiredAmount) || Number(formData.requiredAmount) <= 0) {
       toast.error('Please enter a valid Required Amount in ETH');
       setIsSubmitting(false);
       return;
     }

     // Check if MetaMask is available
     if (!window.ethereum) {
       toast.error('MetaMask is not installed');
       setIsSubmitting(false);
       return;
     }

     // Check if wallet is connected using existing wallet component
     const accounts = await window.ethereum.request({ method: 'eth_accounts' });
     if (!accounts || accounts.length === 0) {
       toast.error('Please connect your wallet using the header wallet button');
       setIsSubmitting(false);
       return;
     }

     // Initialize ethers provider and signer
     const provider = new BrowserProvider(window.ethereum);
     const signer = await provider.getSigner();

     // Convert ETH to Wei
     const requiredAmountInWei = parseEther(formData.requiredAmount.toString());

     // Initialize Contract
     const contract = new Contract(
       process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
       ContractAbi.abi,
       signer
     );

     // Call createCampaign on Smart Contract
     const tx = await contract.createCampaign(
       formData.title,
       requiredAmountInWei,
       formData.image.ipfsUrl,
       formData.category,
       formData.description
     );

     toast.info('Transaction submitted. Waiting for confirmation...');
     await tx.wait();

     toast.success('Campaign created successfully on Blockchain!');

     // Reset form
     setFormData({
       title: '',
       requiredAmount: '',
       image: null,
       category: '',
       description: ''
     });
     setImagePreview(null);
   } catch (error) {
     console.error('Error creating campaign:', error);
     toast.error('Failed to create campaign. Please try again.');
   }

   setIsSubmitting(false);
 };


  const retrieveFileFromIPFS = async (cid) => {
    try {
      const data = await pinata.gateways.get(cid);
      return data;
    } catch (error) {
      console.error('Error retrieving file from IPFS:', error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto pt-24">
        {/* Header */}
        <div className="text-center mb-12 ">
          <h1 className="text-5xl font-bold text-white mb-4">
            Create Your
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse"> Campaign</span>
          </h1>
          <p className="text-xl text-gray-300">
            Launch your project and be part of the decentralized future
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Campaign Title */}
            <div className="space-y-3">
              <label className="flex items-center text-white text-lg font-semibold">
                <FileText className="w-5 h-5 mr-2 text-purple-400" />
                Campaign Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter your campaign title..."
                className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            {/* Campaign Description */}
            <div className="space-y-3">
              <label className="flex items-center text-white text-lg font-semibold">
                <FileText className="w-5 h-5 mr-2 text-purple-400" />
                Campaign Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project, goals, and how funds will be used..."
                rows="6"
                className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                required
              />
            </div>

            {/* Required Amount and Category Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Required Amount */}
              <div className="space-y-3">
                <label className="flex items-center text-white text-lg font-semibold">
                  <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                  Required Amount (ETH) *
                </label>
                <input
                  type="number"
                  name="requiredAmount"
                  value={formData.requiredAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.001"
                  min="0"
                  className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label className="flex items-center text-white text-lg font-semibold">
                  <Tag className="w-5 h-5 mr-2 text-cyan-400" />
                  Choose Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  required
                >
                  <option value="" disabled className="bg-gray-800">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-gray-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="flex items-center text-white text-lg font-semibold">
                <ImageIcon className="w-5 h-5 mr-2 text-pink-400" />
                Campaign Image *
              </label>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/30 rounded-2xl cursor-pointer hover:border-pink-400 transition-all duration-300 bg-white/5 hover:bg-white/10"
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imagePreview}
                        alt="Campaign Preview"
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white font-semibold">Click to change image</p>
                      </div>
                      {formData.image && formData.image.cid && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs">
                          ✓ Uploaded to IPFS
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
                          <p className="text-white font-semibold mb-2">Uploading to IPFS via Pinata...</p>
                          <p className="text-gray-400 text-sm">Please wait while we secure your image</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                          <p className="text-white font-semibold mb-2">Upload Campaign Image</p>
                          <p className="text-gray-500 text-xs mt-2">Max 10MB • JPG, PNG, GIF, WebP</p>
                        </>
                      )}
                    </div>
                  )}
                </label>
              </div>
              
              {/* IPFS Upload Details */}
              {formData.image && formData.image.cid && (
                <div className="bg-white/5 rounded-xl p-4 border border-green-500/30">
                  <h4 className="text-green-400 font-semibold mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Successfully uploaded to IPFS
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Upload ID:</span>
                      <span className="text-white font-mono text-xs break-all max-w-xs">
                        {formData.image.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">IPFS CID:</span>
                      <span className="text-white font-mono text-xs break-all max-w-xs">
                        {formData.image.cid}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">File Size:</span>
                      <span className="text-white">{(formData.image.size / 1024).toFixed(2)} KB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">MIME Type:</span>
                      <span className="text-white">{formData.image.mimeType}</span>
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                      <a
                        href={formData.image.gatewayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                      >
                        View on Pinata Gateway
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <a
                        href={formData.image.ipfsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors text-sm"
                      >
                        View on IPFS.io Gateway
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Campaign...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    <span>Launch Campaign</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            By creating a campaign, you agree to our terms of service and community guidelines.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Images are securely stored on IPFS via Pinata for permanent, decentralized access.
          </p>
        </div>
      </div>
    </div>
  );
}