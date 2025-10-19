const MENU = [
  { id:'t1', name:'Tacos (3)', description:'Al Pastor tacos with pineapple', price:299, image:'assets/images/taco1.jpg', options:{toppings:['Tomatoes','Onions','Cilantro']} },
  { id:'b1', name:'Burrito', description:'Rice, beans, meat, cheese', price:749, image:'assets/images/burrito.jpg', options:{toppings:['Sour Cream','Cheese']} },
  { id:'q1', name:'Quesadilla', description:'Cheesy quesadilla', price:599, image:'assets/images/quesadilla.jpg', options:{toppings:['Salsa','Guacamole']} },
  { id:'a1', name:'Aguas Frescas', description:'Horchata / Jamaica / Tamarind', price:349, image:'assets/images/aguasfrescas.jpg', options:{choices:['Horchata','Jamaica','Tamarind']} },
  { id:'to1', name:'Torta', description:'Torta Cubana', price:900, image:'assets/images/torta.jpg', options:{} },
  { id:'s1', name:'Seafood Special', description:'Ceviche tostada', price:1200, image:'assets/images/ceviche.jpg', options:{} }
];

const $ = (sel, root=document) => root.querySelector(sel);
const format = cents => '$' + (cents/100).toFixed(2);
let cart = JSON.parse(localStorage.getItem('mc_cart') || '[]');

function renderMenu(){
  const grid = $('#menuGrid');
  grid.innerHTML = '';
  MENU.forEach(it=>{
    const el = document.createElement('div');
    el.className = 'menu-item';
    el.innerHTML = `
      <img class="menu-thumb" src="${it.image}" alt="${it.name}" />
      <div class="menu-detail">
        <h3>${it.name}</h3>
        <div class="muted">${it.description}</div>
        <div class="row"><div class="price">${format(it.price)}</div><div><button class="btn add-btn" data-id="${it.id}">Add to cart</button></div></div>
      </div>`;
    grid.appendChild(el);
  });
  document.querySelectorAll('.add-btn').forEach(b=>b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id;
    const item = MENU.find(x=>x.id===id);
    if(!item) return;
    openModalFor(item);
  }));
}

function updateCartCount(){
  $('#cartCount').textContent = cart.reduce((s,i)=>s+i.qty,0);
  $('#cartTotal').textContent = format(cart.reduce((s,i)=>s+i.price*i.qty,0));
  const items = $('#cartItems');
  items.innerHTML = '';
  cart.forEach((c, idx)=>{
    const row = document.createElement('div');
    row.className = 'cart-line';
    row.innerHTML = `<div>${c.name} x${c.qty}</div><div><button class="btn small remove" data-idx="${idx}">Remove</button></div>`;
    items.appendChild(row);
  });
  document.querySelectorAll('.remove').forEach(b=>b.addEventListener('click', e=>{
    const i = parseInt(e.currentTarget.dataset.idx,10);
    cart.splice(i,1);
    saveCart(); renderMenu(); updateCartCount();
  }));
}

function saveCart(){ localStorage.setItem('mc_cart', JSON.stringify(cart)); }

function openModalFor(item){
  const modal = $('#modal');
  $('#modalBody').innerHTML = `<h3>${item.name}</h3>
    <p class="muted">${item.description}</p>
    <label>Qty <input id="qty" type="number" value="1" min="1" style="width:60px"/></label>
    <div style="margin-top:10px;"><label>Notes</label><br/><textarea id="notes" placeholder="No onions..." style="width:100%;height:70px"></textarea></div>
    <div style="margin-top:10px;"><button id="addCartBtn" class="btn primary">Add to order</button> <button id="cancelBtn" class="btn">Cancel</button></div>`;
  modal.classList.remove('hidden');
  $('#modalClose').onclick = ()=>{ modal.classList.add('hidden'); };
  $('#cancelBtn').onclick = ()=>{ modal.classList.add('hidden'); };
  $('#addCartBtn').onclick = ()=>{
    const qty = Math.max(1, parseInt($('#qty').value||1,10));
    const notes = $('#notes').value || '';
    cart.push({ id:item.id, name:item.name, qty:qty, price:item.price, notes });
    saveCart(); updateCartCount(); modal.classList.add('hidden');
  };
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderMenu(); updateCartCount();
  $('#cartToggle').addEventListener('click', ()=>{
    const panel = $('#cartPanel');
    panel.classList.toggle('open');
  });
  $('#viewMenuBtn').addEventListener('click', ()=>{ document.getElementById('menu').scrollIntoView({behavior:'smooth'}); });
  $('#clearCart').addEventListener('click', ()=>{ cart = []; saveCart(); updateCartCount(); });
  $('#placeOrder').addEventListener('click', ()=>{
    if(cart.length===0){ alert('Cart is empty'); return; }
    const body = `<h3>Order Summary</h3>` + cart.map(c=>`<div>${c.qty} x ${c.name} — ${format(c.qty*c.price)}</div>`).join('') + `<div style="margin-top:10px"><strong>Total: ${format(cart.reduce((s,i)=>s+i.price*i.qty,0))}</strong></div><div style="margin-top:12px"><button id="confirmPay" class="btn primary">Confirm (test)</button> <button id="cancelPay" class="btn">Cancel</button></div>`;
    $('#modalBody').innerHTML = body;
    $('#modal').classList.remove('hidden');
    $('#confirmPay').onclick = ()=>{
      const orderNumber = 'MC-' + Math.floor(Math.random()*900000 + 100000);
      $('#modalBody').innerHTML = `<h3>Thank you!</h3><p>Your order <strong>${orderNumber}</strong> has been received.</p><p>We will prepare it shortly.</p><div style="margin-top:10px"><button id="closeThanks" class="btn primary">Done</button></div>`;
      $('#closeThanks').onclick = ()=>{ $('#modal').classList.add('hidden'); cart=[]; saveCart(); updateCartCount(); $('#cartPanel').classList.remove('open'); };
    };
    $('#cancelPay').onclick = ()=>{ $('#modal').classList.add('hidden'); };
  });
});
