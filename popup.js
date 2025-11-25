document.addEventListener('DOMContentLoaded', () => {
    // State
    let userData = { name: "", age: null, gender: "male", kids: false };
    let isPaused = false;

    // Navigation Views
    const views = {
        setup: document.getElementById('view-setup'),
        home: document.getElementById('view-home'),
        settings: document.getElementById('view-settings')
    };

    function showView(name) {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        views[name].classList.remove('hidden');
        
        // Header Toggle
        if (name === 'settings') {
            document.getElementById('mainHeader').classList.add('hidden');
            document.getElementById('settingsHeader').classList.remove('hidden');
        } else {
            document.getElementById('mainHeader').classList.remove('hidden');
            document.getElementById('settingsHeader').classList.add('hidden');
        }
    }

    // INIT
    loadState();

    // --- SETUP LOGIC (FIXED BUTTONS) ---
    let tempGender = 'male';
    let tempParent = false;

    // Gender Selection
    const genderBtns = document.querySelectorAll('.gender-btn');
    genderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selected class from all
            genderBtns.forEach(b => b.classList.remove('selected'));
            // Add to clicked
            btn.classList.add('selected');
            // Update state
            tempGender = btn.getAttribute('data-value');
        });
    });
    // Select first by default
    if(genderBtns.length > 0) genderBtns[0].click();

    // Parent Selection
    const parentBtns = document.querySelectorAll('.parent-btn');
    parentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            parentBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            tempParent = (btn.getAttribute('data-value') === 'true');
        });
    });
    if(parentBtns.length > 0) parentBtns[0].click();

    // Steps Navigation
    document.getElementById('btnNext1').addEventListener('click', () => {
        const name = document.getElementById('inputName').value.trim();
        if(!name) return shake(document.getElementById('inputName'));
        userData.name = name;
        document.getElementById('setup-step-1').classList.add('hidden');
        document.getElementById('setup-step-2').classList.remove('hidden');
    });

    document.getElementById('btnNext2').addEventListener('click', () => {
        const age = document.getElementById('inputAge').value;
        if(!age || age < 5 || age > 100) return shake(document.getElementById('inputAge'));
        userData.age = age;
        userData.gender = tempGender; // Save the selected gender
        document.getElementById('setup-step-2').classList.add('hidden');
        document.getElementById('setup-step-3').classList.remove('hidden');
    });

    document.getElementById('btnFinishSetup').addEventListener('click', () => {
        userData.kids = tempParent;
        chrome.storage.sync.set({ fohkasuProfile: userData }, () => {
            loadState();
        });
    });

    // --- HOME LOGIC ---
    function loadState() {
        chrome.storage.sync.get(['fohkasuProfile', 'fohkasuPaused', 'murderedDays'], (res) => {
            if (!res.fohkasuProfile) {
                showView('setup');
                return;
            }

            userData = res.fohkasuProfile;
            isPaused = res.fohkasuPaused || false;

            // Update UI
            document.getElementById('display-name').innerText = userData.name;
            let details = `${userData.gender.toUpperCase()} • ${userData.age}YO`;
            if(userData.kids) details += ` • PARENT`;
            document.getElementById('display-details').innerText = details;

            updateStatusUI();
            renderGraveyard(res.murderedDays || []);
            
            showView('home');
        });
    }

    function renderGraveyard(murderedDays) {
        const grid = document.getElementById('graveyardGrid');
        grid.innerHTML = '';
        for (let i = 27; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toDateString();
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            if (murderedDays.includes(dateStr)) {
                cell.classList.add('skull');
                cell.innerText = "💀";
            } else {
                cell.classList.add('shield');
                cell.innerText = "🛡️";
            }
            grid.appendChild(cell);
        }
    }

    // --- NAVIGATION ---
    document.getElementById('btnSettings').addEventListener('click', () => showView('settings'));
    document.getElementById('btnBack').addEventListener('click', () => showView('home'));

    // --- TOGGLE & CONFESSION ---
    const confessionOverlay = document.getElementById('confession-overlay');
    const confessionInput = document.getElementById('confessionInput');
    const btnAdmitDefeat = document.getElementById('btnAdmitDefeat');

    document.getElementById('systemToggle').addEventListener('click', () => {
        if(isPaused) {
            isPaused = false;
            chrome.storage.sync.set({ fohkasuPaused: false });
            updateStatusUI();
        } else {
            confessionOverlay.style.display = 'flex';
            confessionInput.value = "";
            btnAdmitDefeat.style.opacity = "0.5";
            btnAdmitDefeat.style.cursor = "not-allowed";
        }
    });

    confessionInput.addEventListener('input', () => {
        if(confessionInput.value.length >= 50) {
            btnAdmitDefeat.style.opacity = "1";
            btnAdmitDefeat.style.cursor = "pointer";
        } else {
            btnAdmitDefeat.style.opacity = "0.5";
            btnAdmitDefeat.style.cursor = "not-allowed";
        }
    });

    document.getElementById('btnStayStrong').addEventListener('click', () => confessionOverlay.style.display = 'none');

    btnAdmitDefeat.addEventListener('click', () => {
        if(confessionInput.value.length < 50) return;
        isPaused = true;
        chrome.storage.sync.set({ fohkasuPaused: true });
        updateStatusUI();
        confessionOverlay.style.display = 'none';
    });

    function updateStatusUI() {
        const root = document.getElementById('systemToggle');
        const pill = document.getElementById('statusPill');
        const sub = document.getElementById('statusSubtext');

        if(isPaused) {
            root.classList.add('paused');
            pill.innerText = "PAUSED";
            pill.style.color = "#F43F5E"; // Danger Color
            pill.style.background = "rgba(244, 63, 94, 0.1)";
            sub.innerText = "You are vulnerable";
        } else {
            root.classList.remove('paused');
            pill.innerText = "ACTIVE";
            pill.style.color = "#10B981"; // Success Color
            pill.style.background = "rgba(16, 185, 129, 0.1)";
            sub.innerText = "Protecting your mind";
        }
    }

    // --- RESET ---
    document.getElementById('btnReset').addEventListener('click', () => {
        if(confirm("Are you sure you want to erase your identity? This cannot be undone.")) {
            chrome.storage.sync.clear(() => location.reload());
        }
    });

    function shake(el) {
        el.style.borderColor = "#F43F5E";
        el.classList.add('shake'); // You'd need a CSS animation for 'shake' ideally
        setTimeout(() => el.style.borderColor = "#334155", 500);
    }
});