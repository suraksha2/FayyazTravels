"use client"

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* General Section */}
        <div>
          <h3 className="text-[#C69C3C] font-semibold mb-6">General</h3>
          <ul className="space-y-3">
            <li><Link href="/about" className="hover:text-gray-300 transition">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-gray-300 transition">Contact Us</Link></li>
            <li><Link href="/visa" className="hover:text-gray-300 transition">Visa</Link></li>
            <li><Link href="/csr" className="hover:text-gray-300 transition">Corporate Social Responsibility</Link></li>
            <li><Link href="/testimonials" className="hover:text-gray-300 transition">Testimonials</Link></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-[#C69C3C] font-semibold mb-6">Get In Touch</h3>
          <ul className="space-y-3">
            <li>
              <a href="mailto:info@fayyaztravels.com" className="hover:text-gray-300 transition">
                info@fayyaztravels.com
              </a>
            </li>
            <li>
              <a href="tel:+6562352900" className="hover:text-gray-300 transition">
                (+65) 6235 2900
              </a>
            </li>
          </ul>

          <h3 className="text-[#C69C3C] font-semibold mt-8 mb-4">Find us on</h3>
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-[#C69C3C] transition">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-[#C69C3C] transition">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-[#C69C3C] transition">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-[#C69C3C] transition">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-[#C69C3C] transition">
              <Youtube className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-[#C69C3C] transition">
              <Music className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Scandinavian Experiences Section */}
        <div>
          <h3 className="text-[#C69C3C] font-semibold mb-6">Scandinavian Experiences</h3>
          <ul className="space-y-3">
            <li><Link href="/tours/norway" className="hover:text-gray-300 transition">Norway Tour Packages</Link></li>
            <li><Link href="/tours/finland" className="hover:text-gray-300 transition">Finland Tour Packages</Link></li>
            <li><Link href="/tours/sweden" className="hover:text-gray-300 transition">Sweden Tour Packages</Link></li>
          </ul>
        </div>

        {/* Europe Holidays Section */}
        <div>
          <h3 className="text-[#C69C3C] font-semibold mb-6">Europe Holidays</h3>
          <ul className="space-y-3">
            <li><Link href="/tours/bosnia-herzegovina" className="hover:text-gray-300 transition">Bosnia & Herzegovina</Link></li>
            <li><Link href="/tours/bulgaria" className="hover:text-gray-300 transition">Bulgaria</Link></li>
            <li><Link href="/tours/croatia" className="hover:text-gray-300 transition">Croatia</Link></li>
            <li><Link href="/tours/greece" className="hover:text-gray-300 transition">Greece</Link></li>
            <li><Link href="/tours/italy" className="hover:text-gray-300 transition">Italy</Link></li>
          </ul>
        </div>

        {/* COVID Policies Section */}
        <div>
          <h3 className="text-[#C69C3C] font-semibold mb-6">COVID Policies</h3>
          <ul className="space-y-3">
            <li><Link href="/covid/singapore" className="hover:text-gray-300 transition">Singapore Travel Advice</Link></li>
            <li><Link href="/covid/uae" className="hover:text-gray-300 transition">UAE Travel Advice</Link></li>
            <li><Link href="/covid/uk" className="hover:text-gray-300 transition">UK Travel Advice</Link></li>
            <li><Link href="/covid/us" className="hover:text-gray-300 transition">US Travel Advice</Link></li>
          </ul>

          <div className="mt-12">
            <img 
              src="https://i.ibb.co/8LSpyb4Y/logo-white-1-2.png" 
              alt="Fayyaz Travels Logo" 
              className="w-32"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}