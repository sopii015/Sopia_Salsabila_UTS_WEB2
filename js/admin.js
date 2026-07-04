/**
 * Mandasari Premium - Panel Kendali Admin
 */

const AdminController = {
    init: () => {
        const session = Storage.get(STORAGE_KEYS.SESSION);
        if (!Auth.isLoggedIn() || session.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        
        AdminController.loadDashboardStats();
    },

    loadDashboardStats: () => {
        const daftarUser = Storage.get(STORAGE_KEYS.USERS) || [];
        const daftarPesanan = Storage.get(STORAGE_KEYS.ORDERS) || [];
        
        let totalPendapatan = 0;
        daftarPesanan.forEach(item => {
            if(item.rincianBiaya && item.rincianBiaya.totalBayar) {
                totalPendapatan += item.rincianBiaya.totalBayar;
            } else {
                totalPendapatan += item.total || 0;
            }
        });

        // Diubah agar pas dengan ID elemen di admin.html kalian
        const userEl = document.getElementById('stat-users');
        const orderEl = document.getElementById('stat-orders');
        const revenueEl = document.getElementById('stat-revenue');

        if (userEl) userEl.textContent = daftarUser.length;
        if (orderEl) orderEl.textContent = daftarPesanan.length;
        if (revenueEl) revenueEl.textContent = Cart.formatCurrency(totalPendapatan);

        AdminController.renderDaftarTransaksi(daftarPesanan);
    },

    renderDaftarTransaksi: (pesanan) => {
        const tabelBody = document.getElementById('orders-tbody');
        if (!tabelBody) return;

        if (pesanan.length === 0) {
            tabelBody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-10 text-center text-slate-400 font-medium">
                        Belum ada transaksi masuk untuk saat ini.
                    </td>
                </tr>`;
            return;
        }

        const sortedOrders = [...pesanan].sort((a, b) => new Date(b.waktuTransaksi) - new Date(a.waktuTransaksi));

        tabelBody.innerHTML = sortedOrders.map(order => {
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

            const totalBayar = order.rincianBiaya ? order.rincianBiaya.totalBayar : (order.total || 0);

            return `
                <tr class="border-b border-mandasari-gold/5 hover:bg-mandasari-cream/30 transition-colors">
                    <td class="py-4 px-4 font-mono text-xs text-mandasari-gold font-bold">#${order.id.substring(0, 8)}</td>
                    <td class="py-4 px-4">
                        <div class="text-sm font-bold text-mandasari-navy">${order.customerName || 'Customer'}</div>
                        <div class="text-[10px] text-slate-400">${order.customerEmail || ''}</div>
                    </td>
                    <td class="py-4 px-4">
                        <span class="px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider ${badgeClass}">
                            ${statusIndo}
                        </span>
                    </td>
                    <td class="py-4 px-4 font-bold text-sm text-right">${Cart.formatCurrency(totalBayar)}</td>
                    <td class="py-4 px-4 text-center">
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

    ubahStatusPesanan: (idPesanan, statusBaru) => {
        const berhasil = PesananMandasari.perbaruiStatus(idPesanan, statusBaru);
        
        if (berhasil) {
            if (typeof Toast !== 'undefined') Toast.show(`Pesanan ${idPesanan.substring(0, 8)} diperbarui ke: ${statusBaru}`, 'success');
            AdminController.loadDashboardStats();
        } else {
            if (typeof Toast !== 'undefined') Toast.show("Gagal memperbarui status pesanan", "error");
        }
    }
};

window.AdminController = AdminController;
document.addEventListener('DOMContentLoaded', AdminController.init);
