/**
 * Mandasari Premium App - Core Logic
 */

const MandasariApp = {
    init: () => {
        MandasariApp.handleNavbarScroll();
        MandasariApp.initDropdownSystem();
        MandasariApp.updateFooterYear();
        
        // Inisialisasi Tooltip atau inisialisasi awal lainnya jika diperlukan
        console.log("Mandasari App Initialized...");
    },

    // Mengatur efek transparan ke solid pada Navbar saat scroll
    handleNavbarScroll: () => {
        const header = document.getElementById('navbar');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
                // Efek saat scroll ke bawah
                header.classList.add('glass-nav', 'shadow-sm');
                header.style.paddingTop = '0.75rem';
                header.style.paddingBottom = '0.75rem';
            } else {
                // Efek saat di posisi paling atas
                header.classList.remove('glass-nav', 'shadow-sm');
                header.style.paddingTop = '1.25rem';
                header.style.paddingBottom = '1.25rem';
            }
        });
    },

    // Sistem Dropdown yang cerdas dan menutup otomatis
    initDropdownSystem: () => {
        document.addEventListener('click', (event) => {
            const isDropdownButton = event.target.closest('.dropdown-trigger');
            const currentDropdown = event.target.closest('.dropdown-container');

            // Tutup semua dropdown jika klik di luar area dropdown
            if (!isDropdownButton && !currentDropdown) {
                document.querySelectorAll('.dropdown-content').forEach(d => {
                    d.classList.add('opacity-0', 'invisible', 'translate-y-2');
                });
                return;
            }

            // Jika tombol dropdown diklik
            if (isDropdownButton) {
                const content = isDropdownButton.parentElement.querySelector('.dropdown-content');
                
                // Tutup dropdown lain yang mungkin sedang terbuka
                document.querySelectorAll('.dropdown-content').forEach(other => {
                    if (other !== content) {
                        other.classList.add('opacity-0', 'invisible', 'translate-y-2');
                    }
                });

                // Toggle menu saat ini
                content.classList.toggle('opacity-0');
                content.classList.toggle('invisible');
                content.classList.toggle('translate-y-2');
            }
        });
    },

    // Update tahun hak cipta secara otomatis
    updateFooterYear: () => {
        const yearDisplay = document.getElementById('footer-year');
        if (yearDisplay) {
            yearDisplay.textContent = new Date().getFullYear();
        }
    },

    /**
     * Helper: Format tanggal Indonesia (Contoh: 21 April 2026)
     */
    formatDate: (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
};

// Start App
document.addEventListener('DOMContentLoaded', MandasariApp.init);

/**
 * Global Event: Wishlist Toggle
 * Menangani interaksi tombol hati pada kartu produk
 */
window.addEventListener('toggle-wishlist', (e) => {
    const { productId } = e.detail;
    
    if (!Auth.isLoggedIn()) {
        Toast.show('Silakan login untuk menyimpan produk favorit', 'warning');
        return;
    }

    let wishlist = Storage.get(STORAGE_KEYS.WISHLIST) || [];
    const isExist = wishlist.includes(productId);

    if (!isExist) {
        wishlist.push(productId);
        Storage.set(STORAGE_KEYS.WISHLIST, wishlist);
        Toast.show('Kue berhasil ditambahkan ke Wishlist', 'success');
    } else {
        wishlist = wishlist.filter(id => id !== productId);
        Storage.set(STORAGE_KEYS.WISHLIST, wishlist);
        Toast.show('Kue dihapus dari Wishlist', 'info');
    }

    // Update tampilan icon secara real-time di semua card yang memiliki ID tersebut
    const targetButtons = document.querySelectorAll(`.btn-wishlist[data-id="${productId}"]`);
    targetButtons.forEach(btn => {
        const icon = btn.querySelector('svg');
        if (!isExist) {
            icon.classList.add('text-rose-500', 'fill-current');
            btn.classList.add('scale-110');
        } else {
            icon.classList.remove('text-rose-500', 'fill-current');
            btn.classList.remove('scale-110');
        }
    });
});