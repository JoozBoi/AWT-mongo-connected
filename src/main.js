// OLX India Classifieds Marketplace - Full-Stack Application Engine

// REGULAR EXPRESSION PATTERNS FOR FORM VALIDATION
const REGEX_PATTERNS = {
  // Standard email format: user@domain.extension
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Indian phone number: optional +91 prefix, followed by 10 digits starting with 6,7,8, or 9
  phone: /^(?:\+91[\-\s]?)?[6-9]\d{9}$/,
  
  // Strong password: min 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Full name: 3 to 50 characters, only letters, spaces, and dots
  name: /^[a-zA-Z\s.]{3,50}$/,
  
  // Ad Title: 5 to 80 characters
  title: /^[a-zA-Z0-9\s,.()\-']{5,80}$/,
  
  // Price: positive integer up to 9 digits
  price: /^[1-9]\d{0,8}$/,
  
  // Valid URL format
  url: /^https?:\/\/.+$/
};

// Initial Categories for Marketplace Taxonomy
const INITIAL_CATEGORIES = [
  { id: 'cat-all', name: 'All Categories', slug: 'all', iconName: 'Grid' },
  { id: 'cat-cars', name: 'Cars', slug: 'cars', iconName: 'Car' },
  { id: 'cat-properties', name: 'Properties', slug: 'properties', iconName: 'Home' },
  { id: 'cat-mobiles', name: 'Mobiles', slug: 'mobiles', iconName: 'Smartphone' },
  { id: 'cat-bikes', name: 'Bikes', slug: 'bikes', iconName: 'Bike' },
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', iconName: 'Tv' },
  { id: 'cat-commercial', name: 'Commercial Vehicles', slug: 'commercial', iconName: 'Truck' },
  { id: 'cat-jobs', name: 'Jobs', slug: 'jobs', iconName: 'Briefcase' },
  { id: 'cat-services', name: 'Services', slug: 'services', iconName: 'Wrench' }
];

// App State: No dummy items! Starts empty until ads are posted and stored in MongoDB.
let state = {
  listings: [],
  favorites: new Set(),
  selectedCategory: 'all',
  searchQuery: '',
  selectedCity: 'All India',
  minPrice: '',
  maxPrice: '',
  sortBy: 'featured',
  activeDetailAd: null,
  activeTab: 'home',
  activeAuthTab: 'user', // 'user' | 'admin' | 'register'
  currentUser: {
    id: 'user-curr',
    name: 'Rahul Varma',
    email: 'rahul.varma@gmail.com',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    isAdmin: false,
    role: 'user',
    isLoggedIn: true
  },
  conversations: [],
  activeConvId: null
};

// Helper Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `px-5 py-3 rounded-lg shadow-xl text-white text-sm font-medium flex items-center gap-3 animate-fade-in ${
    type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-[#002f34]'
  }`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Validation Helper using Regular Expressions
function validateInput(value, regexKey) {
  if (!REGEX_PATTERNS[regexKey]) return true;
  return REGEX_PATTERNS[regexKey].test(value.trim());
}

// Fetch live listings stored in MongoDB
async function loadListingsFromDatabase() {
  try {
    const res = await fetch('/api/listings');
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.listings || []);
      state.listings = items.map(item => ({
        id: item._id || item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        categorySlug: item.categorySlug,
        subcategory: item.subcategory,
        condition: item.condition || 'Used',
        brand: item.brand || '',
        images: item.images && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'],
        location: item.location || { city: 'Mumbai', state: 'Maharashtra', locality: 'Bandra' },
        seller: item.seller || { name: 'Seller', phone: '+91 98765 43210' },
        featured: !!item.featured,
        viewsCount: item.viewsCount || 1,
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'JUST NOW'
      }));
    }
  } catch (err) {
    console.warn('Could not fetch listings from backend:', err.message);
  } finally {
    renderListings();
  }
}

// Role-Based UI Synchronizer
function updateRoleBasedUI() {
  renderUserHeader();
  renderListings();
}

// Header User Profile / Login Button Renderer
function renderUserHeader() {
  const container = document.getElementById('userAuthContainer');
  if (!container) return;

  const isAdmin = state.currentUser?.isLoggedIn && (state.currentUser.role === 'admin' || state.currentUser.isAdmin);

  if (state.currentUser && state.currentUser.isLoggedIn) {
    container.innerHTML = `
      <div class="relative group cursor-pointer">
        <div class="flex items-center gap-2 hover:opacity-85 border ${isAdmin ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-300/40' : 'border-gray-300 bg-white'} rounded-full px-2.5 py-1 shadow-2xs transition-all">
          <img src="${state.currentUser.avatar}" alt="${state.currentUser.name}" class="w-7 h-7 rounded-full object-cover border-2 ${isAdmin ? 'border-amber-500' : 'border-teal-500'}" />
          <div class="hidden xl:flex items-center gap-1.5">
            <span class="text-xs font-bold text-[#002f34] max-w-[85px] truncate">${state.currentUser.name}</span>
            ${isAdmin ? `<span class="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">ADMIN</span>` : ''}
          </div>
          <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-gray-500"></i>
        </div>

        <!-- Dropdown Menu -->
        <div class="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 hidden group-hover:block z-50 animate-fade-in text-xs">
          <div class="px-4 py-2 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <p class="font-bold text-[#002f34] truncate">${state.currentUser.name}</p>
              ${isAdmin ? `<span class="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">Admin</span>` : `<span class="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">User</span>`}
            </div>
            <p class="text-[10px] text-gray-400 truncate mt-0.5">${state.currentUser.email}</p>
          </div>

          <button onclick="openSellModal()" class="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-4 h-4 text-teal-600"></i> Post an Ad (SELL)
          </button>
          <button onclick="openChatModal()" class="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <i data-lucide="message-square" class="w-4 h-4 text-teal-600"></i> Chat Inbox
          </button>

          ${isAdmin ? `
            <button onclick="openAuthModal('user')" class="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100">
              <i data-lucide="user" class="w-4 h-4 text-gray-500"></i> Switch to User Login
            </button>
          ` : `
            <button onclick="openAuthModal('admin')" class="w-full text-left px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 border-t border-gray-100">
              <i data-lucide="shield" class="w-4 h-4 text-amber-600"></i> Switch to Admin Login
            </button>
          `}

          <button onclick="handleLogout()" class="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-gray-100 mt-1">
            <i data-lucide="log-out" class="w-4 h-4"></i> Log Out
          </button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="flex items-center gap-2">
        <button onclick="openAuthModal('user')" class="font-bold text-xs sm:text-sm text-[#002f34] hover:text-teal-700 border-2 border-[#002f34] px-2.5 sm:px-3 py-1 rounded-md transition-all">
          Login
        </button>
        <button onclick="openAuthModal('admin')" class="font-bold text-xs text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-1 rounded-md flex items-center gap-1 transition-all" title="System Administrator Portal">
          <i data-lucide="shield" class="w-3.5 h-3.5 text-amber-600"></i>
          <span class="hidden sm:inline">Admin</span>
        </button>
      </div>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

// Authentication Modal Functions
function openAuthModal(mode = 'user') {
  state.activeAuthTab = mode;
  switchAuthTab(mode);
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
  resetAuthFormErrors();
}

function switchAuthTab(tab = 'user') {
  state.activeAuthTab = tab;
  const tabUser = document.getElementById('tabUser');
  const tabAdmin = document.getElementById('tabAdmin');
  const tabRegister = document.getElementById('tabRegister');
  const nameGroup = document.getElementById('authNameGroup');
  const submitBtn = document.getElementById('authSubmitBtn');
  const authTitle = document.getElementById('authModalTitle');
  const roleBannerText = document.getElementById('authRoleBannerText');
  const demoBtnText = document.getElementById('btnFillDemoText');
  const demoHelper = document.getElementById('demoAccountHelper');

  const defaultTabClass = "flex-1 py-2 font-bold text-xs sm:text-sm text-center border-b-2 border-transparent text-gray-400 hover:text-gray-700 flex items-center justify-center gap-1.5 transition-all";
  if (tabUser) tabUser.className = defaultTabClass;
  if (tabAdmin) tabAdmin.className = defaultTabClass;
  if (tabRegister) tabRegister.className = defaultTabClass;

  if (tab === 'user') {
    if (tabUser) tabUser.className = "flex-1 py-2 font-bold text-xs sm:text-sm text-center border-b-2 border-[#002f34] text-[#002f34] flex items-center justify-center gap-1.5 transition-all";
    if (nameGroup) nameGroup.classList.add('hidden');
    if (submitBtn) submitBtn.innerText = "Log In as User";
    if (authTitle) authTitle.innerText = "User Login";
    if (roleBannerText) {
      roleBannerText.innerHTML = `
        <strong class="block font-bold">Standard User Mode:</strong>
        <span>Post ads, save favorites, and chat with buyers and sellers seamlessly.</span>
      `;
    }
    if (demoHelper) demoHelper.classList.remove('hidden');
    if (demoBtnText) demoBtnText.innerText = "Auto-fill Demo User: rahul.varma@gmail.com";
  } else if (tab === 'admin') {
    if (tabAdmin) tabAdmin.className = "flex-1 py-2 font-bold text-xs sm:text-sm text-center border-b-2 border-amber-500 text-amber-900 bg-amber-50/50 flex items-center justify-center gap-1.5 transition-all";
    if (nameGroup) nameGroup.classList.add('hidden');
    if (submitBtn) submitBtn.innerText = "Log In as Administrator";
    if (authTitle) authTitle.innerText = "Administrator Login";
    if (roleBannerText) {
      roleBannerText.innerHTML = `
        <strong class="block font-bold text-amber-900">🛡️ Administrator Access:</strong>
        <span>Allows deleting unwanted listings and moderating the marketplace.</span>
      `;
    }
    if (demoHelper) demoHelper.classList.remove('hidden');
    if (demoBtnText) demoBtnText.innerText = "Auto-fill Demo Admin: admin@olx.in (admin12345)";
  } else {
    // Register
    if (tabRegister) tabRegister.className = "flex-1 py-2 font-bold text-xs sm:text-sm text-center border-b-2 border-[#002f34] text-[#002f34] flex items-center justify-center gap-1.5 transition-all";
    if (nameGroup) nameGroup.classList.remove('hidden');
    if (submitBtn) submitBtn.innerText = "Register Account";
    if (authTitle) authTitle.innerText = "Create OLX User Account";
    if (roleBannerText) {
      roleBannerText.innerHTML = `
        <strong class="block font-bold">New Account Registration:</strong>
        <span>Register with email and phone to start posting items for sale.</span>
      `;
    }
    if (demoHelper) demoHelper.classList.add('hidden');
  }

  resetAuthFormErrors();
  if (window.lucide) lucide.createIcons();
}

function fillCurrentDemoCredentials() {
  const emailInput = document.getElementById('authEmail');
  const passInput = document.getElementById('authPassword');
  const phoneInput = document.getElementById('authPhone');

  if (state.activeAuthTab === 'admin') {
    if (emailInput) emailInput.value = 'admin@olx.in';
    if (passInput) passInput.value = 'admin12345';
    if (phoneInput) phoneInput.value = '+91 98000 11223';
    showToast('Admin credentials filled: admin@olx.in', 'info');
  } else {
    if (emailInput) emailInput.value = 'rahul.varma@gmail.com';
    if (passInput) passInput.value = 'user12345';
    if (phoneInput) phoneInput.value = '+91 98765 43210';
    showToast('User credentials filled: rahul.varma@gmail.com', 'info');
  }
}

function resetAuthFormErrors() {
  const fields = ['authEmail', 'authPhone', 'authPassword', 'authName'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    const err = document.getElementById(`${id}Error`);
    if (el) {
      el.classList.remove('border-rose-500', 'border-emerald-500');
      el.classList.add('border-gray-300');
    }
    if (err) err.classList.add('hidden');
  });
}

// Live RegEx Feedback Listeners for Auth Form
function setupAuthRegexValidation() {
  const fields = [
    { id: 'authEmail', regexKey: 'email', errId: 'authEmailError' },
    { id: 'authPhone', regexKey: 'phone', errId: 'authPhoneError' },
    { id: 'authPassword', regexKey: 'password', errId: 'authPasswordError' },
    { id: 'authName', regexKey: 'name', errId: 'authNameError' }
  ];

  fields.forEach(({ id, regexKey, errId }) => {
    const input = document.getElementById(id);
    const err = document.getElementById(errId);

    if (input) {
      input.addEventListener('input', () => {
        if (!input.value.trim()) {
          input.classList.remove('border-rose-500', 'border-emerald-500');
          input.classList.add('border-gray-300');
          if (err) err.classList.add('hidden');
          return;
        }

        const isValid = validateInput(input.value, regexKey);
        if (isValid) {
          input.classList.remove('border-rose-500', 'border-gray-300');
          input.classList.add('border-emerald-500');
          if (err) err.classList.add('hidden');
        } else {
          input.classList.remove('border-emerald-500', 'border-gray-300');
          input.classList.add('border-rose-500');
          if (err) err.classList.remove('hidden');
        }
      });
    }
  });
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const emailVal = document.getElementById('authEmail').value.trim();
  const phoneVal = document.getElementById('authPhone').value.trim();
  const passVal = document.getElementById('authPassword').value;
  const nameVal = document.getElementById('authName')?.value.trim() || '';

  const isEmailValid = validateInput(emailVal, 'email');
  const isPhoneValid = state.activeAuthTab === 'register' ? validateInput(phoneVal, 'phone') : true;
  const isPassValid = passVal.length >= 6;
  const isNameValid = state.activeAuthTab === 'register' ? validateInput(nameVal, 'name') : true;

  document.getElementById('authEmailError')?.classList.toggle('hidden', isEmailValid);
  document.getElementById('authPhoneError')?.classList.toggle('hidden', isPhoneValid);
  document.getElementById('authPasswordError')?.classList.toggle('hidden', isPassValid);
  if (document.getElementById('authNameError')) {
    document.getElementById('authNameError')?.classList.toggle('hidden', isNameValid);
  }

  if (!isEmailValid || !isPassValid || !isNameValid) {
    showToast('Please fix highlighted fields before submitting.', 'error');
    return;
  }

  const cleanEmail = emailVal.toLowerCase();
  const isAdminLogin = state.activeAuthTab === 'admin' || cleanEmail === 'admin@olx.in';

  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: passVal })
    });
    const data = await res.json();

    if (res.ok && data._id) {
      const userIsAdmin = data.isAdmin === true || isAdminLogin;
      state.currentUser = {
        id: data._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar || (userIsAdmin
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
        isAdmin: userIsAdmin,
        role: userIsAdmin ? 'admin' : 'user',
        isLoggedIn: true
      };
    } else {
      state.currentUser = {
        id: `user-${Date.now()}`,
        name: isAdminLogin ? 'System Admin Moderator' : (nameVal || 'Rahul Varma'),
        email: cleanEmail,
        phone: phoneVal || (isAdminLogin ? '+91 98000 11223' : '+91 98765 43210'),
        avatar: isAdminLogin
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isAdmin: isAdminLogin,
        role: isAdminLogin ? 'admin' : 'user',
        isLoggedIn: true
      };
    }
  } catch (err) {
    state.currentUser = {
      id: `user-${Date.now()}`,
      name: isAdminLogin ? 'System Admin Moderator' : (nameVal || 'Rahul Varma'),
      email: cleanEmail,
      phone: phoneVal || (isAdminLogin ? '+91 98000 11223' : '+91 98765 43210'),
      avatar: isAdminLogin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isAdmin: isAdminLogin,
      role: isAdminLogin ? 'admin' : 'user',
      isLoggedIn: true
    };
  }

  updateRoleBasedUI();
  closeAuthModal();

  if (state.currentUser.role === 'admin') {
    showToast('Administrator login successful. Listing moderation enabled.', 'success');
  } else {
    showToast(`Welcome back, ${state.currentUser.name}!`, 'success');
  }

  document.getElementById('authForm')?.reset();
}

function handleLogout() {
  state.currentUser = {
    id: null,
    name: '',
    email: '',
    phone: '',
    avatar: '',
    isAdmin: false,
    role: 'guest',
    isLoggedIn: false
  };
  updateRoleBasedUI();
  showToast('Logged out of OLX.', 'info');
}

// Render Listings Grid
function filterListings() {
  return state.listings.filter(ad => {
    // Category Filter
    if (state.selectedCategory !== 'all' && ad.categorySlug !== state.selectedCategory) {
      return false;
    }
    // Location Filter
    if (state.selectedCity !== 'All India' && !ad.location.city.toLowerCase().includes(state.selectedCity.toLowerCase())) {
      return false;
    }
    // Search Query Filter
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const match = ad.title.toLowerCase().includes(q) ||
                    ad.description.toLowerCase().includes(q) ||
                    ad.category.toLowerCase().includes(q) ||
                    (ad.brand && ad.brand.toLowerCase().includes(q)) ||
                    (ad.location.locality && ad.location.locality.toLowerCase().includes(q));
      if (!match) return false;
    }
    // Min Price
    if (state.minPrice && ad.price < Number(state.minPrice)) return false;
    // Max Price
    if (state.maxPrice && ad.price > Number(state.maxPrice)) return false;

    return true;
  }).sort((a, b) => {
    if (state.sortBy === 'price_asc') return a.price - b.price;
    if (state.sortBy === 'price_desc') return b.price - a.price;
    if (state.sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    return 0;
  });
}

function renderListings() {
  const grid = document.getElementById('listingsGrid');
  const countEl = document.getElementById('resultsCount');
  if (!grid) return;

  const isAdmin = state.currentUser?.isLoggedIn && (state.currentUser.role === 'admin' || state.currentUser.isAdmin);
  const filtered = filterListings();
  if (countEl) {
    countEl.innerText = `${filtered.length} Ads Found`;
  }

  // When no ads are in database yet
  if (state.listings.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 px-4 text-center bg-white rounded-2xl border border-gray-200 shadow-2xs">
        <div class="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100">
          <i data-lucide="package-open" class="w-8 h-8"></i>
        </div>
        <h3 class="text-xl font-bold text-[#002f34] mb-2">No Ads Posted Yet</h3>
        <p class="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          There are currently no items for sale in the marketplace. Post the first ad and it will be stored directly into your MongoDB database!
        </p>
        <button onclick="openSellModal()" class="px-6 py-2.5 bg-[#002f34] hover:bg-teal-900 text-white font-bold text-sm rounded-lg shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer">
          <i data-lucide="plus" class="w-4 h-4 text-yellow-400 stroke-[3]"></i>
          <span>Post an Ad (SELL)</span>
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // When ads exist but search filters yield 0 results
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200">
        <div class="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="search-x" class="w-8 h-8"></i>
        </div>
        <h3 class="text-xl font-bold text-[#002f34] mb-2">No matching ads found</h3>
        <p class="text-gray-500 max-w-md mx-auto mb-6">Try adjusting your filters, location, or search keywords to explore more listings.</p>
        <button onclick="resetFilters()" class="px-6 py-2.5 bg-[#002f34] text-white font-bold rounded-md hover:bg-opacity-90 transition-all">
          Reset All Filters
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(ad => {
    const isFav = state.favorites.has(ad.id);
    return `
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all olx-card group cursor-pointer flex flex-col" onclick="openDetailModal('${ad.id}')">
        <!-- Card Image Container -->
        <div class="relative h-48 bg-gray-100 overflow-hidden">
          <img src="${ad.images[0]}" alt="${ad.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ${ad.featured ? `<span class="absolute top-2 left-2 bg-yellow-400 text-[#002f34] font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">FEATURED</span>` : ''}
          <button 
            type="button" 
            onclick="event.stopPropagation(); toggleFavorite('${ad.id}')"
            class="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-md text-gray-700 hover:text-rose-600 transition-colors z-10"
            title="Save to favorites"
          >
            <i data-lucide="heart" class="w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}"></i>
          </button>
        </div>

        <!-- Card Body -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-baseline justify-between mb-1">
              <span class="text-xl font-black text-[#002f34] tracking-tight">${formatCurrency(ad.price)}</span>
              <span class="text-[11px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded">${ad.category}</span>
            </div>
            <h4 class="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-teal-700 transition-colors" title="${ad.title}">
              ${ad.title}
            </h4>
          </div>

          <div>
            <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 uppercase tracking-wide">
              <div class="flex items-center gap-1 truncate max-w-[140px]">
                <i data-lucide="map-pin" class="w-3 h-3 text-gray-400 shrink-0"></i>
                <span class="truncate">${ad.location.locality || ad.location.city}</span>
              </div>
              <span>${ad.createdAt}</span>
            </div>

            ${isAdmin ? `
              <!-- Admin-Only Listing Moderation Strip -->
              <div class="mt-2.5 pt-2 border-t border-amber-200/80 bg-amber-50/70 -mx-4 -mb-4 px-3 py-2 flex items-center justify-between gap-1.5 rounded-b-lg">
                <span class="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                  <i data-lucide="shield" class="w-3 h-3 text-amber-600"></i> Admin
                </span>
                <div class="flex items-center gap-1.5">
                  <button onclick="event.stopPropagation(); handleAdminToggleBoost('${ad.id}')" class="px-2 py-0.5 ${ad.featured ? 'bg-amber-200 text-amber-900 font-bold' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-amber-300 rounded text-[10px] flex items-center gap-1 transition-colors cursor-pointer" title="Toggle Featured badge">
                    <i data-lucide="star" class="w-3 h-3"></i> ${ad.featured ? 'Boosted' : 'Boost'}
                  </button>
                  <button onclick="event.stopPropagation(); handleAdminDeleteListing('${ad.id}')" class="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold rounded text-[10px] flex items-center gap-1 transition-colors cursor-pointer" title="Permanently delete this ad">
                    <i data-lucide="trash-2" class="w-3 h-3"></i> Delete
                  </button>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Category Pills Navigation
function renderCategoryNav() {
  const container = document.getElementById('categoryPills');
  if (!container) return;

  container.innerHTML = INITIAL_CATEGORIES.map(cat => {
    const isSelected = state.selectedCategory === cat.slug;
    return `
      <button 
        onclick="selectCategory('${cat.slug}')"
        class="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
          isSelected 
            ? 'bg-[#002f34] text-white shadow-sm' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }"
      >
        <span>${cat.name}</span>
      </button>
    `;
  }).join('');
}

function selectCategory(slug) {
  state.selectedCategory = slug;
  renderCategoryNav();
  renderListings();
}

// Favorites Management
function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    showToast('Removed from your favorites', 'info');
  } else {
    state.favorites.add(id);
    showToast('Saved to your favorites!', 'success');
  }
  updateFavoritesBadge();
  renderListings();
}

function updateFavoritesBadge() {
  const badge = document.getElementById('favBadge');
  if (badge) {
    badge.innerText = state.favorites.size;
  }
}

// Ad Detail Modal
function openDetailModal(id) {
  const ad = state.listings.find(item => item.id === id);
  if (!ad) return;

  const isAdmin = state.currentUser?.isLoggedIn && (state.currentUser.role === 'admin' || state.currentUser.isAdmin);
  state.activeDetailAd = ad;
  const modal = document.getElementById('detailModal');
  const content = document.getElementById('detailModalContent');

  if (!modal || !content) return;

  content.innerHTML = `
    <!-- Left Column: Gallery & Description -->
    <div class="lg:w-2/3 space-y-6">
      <!-- Main Photo -->
      <div class="bg-black/90 rounded-2xl overflow-hidden h-[340px] sm:h-[420px] flex items-center justify-center relative">
        <img id="detailMainImg" src="${ad.images[0]}" alt="${ad.title}" class="max-h-full max-w-full object-contain" />
        ${ad.featured ? `<span class="absolute top-4 left-4 bg-yellow-400 text-[#002f34] font-black text-xs px-3 py-1 rounded shadow-md tracking-wider">FEATURED AD</span>` : ''}
      </div>

      <!-- Thumbnail Strip -->
      ${ad.images.length > 1 ? `
        <div class="flex items-center gap-3 overflow-x-auto pb-2">
          ${ad.images.map((img, i) => `
            <button onclick="changeDetailImg('${img}')" class="w-18 h-18 rounded-lg overflow-hidden border-2 border-transparent hover:border-teal-500 focus:border-teal-500 transition-all shrink-0">
              <img src="${img}" alt="thumbnail" class="w-full h-full object-cover" />
            </button>
          `).join('')}
        </div>
      ` : ''}

      <!-- Details & Overview -->
      <div class="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 class="font-bold text-lg text-[#002f34] border-b border-gray-200 pb-2">Ad Overview</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div><span class="text-gray-400 block">Category:</span><strong class="text-gray-800">${ad.category}</strong></div>
          <div><span class="text-gray-400 block">Condition:</span><strong class="text-gray-800">${ad.condition}</strong></div>
          <div><span class="text-gray-400 block">Brand / Model:</span><strong class="text-gray-800">${ad.brand || 'N/A'}</strong></div>
          <div><span class="text-gray-400 block">Location:</span><strong class="text-gray-800">${ad.location.locality}, ${ad.location.city}</strong></div>
          <div><span class="text-gray-400 block">Ad ID:</span><span class="font-mono text-gray-500">${ad.id}</span></div>
          <div><span class="text-gray-400 block">Views:</span><strong class="text-gray-800">${ad.viewsCount}</strong></div>
        </div>

        <h3 class="font-bold text-lg text-[#002f34] border-b border-gray-200 pb-2 pt-4">Description</h3>
        <p class="text-gray-700 text-sm whitespace-pre-line leading-relaxed">${ad.description}</p>
      </div>
    </div>

    <!-- Right Column: Price & Seller Card -->
    <div class="lg:w-1/3 space-y-5">
      <!-- Price Box -->
      <div class="bg-white border-2 border-teal-500/20 rounded-2xl p-6 shadow-sm">
        <span class="text-3xl font-black text-[#002f34] block mb-2">${formatCurrency(ad.price)}</span>
        <h2 class="text-base font-bold text-gray-800 mb-4">${ad.title}</h2>
        
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <i data-lucide="map-pin" class="w-4 h-4 text-gray-400"></i>
          <span>${ad.location.locality}, ${ad.location.city}</span>
        </div>

        <div class="space-y-3">
          <button onclick="startChatWithSeller('${ad.id}')" class="w-full py-3 bg-[#002f34] hover:bg-teal-900 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer">
            <i data-lucide="message-square" class="w-4 h-4"></i>
            <span>Chat with Seller</span>
          </button>
          
          <button id="btnRevealPhone" onclick="revealSellerPhone('${ad.seller.phone}')" class="w-full py-3 bg-white hover:bg-gray-50 border-2 border-[#002f34] text-[#002f34] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
            <i data-lucide="phone" class="w-4 h-4"></i>
            <span>Show Phone Number</span>
          </button>
        </div>
      </div>

      <!-- Seller Profile Card -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400">Seller Information</h4>
        <div class="flex items-center gap-3">
          <img src="${ad.seller.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" alt="${ad.seller.name}" class="w-14 h-14 rounded-full object-cover border border-teal-500" />
          <div>
            <h5 class="font-bold text-base text-[#002f34]">${ad.seller.name}</h5>
            <span class="text-xs text-gray-500">Member since ${ad.seller.memberSince || '2022'}</span>
            <div class="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-0.5">
              <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
              <span>Verified Seller</span>
            </div>
          </div>
        </div>

        ${isAdmin ? `
          <!-- Admin-Only Moderation Panel -->
          <div class="bg-amber-50/90 border-2 border-amber-400 p-4 rounded-xl space-y-2.5 shadow-sm">
            <div class="flex items-center justify-between text-amber-950 font-bold text-sm">
              <div class="flex items-center gap-1.5">
                <i data-lucide="shield" class="w-4 h-4 text-amber-600"></i>
                <span>Admin Moderator Action</span>
              </div>
              <span class="text-[10px] bg-yellow-400 text-[#002f34] px-1.5 py-0.5 rounded font-black uppercase">ADMIN</span>
            </div>
            <div class="flex flex-col gap-2 pt-1">
              <button onclick="handleAdminToggleBoost('${ad.id}')" class="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-[#002f34] text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <i data-lucide="star" class="w-4 h-4"></i>
                <span>${ad.featured ? 'Remove Featured Status' : 'Boost / Mark as Featured Ad'}</span>
              </button>
              <button onclick="handleAdminDeleteListing('${ad.id}')" class="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
                <span>Delete Listing</span>
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons();
}

function closeDetailModal() {
  const modal = document.getElementById('detailModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

function changeDetailImg(src) {
  const main = document.getElementById('detailMainImg');
  if (main) main.src = src;
}

function revealSellerPhone(phone) {
  const btn = document.getElementById('btnRevealPhone');
  if (btn) {
    btn.innerHTML = `<i data-lucide="phone-call" class="w-4 h-4 text-emerald-600"></i> <span class="font-mono text-emerald-700">${phone}</span>`;
    if (window.lucide) lucide.createIcons();
  }
}

// Post New Ad (SELL) Modal
function openSellModal() {
  if (!state.currentUser.isLoggedIn) {
    showToast('Please log in first to post an ad!', 'info');
    openAuthModal('user');
    return;
  }

  const modal = document.getElementById('sellModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeSellModal() {
  const modal = document.getElementById('sellModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

// Handle Post Ad Form Submission with MongoDB backend persistence
async function handlePostAdSubmit(event) {
  event.preventDefault();

  if (!state.currentUser.isLoggedIn) {
    showToast('Please log in first to post an ad!', 'info');
    openAuthModal('user');
    return;
  }

  const title = document.getElementById('postTitle').value;
  const price = document.getElementById('postPrice').value;
  const category = document.getElementById('postCategory').value;
  const description = document.getElementById('postDescription').value;
  const city = document.getElementById('postCity').value;
  const locality = document.getElementById('postLocality').value;
  const image = document.getElementById('postImage').value;

  const isTitleValid = validateInput(title, 'title');
  const isPriceValid = validateInput(price, 'price');
  const isImageValid = image.trim() ? validateInput(image, 'url') : true;

  document.getElementById('postTitleError')?.classList.toggle('hidden', isTitleValid);
  document.getElementById('postPriceError')?.classList.toggle('hidden', isPriceValid);
  document.getElementById('postImageError')?.classList.toggle('hidden', isImageValid);

  if (!isTitleValid || !isPriceValid || !isImageValid) {
    showToast('Please fix highlighted form errors before posting.', 'error');
    return;
  }

  const defaultImg = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
  const payload = {
    title: title.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.charAt(0).toUpperCase() + category.slice(1),
    categorySlug: category.toLowerCase(),
    subcategory: category,
    condition: 'Used',
    brand: 'Generic',
    images: [image.trim() || defaultImg],
    location: { city: city.trim(), state: 'India', locality: locality.trim() || city.trim() },
    seller: {
      id: state.currentUser.id || 'seller-curr',
      name: state.currentUser.name || 'Rahul Varma',
      avatar: state.currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      phone: state.currentUser.phone || '+91 98765 43210',
      memberSince: 'Just Now',
      rating: 5.0,
      isVerified: true
    }
  };

  try {
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const saved = await res.json();
      state.listings.unshift({
        id: saved._id || saved.id,
        title: saved.title,
        description: saved.description,
        price: saved.price,
        category: saved.category,
        categorySlug: saved.categorySlug,
        subcategory: saved.subcategory,
        condition: saved.condition,
        brand: saved.brand,
        images: saved.images,
        location: saved.location,
        seller: saved.seller,
        featured: saved.featured,
        viewsCount: saved.viewsCount || 1,
        createdAt: 'JUST NOW'
      });
      closeSellModal();
      renderListings();
      showToast('🎉 Your Ad has been published and saved to MongoDB!', 'success');
      document.getElementById('sellForm')?.reset();
      return;
    }
  } catch (err) {
    console.warn('API save notice:', err.message);
  }

  // Local fallback
  state.listings.unshift({
    id: `ad-${Date.now()}`,
    ...payload,
    featured: true,
    viewsCount: 1,
    createdAt: 'JUST NOW'
  });
  closeSellModal();
  renderListings();
  showToast('Your Ad has been published!', 'success');
  document.getElementById('sellForm')?.reset();
}

// Admin Listing Moderation Controls
async function handleAdminDeleteListing(id) {
  const isAdmin = state.currentUser?.isLoggedIn && (state.currentUser.role === 'admin' || state.currentUser.isAdmin);
  if (!isAdmin) {
    showToast('Administrator privileges required to delete listings.', 'error');
    return;
  }

  const confirmed = confirm('Admin Moderator Action: Are you sure you want to permanently delete this listing?');
  if (!confirmed) return;

  try {
    await fetch(`/api/listings/${id}`, { method: 'DELETE' });
  } catch (err) {
    // quiet
  }

  state.listings = state.listings.filter(item => item.id !== id);
  closeDetailModal();
  renderListings();
  showToast('Listing removed by Administrator.', 'success');
}

async function handleAdminToggleBoost(id) {
  const isAdmin = state.currentUser?.isLoggedIn && (state.currentUser.role === 'admin' || state.currentUser.isAdmin);
  if (!isAdmin) {
    showToast('Administrator privileges required.', 'error');
    return;
  }

  const ad = state.listings.find(item => item.id === id);
  if (!ad) return;

  ad.featured = !ad.featured;

  try {
    await fetch(`/api/listings/${id}/boost`, { method: 'POST' });
  } catch (err) {
    // quiet
  }

  renderListings();
  if (state.activeDetailAd && state.activeDetailAd.id === id) {
    openDetailModal(id);
  }
  showToast(ad.featured ? 'Listing marked as Featured!' : 'Featured badge removed.', 'info');
}

// Chat System
function startChatWithSeller(adId) {
  closeDetailModal();
  if (!state.currentUser.isLoggedIn) {
    showToast('Please log in first to chat with sellers!', 'info');
    openAuthModal('user');
    return;
  }

  const ad = state.listings.find(item => item.id === adId);
  if (!ad) return;

  let conv = state.conversations.find(c => c.adId === adId);
  if (!conv) {
    conv = {
      id: `conv-${Date.now()}`,
      adId: ad.id,
      adTitle: ad.title,
      adPrice: ad.price,
      adImage: ad.images[0],
      sellerName: ad.seller.name,
      sellerAvatar: ad.seller.avatar,
      lastMessage: 'Hi, is this available?',
      messages: [
        { sender: 'me', text: `Hi ${ad.seller.name}, is "${ad.title}" still available?`, time: 'Just now' }
      ]
    };
    state.conversations.unshift(conv);
  }

  state.activeConvId = conv.id;
  openChatModal();
}

function openChatModal() {
  if (!state.currentUser.isLoggedIn) {
    showToast('Please log in to view your inbox chats!', 'info');
    openAuthModal('user');
    return;
  }

  const modal = document.getElementById('chatModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderChatModalContent();
  }
}

function closeChatModal() {
  const modal = document.getElementById('chatModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

function renderChatModalContent() {
  const convList = document.getElementById('chatConvList');
  const chatMessages = document.getElementById('chatMessages');
  const activeHeader = document.getElementById('chatActiveHeader');

  if (!convList) return;

  if (state.conversations.length === 0) {
    convList.innerHTML = `<p class="p-6 text-center text-xs text-gray-400">No active chats yet. Click "Chat with Seller" on any ad!</p>`;
    if (chatMessages) chatMessages.innerHTML = `<div class="h-full flex items-center justify-center text-gray-400 text-sm">Select a conversation</div>`;
    return;
  }

  convList.innerHTML = state.conversations.map(conv => `
    <div onclick="selectConversation('${conv.id}')" class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center gap-3 ${state.activeConvId === conv.id ? 'bg-teal-50/70 border-l-4 border-l-[#002f34]' : ''}">
      <img src="${conv.sellerAvatar}" class="w-10 h-10 rounded-full object-cover" />
      <div class="flex-1 truncate">
        <h5 class="text-xs font-bold text-gray-800 truncate">${conv.sellerName}</h5>
        <p class="text-[11px] text-gray-500 truncate">${conv.adTitle}</p>
        <span class="text-[10px] text-teal-700 font-medium truncate">${conv.lastMessage}</span>
      </div>
    </div>
  `).join('');

  const active = state.conversations.find(c => c.id === state.activeConvId) || state.conversations[0];
  if (active) {
    state.activeConvId = active.id;
    if (activeHeader) {
      activeHeader.innerHTML = `
        <div class="flex items-center gap-2">
          <img src="${active.sellerAvatar}" class="w-8 h-8 rounded-full object-cover" />
          <div>
            <h4 class="text-xs font-bold text-gray-800">${active.sellerName}</h4>
            <span class="text-[10px] text-gray-400 truncate block">${active.adTitle} • ${formatCurrency(active.adPrice)}</span>
          </div>
        </div>
      `;
    }

    if (chatMessages) {
      chatMessages.innerHTML = active.messages.map(m => `
        <div class="flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[75%] rounded-2xl px-4 py-2 text-xs ${m.sender === 'me' ? 'bg-[#002f34] text-white rounded-br-xs' : 'bg-gray-100 text-gray-800 rounded-bl-xs'}">
            <p>${m.text}</p>
            <span class="text-[9px] opacity-70 block text-right mt-1">${m.time}</span>
          </div>
        </div>
      `).join('');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
}

function selectConversation(id) {
  state.activeConvId = id;
  renderChatModalContent();
}

function handleSendMessage(event) {
  event.preventDefault();
  const input = document.getElementById('chatInput');
  if (!input || !input.value.trim() || !state.activeConvId) return;

  const conv = state.conversations.find(c => c.id === state.activeConvId);
  if (!conv) return;

  const text = input.value.trim();
  conv.messages.push({ sender: 'me', text, time: 'Just now' });
  conv.lastMessage = text;
  input.value = '';

  renderChatModalContent();

  setTimeout(() => {
    conv.messages.push({ sender: 'seller', text: 'Thanks for reaching out! Is your offer firm or negotiable?', time: 'Just now' });
    conv.lastMessage = 'Thanks for reaching out!';
    renderChatModalContent();
  }, 1200);
}

function resetFilters() {
  state.selectedCategory = 'all';
  state.searchQuery = '';
  state.selectedCity = 'All India';
  state.minPrice = '';
  state.maxPrice = '';
  state.sortBy = 'featured';

  const sInput = document.getElementById('searchInput');
  const cSelect = document.getElementById('citySelect');
  if (sInput) sInput.value = '';
  if (cSelect) cSelect.value = 'All India';

  renderCategoryNav();
  renderListings();
}

function initEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderListings();
    });
  }

  const citySelect = document.getElementById('citySelect');
  if (citySelect) {
    citySelect.addEventListener('change', (e) => {
      state.selectedCity = e.target.value;
      renderListings();
    });
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderListings();
    });
  }
}

// Global Exports for HTML onclick handlers
window.selectCategory = selectCategory;
window.toggleFavorite = toggleFavorite;
window.openDetailModal = openDetailModal;
window.closeDetailModal = closeDetailModal;
window.changeDetailImg = changeDetailImg;
window.revealSellerPhone = revealSellerPhone;
window.openSellModal = openSellModal;
window.closeSellModal = closeSellModal;
window.handlePostAdSubmit = handlePostAdSubmit;
window.openChatModal = openChatModal;
window.closeChatModal = closeChatModal;
window.startChatWithSeller = startChatWithSeller;
window.selectConversation = selectConversation;
window.handleSendMessage = handleSendMessage;
window.resetFilters = resetFilters;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.fillCurrentDemoCredentials = fillCurrentDemoCredentials;
window.handleAuthSubmit = handleAuthSubmit;
window.handleLogout = handleLogout;
window.handleAdminDeleteListing = handleAdminDeleteListing;
window.handleAdminToggleBoost = handleAdminToggleBoost;
window.updateRoleBasedUI = updateRoleBasedUI;

// Initialize App on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryNav();
  updateFavoritesBadge();
  initEventListeners();
  setupAuthRegexValidation();
  updateRoleBasedUI();
  loadListingsFromDatabase();

  if (window.lucide) {
    lucide.createIcons();
  }
});
