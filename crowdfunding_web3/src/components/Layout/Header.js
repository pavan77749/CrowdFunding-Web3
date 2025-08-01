'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { Menu, X } from 'lucide-react';
import Wallet from "../Wallet/Wallet";
import { Rocket } from 'lucide-react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-[#1e1e2f] to-[#1a1a40] text-white shadow-md px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
             <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
          <Link href="/">FundChain</Link>
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-4">
          <Link href="/campaigns" className="bg-white/10 backdrop-blur-md text-sm px-4 py-2 rounded-md hover:bg-white/20 transition">
            Campaigns
          </Link>
          <Link href="/createCampaign" className="bg-white/10 backdrop-blur-md text-sm px-4 py-2 rounded-md hover:bg-white/20 transition">
            Create
          </Link>
          <Link href="/dashboard" className="bg-white/10 backdrop-blur-md text-sm px-4 py-2 rounded-md hover:bg-white/20 transition">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Wallet visible only on md and above */}
          <div className="hidden md:flex">
            <Wallet />
          </div>

          {/* Mobile Menu Toggle Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3">
          <Link href="/campaigns" className="bg-white/10 px-4 py-2 rounded-md hover:bg-white/20 transition">
            Campaigns
          </Link>
          <Link href="/create-campaign" className="bg-white/10 px-4 py-2 rounded-md hover:bg-white/20 transition">
            Create
          </Link>
          <Link href="/dashboard" className="bg-white/10 px-4 py-2 rounded-md hover:bg-white/20 transition">
            Dashboard
          </Link>

          {/* Wallet visible only on mobile */}
          <div className="md:hidden">
            <Wallet />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
