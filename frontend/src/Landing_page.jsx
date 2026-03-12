import { Link } from "react-router-dom";

export default function Landing_page() {
  return (
    <div className="font-sans bg-[#FFF6E9] text-gray-800">

      {/* NAVIGATION BAR */}
      <nav className="flex justify-between items-center p-6 shadow-sm bg-[#FFFDF8] sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-[#F97316]">
          PetConnect
        </h1>

        <ul className="flex gap-6 text-gray-700 font-medium items-center">
          <li><a href="#home" className="hover:text-[#F97316] transition">Home</a></li>
          <li><a href="#about" className="hover:text-[#F97316] transition">About</a></li>
          <li><a href="#features" className="hover:text-[#F97316] transition">Features</a></li>
          <li><a href="#howitworks" className="hover:text-[#F97316] transition">How It Works</a></li>

          <li><a href="#contact" className="hover:text-[#F97316] transition">Contact Us</a></li>
          <li>
            <Link
              to="/login"
              className="bg-[#F97316] text-white px-5 py-2 rounded-full shadow-md hover:bg-[#EA580C] transition"
            >
              Login
            </Link>
          </li>
        </ul>
      </nav>

      {/* HERO SECTION */}
      <section
        id="home"
        className="flex flex-col md:flex-row justify-center items-center p-16 bg-[#FFF6E9] min-h-[85vh]"
      >
        <div className="md:w-1/2">
          <h2 className="text-5xl font-bold leading-snug">
            A Smarter Way to Care for
            <span className="text-[#F97316]"> Your Beloved Pets</span>
          </h2>

          <p className="mt-6 text-gray-700 text-lg">
            Manage pet profiles, track vaccinations, book vet appointments,
            and shop pet essentials — All in one platform!
          </p>

          <Link
            to="/register"
            className="mt-8 inline-block bg-[#F97316] text-white px-8 py-3 rounded-full text-lg shadow-lg hover:bg-[#EA580C] hover:scale-105 transition"
          >
            Get Started →
          </Link>
        </div>

        <div className="md:w-1/2 mt-10 md:mt-0">
          <img
            src="/images/hero2.jpeg"
            alt="Pet Illustration"
            className="w-full max-w-md mx-auto rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
          />
        </div>
      </section>

      {/* ABOUT US */}
      {/* ABOUT US */}
      <section id="about" className="bg-[#FFFDF8] py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">

          {/* Heading */}
          <h2 className="text-4xl font-bold text-[#F97316] mb-6">
            About PetConnect
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            PetConnect is a comprehensive digital platform built to simplify and modernize
            pet wellness management. We empower pet owners to manage pet profiles,
            monitor vaccination schedules, book verified veterinary appointments,
            and purchase trusted pet essentials — all within one secure ecosystem.
            Our mission is to deliver reliability, convenience, and peace of mind
            through technology-driven pet care solutions.
          </p>

          {/* STATS SECTION */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-3xl font-bold text-[#F97316]">10K+</h3>
              <p className="text-gray-600 mt-2">Registered Users</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-3xl font-bold text-[#F97316]">5K+</h3>
              <p className="text-gray-600 mt-2">Active Pet Profiles</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-3xl font-bold text-[#F97316]">1K+</h3>
              <p className="text-gray-600 mt-2">Vet Appointments Booked</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-3xl font-bold text-[#F97316]">99%</h3>
              <p className="text-gray-600 mt-2">User Satisfaction</p>
            </div>

          </div>

        </div>
      </section>
      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-10">

          <h2 className="text-4xl font-bold text-center text-[#F97316] mb-6">
            Features
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            {[
              {
                title: "Pet Profile Management",
                desc: "Maintain detailed pet profiles including breed, age, and health history.",
                img: "/images/pet_profile.png",
              },
              {
                title: "Vaccination Tracking",
                desc: "Automated reminders for vaccinations and routine health checkups.",
                img: "/images/appointment.png",
              },
              {
                title: "Vet Appointment Booking",
                desc: "Book consultations online with flexible scheduling options.",
                img: "/images/petwellness.jpg",
              },
              {
                title: "Pet Marketplace",
                desc: "Shop premium pet food, toys, and wellness products securely.",
                img: "/images/market_place.png",
              },
              {
                title: "Secure Admin Panel",
                desc: "Admin controls for approvals, product management, and vet slots.",
                img: "/images/admin.webp",
              },
              {
                title: "Order Tracking",
                desc: "Track purchases and download invoices effortlessly.",
                img: "/images/track.jpeg",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition duration-300 text-center"
              >
                <img src={feature.img} className="w-16 mx-auto mb-5" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="howitworks" className="bg-[#FFFDF8] py-24">

        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold text-[#F97316] mb-4">
            How PetConnect Works
          </h2>

          <p className="text-gray-600 mb-16">
            A smooth journey from registration to complete pet care management.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-between relative">

            {[
              { title: "Create Account", desc: "Register securely with your details." },
              { title: "Add Pet Profile", desc: "Enter pet details and health info." },
              { title: "Track Health", desc: "Monitor vaccinations and alerts." },
              { title: "Book Services", desc: "Schedule vet appointments easily." },
              { title: "Shop & Manage", desc: "Buy essentials and track orders." },
            ].map((step, index, arr) => (
              <div key={index} className="flex items-center">

                {/* STEP CARD */}
                <div className="bg-white px-6 py-6 rounded-2xl shadow-md
                          hover:shadow-xl transition duration-300
                          text-center w-56">

                  <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center
                            rounded-full bg-[#F97316] text-white font-bold">
                    {index + 1}
                  </div>

                  <h3 className="font-semibold text-lg">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 text-sm mt-2">
                    {step.desc}
                  </p>
                </div>

                {/* ARROW (except last) */}
                {index !== arr.length - 1 && (
                  <div className="hidden md:flex items-center px-4">
                    <svg
                      width="60"
                      height="20"
                      viewBox="0 0 60 20"
                      fill="none"
                    >
                      <line
                        x1="0"
                        y1="10"
                        x2="50"
                        y2="10"
                        stroke="#F97316"
                        strokeWidth="3"
                      />
                      <polygon
                        points="50,3 60,10 50,17"
                        fill="#F97316"
                      />
                    </svg>
                  </div>
                )}

              </div>
            ))}

          </div>
        </div>
      </section>


      {/* CONTACT US */}
      <section id="contact" className="bg-[#FFFDF8] py-20">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center text-[#F97316] mb-6">
            Contact Us
          </h2>

          <p className="text-center text-gray-600 mb-14">
            Have questions? We'd love to hear from you.
          </p>

          <div className="grid md:grid-cols-2 gap-12">

            <div className="bg-white p-10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] space-y-6">
              <h3 className="text-2xl font-semibold text-[#F97316]">
                Get In Touch
              </h3>
              <p>📍 Hyderabad, Telangana, India</p>
              <p>📞 +91 98765 43210</p>
              <p>📧 support@petconnect.com</p>
              <p>🕒 Mon – Sat: 9:00 AM – 7:00 PM</p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <form className="space-y-6">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none"
                />
                <textarea
                  rows="4"
                  placeholder="Your Message"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-[#F97316] text-white py-3 rounded-full font-semibold hover:bg-[#EA580C] transition"
                >
                  Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#4B3F3F] text-gray-200 pt-12 pb-6 mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              PawConnect
            </h2>
            <p className="text-gray-300">
              A smart platform to manage your pets, track health,
              and book vet appointments.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-white">Home</a></li>
              <li><a href="#about" className="hover:text-white">About</a></li>
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              <li>Pet Profiles</li>
              <li>Vaccination Tracking</li>
              <li>Vet Appointments</li>
              <li>Pet Marketplace</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <p>📞 +91 98765 xxxxx</p>
            <p>📧 support@petconnect.com</p>
            <p>📍 Hyderabad, India</p>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-10 pt-6 text-center text-sm">
          © {new Date().getFullYear()} PawConnect — All Rights Reserved.
        </div>
      </footer>

    </div>
  );
}
