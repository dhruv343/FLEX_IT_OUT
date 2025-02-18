import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-center md:text-left">© 2025 FLEX-IT-OUT. All rights reserved.</p>
        
        <ul className="flex space-x-4">
          <li><Link to="/privacy" className="hover:text-gray-400">Privacy Policy</Link></li>
          <li><Link to="/terms" className="hover:text-gray-400">Terms of Service</Link></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
