import Image from "next/image";
import { FaFacebook, FaInstagram, FaPhone, FaWhatsapp } from "react-icons/fa";

export default function ProfileSection() {
  return (
    <div className="relative bg-[#333333] p-6 h-[500px] md:h-[550px] flex justify-center shadow-lg bg-cover sm:pl-0 pt-0 bg-no-repeat">
      <div className="profile-card bg-[#d8d8d8] text-center flex flex-col items-center justify-center max-w-sm md:max-w-full w-full sm:[clip-path:polygon(0%_0%,100%_0%,100%_90%,0%_100%)] shadow-lg p-8">
        <div className="profile-image mb-6">
          <Image
            src="/features/profile2.jpg"
            alt="Profile Picture"
            width={128}
            height={128}
            className="w-32 h-32 md:w-36 md:h-36 rounded-full mx-auto border-4 border-[#d7000f] object-cover shadow-md ring-8 ring-red-200"
            priority
          />
        </div>
        <div className="profile-info">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Mustafa Kamal
          </h2>
          <p className="text-md sm:text-lg text-gray-600 mb-2 sm:mb-4">
            Sales Executive
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
            Honest advice, smooth deals.
          </p>
          <div className="social-links flex justify-center space-x-6 mb-6 sm:mb-8">
            <a
              href="#"
              target="_blank"
              className="text-gray-500 hover:text-blue-600 transform hover:-translate-y-1 transition duration-300"
            >
              <FaFacebook className="w-8 h-8 grayscale hover:grayscale-0 transition duration-300" />
            </a>
            <a
              href="#"
              target="_blank"
              className="text-gray-500 hover:text-gray-800 transform hover:-translate-y-1 transition duration-300"
            >
              <FaInstagram className="w-8 h-8 grayscale hover:grayscale-0 transition duration-300" />
            </a>
            <a
              href="#"
              target="_blank"
              className="text-gray-500 hover:text-blue-400 transform hover:-translate-y-1 transition duration-300"
            >
              <FaWhatsapp className="w-8 h-8 grayscale hover:grayscale-0 transition duration-300" />
            </a>
            <a
              href="#"
              target="_blank"
              className="text-gray-500 hover:text-blue-400 transform hover:-translate-y-1 transition duration-300"
            >
              <FaPhone className="w-8 h-8 grayscale hover:grayscale-0 transition duration-300" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
