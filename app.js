// Orshoes APP JS Core Logic

document.addEventListener('DOMContentLoaded', () => {
    
    // STATE DATABASE
    const state = {
        currentUser: null,
        activeInput: 'login-id', // 'login-id' or 'login-pwd'
        cart: [],
        orders: [
            {
                id: 'ORD-2026063001',
                time: '2026-06-30 09:15',
                phone: '0912-345-678',
                items: [{ title: '經典手工牛皮鞋', code: '#SH-2024001', size: '25.5', qty: 1, price: 3200 }],
                total: 3360,
                status: 'completed'
            },
            {
                id: 'ORD-2026062908',
                time: '2026-06-29 16:40',
                phone: '0988-777-666',
                items: [{ title: '經典手工牛皮鞋', code: '#SH-2024001', size: '26.0', qty: 2, price: 3200 }],
                total: 6720,
                status: 'completed'
            }
        ],
        stores: [
            { name: '信義店', address: '110台北市信義區松壽路20號', distance: 12.8, stock: 5 },
            { name: '忠孝店', address: '106台北市大安區忠孝東路四段45號', distance: 8.5, stock: 8 },
            { name: '中山店', address: '104台北市中山區南京西路12號', distance: 14.2, stock: 0 },
            { name: '板橋店', address: '220新北市板橋區新府路66號', distance: 18.5, stock: 12 }
        ],
        selectedSize: '25.0',
        activeScreen: 'screen-login',
        scanTimeout: null,
        flashlightOn: false
    };

    // DOM ELEMENTS
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');
    const bottomNav = document.getElementById('app-bottom-nav');
    const statusTime = document.getElementById('status-time');
    
    // Login Elements
    const loginIdInput = document.getElementById('login-id');
    const loginPwdInput = document.getElementById('login-pwd');
    const inputGroupId = document.getElementById('input-group-id');
    const inputGroupPwd = document.getElementById('input-group-pwd');
    const keypadButtons = document.querySelectorAll('.key-btn');
    const btnLoginSubmit = document.getElementById('btn-login-submit');
    const togglePwdBtn = document.getElementById('toggle-pwd-btn');
    
    // Navigation / Header Actions
    const btnScanInvBack = document.getElementById('btn-scan-inv-back');
    const btnInvResultBack = document.getElementById('btn-inv-result-back');
    const btnOtherStoreBack = document.getElementById('btn-other-store-back');
    const btnOrderScanBack = document.getElementById('btn-order-scan-back');
    const btnCheckoutBack = document.getElementById('btn-checkout-back');
    const btnHistoryBack = document.getElementById('btn-history-back');
    const btnUserInfoBack = document.getElementById('btn-user-info-back');
    const homeAvatar = document.getElementById('home-avatar');

    // New Search List Navigation Back & Triggers
    const btnInvQueryBack = document.getElementById('btn-inv-query-back');
    const btnOrderInputBack = document.getElementById('btn-order-input-back');
    const btnInvScanTrigger = document.getElementById('btn-inv-scan-trigger');
    const btnOrderScanTrigger = document.getElementById('btn-order-scan-trigger');
    const btnListCheckoutNext = document.getElementById('btn-list-checkout-next');
    
    // Home Dashboard Buttons
    const homeBtnScanInv = document.getElementById('home-btn-scan-inv');
    const homeBtnCreateOrder = document.getElementById('home-btn-create-order');
    const homeBtnQueryOrder = document.getElementById('home-btn-query-order');
    
    // Inventory Result Elements
    const sizeButtons = document.querySelectorAll('.size-btn');
    const btnAddToOrderNow = document.getElementById('btn-add-to-order-now');
    const btnQueryOtherStores = document.getElementById('btn-query-other-stores');
    
    // Other Store Elements
    const storeDistanceFilter = document.getElementById('store-distance-filter');
    const storeStockListContainer = document.getElementById('store-stock-list-container');
    
    // Scan & Order Cart Elements
    const scanCartPreviewBar = document.getElementById('scan-cart-preview-bar');
    const btnGoToCheckout = document.getElementById('btn-go-to-checkout');
    const checkoutCartItems = document.getElementById('checkout-cart-items');
    const btnClearCart = document.getElementById('btn-clear-cart');
    const btnSubmitOrder = document.getElementById('btn-submit-order');
    
    // Pricing Summary Elements
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutTax = document.getElementById('checkout-tax');
    const checkoutTotal = document.getElementById('checkout-total');
    
    // Order Success Overlay
    const checkoutSuccessOverlay = document.getElementById('checkout-success-overlay');
    const successOrderIdLabel = document.getElementById('success-order-id-label');
    const btnSuccessOk = document.getElementById('btn-success-ok');
    
    // Order History Elements
    const orderHistoryContainer = document.getElementById('order-history-container');
    const filterDateInput = document.getElementById('filter-date');
    const filterNameInput = document.getElementById('filter-name');
    const filterCodeInput = document.getElementById('filter-code');
    const btnClearFilters = document.getElementById('btn-clear-filters');
    
    // User Settings Elements
    const btnLogout = document.getElementById('btn-logout');

    // Flashlight Toggles
    const btnFlashlightInv = document.getElementById('btn-flashlight-inv');
    const btnFlashlightOrder = document.getElementById('btn-flashlight-order');

    // INITIALIZATION
    function init() {
        updateClock();
        setInterval(updateClock, 1000);
        setupNavigation();
        setupKeypad();
        setupLogin();
        setupInventoryFlow();
        setupCheckoutFlow();
        setupOrderHistory();
        setupUserSettings();
        
        // Hide bottom nav initially for Login Screen
        bottomNav.style.display = 'none';

        // Programmatically hide simulated status bar and notch on actual mobile devices (safeguard)
        const isMobile = window.innerWidth <= 500 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            const notch = document.querySelector('.phone-camera-notch');
            const statusBar = document.querySelector('.status-bar');
            if (notch) notch.style.setProperty('display', 'none', 'important');
            if (statusBar) statusBar.style.setProperty('display', 'none', 'important');
            
            // Adjust top padding of app container for native status bar / safe area
            const appContainer = document.getElementById('app');
            if (appContainer) {
                appContainer.style.setProperty('padding-top', 'env(safe-area-inset-top, 20px)', 'important');
            }
            
            // Adjust screens to align below native status bar
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => {
                screen.style.setProperty('top', 'env(safe-area-inset-top, 20px)', 'important');
            });
        }

        // Register PWA Service Worker for offline and desktop app support
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(reg => {
                        console.log('Service Worker registered successfully!', reg.scope);
                        // Detect updates to service worker assets
                        reg.onupdatefound = () => {
                            const installingWorker = reg.installing;
                            installingWorker.onstatechange = () => {
                                if (installingWorker.state === 'installed') {
                                    if (navigator.serviceWorker.controller) {
                                        console.log('New content detected, reloading to apply updates...');
                                        window.location.reload();
                                    }
                                }
                            };
                        };
                    })
                    .catch(err => console.log('Service Worker registration failed:', err));
            });
        }
    }

    // CLOCK UPDATE
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        statusTime.textContent = `${hours}:${minutes}`;
    }

    // ROUTING / NAVIGATION
    function navigateTo(screenId) {
        // Clear any ongoing scan timers
        if (state.scanTimeout) {
            clearTimeout(state.scanTimeout);
            state.scanTimeout = null;
        }

        // Deactivate all screens
        screens.forEach(s => s.classList.remove('active'));
        
        // Activate target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            state.activeScreen = screenId;
        }

        // Adjust Bottom Nav visibility
        if (screenId === 'screen-login') {
            bottomNav.style.display = 'none';
        } else {
            bottomNav.style.display = 'flex';
            // Sync bottom nav active icon
            updateBottomNavActive(screenId);
        }

        // TRIGGER SPECIFIC SCREEN BEHAVIORS
        if (screenId === 'screen-inventory-scan') {
            startInventoryScanSimulation();
        } else if (screenId === 'screen-order-scan') {
            startOrderScanSimulation();
        } else if (screenId === 'screen-other-store') {
            renderStoreList();
        } else if (screenId === 'screen-order-checkout') {
            renderCartItems();
        } else if (screenId === 'screen-order-history') {
            renderOrderHistory();
        }
    }

    function updateBottomNavActive(screenId) {
        navItems.forEach(item => {
            const target = item.getAttribute('data-target');
            // Group sub-screens to highlight the parent nav icon
            let isMatched = false;
            if (target === 'screen-home' && screenId === 'screen-home') {
                isMatched = true;
            } else if (target === 'screen-inventory-scan' && (screenId === 'screen-inventory-scan' || screenId === 'screen-inventory-result' || screenId === 'screen-other-store')) {
                isMatched = true;
            } else if (target === 'screen-order-scan' && (screenId === 'screen-order-scan' || screenId === 'screen-order-checkout')) {
                isMatched = true;
            } else if (target === 'screen-order-history' && screenId === 'screen-order-history') {
                isMatched = true;
            } else if (target === 'screen-user-info' && screenId === 'screen-user-info') {
                isMatched = true;
            }
            
            if (isMatched) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.getAttribute('data-target');
                navigateTo(target);
            });
        });

        // Home Actions Shortcuts
        homeBtnScanInv.addEventListener('click', () => navigateTo('screen-inventory-query'));
        homeBtnCreateOrder.addEventListener('click', () => navigateTo('screen-order-input'));
        homeBtnQueryOrder.addEventListener('click', () => navigateTo('screen-order-history'));
        homeAvatar.addEventListener('click', () => navigateTo('screen-user-info'));
 
        // Back Buttons
        btnInvQueryBack.addEventListener('click', () => navigateTo('screen-home'));
        btnOrderInputBack.addEventListener('click', () => navigateTo('screen-home'));
        btnScanInvBack.addEventListener('click', () => navigateTo('screen-inventory-query'));
        btnInvResultBack.addEventListener('click', () => navigateTo('screen-inventory-query'));
        btnOtherStoreBack.addEventListener('click', () => navigateTo('screen-inventory-result'));
        btnOrderScanBack.addEventListener('click', () => navigateTo('screen-order-input'));
        btnCheckoutBack.addEventListener('click', () => navigateTo('screen-order-input'));
        btnHistoryBack.addEventListener('click', () => navigateTo('screen-home'));
        btnUserInfoBack.addEventListener('click', () => navigateTo('screen-home'));

        // Toggle triggers inside search lists to slide into camera scanner
        btnInvScanTrigger.addEventListener('click', () => navigateTo('screen-inventory-scan'));
        btnOrderScanTrigger.addEventListener('click', () => navigateTo('screen-order-scan'));

        // Checkout next step button in list
        btnListCheckoutNext.addEventListener('click', () => navigateTo('screen-checkout'));
    }

    // KEYPAD INPUT SYSTEM
    function setupKeypad() {
        // Toggle input fields focus on tap
        inputGroupId.addEventListener('click', (e) => {
            e.stopPropagation();
            state.activeInput = 'login-id';
            inputGroupId.classList.add('focused');
            inputGroupPwd.classList.remove('focused');
            openKeypad();
        });

        inputGroupPwd.addEventListener('click', (e) => {
            e.stopPropagation();
            state.activeInput = 'login-pwd';
            inputGroupPwd.classList.add('focused');
            inputGroupId.classList.remove('focused');
            openKeypad();
        });

        // Keypad button listeners
        keypadButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing keypad
                const val = btn.getAttribute('data-val');
                const targetInput = state.activeInput === 'login-id' ? loginIdInput : loginPwdInput;
                
                if (val === 'clear') {
                    targetInput.value = '';
                } else if (val === 'backspace') {
                    targetInput.value = targetInput.value.slice(0, -1);
                } else {
                    targetInput.value += val;
                }
            });
        });

        // Toggle Password Visibility
        togglePwdBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent keyboard slide trigger
            if (loginPwdInput.type === 'password') {
                loginPwdInput.type = 'text';
                togglePwdBtn.classList.remove('fa-eye-slash');
                togglePwdBtn.classList.add('fa-eye');
            } else {
                loginPwdInput.type = 'password';
                togglePwdBtn.classList.remove('fa-eye');
                togglePwdBtn.classList.add('fa-eye-slash');
            }
        });

        // Close keypad when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.input-group') && !e.target.closest('.custom-keypad')) {
                closeKeypad();
            }
        });
    }

    function openKeypad() {
        const keypad = document.querySelector('.custom-keypad');
        if (keypad) {
            keypad.classList.add('active');
        }
    }

    function closeKeypad() {
        const keypad = document.querySelector('.custom-keypad');
        if (keypad) {
            keypad.classList.remove('active');
        }
        inputGroupId.classList.remove('focused');
        inputGroupPwd.classList.remove('focused');
    }

    // LOGIN PROCESS
    function setupLogin() {
        btnLoginSubmit.addEventListener('click', () => {
            const idVal = loginIdInput.value.trim();
            const pwdVal = loginPwdInput.value.trim();

            if (idVal === '') {
                alert('請輸入員工編號');
                return;
            }

            // Simulate login success (allows any ID/pwd for demo purposes, mock user '王大明')
            state.currentUser = {
                id: idVal,
                name: '王大明',
                role: '信義旗艦店 - 資深銷售顧問'
            };

            closeKeypad();

            // Switch to home screen
            navigateTo('screen-home');
        });
    }

    // INVENTORY FLOW (SCAN & RESULT)
    function startInventoryScanSimulation() {
        const simulationText = document.querySelector('#screen-inventory-scan .scan-simulation-tip');
        simulationText.textContent = "自動對焦中...";
        
        state.scanTimeout = setTimeout(() => {
            simulationText.textContent = "條碼讀取成功，載入中...";
            setTimeout(() => {
                navigateTo('screen-inventory-result');
            }, 500);
        }, 2000);
    }

    function setupInventoryFlow() {
        // Size Selector
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('out-of-stock')) return;
                
                sizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.selectedSize = btn.getAttribute('data-size');
            });
        });

        // Add to Order button redirects to Checkout
        btnAddToOrderNow.addEventListener('click', () => {
            // Add selected item to cart
            addItemToCart('經典手工牛皮鞋', state.selectedSize, 3200);
            navigateTo('screen-order-checkout');
        });

        // Query Other Stores button redirects to Store list
        btnQueryOtherStores.addEventListener('click', () => {
            navigateTo('screen-other-store');
        });

        // Distance Filter for stores
        storeDistanceFilter.addEventListener('change', () => {
            renderStoreList();
        });

        // Flashlight simulation
        btnFlashlightInv.addEventListener('click', () => toggleFlashlight(btnFlashlightInv));
        btnFlashlightOrder.addEventListener('click', () => toggleFlashlight(btnFlashlightOrder));

        // Inventory Query List Filter Logic
        const invSearchField = document.getElementById('inv-search-field');
        const btnInvSearchSubmit = document.getElementById('btn-inv-search-submit');
        const filterInvQueryList = () => {
            const query = invSearchField.value.trim().toLowerCase();
            const items = document.querySelectorAll('#inv-query-list-container .product-query-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        };
        if (invSearchField) {
            invSearchField.addEventListener('input', filterInvQueryList);
        }
        if (btnInvSearchSubmit) {
            btnInvSearchSubmit.addEventListener('click', filterInvQueryList);
        }

        // Inventory Query List Clicks
        const queryItems = document.querySelectorAll('#inv-query-list-container .product-query-item');
        queryItems.forEach(item => {
            item.addEventListener('click', () => {
                const dataId = item.getAttribute('data-id');
                if (dataId === 'SH-2024001') {
                    // Navigate to details screen
                    navigateTo('screen-inventory-result');
                } else {
                    alert('該商品目前無可用庫存（可用總庫存量為 0 雙）');
                }
            });
        });
    }

    function toggleFlashlight(buttonElement) {
        state.flashlightOn = !state.flashlightOn;
        if (state.flashlightOn) {
            buttonElement.classList.add('active');
            buttonElement.style.background = 'rgba(245, 158, 11, 0.2)';
            buttonElement.style.color = '#F59E0B';
            buttonElement.innerHTML = '<i class="fa-solid fa-bolt-slash"></i> 關閉';
        } else {
            buttonElement.classList.remove('active');
            buttonElement.style.background = '';
            buttonElement.style.color = '';
            buttonElement.innerHTML = '<i class="fa-solid fa-bolt"></i> 閃光燈';
        }
    }

    function renderStoreList() {
        const filterVal = storeDistanceFilter.value;
        storeStockListContainer.innerHTML = '';
        
        let filteredStores = state.stores;
        if (filterVal !== 'all') {
            const limit = parseFloat(filterVal);
            filteredStores = state.stores.filter(s => s.distance <= limit);
        }

        if (filteredStores.length === 0) {
            storeStockListContainer.innerHTML = '<div class="text-center text-muted" style="padding: 40px 0;">無符合篩選條件的門市</div>';
            return;
        }

        filteredStores.forEach(store => {
            const card = document.createElement('div');
            card.className = 'store-card';
            
            let stockColor = 'green';
            if (store.stock === 0) stockColor = 'red';
            else if (store.stock <= 5) stockColor = 'orange';

            card.innerHTML = `
                <div class="store-info">
                    <h4>${store.name}</h4>
                    <p>${store.address}</p>
                    <p class="text-muted"><i class="fa-solid fa-location-dot"></i> 距離 ${store.distance} km</p>
                </div>
                <div class="store-stock-badge">
                    <span class="stock-count-bubble ${stockColor}">
                        ${store.stock > 0 ? `${store.stock} 雙` : '缺貨'}
                    </span>
                    <span style="font-size: 10px; color: var(--text-muted);">庫存量</span>
                </div>
            `;
            storeStockListContainer.appendChild(card);
        });
    }

    // ORDER CHECKOUT & CART SYSTEM
    function startOrderScanSimulation() {
        const simulationText = document.querySelector('#screen-order-scan .scan-simulation-tip');
        simulationText.textContent = "尋找條碼中...";
        updateScanCartPreview();

        state.scanTimeout = setTimeout(() => {
            simulationText.textContent = "條碼讀取成功！已加入購物車。";
            
            // Add a default item size 25.5
            addItemToCart('經典手工牛皮鞋', '25.5', 3200);
            updateScanCartPreview();
            
            // Show toast feedback
            setTimeout(() => {
                simulationText.textContent = "等待下一個商品...";
            }, 1000);
        }, 2000);
    }

    function addItemToCart(title, size, price) {
        // Check if item already exists in cart with same size
        const existing = state.cart.find(item => item.title === title && item.size === size);
        if (existing) {
            existing.qty += 1;
        } else {
            state.cart.push({
                title,
                code: '#SH-2024001',
                size,
                price,
                qty: 1
            });
        }
    }

    function updateScanCartPreview() {
        const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
        const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        const countText = document.querySelector('.cart-preview-count');
        const totalText = document.querySelector('.cart-preview-total');
        
        if (countText) countText.textContent = `已加入 ${totalItems} 項商品`;
        if (totalText) totalText.textContent = `估計總額: NT$ ${subtotal.toLocaleString()}`;

        if (totalItems > 0) {
            if (scanCartPreviewBar) scanCartPreviewBar.classList.add('active');
        } else {
            if (scanCartPreviewBar) scanCartPreviewBar.classList.remove('active');
        }

        // Also update the list preview bar
        const listCartCount = document.getElementById('list-cart-count');
        const listCartTotal = document.getElementById('list-cart-total');
        const listCartPreviewBar = document.getElementById('list-cart-preview-bar');
        if (listCartCount) listCartCount.textContent = totalItems;
        if (listCartTotal) listCartTotal.textContent = `NT$ ${subtotal.toLocaleString()}`;
        if (listCartPreviewBar) {
            if (totalItems > 0) {
                listCartPreviewBar.style.display = 'flex';
            } else {
                listCartPreviewBar.style.display = 'none';
            }
        }
    }

    function setupCheckoutFlow() {
        btnGoToCheckout.addEventListener('click', () => {
            navigateTo('screen-order-checkout');
        });

        btnClearCart.addEventListener('click', () => {
            if (confirm('確定要清空購物車嗎？')) {
                state.cart = [];
                renderCartItems();
                updateScanCartPreview();
            }
        });

        // Order Input List Filter Logic
        const orderSearchField = document.getElementById('order-search-field');
        const btnOrderSearchSubmit = document.getElementById('btn-order-search-submit');
        const filterOrderInputList = () => {
            const query = orderSearchField.value.trim().toLowerCase();
            const items = document.querySelectorAll('#order-query-list-container .product-order-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        };
        if (orderSearchField) {
            orderSearchField.addEventListener('input', filterOrderInputList);
        }
        if (btnOrderSearchSubmit) {
            btnOrderSearchSubmit.addEventListener('click', filterOrderInputList);
        }

        // Order Input List Clicks
        const orderItems = document.querySelectorAll('#order-query-list-container .product-order-item');
        orderItems.forEach(item => {
            item.addEventListener('click', () => {
                const dataId = item.getAttribute('data-id');
                if (dataId === 'SH-2024001') {
                    if (confirm('確定要將「經典手工牛皮鞋 (尺寸: 25.5)」加入訂單嗎？')) {
                        addItemToCart('經典手工牛皮鞋', '25.5', 3200);
                        updateScanCartPreview();
                        alert('已成功將商品加入訂單！');
                    }
                } else {
                    alert('該商品目前無可用庫存，無法選取加入訂單。');
                }
            });
        });

        // Submit Order
        btnSubmitOrder.addEventListener('click', () => {
            if (state.cart.length === 0) {
                alert('您的購物車是空的，請先掃描商品加入。');
                return;
            }

            const phoneVal = document.getElementById('cust-phone').value.trim();
            const orderId = 'ORD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(state.orders.length + 1).padStart(2, '0');
            const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const tax = Math.round(subtotal * 0.05);
            const total = subtotal + tax;

            // Save order in history
            const newOrder = {
                id: orderId,
                time: new Date().toLocaleString(),
                phone: phoneVal || '無會員電話',
                items: [...state.cart],
                total: total,
                status: 'completed'
            };
            state.orders.unshift(newOrder); // Add to beginning of history list

            // Display success modal
            successOrderIdLabel.textContent = `訂單編號：#${orderId}`;
            checkoutSuccessOverlay.classList.add('active');
        });

        // OK button on Success modal goes back Home
        btnSuccessOk.addEventListener('click', () => {
            checkoutSuccessOverlay.classList.remove('active');
            state.cart = []; // clear cart
            updateScanCartPreview();
            navigateTo('screen-home');
        });
    }

    function renderCartItems() {
        checkoutCartItems.innerHTML = '';
        const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        if (state.cart.length === 0) {
            checkoutCartItems.innerHTML = '<div class="text-center text-muted" style="padding: 40px 0;">購物車內目前沒有商品</div>';
            checkoutSubtotal.textContent = 'NT$ 0';
            checkoutTax.textContent = 'NT$ 0';
            checkoutTotal.textContent = 'NT$ 0';
            return;
        }

        state.cart.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `
                <div class="cart-item-img">
                    <img src="classic_leather_shoes.jpg" alt="Shoe">
                </div>
                <div class="cart-item-detail">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-meta">尺寸: ${item.size} | 單價: NT$ ${item.price.toLocaleString()}</div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn dec-qty" data-idx="${index}"><i class="fa-solid fa-minus"></i></button>
                    <span class="qty-val">${item.qty}</span>
                    <button class="qty-btn inc-qty" data-idx="${index}"><i class="fa-solid fa-plus"></i></button>
                </div>
                <div class="cart-item-price">NT$ ${(item.price * item.qty).toLocaleString()}</div>
            `;
            checkoutCartItems.appendChild(row);
        });

        // Attach event listeners to +/- quantity buttons
        document.querySelectorAll('.dec-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                if (state.cart[idx].qty > 1) {
                    state.cart[idx].qty -= 1;
                } else {
                    state.cart.splice(idx, 1);
                }
                renderCartItems();
            });
        });

        document.querySelectorAll('.inc-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                state.cart[idx].qty += 1;
                renderCartItems();
            });
        });

        // Update pricing summary
        const tax = Math.round(subtotal * 0.05);
        const total = subtotal + tax;
        
        checkoutSubtotal.textContent = `NT$ ${subtotal.toLocaleString()}`;
        checkoutTax.textContent = `NT$ ${tax.toLocaleString()}`;
        checkoutTotal.textContent = `NT$ ${total.toLocaleString()}`;
    }

    // ORDER HISTORY SCREEN
    function setupOrderHistory() {
        filterDateInput.addEventListener('change', renderOrderHistory);
        filterNameInput.addEventListener('input', renderOrderHistory);
        filterCodeInput.addEventListener('input', renderOrderHistory);
        
        btnClearFilters.addEventListener('click', () => {
            filterDateInput.value = '';
            filterNameInput.value = '';
            filterCodeInput.value = '';
            renderOrderHistory();
        });
    }
 
    function renderOrderHistory() {
        const dateVal = filterDateInput.value; // YYYY-MM-DD
        const nameQuery = filterNameInput.value.trim().toLowerCase();
        const codeQuery = filterCodeInput.value.trim().toLowerCase();
        
        orderHistoryContainer.innerHTML = '';
 
        let filtered = state.orders;
        
        // Multi-criteria filter: AND condition
        if (dateVal !== '') {
            filtered = filtered.filter(ord => ord.time.startsWith(dateVal));
        }
        if (nameQuery !== '') {
            filtered = filtered.filter(ord => 
                ord.items.some(item => item.title.toLowerCase().includes(nameQuery))
            );
        }
        if (codeQuery !== '') {
            filtered = filtered.filter(ord => 
                ord.items.some(item => item.code && item.code.toLowerCase().includes(codeQuery))
            );
        }

        if (filtered.length === 0) {
            orderHistoryContainer.innerHTML = '<div class="text-center text-muted" style="padding: 40px 0;">找不到相符的歷史訂單</div>';
            return;
        }

        filtered.forEach(ord => {
            const card = document.createElement('div');
            card.className = 'order-card';
            
            // Build items detail string
            const itemsSummary = ord.items.map(item => `${item.title} (${item.size}) x ${item.qty}`).join(', ');
            
            card.innerHTML = `
                <div class="order-card-header">
                    <span class="order-id">#${ord.id}</span>
                    <span class="order-status completed">已完成</span>
                </div>
                <div class="order-card-body">
                    <div class="order-details">
                        <p><i class="fa-regular fa-clock"></i> 時間: ${ord.time}</p>
                        <p><i class="fa-regular fa-user"></i> 會員電話: ${ord.phone}</p>
                        <p class="text-muted"><i class="fa-solid fa-box-open"></i> ${itemsSummary}</p>
                    </div>
                    <div class="order-price">NT$ ${ord.total.toLocaleString()}</div>
                </div>
            `;
            orderHistoryContainer.appendChild(card);
        });
    }

    // USER SETTINGS & LOGOUT
    function setupUserSettings() {
        btnLogout.addEventListener('click', () => {
            if (confirm('確定要登出系統嗎？')) {
                // Clear session and return to login
                state.currentUser = null;
                loginIdInput.value = '';
                loginPwdInput.value = '';
                state.cart = [];
                updateScanCartPreview();
                navigateTo('screen-login');
            }
        });
    }

    // START THE APP
    init();
});
