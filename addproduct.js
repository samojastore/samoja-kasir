let products = [], currentPage = 1, itemsPerPage = 10, filteredProducts = [];
const defaultProducts = [
    { id: 1, name: "Eren Yeager", price: 89000 },
    { id: 2, name: "RX-78-02 Gundam", price: 89000 },
    { id: 3, name: "Jiraiya", price: 89000 }
];
function loadProducts(){
    let stored = localStorage.getItem("samoja_products");
    if(stored && stored!=="undefined"){ products = JSON.parse(stored); }
    else { products = defaultProducts; saveProducts(); }
    applySearch();
}
function saveProducts(){ localStorage.setItem("samoja_products", JSON.stringify(products)); }
function renderProducts(data){
    let tbody = document.getElementById("productsList");
    tbody.innerHTML="";
    let start = (currentPage-1)*itemsPerPage, end = start+itemsPerPage;
    let pageData = data.slice(start,end);
    pageData.forEach(p=>{
        let row = tbody.insertRow();
        row.insertCell(0).innerText = p.id;
        row.insertCell(1).innerText = p.name;
        row.insertCell(2).innerText = "Rp "+p.price.toLocaleString();
        let aksi = row.insertCell(3);
        aksi.style.textAlign="center";
        let editBtn = document.createElement("button");
        editBtn.innerHTML='<i class="fas fa-edit"></i>';
        editBtn.className="aksi-icon edit";
        editBtn.onclick=()=>editProduct(p.id);
        aksi.appendChild(editBtn);
        let delBtn = document.createElement("button");
        delBtn.innerHTML='<i class="fas fa-trash-alt"></i>';
        delBtn.className="aksi-icon delete";
        delBtn.onclick=()=>{ if(confirm(`Hapus ${p.name}?`)){ products=products.filter(x=>x.id!==p.id); saveProducts(); applySearch(); } };
        aksi.appendChild(delBtn);
    });
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
        btn.onclick=()=>{ currentPage=i; renderProducts(filteredProducts); };
        div.appendChild(btn);
    }
}
function showProductForm(){
    document.getElementById("productForm").style.display="block";
    document.getElementById("formTitle").innerText="Tambah Produk";
    document.getElementById("editId").value="";
    document.getElementById("productName").value="";
    document.getElementById("productPrice").value="";
}
function cancelProductForm(){ document.getElementById("productForm").style.display="none"; }
function editProduct(id){
    let prod = products.find(p=>p.id===id);
    if(!prod) return;
    document.getElementById("formTitle").innerText="Edit Produk";
    document.getElementById("editId").value=prod.id;
    document.getElementById("productName").value=prod.name;
    document.getElementById("productPrice").value=prod.price;
    document.getElementById("productForm").style.display="block";
}
function saveProduct(){
    let id = document.getElementById("editId").value;
    let name = document.getElementById("productName").value.trim();
    let price = parseInt(document.getElementById("productPrice").value);
    if(!name || isNaN(price) || price<=0){ alert("Nama dan harga harus diisi dengan benar"); return; }
    if(id){
        let idx = products.findIndex(p=>p.id==id);
        if(idx!==-1){ products[idx] = { id: parseInt(id), name, price }; }
    } else {
        let newId = Date.now();
        products.push({ id: newId, name, price });
    }
    saveProducts();
    applySearch();
    cancelProductForm();
}
function applySearch(){
    let kw = document.getElementById("searchInput").value.toLowerCase();
    filteredProducts = products.filter(p=>p.name.toLowerCase().includes(kw));
    currentPage=1;
    renderProducts(filteredProducts);
}
function resetSearch(){
    document.getElementById("searchInput").value="";
    applySearch();
}
document.addEventListener("DOMContentLoaded",()=>{
    loadProducts();
    document.getElementById("tambahBtn").addEventListener("click",showProductForm);
    document.getElementById("saveProductBtn").addEventListener("click",saveProduct);
    document.getElementById("cancelFormBtn").addEventListener("click",cancelProductForm);
    document.getElementById("searchBtn").addEventListener("click",applySearch);
    document.getElementById("resetBtn").addEventListener("click",resetSearch);
});