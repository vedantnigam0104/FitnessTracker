import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaGithub,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 px-8 sm:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand & Description */}
        <div>
          <h2 className="text-3xl font-bold text-green-400 mb-4">FitTrack</h2>
          <p className="text-gray-400 leading-relaxed">
            Your ultimate fitness companion. Track, analyze, and improve your
            health journey with us.
          </p>
          <div className="flex space-x-4 mt-6 text-green-400">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="hover:text-green-600 transition"
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="hover:text-green-600 transition"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="hover:text-green-600 transition"
            >
              <FaLinkedinIn size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hover:text-green-600 transition"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="hover:text-green-600 transition"
            >
              <FaGithub size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-green-400 mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#home" className="hover:text-green-600 transition">
                Home
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-green-600 transition">
                Features
              </a>
            </li>
            <li>
              <a href="#testimonials" className="hover:text-green-600 transition">
                Testimonials
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-green-600 transition">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-green-600 transition">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-xl font-semibold text-green-400 mb-4">Resources</h3>
          <ul className="space-y-2">
            <li>
              <a href="/blog" className="hover:text-green-600 transition">
                Blog
              </a>
            </li>
            <li>
              <a href="/help" className="hover:text-green-600 transition">
                Help Center
              </a>
            </li>
            <li>
              <a href="/api-docs" className="hover:text-green-600 transition">
                API Documentation
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-green-600 transition">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-semibold text-green-400 mb-4">Stay Updated</h3>
          <p className="text-gray-400 mb-6">
            Subscribe to our newsletter to get the latest updates and offers.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Subscribed!");
            }}
            className="flex flex-col items-center sm:flex-row sm:justify-center gap-4"
          >
           <input
            type="email"
            placeholder="Your email address"
            required
            className="px-4 py-3 rounded-md bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
            />

            <button
              type="submit"
              className="bg-green-400 text-gray-900 px-6 py-3 rounded-md font-semibold hover:bg-green-500 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} FitTrack. All rights reserved.
      </div>
    </footer>
  );
}
