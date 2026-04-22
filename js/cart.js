/**
 * Mandasari Premium - Keranjang Belanja Logic
 */

const KeranjangMandasari = {
    // Memuat item dari penyimpanan lokal saat inisialisasi
    items: Storage.get(STORAGE_KEYS.CART) || [],

    init: () => {
        KeranjangMandasari.perbaruiBadgeNavigasi();
    },

    /**
     * Menambah Produk ke Keranjang
     */
    tambahProduk: (produk, jumlah = 1) => {
        // Cek autentikasi sebelum belanja
        if (!MandasariAuth.isLoggedIn()) {
            Toast.show('Silakan masuk akun untuk mulai belanja', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return false;
        }

        const itemAda = KeranjangMandasari.items.find(item => item.id === produk.id);

        if (itemAda) {
            // Validasi ketersediaan stok kue
            if (itemAda.quantity + jumlah > produk.stock) {
                Toast.show('Maaf, stok kue tidak mencukupi', 'error');
                return false;
            }
            itemAda.quantity += jumlah;
        } else {
            // Cek stok untuk item baru
            if (jumlah > produk.stock) {
                Toast.show('Jumlah melebiuk stok yang tersedia', 'error');
                return false;
            }
            KeranjangMandasari.items.push({
                id: produk.id,
                name: produk.name,
                price: produk.price,
                image: produk.image,
                stock: produk.stock,
                category: produk.category,
                quantity: jumlah
            });
        }

        KeranjangMandasari.simpanData();
        Toast.show(`${produk.name} berhasil masuk keranjang`, 'success');
        return true;
    },

    /**
     * Menghapus Satu Jenis Produk
     */
    hapusItem: (idProduk) => {
        KeranjangMandasari.items = KeranjangMandasari.items.filter(item => item.id !== idProduk);
        KeranjangMandasari.simpanData();
        
        // Kirim sinyal agar halaman keranjang melakukan refresh UI
        window.dispatchEvent(new CustomEvent('update-tampilan-keranjang'));
    },

    /**
     * Update Jumlah (Quantity) Item
     */
    updateJumlah: (idProduk, jumlahBaru) => {
        const item = KeranjangMandasari.items.find(i => i.id === idProduk);
        if (!item) return false;

        if (jumlahBaru <= 0) {
            KeranjangMandasari.hapusItem(idProduk);
            return true;
        }

        if (jumlahBaru > item.stock) {
            Toast.show(`Hanya tersedia ${item.stock} porsi`, 'warning');
            item.quantity = item.stock;
        } else {
            item.quantity = jumlahBaru;
        }

        KeranjangMandasari.simpanData();
        window.dispatchEvent(new CustomEvent('update-tampilan-keranjang'));
        return true;
    },

    /**
     * Mengosongkan Seluruh Isi Keranjang
     */
    kosongkan: () => {
        KeranjangMandasari.items = [];
        KeranjangMandasari.simpanData();
        window.dispatchEvent(new CustomEvent('update-tampilan-keranjang'));
    },

    /**
     * Kalkulasi Total Belanja
     */
    hitungRingkasan: () => {
        const subtotal = KeranjangMandasari.items.reduce((acc, item) => {
            return acc + (item.price * item.quantity);
        }, 0);

        // Contoh logika pajak atau biaya layanan 5% (opsional)
        const biayaLayanan = subtotal * 0.05;
        const totalAkhir = subtotal + biayaLayanan;

        return { 
            subtotal, 
            biayaLayanan, 
            totalAkhir 
        };
    },

    /**
     * Format Mata Uang Rupiah (IDR)
     */
    formatRupiah: (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    },

    /**
     * Simpan ke LocalStorage & Sync Badge
     */
    simpanData: () => {
        Storage.set(STORAGE_KEYS.CART, KeranjangMandasari.items);
        KeranjangMandasari.perbaruiBadgeNavigasi();
    },

    /**
     * Update Angka pada Icon Keranjang di Navbar
     */
    perbaruiBadgeNavigasi: () => {
        const badges = document.querySelectorAll('.cart-counter-badge');
        const totalJenisKue = KeranjangMandasari.items.length;
        
        badges.forEach(badge => {
            if (totalJenisKue > 0) {
                badge.textContent = totalJenisKue;
                badge.classList.remove('hidden');
                
                // Animasi pop-up saat angka berubah
                badge.animate([
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.3)' },
                    { transform: 'scale(1)' }
                ], { duration: 300 });
            } else {
                badge.classList.add('hidden');
            }
        });
    }
};

// Start logic saat halaman dimuat
window.addEventListener('DOMContentLoaded', KeranjangMandasari.init);