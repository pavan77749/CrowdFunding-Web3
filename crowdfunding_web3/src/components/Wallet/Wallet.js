'use client';

import React, { useEffect, useState } from 'react';

const Wallet = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('');

  const sepoliaChain = {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  };

  const fetchBalance = async (address) => {
    if (typeof window.ethereum !== 'undefined' && address) {
      try {
        const balanceWei = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        });
        // Convert from Wei to ETH
        setBalance((parseInt(balanceWei, 16) / 1e18).toFixed(4));
      } catch (err) {
        setBalance('');
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          fetchBalance(accounts[0]);
        }

        const currentChainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        if (currentChainId !== sepoliaChain.chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: sepoliaChain.chainId }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [sepoliaChain],
              });
            }
          }
        }
      } catch (err) {
        console.error('Wallet connection error:', err?.message || err);
      }
    } else {
      alert('MetaMask not detected!');
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          fetchBalance(accounts[0]);
        }
      }
    };

    checkWalletConnection();
  }, []);

  return (
    <div className='flex items-center gap-2'>
      <button
        onClick={connectWallet}
        className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse px-4 py-2 text-xl"
      >
        {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
      </button>
      {walletAddress && (
        <div className=" text-white font-bold shadow  py-2 px-4 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-sm">
          Balance: {balance} ETH
        </div>
      )}
    </div>
  );
};

export default Wallet;
