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
        let sel = document.createElement("select");
        ["Diproses","Dikirim","Selesai","Dibatalkan"].forEach(st=>{
            let opt = document.createElement("option");
            opt.value=st; opt.innerText=st;
            if(s.status===st) opt.selected=true;
            sel.appendChild(opt);
        });
        sel.onchange = e=>{ s.status=e.target.value; saveSales(); applySearch(); };
        statusCell.appendChild(sel);
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
function printStruk(s){
    let win = window.open('','_blank','width=400,height=600');
    let detail="";
    if(s.type==="custom" && s.customData){
        let cd = s.customData;
        detail+=`<p>Jenis: ${cd.jenis==="24s"?"Cotton 24s":"Cotton 30s"}</p><p>Lengan: ${cd.lengan==="pendek"?"Pendek":"Panjang(+8k)"}</p>`;
        if(cd.warna) detail+=`<p>Warna: ${cd.warna}</p>`;
        if(cd.ukuranDetail) detail+=`<p>Ukuran: ${cd.ukuranDetail.join(", ")}</p>`;
        if(cd.sablonDepan!=="none") detail+=`<p>Sablon Depan: ${cd.sablonDepan}</p>`;
        if(cd.sablonBelakang!=="none") detail+=`<p>Sablon Belakang: ${cd.sablonBelakang}</p>`;
        if(cd.posisiDepan) detail+=`<p>Posisi Depan: ${cd.posisiDepan}</p>`;
        if(cd.posisiBelakang) detail+=`<p>Posisi Belakang: ${cd.posisiBelakang}</p>`;
        if(cd.catatan) detail+=`<p>Catatan: ${cd.catatan}</p>`;
    }
    win.document.write(`
        <html><head><title>Struk ${s.id}</title><style>body{font-family:monospace;margin:20px}.struk{border:1px solid #ccc;padding:15px}.garis{border-top:1px dashed #000;margin:10px 0}</style></head>
        <body><div class="struk"><div class="header"><h3>SAMOJA</h3><p>Jl. Contoh 123, Bandung</p></div><div class="garis"></div>
        <p><strong>No.Order:</strong> ${s.id}</p><p><strong>Customer:</strong> ${s.customer}</p><p><strong>Tgl:</strong> ${new Date().toLocaleString()}</p>
        <div class="garis"></div><p><strong>Produk:</strong> ${s.type==="custom"?"Custom Design":s.productName}</p>${detail}
        <p><strong>Jumlah:</strong> ${s.qty}</p><p><strong>Total:</strong> Rp ${s.total.toLocaleString()}</p><div class="garis"></div><p>Terima kasih</p></div></body></html>
    `);
    win.document.close(); win.print();
}
// Custom calculation functions
function getTotalQtyFromVariasi(){
    let total=0;
    document.querySelectorAll("#sizeVariasiContainer .varQty").forEach(inp=>total+=parseInt(inp.value)||0);
    return total;
}
function calculateCustomTotal(){
    let jenis = document.getElementById("customJenis").value;
    let lengan = document.getElementById("customLengan").value;
    let sablonDepan = document.getElementById("customSablonDepan").value;
    let sablonBelakang = document.getElementById("customSablonBelakang").value;
    let totalQty = getTotalQtyFromVariasi();
    let hargaDasar = totalQty>=12 ? GROSIR[jenis] : ECERAN[jenis];
    let totalHarga=0;
    document.querySelectorAll("#sizeVariasiContainer .size-row").forEach(row=>{
        let ukuran = row.querySelector(".varSize").value;
        let qty = parseInt(row.querySelector(".varQty").value)||0;
        if(qty===0) return;
        let biayaUkuran = TAMBAH_UKURAN[ukuran]||0;
        let biayaLengan = TAMBAH_LENGAN[lengan];
        let biayaDepan = HARGA_SABLON[sablonDepan];
        let biayaBelakang = HARGA_SABLON[sablonBelakang];
        if((sablonBelakang==="A3"||sablonBelakang==="A4") && sablonDepan==="Logo") biayaDepan=0;
        totalHarga += (hargaDasar+biayaLengan+biayaUkuran+biayaDepan+biayaBelakang) * qty;
    });
    let info = document.getElementById("customGrosirInfo");
    info.innerHTML = totalQty>=12 ? "⭐ Harga grosir (≥12 pcs)" : "Harga eceran (<12 pcs)";
    document.getElementById("customTotalPreview").innerHTML = `Total: Rp ${totalHarga.toLocaleString()} (${totalQty} pcs)`;
    return {total:totalHarga, qty:totalQty};
}
function attachVariasiEvents(){
    document.querySelectorAll("#sizeVariasiContainer .varSize, #sizeVariasiContainer .varQty").forEach(el=>{
        el.removeEventListener("change", calculateCustomTotal);
        el.removeEventListener("input", calculateCustomTotal);
        el.addEventListener("change", calculateCustomTotal);
        el.addEventListener("input", calculateCustomTotal);
    });
    document.querySelectorAll("#sizeVariasiContainer .removeVarBtn").forEach(btn=>{
        btn.removeEventListener("click", (e)=>{
            if(document.querySelectorAll("#sizeVariasiContainer .size-row").length>1) btn.closest(".size-row").remove();
            else alert("Minimal satu baris");
            calculateCustomTotal();
        });
        btn.addEventListener("click", (e)=>{
            if(document.querySelectorAll("#sizeVariasiContainer .size-row").length>1) btn.closest(".size-row").remove();
            else alert("Minimal satu baris ukuran");
            calculateCustomTotal();
        });
    });
}
function addVariasiRow(){
    let container = document.getElementById("sizeVariasiContainer");
    let row = document.createElement("div");
    row.className="size-row";
    row.innerHTML=`<select class="varSize"><option>S</option><option>M</option><option>L</option><option>XL</option><option>2XL</option><option>3XL</option><option>4XL</option></select>
        <input type="number" class="varQty" value="1" min="1"><button type="button" class="removeVarBtn btn-danger">✕</button>`;
    container.appendChild(row);
    attachVariasiEvents();
    calculateCustomTotal();
}
function toggleOrderFields(){
    let type = document.getElementById("orderType").value;
    document.getElementById("readyFields").style.display = type==="ready"?"block":"none";
    document.getElementById("customFields").style.display = type==="custom"?"block":"none";
    if(type==="custom") calculateCustomTotal();
}
function showOrderForm(){
    document.getElementById("orderForm").style.display="block";
    document.getElementById("formTitle").innerText="Tambah Penjualan";
    document.getElementById("editId").value="";
    document.getElementById("orderId").value="";
    document.getElementById("customerName").value="";
    document.getElementById("orderType").value="ready";
    toggleOrderFields();
    let cont = document.getElementById("sizeVariasiContainer");
    cont.innerHTML=`<div class="size-row"><select class="varSize"><option>S</option><option>M</option><option>L</option><option>XL</option><option>2XL</option><option>3XL</option><option>4XL</option></select>
        <input type="number" class="varQty" value="1" min="1"><button class="removeVarBtn btn-danger">✕</button></div>`;
    attachVariasiEvents();
    calculateCustomTotal();
    document.getElementById("customJenis").value="24s";
    document.getElementById("customLengan").value="pendek";
    document.getElementById("customWarna").value="";
    document.getElementById("customSablonDepan").value="none";
    document.getElementById("customSablonBelakang").value="none";
    document.getElementById("customPosisiDepan").value="";
    document.getElementById("customPosisiBelakang").value="";
    document.getElementById("customCatatan").value="";
    document.getElementById("orderStatus").value="Diproses";
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
    } else if(sale.type==="custom" && sale.customData){
        let cd = sale.customData;
        document.getElementById("customJenis").value=cd.jenis||"24s";
        document.getElementById("customLengan").value=cd.lengan||"pendek";
        document.getElementById("customWarna").value=cd.warna||"";
        let container = document.getElementById("sizeVariasiContainer");
        container.innerHTML="";
        if(cd.ukuranDetail && cd.ukuranDetail.length){
            cd.ukuranDetail.forEach(item=>{
                let [uk,jml]=item.split(": ");
                let row = document.createElement("div");
                row.className="size-row";
                row.innerHTML=`<select class="varSize"><option>S</option><option>M</option><option>L</option><option>XL</option><option>2XL</option><option>3XL</option><option>4XL</option></select>
                    <input type="number" class="varQty" value="${jml}" min="1"><button class="removeVarBtn btn-danger">✕</button>`;
                row.querySelector(".varSize").value=uk;
                container.appendChild(row);
            });
        } else {
            container.innerHTML=`<div class="size-row"><select class="varSize"><option>S</option><option>M</option><option>L</option><option>XL</option><option>2XL</option><option>3XL</option><option>4XL</option></select>
                <input type="number" class="varQty" value="1" min="1"><button class="removeVarBtn btn-danger">✕</button></div>`;
        }
        attachVariasiEvents();
        document.getElementById("customSablonDepan").value=cd.sablonDepan||"none";
        document.getElementById("customSablonBelakang").value=cd.sablonBelakang||"none";
        document.getElementById("customPosisiDepan").value=cd.posisiDepan||"";
        document.getElementById("customPosisiBelakang").value=cd.posisiBelakang||"";
        document.getElementById("customCatatan").value=cd.catatan||"";
        calculateCustomTotal();
    }
    document.getElementById("orderForm").style.display="block";
}
function saveOrder(){
    let isEdit = document.getElementById("editId").value!=="";
    let id = document.getElementById("orderId").value.trim();
    if(!id){ alert("ID wajib"); return; }
    let customer = document.getElementById("customerName").value.trim();
    if(!customer){ alert("Nama customer wajib"); return; }
    let type = document.getElementById("orderType").value;
    let status = document.getElementById("orderStatus").value;
    let total=0, qty=0, productName="", customData=null;
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
        let calc = calculateCustomTotal();
        total = calc.total; qty = calc.qty;
        if(qty===0){ alert("Minimal 1 pcs"); return; }
        productName = "Custom Design";
        let ukuranDetail = [];
        document.querySelectorAll("#sizeVariasiContainer .size-row").forEach(row=>{
            let uk = row.querySelector(".varSize").value;
            let jml = row.querySelector(".varQty").value;
            ukuranDetail.push(`${uk}: ${jml}`);
        });
        customData = {
            jenis: document.getElementById("customJenis").value,
            lengan: document.getElementById("customLengan").value,
            warna: document.getElementById("customWarna").value.trim(),
            ukuranDetail: ukuranDetail,
            sablonDepan: document.getElementById("customSablonDepan").value,
            sablonBelakang: document.getElementById("customSablonBelakang").value,
            posisiDepan: document.getElementById("customPosisiDepan").value.trim(),
            posisiBelakang: document.getElementById("customPosisiBelakang").value.trim(),
            catatan: document.getElementById("customCatatan").value.trim()
        };
    }
    if(!isEdit && sales.some(s=>s.id===id)){ alert("ID sudah ada!"); return; }
    let newSale = { id, customer, type, productName, qty, total, status, customData };
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
    document.getElementById("addVarBtn").addEventListener("click",addVariasiRow);
    document.getElementById("tambahBtn").addEventListener("click",showOrderForm);
    document.getElementById("saveOrderBtn").addEventListener("click",saveOrder);
    document.getElementById("cancelFormBtn").addEventListener("click",cancelForm);
    document.getElementById("searchBtn").addEventListener("click",applySearch);
    document.getElementById("resetBtn").addEventListener("click",resetSearch);
    document.getElementById("orderType").addEventListener("change",toggleOrderFields);
    ["customJenis","customLengan","customSablonDepan","customSablonBelakang"].forEach(id=>{
        document.getElementById(id).addEventListener("change",calculateCustomTotal);
    });
    attachVariasiEvents();
    calculateCustomTotal();
});