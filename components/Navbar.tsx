'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Server, Film, Play, Gamepad2, Settings, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'NAS', href: '/nas', icon: Server },
  { name: 'Arr', href: '/arr', icon: Film },
  { name: 'Jellyfin', href: '/jellyfin', icon: Play },
  { name: 'MC', href: '/minecraft', icon: Gamepad2 },
  { name: 'Network', href: '/network', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 w-full md:w-20 md:h-screen md:top-0 bg-neutral-900 border-t md:border-t-0 md:border-r border-white/10 z-50">
      <nav className="flex md:flex-col justify-around md:justify-start md:gap-8 items-center h-20 md:h-full md:pt-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="relative p-4 group">
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon 
                size={24} 
                className={`relative z-10 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} 
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}