import React, { useEffect } from 'react';

const LandingPage = ({ onEnterApp }) => {
  useEffect(() => {
    // Load external scripts and styles
    const loadAOS = () => {
      if (!window.AOS) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
        script.onload = () => {
          window.AOS.init({
            duration: 800,
            once: true,
          });
        };
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
        document.head.appendChild(link);
      }
    };

    loadAOS();

    // Mobile Menu Logic
    const initMobileMenu = () => {
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      const mobileMenu = document.getElementById('mobile-menu');
      
      if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
          mobileMenu.classList.toggle('hidden');
        });
      }
    };

    // FAQ Accordion Logic
    const initFAQ = () => {
      const faqItems = document.querySelectorAll('.faq-item');
      faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
          question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(i => i.classList.remove('open'));
            if (!isOpen) {
              item.classList.add('open');
            }
          });
        }
      });
    };

    initMobileMenu();
    initFAQ();

    return () => {
      // Cleanup
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      const mobileMenu = document.getElementById('mobile-menu');
      
      if (mobileMenuButton) {
        mobileMenuButton.replaceWith(mobileMenuButton.cloneNode(true));
      }
    };
  }, []);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    onEnterApp();
  };

  // Scroll to section function
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="text-gray-800 font-poppins">
      {/* Header */}
      <header id="header" className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="text-2xl font-bold text-gray-900">Edu<span className="text-indigo-600">Task</span></div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Kelebihan</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Cara Kerja</button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">FAQ</button>
            </nav>
            
            {/* Desktop Action Button */}
            <div className="hidden md:flex items-center">
              <button onClick={handleRegisterClick} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg shadow-lg hover:shadow-indigo-500/50 transition-all transform hover:scale-105 duration-300">
                Register
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button id="mobile-menu-button" className="text-gray-700 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        <div id="mobile-menu" className="hidden md:hidden bg-white border-t border-gray-200">
          <nav className="flex flex-col space-y-2 p-4">
            <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-indigo-600 font-medium p-2 rounded-md text-left">Kelebihan</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-indigo-600 font-medium p-2 rounded-md text-left">Cara Kerja</button>
            <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-indigo-600 font-medium p-2 rounded-md text-left">FAQ</button>
            <button onClick={handleRegisterClick} className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold mt-2 py-2 px-5 rounded-lg shadow-lg">
              Register
            </button>
          </nav>
        </div>
      </header>

      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div data-aos="fade-up">
              <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">✨ 100% Gratis Selamanya</span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">Fokus Mengajar, <br className="hidden md:block" />Bukan Administrasi Tugas</h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-8">EduTask adalah platform modern yang menyederhanakan cara guru memberikan dan siswa mengerjakan tugas. Terorganisir, efisien, dan tanpa biaya.</p>
              <button onClick={handleRegisterClick} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-xl transition-transform transform hover:scale-105 duration-300">
                Daftar Akun Gratis
              </button>
            </div>
            <div data-aos="fade-up" data-aos-delay="200" className="mt-16">
              <img src="https://edutask-app.vercel.app/Screenshot_2025-08-31-06-30-37-12.jpg" alt="Dasbor EduTask" className="rounded-2xl shadow-2xl mx-auto ring-1 ring-gray-200 max-w-full h-auto" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Sangat Mudah Digunakan</h2>
              <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">Hanya dalam 3 langkah, kelas Anda siap untuk berjalan lebih efisien.</p>
            </div>
            <div className="relative">
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Step 1 */}
                <div className="text-center" data-aos="fade-up">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold ring-8 ring-white">1</div>
                  </div>
                  <h3 className="text-xl font-bold mt-6 mb-2">Buat Kelas & Kategori</h3>
                  <p className="text-gray-600">Guru membuat kelas virtual untuk setiap mata pelajaran dan mengatur kategori tugas (PR, Ujian, Proyek) agar terorganisir.</p>
                </div>
                {/* Step 2 */}
                <div className="text-center" data-aos="fade-up" data-aos-delay="150">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold ring-8 ring-white">2</div>
                  </div>
                  <h3 className="text-xl font-bold mt-6 mb-2">Beri & Kirim Tugas</h3>
                  <p className="text-gray-600">Guru memposting tugas baru dengan instruksi dan tenggat waktu. Siswa menerima notifikasi dan mengirimkan hasil tugas secara digital.</p>
                </div>
                {/* Step 3 */}
                <div className="text-center" data-aos="fade-up" data-aos-delay="300">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold ring-8 ring-white">3</div>
                  </div>
                  <h3 className="text-xl font-bold mt-6 mb-2">Pantau & Beri Nilai</h3>
                  <p className="text-gray-600">Guru dapat dengan mudah melihat siapa saja yang sudah dan belum mengumpulkan, lalu memberikan nilai dan feedback langsung di platform.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Kelebihan Utama EduTask</h2>
              <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">Dirancang khusus untuk memecahkan masalah nyata di lingkungan sekolah.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-2xl" data-aos="fade-up">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Manajemen Kelas Terpusat</h3>
                <p className="text-gray-600">Buat kelas untuk setiap mata pelajaran, undang siswa dengan kode unik, dan lihat semua tugas dalam satu dasbor yang rapi.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl" data-aos="fade-up" data-aos-delay="100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pengumpulan Tugas Digital</h3>
                <p className="text-gray-600">Siswa dapat mengunggah file tugas (dokumen, gambar, PDF) langsung dari HP atau komputer. Guru menerima notifikasi instan.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl" data-aos="fade-up" data-aos-delay="200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pengingat & Notifikasi Otomatis</h3>
                <p className="text-gray-600">Sistem akan mengirimkan pengingat otomatis kepada siswa saat mendekati tenggat waktu, mengurangi keterlambatan.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl" data-aos="fade-up">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Akun Terpisah Guru & Siswa</h3>
                <p className="text-gray-600">Setiap peran memiliki dasbor yang dioptimalkan untuk kebutuhannya, membuat navigasi menjadi intuitif dan efisien.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl" data-aos="fade-up" data-aos-delay="100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kategori Tugas Fleksibel</h3>
                <p className="text-gray-600">Kelompokkan tugas berdasarkan mata pelajaran atau jenis (PR, Ujian, Proyek) agar semuanya lebih terstruktur.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl" data-aos="fade-up" data-aos-delay="200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Akses di Mana Saja</h3>
                <p className="text-gray-600">Sebagai aplikasi web, EduTask dapat diakses dari perangkat apa pun (HP, tablet, laptop) tanpa perlu instalasi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Pertanyaan yang Sering Diajukan</h2>
              <p className="text-lg text-gray-600 mt-2">Menemukan jawaban yang Anda butuhkan.</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {/* FAQ Item 1 */}
              <div className="faq-item bg-white rounded-lg shadow-sm border border-gray-200" data-aos="fade-up">
                <button className="faq-question w-full flex justify-between items-center text-left p-5 font-semibold text-gray-800">
                  <span>Apakah EduTask benar-benar gratis?</span>
                  <svg className="faq-icon w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div className="faq-answer px-5 pb-5 text-gray-600">
                  <p>Ya, 100% gratis. Misi kami adalah untuk mempermudah akses pendidikan berkualitas dengan menyediakan alat bantu yang efisien tanpa biaya apa pun.</p>
                </div>
              </div>
              {/* FAQ Item 2 */}
              <div className="faq-item bg-white rounded-lg shadow-sm border border-gray-200" data-aos="fade-up" data-aos-delay="100">
                <button className="faq-question w-full flex justify-between items-center text-left p-5 font-semibold text-gray-800">
                  <span>Bagaimana cara mendaftarkan sekolah saya?</span>
                  <svg className="faq-icon w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div className="faq-answer px-5 pb-5 text-gray-600">
                  <p>Anda tidak perlu mendaftarkan sekolah. Cukup guru yang membuat akun, lalu membuat kelas dan mengundang siswanya untuk bergabung. Prosesnya cepat dan mudah.</p>
                </div>
              </div>
              {/* FAQ Item 3 */}
              <div className="faq-item bg-white rounded-lg shadow-sm border border-gray-200" data-aos="fade-up" data-aos-delay="200">
                <button className="faq-question w-full flex justify-between items-center text-left p-5 font-semibold text-gray-800">
                  <span>Apakah data saya aman di EduTask?</span>
                  <svg className="faq-icon w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div className="faq-answer px-5 pb-5 text-gray-600">
                  <p>Keamanan data adalah prioritas utama kami. Kami menggunakan praktik keamanan standar industri untuk melindungi semua data pengguna. Untuk detail lebih lanjut, silakan baca Kebijakan Privasi kami.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
            <div className="bg-indigo-600 rounded-2xl p-8 md:p-12 text-center" data-aos="zoom-in">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Siap Mengubah Cara Anda Mengelola Tugas?</h2>
              <p className="text-lg text-indigo-200 mt-4 max-w-2xl mx-auto">Buat akun gratis Anda sekarang dan rasakan kemudahannya. Hanya butuh kurang dari satu menit untuk memulai.</p>
              <button onClick={handleRegisterClick} className="mt-8 inline-block bg-white hover:bg-gray-100 text-indigo-600 font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 duration-300">
                Mulai Gratis Sekarang
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-900 text-gray-400">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <div className="text-2xl font-bold text-white">Edu<span className="text-indigo-400">Task</span></div>
              <p className="mt-4 text-sm">Platform modern untuk menyederhanakan manajemen tugas sekolah, dirancang untuk guru dan siswa.</p>
            </div>
            {/* Navigation */}
            <div>
              <h3 className="font-semibold text-white tracking-wider uppercase">Navigasi</h3>
              <ul className="mt-4 space-y-2">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-indigo-400">Kelebihan</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-indigo-400">Cara Kerja</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-indigo-400">FAQ</button></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h3 className="font-semibold text-white tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="/privacy-policy" className="hover:text-indigo-400">Kebijakan Privasi</a></li>
                <li><a href="/terms-of-service" className="hover:text-indigo-400">Syarat & Ketentuan</a></li>
              </ul>
            </div>
            {/* Connect */}
            <div>
              <h3 className="font-semibold text-white tracking-wider uppercase">Terhubung</h3>
              <div className="flex mt-4 space-x-4">
                <a href="https://github.com/Adisdzaky1" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2025 EduTask. Dibuat dengan ❤️ oleh <a href="https://github.com/Adisdzaky1" className="font-semibold text-indigo-400 hover:text-indigo-300">AdisDzakyR</a>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;