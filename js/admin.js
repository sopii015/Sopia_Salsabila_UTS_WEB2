/**
 * Mandasari Premium - Panel Kendali Admin
 */

const AdminController = {
    // Inisialisasi pengecekan akses
    init: () => {
        // Cek apakah user sudah login dan memiliki peran admin
        const session = Auth.getSession();
        if (!Auth.isLoggedIn() || session.role !== 'admin') {
            // Jika bukan admin, arahkan ke halaman beranda
            window.location.href = 'index.html';
            return;
        }
        
        AdminController.loadDashboardStats();
    },

    // Memuat data statistik ke dashboard
    loadDashboardStats: () => {
        const daftarUser = Storage.get(STORAGE_KEYS.USERS) || [];
        const daftarPesanan = Storage.get(STORAGE_KEYS.ORDERS) || [];
        
        // Hitung total pendapatan dari pesanan yang masuk
        let totalPendapatan = 0;
        daftarPesanan.forEach(item => {
            totalPendapatan += item.total;
        });

        // Update elemen UI untuk statistik (Gunakan ID yang sesuai di HTML)
        const userEl = document.getElementById('stat-total-users');
        const orderEl = document.getElementById('stat-total-orders');
        const revenueEl = document.getElementById('stat-total-revenue');

        if (userEl) userEl.textContent = daftarUser.length;
        if (orderEl) orderEl.textContent = daftarPesanan.length;
        if (revenueEl) revenueEl.textContent = Cart.formatCurrency(totalPendapatan);

        AdminController.renderDaftarTransaksi(daftarPesanan);
    },

    // Menampilkan tabel transaksi terbaru
    renderDaftarTransaksi: (pesanan) => {
        const tabelBody = document.getElementById('orders-tbody');
        if (!tabelBody) return;

        if (pesanan.length === 0) {
            tabelBody.innerHTML = `
                <tr>
                    <td colspan="6" class="py-10 text-center text-slate-400 font-medium">
                        Belum ada transaksi masuk untuk saat ini.
                    </td>
                </tr>`;
            return;
        }

        // Urutkan pesanan terbaru berada di paling atas
        const sortedOrders = [...pesanan].sort((a, b) => new Date(b.date) - new Date(a.date));

        tabelBody.innerHTML = sortedOrders.map(order => {
            // Logika Label Status (Badge)
            let badgeClass = '';
            let statusIndo = '';

            switch (order.status) {
                case 'Processing':
                    badgeClass = 'bg-amber-100 text-amber-700 border-amber-200';
                    statusIndo = 'Diproses';
                    break;
                case 'Shipped':
                    badgeClass = 'bg-blue-100 text-blue-700 border-blue-200';
                    statusIndo = 'Dikirim';
                    break;
                case 'Delivered':
                    badgeClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                    statusIndo = 'Selesai';
                    break;
                default:
                    badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                    statusIndo = order.status;
            }

            return `
                <tr class="border-b border-mandasari-gold/5 hover:bg-mandasari-cream/30 transition-colors">
                    <td class="py-4 px-4 font-mono text-xs text-mandasari-gold font-bold">#${order.id.substring(0, 8)}</td>
                    <td class="py-4 px-4">
                        <div class="text-sm font-bold text-mandasari-navy">${order.userName || 'Customer'}</div>
                        <div class="text-[10px] text-slate-400">${order.userEmail}</div>
                    </td>
                    <td class="py-4 px-4 text-xs font-medium">${App.formatDate ? App.formatDate(order.date) : order.date}</td>
                    <td class="py-4 px-4">
                        <span class="px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider ${badgeClass}">
                            ${statusIndo}
                        </span>
                    </td>
                    <td class="py-4 px-4 font-bold text-sm text-right">${Cart.formatCurrency(order.total)}</td>
                    <td class="py-4 px-4 text-right">
                        <select 
                            onchange="AdminController.ubahStatusPesanan('${order.id}', this.value)" 
                            class="bg-white border border-mandasari-gold/20 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:ring-2 focus:ring-mandasari-gold/20 outline-none cursor-pointer"
                        >
                            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Proses</option>
                            <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Kirim</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Selesai</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // Fungsi untuk mengubah status pesanan
    ubahStatusPesanan: (idPesanan, statusBaru) => {
        const berhasil = Orders.updateOrderStatus(idPesanan, statusBaru);
        
        if (berhasil) {
            Toast.show(`Pesanan ${idPesanan.substring(0, 8)} diperbarui ke: ${statusBaru}`, 'success');
            // Refresh data tampilan
            AdminController.loadDashboardStats();
        } else {
            Toast.show("Gagal memperbarui status pesanan", "error");
        }
    }
};

// Hubungkan ke window agar bisa diakses oleh atribut onclick/onchange di HTML
window.AdminController = AdminController;

// Jalankan inisialisasi saat dokumen siap
document.addEventListener('DOMContentLoaded', AdminController.init);