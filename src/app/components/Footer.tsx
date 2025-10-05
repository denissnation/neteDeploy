import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#333333] text-white py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div
          className="flex md:flex-row flex-wrap md:justify-between justify-evenly
           items-start "
        >
          {/* Footer Links */}
          <ul className=" md:mb-0">
            <li className="mb-2 ">
              <h2 className="font-bold text-xl">MODEL</h2>
            </li>
            <li className="mb-2 ">
              <a
                href="/about"
                className="hover:text-[#d7000f] text-sm sm:text-base "
              >
                Neta X
              </a>
            </li>
            <li className="mb-2 ">
              <a
                href="/services"
                className="hover:text-[#d7000f] text-sm sm:text-base"
              >
                Neta VII
              </a>
            </li>
            <li className="mb-2 ">
              <a
                href="/contact"
                className="hover:text-[#d7000f] text-sm sm:text-base"
              >
                Neta V
              </a>
            </li>
          </ul>

          {/* Social Media Links */}
          <div className="space-x-6">
            <ul className=" md:mb-0">
              <li className="mb-2 ">
                <h2 className="font-bold text-xl">Contact</h2>
              </li>
              <li className="mb-2 ">
                <a
                  href="https://www.facebook.com/mustafa.kamal.460995"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#d7000f] text-sm sm:text-base"
                >
                  Facebook
                </a>
              </li>
              <li className="mb-2 ">
                <a
                  href="https://www.instagram.com/musta_fakamal2706/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#d7000f] text-sm sm:text-base"
                >
                  Instagram
                </a>
              </li>
              <li className="mb-2 ">
                <a
                  href="https://wa.me/6285297129607"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#d7000f] text-sm sm:text-base"
                >
                  WhatsApp
                </a>
              </li>
              <li className="mb-2 ">
                <p className="text-sm sm:text-base">+6285297129607</p>
              </li>
            </ul>
          </div>
          <div className="space-x-6">
            <ul className="px-16 sm:px-0 md:mb-0 flex flex-col items-center">
              <li>
                {/* <div className="relative h-16 md:h-24 md:w-96 w-48 "> */}
                <Image
                  src="/features/gwm.png"
                  width={800} // or appropriate width for h-24 (6rem = 96px)
                  height={600} // or appropriate height for h-16 (4rem = 64px)
                  className="h-16 md:h-24 md:w-96 w-48 object-contain" // Added object-contain for better scaling
                  alt="GWM logo" // Always use descriptive alt text
                />
                {/* </div> */}
                {/* <img src="/features/gwm.png" className="h-16 md:h-24 " alt="" /> */}
              </li>
              <li className="text-sm sm:text-base ">
                <p>Alamat Showroom:</p>
                <p> Jl. Sisingamangaraja No.1 Medan, Sumatera Utara </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8">
          <p className="text-sm sm:text-base">
            &copy; {new Date().getFullYear()} Great Wall Motor. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
