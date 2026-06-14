// ========== HARGA ==========
const ECERAN = { "24s": 49000, "30s": 44000 };
const GROSIR = { "24s": 41000, "30s": 36000 };
const TAMBAH_LENGAN = { "pendek": 0, "panjang": 8000 };
const TAMBAH_UKURAN = { "2XL": 5000, "3XL": 11000, "4XL": 17000 };
const HARGA_SABLON = { "Logo": 10000, "A5": 15000, "A4": 25000, "A3": 35000, "none": 0 };

function getProducts() {
    let stored = localStorage.getItem("samoja_products");
    if (stored && stored !== "undefined") {
        try { let parsed = JSON.parse(stored); if (Array.isArray(parsed) && parsed.length) return parsed; } catch(e) {}
    }
    return [
        { id: 1, name: "Eren Yeager", price: 89000 },
        { id: 2, name: "RX-78-02 Gundam", price: 89000 },
        { id: 3, name: "Jiraiya", price: 89000 }
    ];
}

let sales = [], currentPage = 1, itemsPerPage = 10, filteredSales = [];

function loadSales() {
    let stored = localStorage.getItem("samoja_sales");
    sales = stored ? JSON.parse(stored) : [];
    sales.sort((a,b)=>b.id.localeCompare(a.id));
    applySearch();
}
function saveSales() { localStorage.setItem("samoja_sales", JSON.stringify(sales)); }

function renderSales(data) {
    let tbody = document.getElementById("ordersList");
    tbody.innerHTML = "";
    let start = (currentPage-1)*itemsPerPage, end = start+itemsPerPage;
    let pageData = data.slice(start, end);
    let totalAll = data.reduce((s,o)=>s+o.total,0);
    pageData.forEach(s => {
        let row = tbody.insertRow();
        row.insertCell(0).innerText = s.id;
        row.insertCell(1).innerText = s.customer;
        row.insertCell(2).innerText = s.type==="custom"? "[Custom] "+s.productName : s.productName;
        row.insertCell(3).innerText = s.qty;
        row.insertCell(4).innerText = "Rp "+s.total.toLocaleString();
        let statusCell = row.insertCell(5);
        statusCell.innerText = s.status;
        let aksi = row.insertCell(6);
        aksi.style.textAlign="center";
        let editBtn = document.createElement("button");
        editBtn.innerHTML='<i class="fas fa-edit"></i>';
        editBtn.className="aksi-icon edit";
        editBtn.onclick=()=>editOrder(s.id);
        aksi.appendChild(editBtn);
        let printBtn = document.createElement("button");
        printBtn.innerHTML='<i class="fas fa-print"></i>';
        printBtn.className="aksi-icon print";
        printBtn.onclick=()=>printStruk(s);
        aksi.appendChild(printBtn);
        let delBtn = document.createElement("button");
        delBtn.innerHTML='<i class="fas fa-trash-alt"></i>';
        delBtn.className="aksi-icon delete";
        delBtn.onclick=()=>{ if(confirm("Hapus?")){ sales=sales.filter(x=>x.id!==s.id); saveSales(); applySearch(); } };
        aksi.appendChild(delBtn);
    });
    document.getElementById("totalRevenue").innerText = "Total Pendapatan: Rp "+totalAll.toLocaleString();
    renderPagination(data.length);
}
function renderPagination(total){
    let totalPages = Math.ceil(total/itemsPerPage);
    let div = document.getElementById("pagination");
    div.innerHTML="";
    if(totalPages<=1) return;
    for(let i=1;i<=totalPages;i++){
        let btn = document.createElement("button");
        btn.innerText=i;
        if(i===currentPage) btn.classList.add("active");
        btn.onclick=()=>{ currentPage=i; renderSales(filteredSales); };
        div.appendChild(btn);
    }
}

// ========== PRINT STRUK ==========
function printStruk(s) {
    let win = window.open('', '_blank', 'width=450,height=600');
    let itemRows = '';
    if (s.type === 'ready') {
        let hargaSatuan = s.total / s.qty;
        itemRows += `
            <tr>
                <td style="padding:4px 0">${s.productName}</td>
                <td style="padding:4px 8px; text-align:center">${s.qty}</td>
                <td style="padding:4px 8px; text-align:right">${hargaSatuan.toLocaleString()}</td>
                <td style="padding:4px 8px; text-align:right">${s.total.toLocaleString()}</td>
            </tr>
        `;
    } else {
        (s.items || []).forEach(item => {
            let detail = `${item.jenis === '24s' ? 'Cotton 24s' : 'Cotton 30s'} ${item.lengan === 'pendek' ? 'Pendek' : 'Panjang'}`;
            if (item.warna) detail += `, ${item.warna}`;
            if (item.variasi && item.variasi.length) {
                let ukuranStr = item.variasi.map(v => `${v.ukuran}: ${v.qty}`).join(', ');
                detail += `, ${ukuranStr}`;
            }
            if (item.sablonDepan && item.sablonDepan !== 'none') detail += `, Sablon Depan:${item.sablonDepan}`;
            if (item.sablonBelakang && item.sablonBelakang !== 'none') detail += `, Sablon Belakang:${item.sablonBelakang}`;
            if (item.posisiDepan) detail += `, Posisi Depan:${item.posisiDepan}`;
            if (item.posisiBelakang) detail += `, Posisi Belakang:${item.posisiBelakang}`;
            let hargaSatuan = item.total / item.qty;
            itemRows += `
                <tr>
                    <td style="padding:4px 0">
                        Custom Design<br>
                        <small>${detail}</small>
                    </td>
                    <td style="padding:4px 8px; text-align:center">${item.qty}</td>
                    <td style="padding:4px 8px; text-align:right">${hargaSatuan.toLocaleString()}</td>
                    <td style="padding:4px 8px; text-align:right">${item.total.toLocaleString()}</td>
                </tr>
            `;
        });
    }
    win.document.write(`
        <html>
        <head>
            <title>Struk ${s.id}</title>
            <style>
                body { font-family: monospace; margin: 20px; }
                .struk { max-width: 380px; margin: auto; border: 1px solid #ccc; padding: 15px; }
                .header { text-align: center; margin-bottom: 15px; }
                .header h3 { margin: 0; }
                .header p { margin: 2px 0; font-size: 12px; }
                .garis { border-top: 1px dashed #000; margin: 8px 0; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { padding: 5px 0; }
                th { border-bottom: 1px solid #000; text-align: left; }
                .right { text-align: right; }
                .center { text-align: center; }
                .total { font-weight: bold; border-top: 1px solid #000; margin-top: 5px; padding-top: 5px; text-align: right; }
                .footer { text-align: center; margin-top: 10px; font-size: 11px; }
            </style>
        </head>
        <body>
            <div class="struk">
                <div class="header">
                    <h3>SAMOJA STORE</h3>
                    <p>Dusun Galumpit RT01/RW01</p>
                    <p>Desa Jatiroke, Kec. Jatinangor</p>
                    <p>Kab. Sumedang</p>
                </div>
                <div class="garis"></div>
                <p><strong>No.Order:</strong> ${s.id}</p>
                <p><strong>Customer:</strong> ${s.customer}</p>
                <p><strong>Tgl:</strong> ${new Date().toLocaleString()}</p>
                <div class="garis"></div>
                <table>
                    <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Harga</th><th style="text-align:right">Total</th></tr></thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <div class="total">Total: Rp ${s.total.toLocaleString()}</div>
                <div class="garis"></div>
                <div class="footer">TERIMA KASIH TELAH ORDER DI SAMOJA STORE</div>
            </div>
        </body>
        </html>
    `);
    win.document.close();
    win.print();
}

// ========== FUNGSI UNTUK CUSTOM ITEM DINAMIS ==========
function createCustomItemRow(itemData = null) {
    let div = document.createElement("div");
    div.className = "custom-item";
    div.style.background = "#252525";
    div.style.padding = "15px";
    div.style.borderRadius = "20px";
    div.style.marginBottom = "15px";
    
    div.innerHTML = `
        <div class="row-dua" style="display:flex; gap:10px; margin-bottom:10px">
            <select class="itemJenis" style="flex:1">
                <option value="24s">Cotton Combed 24s</option>
                <option value="30s">Cotton Combed 30s</option>
            </select>
            <select class="itemLengan" style="flex:1">
                <option value="pendek">Lengan Pendek</option>
                <option value="panjang">Lengan Panjang (+Rp 8.000/pcs)</option>
            </select>
        </div>
        <input type="text" class="itemWarna" placeholder="Warna Kaos (opsional)" style="width:100%; margin-bottom:10px">
        <label>Variasi Ukuran & Jumlah:</label>
        <div class="itemVariasiContainer" style="margin-top:5px"></div>
        <button type="button" class="addVariasiBtn btn-add" style="margin:8px 0">+ Tambah Ukuran</button>
        <div class="itemGrosirInfo" style="font-size:12px; color:#ffaa66; margin:5px 0"></div>
        <div class="row-dua" style="display:flex; gap:10px; margin-bottom:10px">
            <select class="itemSablonDepan" style="flex:1">
                <option value="none">Tidak ada sablon depan</option>
                <option value="Logo">Logo (Rp 10.000)</option>
                <option value="A5">A5 (Rp 15.000)</option>
                <option value="A4">A4 (Rp 25.000)</option>
                <option value="A3">A3 (Rp 35.000)</option>
            </select>
            <select class="itemSablonBelakang" style="flex:1">
                <option value="none">Tidak ada sablon belakang</option>
                <option value="A5">A5 (Rp 15.000)</option>
                <option value="A4">A4 (Rp 25.000)</option>
                <option value="A3">A3 (Rp 35.000)</option>
            </select>
        </div>
        <input type="text" class="itemPosisiDepan" placeholder="Posisi sablon depan" style="width:100%; margin-bottom:10px">
        <input type="text" class="itemPosisiBelakang" placeholder="Posisi sablon belakang" style="width:100%; margin-bottom:10px">
        <textarea class="itemCatatan" rows="1" placeholder="Catatan tambahan" style="width:100%; margin-bottom:10px"></textarea>
        <div class="itemTotalPreview" style="background:#1e1e1e; padding:8px; border-radius:20px; text-align:center; margin-top:8px">Total: Rp 0 (0 pcs)</div>
        <div style="display:flex; gap:10px; margin-top:10px">
            <button type="button" class="removeItemBtn btn-danger">✕ Hapus Item Custom Ini</button>
        </div>
    `;
    
    let variasiContainer = div.querySelector(".itemVariasiContainer");
    function addVariasiRow(ukuran = "S", qty = 1) {
        let row = document.createElement("div");
        row.className = "size-row";
        row.style.display = "flex";
        row.style.gap = "10px";
        row.style.alignItems = "center";
        row.style.marginBottom = "10px";
        row.innerHTML = `
            <select class="varSize" style="width:120px">
                <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
                <option value="2XL">2XL (+5.000)</option><option value="3XL">3XL (+11.000)</option><option value="4XL">4XL (+17.000)</option>
            </select>
            <input type="number" class="varQty" value="${qty}" min="1" step="1" style="width:100px">
            <button type="button" class="removeVariasiBtn btn-danger" style="width:36px;height:36px;padding:0">✕</button>
        `;
        row.querySelector(".varSize").value = ukuran;
        row.querySelector(".removeVariasiBtn").onclick = () => row.remove();
        variasiContainer.appendChild(row);
    }
    if (itemData && itemData.variasi && itemData.variasi.length) {
        itemData.variasi.forEach(v => addVariasiRow(v.ukuran, v.qty));
    } else {
        addVariasiRow("S", 1);
    }
    div.querySelector(".addVariasiBtn").onclick = () => addVariasiRow("S", 1);
    
    function calculateItemTotal() {
        let jenis = div.querySelector(".itemJenis").value;
        let lengan = div.querySelector(".itemLengan").value;
        let sablonDepan = div.querySelector(".itemSablonDepan").value;
        let sablonBelakang = div.querySelector(".itemSablonBelakang").value;
        let rows = div.querySelectorAll(".size-row");
        let totalQty = 0;
        rows.forEach(row => totalQty += parseInt(row.querySelector(".varQty").value) || 0);
        let hargaDasar = totalQty >= 12 ? GROSIR[jenis] : ECERAN[jenis];
        let totalHarga = 0;
        rows.forEach(row => {
            let ukuran = row.querySelector(".varSize").value;
            let qty = parseInt(row.querySelector(".varQty").value) || 0;
            if (qty === 0) return;
            let biayaUkuran = TAMBAH_UKURAN[ukuran] || 0;
            let biayaLengan = TAMBAH_LENGAN[lengan];
            let biayaDepan = HARGA_SABLON[sablonDepan];
            let biayaBelakang = HARGA_SABLON[sablonBelakang];
            if ((sablonBelakang === "A3" || sablonBelakang === "A4") && sablonDepan === "Logo") biayaDepan = 0;
            let hargaPerPcs = hargaDasar + biayaLengan + biayaUkuran + biayaDepan + biayaBelakang;
            totalHarga += hargaPerPcs * qty;
        });
        let infoDiv = div.querySelector(".itemGrosirInfo");
        infoDiv.innerHTML = totalQty >= 12 ? "⭐ Harga grosir (≥12 pcs)" : "Harga eceran (<12 pcs)";
        div.querySelector(".itemTotalPreview").innerHTML = `Total: Rp ${totalHarga.toLocaleString()} (${totalQty} pcs)`;
        return { total: totalHarga, qty: totalQty };
    }
    // Pasang event listener
    let fields = [".itemJenis", ".itemLengan", ".itemSablonDepan", ".itemSablonBelakang"];
    fields.forEach(sel => div.querySelector(sel).addEventListener("change", calculateItemTotal));
    div.querySelector(".itemVariasiContainer").addEventListener("change", calculateItemTotal);
    div.querySelector(".itemVariasiContainer").addEventListener("input", calculateItemTotal);
    if (itemData) {
        div.querySelector(".itemJenis").value = itemData.jenis || "24s";
        div.querySelector(".itemLengan").value = itemData.lengan || "pendek";
        div.querySelector(".itemWarna").value = itemData.warna || "";
        div.querySelector(".itemSablonDepan").value = itemData.sablonDepan || "none";
        div.querySelector(".itemSablonBelakang").value = itemData.sablonBelakang || "none";
        div.querySelector(".itemPosisiDepan").value = itemData.posisiDepan || "";
        div.querySelector(".itemPosisiBelakang").value = itemData.posisiBelakang || "";
        div.querySelector(".itemCatatan").value = itemData.catatan || "";
    }
    calculateItemTotal();
    return div;
}

function addCustomItemToForm(itemData = null) {
    let container = document.getElementById("customItemsContainer");
    let newItem = createCustomItemRow(itemData);
    container.appendChild(newItem);
    newItem.querySelector(".removeItemBtn").onclick = () => newItem.remove();
}

// ========== MODIFIKASI FORM CUSTOM ==========
function toggleOrderFields() {
    let type = document.getElementById("orderType").value;
    document.getElementById("readyFields").style.display = type === "ready" ? "block" : "none";
    document.getElementById("customFields").style.display = type === "custom" ? "block" : "none";
}
function calculateCustomTotal() {
    let items = document.querySelectorAll("#customItemsContainer .custom-item");
    let totalAll = 0;
    let totalQtyAll = 0;
    items.forEach(item => {
        let totalEl = item.querySelector(".itemTotalPreview");
        let match = totalEl.innerText.match(/Rp ([\d,]+)/);
        if (match) {
            let total = parseInt(match[1].replace(/,/g, ''));
            totalAll += total;
            let qtyMatch = totalEl.innerText.match(/\((\d+) pcs\)/);
            if (qtyMatch) totalQtyAll += parseInt(qtyMatch[1]);
        }
    });
    document.getElementById("customTotalPreview").innerHTML = `Total: Rp ${totalAll.toLocaleString()} (${totalQtyAll} pcs)`;
    return { total: totalAll, qty: totalQtyAll };
}
function showOrderForm(){
    document.getElementById("orderForm").style.display="block";
    document.getElementById("formTitle").innerText="Tambah Penjualan";
    document.getElementById("editId").value="";
    document.getElementById("orderId").value="";
    document.getElementById("customerName").value="";
    document.getElementById("orderType").value="ready";
    toggleOrderFields();
    let container = document.getElementById("customItemsContainer");
    container.innerHTML = "";
    addCustomItemToForm();
    document.getElementById("orderStatus").value="Diproses";
}
function saveOrder(){
    let isEdit = document.getElementById("editId").value!=="";
    let id = document.getElementById("orderId").value.trim();
    if(!id){ alert("ID wajib"); return; }
    let customer = document.getElementById("customerName").value.trim();
    if(!customer){ alert("Nama customer wajib"); return; }
    let type = document.getElementById("orderType").value;
    let status = document.getElementById("orderStatus").value;
    let total=0, qty=0, productName="", items=null;
    if(type==="ready"){
        let productId = parseInt(document.getElementById("productSelect").value);
        let products = getProducts();
        let product = products.find(p=>p.id===productId);
        if(!product) return;
        let size = document.getElementById("sizeSelect").value;
        let qtyReady = parseInt(document.getElementById("qtyReady").value);
        total = product.price * qtyReady;
        qty = qtyReady;
        productName = `${product.name} (${size})`;
    } else {
        items = [];
        let itemDivs = document.querySelectorAll("#customItemsContainer .custom-item");
        if(itemDivs.length === 0){ alert("Tambahkan minimal satu item custom"); return; }
        let totalAll = 0;
        let totalQtyAll = 0;
        for(let div of itemDivs){
            let jenis = div.querySelector(".itemJenis").value;
            let lengan = div.querySelector(".itemLengan").value;
            let warna = div.querySelector(".itemWarna").value.trim();
            let sablonDepan = div.querySelector(".itemSablonDepan").value;
            let sablonBelakang = div.querySelector(".itemSablonBelakang").value;
            let posisiDepan = div.querySelector(".itemPosisiDepan").value.trim();
            let posisiBelakang = div.querySelector(".itemPosisiBelakang").value.trim();
            let catatan = div.querySelector(".itemCatatan").value.trim();
            let variasi = [];
            let variasiRows = div.querySelectorAll(".size-row");
            for(let row of variasiRows){
                let ukuran = row.querySelector(".varSize").value;
                let jml = parseInt(row.querySelector(".varQty").value);
                if(jml>0) variasi.push({ ukuran, qty: jml });
            }
            if(variasi.length === 0){ alert("Setiap item minimal satu ukuran"); return; }
            let itemQty = variasi.reduce((a,b)=>a+b.qty,0);
            let hargaDasar = itemQty >= 12 ? GROSIR[jenis] : ECERAN[jenis];
            let itemTotal = 0;
            for(let v of variasi){
                let biayaUkuran = TAMBAH_UKURAN[v.ukuran] || 0;
                let biayaLengan = TAMBAH_LENGAN[lengan];
                let biayaDepan = HARGA_SABLON[sablonDepan];
                let biayaBelakang = HARGA_SABLON[sablonBelakang];
                if((sablonBelakang==="A3"||sablonBelakang==="A4") && sablonDepan==="Logo") biayaDepan=0;
                let hargaPerPcs = hargaDasar + biayaLengan + biayaUkuran + biayaDepan + biayaBelakang;
                itemTotal += hargaPerPcs * v.qty;
            }
            totalAll += itemTotal;
            totalQtyAll += itemQty;
            items.push({
                jenis, lengan, warna, sablonDepan, sablonBelakang,
                posisiDepan, posisiBelakang, catatan, variasi,
                total: itemTotal, qty: itemQty
            });
        }
        total = totalAll;
        qty = totalQtyAll;
        productName = "Custom Design";
    }
    if(!isEdit && sales.some(s=>s.id===id)){ alert("ID sudah ada!"); return; }
    let newSale = { id, customer, type, productName, qty, total, status };
    if(type==="custom") newSale.items = items;
    if(isEdit){
        let idx = sales.findIndex(s=>s.id===document.getElementById("editId").value);
        if(idx!==-1) sales[idx]=newSale;
    } else {
        sales.push(newSale);
    }
    sales.sort((a,b)=>b.id.localeCompare(a.id));
    saveSales();
    applySearch();
    cancelForm();
}
function cancelForm(){
    document.getElementById("orderForm").style.display="none";
}
function editOrder(id){
    let sale = sales.find(s=>s.id===id);
    if(!sale) return;
    document.getElementById("formTitle").innerText="Edit Penjualan";
    document.getElementById("editId").value=sale.id;
    document.getElementById("orderId").value=sale.id;
    document.getElementById("customerName").value=sale.customer;
    document.getElementById("orderType").value=sale.type;
    document.getElementById("orderStatus").value=sale.status;
    toggleOrderFields();
    if(sale.type==="ready"){
        let products = getProducts();
        let product = products.find(p=>sale.productName.includes(p.name));
        if(product) document.getElementById("productSelect").value=product.id;
        let sizeMatch = sale.productName.match(/\(([^)]+)\)/);
        if(sizeMatch) document.getElementById("sizeSelect").value=sizeMatch[1];
        document.getElementById("qtyReady").value=sale.qty;
    } else if(sale.type==="custom" && sale.items){
        let container = document.getElementById("customItemsContainer");
        container.innerHTML = "";
        sale.items.forEach(item => {
            let itemData = {
                jenis: item.jenis,
                lengan: item.lengan,
                warna: item.warna,
                sablonDepan: item.sablonDepan,
                sablonBelakang: item.sablonBelakang,
                posisiDepan: item.posisiDepan,
                posisiBelakang: item.posisiBelakang,
                catatan: item.catatan,
                variasi: item.variasi
            };
            addCustomItemToForm(itemData);
        });
        if(sale.items.length === 0) addCustomItemToForm();
    }
    document.getElementById("orderForm").style.display="block";
}
function populateProductSelect(){
    let sel = document.getElementById("productSelect");
    sel.innerHTML="";
    getProducts().forEach(p=>{
        let opt = document.createElement("option");
        opt.value=p.id;
        opt.innerText=`${p.name} - Rp ${p.price.toLocaleString()}`;
        sel.appendChild(opt);
    });
}
function applySearch(){
    let keyword = document.getElementById("searchInput").value.toLowerCase();
    let status = document.getElementById("statusFilter").value;
    filteredSales = sales.filter(s=> (s.id.toLowerCase().includes(keyword)||s.customer.toLowerCase().includes(keyword)) && (status===""||s.status===status) );
    currentPage=1;
    renderSales(filteredSales);
}
function resetSearch(){
    document.getElementById("searchInput").value="";
    document.getElementById("statusFilter").value="";
    applySearch();
}
document.addEventListener("DOMContentLoaded",()=>{
    loadSales();
    populateProductSelect();
    document.getElementById("tambahBtn").addEventListener("click",showOrderForm);
    document.getElementById("saveOrderBtn").addEventListener("click",saveOrder);
    document.getElementById("cancelFormBtn").addEventListener("click",cancelForm);
    document.getElementById("searchBtn").addEventListener("click",applySearch);
    document.getElementById("resetBtn").addEventListener("click",resetSearch);
    document.getElementById("orderType").addEventListener("change",toggleOrderFields);
    // Tombol untuk menambah item custom
    let addItemBtn = document.getElementById("addCustomItemBtn");
    if(addItemBtn) addItemBtn.addEventListener("click", () => addCustomItemToForm());
});