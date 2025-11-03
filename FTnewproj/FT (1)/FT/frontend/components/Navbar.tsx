"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, User, ChevronDown, Menu, Calendar, UserCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import PackagesDropdown from './PackagesDropdown'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPackagesOpen, setIsPackagesOpen] = useState(false)
  
  // Use real authentication context
  const { user, token, logout, isAuthenticated } = useAuth()
  
  // Create avatar initial from user name
  const getInitials = (name: string) => {
    if (!name) return ''
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <nav className="fixed w-full bg-[#002147] z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img 
                src="https://i.ibb.co/8LSpyb4Y/logo-white-1-2.png"
                alt="FayVyaz Travels" 
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div 
                className="relative"
                onMouseEnter={() => setIsPackagesOpen(true)}
                onMouseLeave={() => setIsPackagesOpen(false)}
              >
                <Link
                  href="/packages"
                  className="text-white hover:text-gray-300 transition flex items-center gap-1"
                >
                  Packages
                  <ChevronDown className="h-4 w-4" />
                </Link>
                {/* Packages Dropdown */}
                <PackagesDropdown 
                  isOpen={isPackagesOpen} 
                  onClose={() => setIsPackagesOpen(false)} 
                />
              </div>
              <Link href="/deals" className="text-white hover:text-gray-300 transition">Deals</Link>
              <Link href="/luxury" className="text-white hover:text-gray-300 transition">Luxury</Link>
              <Link href="/corporate" className="text-white hover:text-gray-300 transition">Corporate</Link>
              <Link href="/visa" className="text-white hover:text-gray-300 transition">Visa</Link>
              <Link href="/inspo" className="text-white hover:text-gray-300 transition">Blog</Link>
              <Link href="/about" className="text-white hover:text-gray-300 transition">About</Link>
            </div>

            {/* Right Side Items */}
            <div className="hidden md:flex items-center space-x-6">
              {/* <Button variant="ghost" size="icon" className="text-white">
                <Heart className="h-5 w-5" />
              </Button> */}
             
             {/* Login button - only visible when not logged in */}
             {!isAuthenticated && (
               <Link href="/login">
                 <Button 
                   className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-sm px-6 py-2"
                 >
                   Login
                 </Button>
               </Link>
             )}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 text-white hover:text-[#C69C3C] hover:bg-white/10">
                        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(user?.name || '')}
                        </div>
                        <span className="hidden md:block">{user?.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mt-2" align="end">
                      <div className="px-4 py-3 border-b bg-gradient-to-r from-[#002147] to-[#003366] text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-800 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {getInitials(user?.name || '')}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{user?.name}</p>
                            <p className="text-sm text-white/80">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center space-x-3 w-full cursor-pointer py-3 px-4 hover:bg-gradient-to-r hover:from-[#002147]/10 hover:to-[#003366]/10 transition-all duration-200 group">
                          <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center group-hover:bg-[#003366] transition-colors">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 group-hover:text-[#002147]">Dashboard</span>
                            <p className="text-xs text-gray-500">View your overview</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/my-bookings" className="flex items-center space-x-3 w-full cursor-pointer py-3 px-4 hover:bg-gradient-to-r hover:from-[#002147]/10 hover:to-[#003366]/10 transition-all duration-200 group">
                          <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center group-hover:bg-[#003366] transition-colors">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 group-hover:text-[#002147]">All Transactions</span>
                            <p className="text-xs text-gray-500">View your bookings</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/my-account" className="flex items-center space-x-3 w-full cursor-pointer py-3 px-4 hover:bg-gradient-to-r hover:from-[#002147]/10 hover:to-[#003366]/10 transition-all duration-200 group">
                          <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center group-hover:bg-[#003366] transition-colors">
                            <UserCircle className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 group-hover:text-[#002147]">Profile</span>
                            <p className="text-xs text-gray-500">Manage your profile</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/my-account" className="flex items-center space-x-3 w-full cursor-pointer py-3 px-4 hover:bg-gradient-to-r hover:from-[#002147]/10 hover:to-[#003366]/10 transition-all duration-200 group">
                          <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center group-hover:bg-[#003366] transition-colors">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 group-hover:text-[#002147]">Account Setting</span>
                            <p className="text-xs text-gray-500">Update preferences</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="my-2" />
                      
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer py-3 px-4 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium">Logout</span>
                          <p className="text-xs text-red-500">Sign out of account</p>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : null}
              
              <a 
                href="facetime:+6562352900" 
                className="text-white text-sm font-medium hover:text-gray-300 transition-colors cursor-pointer"
                onClick={(e) => {
                  // Track FaceTime call click
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'click', {
                      event_category: 'Contact',
                      event_label: 'FaceTime Call - Navbar'
                    })
                  }
                }}
              >
                +65 6235 2900
              </a>
            </div>

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <Link href="/packages" className="text-lg">
                    Packages
                  </Link>
                  <Link href="/packages" className="text-lg">Deals</Link>
                  <Link href="/luxury" className="text-lg">Luxury</Link>
                  <Link href="/corporate" className="text-lg">Corporate</Link>
                  <Link href="/visa" className="text-lg">Visa</Link>
                  <Link href="/inspo" className="text-lg">Blog</Link>
                  <Link href="/about" className="text-lg">About</Link>
                  
                  {/* Login button for mobile - only visible when not logged in */}
                  {!isAuthenticated && (
                    <div className="pt-4 border-t">
                      <Link href="/login" className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" />
                        Login
                      </Link>
                    </div>
                  )}
                 
                  {isAuthenticated && (
                    <div className="pt-4 border-t space-y-2">
                      <Link href="/dashboard" className="flex items-center gap-3 text-lg hover:text-[#002147] transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 group">
                        <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center group-hover:bg-[#003366] transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium">Dashboard</span>
                          <p className="text-sm text-gray-500">View overview</p>
                        </div>
                      </Link>
                      <Link href="/my-bookings" className="flex items-center gap-3 text-lg hover:text-[#002147] transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 group">
                        <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center group-hover:bg-[#003366] transition-colors">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <span className="font-medium">All Transactions</span>
                          <p className="text-sm text-gray-500">View bookings</p>
                        </div>
                      </Link>
                      <Link href="/my-account" className="flex items-center gap-3 text-lg hover:text-[#002147] transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 group">
                        <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center group-hover:bg-[#003366] transition-colors">
                          <UserCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <span className="font-medium">Profile</span>
                          <p className="text-sm text-gray-500">Manage profile</p>
                        </div>
                      </Link>
                      <Link href="/my-account" className="flex items-center gap-3 text-lg hover:text-[#002147] transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 group">
                        <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center group-hover:bg-[#003366] transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium">Account Setting</span>
                          <p className="text-sm text-gray-500">Update preferences</p>
                        </div>
                      </Link>
                      <Button 
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full justify-start text-lg p-3 h-auto hover:bg-red-50 hover:text-red-600 transition-colors group rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <span className="font-medium">Logout</span>
                            <p className="text-sm text-gray-500">Sign out</p>
                          </div>
                        </div>
                      </Button>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <span className="text-sm">+65 6235 2900</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar