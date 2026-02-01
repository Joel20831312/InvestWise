// ============== STATE ==============
let selectedRisk = 'moderate';
let portfolio = JSON.parse(localStorage.getItem('investwisePortfolio')) || [];
let userProfile = JSON.parse(localStorage.getItem('investwiseProfile')) || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    balance: 0,
    totalDeposits: 0
};

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', () => {
    setupDarkMode();
    setupEventListeners();
    setupNavigation();
    loadPortfolio();
    loadUserProfile();
    loadDashboardData();
});

// ============== DARK MODE ==============
function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            updateDarkModeIcon(isDark);
        });
    }
}

function updateDarkModeIcon(isDarkMode) {
    const icon = document.querySelector('.dark-mode-icon');
    if (icon) {
        icon.textContent = isDarkMode ? '☀️' : '🌙';
    }
}

// ============== NAVIGATION ==============
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = link.dataset.page;
            navigateToPage(pageName);
        });
    });
}

function navigateToPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(`${pageName}-page`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
    
    // Reload data if needed
    if (pageName === 'dashboard') {
        loadDashboardData();
    } else if (pageName === 'account') {
        displayPortfolio();
    }
    
    window.scrollTo(0, 0);
}

// ============== HOME/DASHBOARD PAGE - INVESTMENT ANALYZER ==============
function setupEventListeners() {
    // Risk button selection
    const riskButtons = document.querySelectorAll('.risk-btn');
    riskButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            riskButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedRisk = btn.dataset.risk;
        });
    });

    // Analyze button
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', handleAnalyze);
    }

    // Enter key on amount input
    const amountInput = document.getElementById('investmentAmount');
    if (amountInput) {
        amountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAnalyze();
            }
        });
    }
    
    // Calculator setup
    const calcButton = document.getElementById('calcButton');
    if (calcButton) {
        calcButton.addEventListener('click', calculateStrategies);
    }
    
    // Account form setup
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveUserProfile();
        });
    }
    
    // Deposit button setup
    const depositBtn = document.getElementById('depositBtn');
    if (depositBtn) {
        depositBtn.addEventListener('click', processDeposit);
    }
    
    // Portfolio position add
    const addPositionBtn = document.getElementById('addPositionBtn');
    if (addPositionBtn) {
        addPositionBtn.addEventListener('click', addPosition);
    }
}

async function handleAnalyze() {
    const amount = document.getElementById('investmentAmount').value;
    const timeHorizon = document.getElementById('timeHorizon').value;
    const analyzeBtn = document.getElementById('analyzeBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const resultsCard = document.getElementById('resultsCard');

    if (!amount || amount < 100) {
        alert('Bitte gib einen Betrag von mindestens CHF 100 ein.');
        return;
    }

    analyzeBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    resultsCard.classList.add('hidden');

    try {
        const recommendation = await getInvestmentRecommendation(amount, selectedRisk, timeHorizon);
        displayRecommendation(recommendation);
        
        setTimeout(() => {
            resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } catch (error) {
        console.error('Error:', error);
        alert('Es gab einen Fehler bei der Analyse. Bitte versuche es erneut.');
    } finally {
        analyzeBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

async function getInvestmentRecommendation(amount, risk, timeHorizon) {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                risk: risk,
                timeHorizon: timeHorizon
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function displayRecommendation(recommendation) {
    const resultsCard = document.getElementById('resultsCard');
    const contentDiv = document.getElementById('recommendationContent');
    
    const formattedRecommendation = formatRecommendation(recommendation);
    contentDiv.innerHTML = formattedRecommendation;
    
    resultsCard.classList.remove('hidden');
}

function formatRecommendation(text) {
    let formatted = text;
    
    formatted = formatted.replace(/###\s+(.+)/g, '<h3>$1</h3>');
    formatted = formatted.replace(/##\s+(.+)/g, '<h3>$1</h3>');
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/^\- (.+)/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    formatted = formatted.split('\n\n').map(para => {
        if (para.includes('<h3>') || para.includes('<ul>')) {
            return para;
        }
        return `<p>${para}</p>`;
    }).join('\n');
    
    return formatted;
}

// ============== DASHBOARD ==============
async function loadDashboardData() {
    loadMarketData();
    loadCryptoData();
    loadForexData();
}

async function loadMarketData() {
    // Mock data
}

async function loadCryptoData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=chf');
        const data = await response.json();
        
        if (data.bitcoin && document.getElementById('bitcoin')) {
            document.getElementById('bitcoin').textContent = `CHF ${data.bitcoin.chf.toLocaleString('de-CH')}`;
        }
        if (data.ethereum && document.getElementById('ethereum')) {
            document.getElementById('ethereum').textContent = `CHF ${data.ethereum.chf.toLocaleString('de-CH')}`;
        }
    } catch (error) {
        console.log('Crypto data unavailable');
    }
}

async function loadForexData() {
    const forexData = {
        'eur-chf': 0.945,
        'usd-chf': 0.885
    };
    
    const eurChfEl = document.getElementById('eur-chf');
    const usdChfEl = document.getElementById('usd-chf');
    
    if (eurChfEl) eurChfEl.textContent = forexData['eur-chf'].toFixed(3);
    if (usdChfEl) usdChfEl.textContent = forexData['usd-chf'].toFixed(3);
}

// ============== CALCULATOR ==============
function calculateStrategies() {
    const amount = parseFloat(document.getElementById('calcAmount').value) || 0;
    const years = parseFloat(document.getElementById('calcYears').value) || 1;
    const monthly = 100; // Fixed monthly investment
    
    if (amount <= 0) {
        alert('Bitte gib einen Betrag ein');
        return;
    }
    
    const rates = {
        conservative: 0.04,
        moderate: 0.065,
        aggressive: 0.085
    };
    
    function calculateFinal(principal, rate, years, monthly) {
        let result = principal;
        for (let year = 0; year < years; year++) {
            result = result * (1 + rate);
            for (let month = 0; month < 12; month++) {
                result += monthly;
            }
        }
        return Math.round(result);
    }
    
    const results = {
        conservative: calculateFinal(amount, rates.conservative, years, monthly),
        moderate: calculateFinal(amount, rates.moderate, years, monthly),
        aggressive: calculateFinal(amount, rates.aggressive, years, monthly)
    };
    
    const resultConsEl = document.getElementById('result-conservative');
    const resultModEl = document.getElementById('result-moderate');
    const resultAggEl = document.getElementById('result-aggressive');
    const calcResultsEl = document.getElementById('calcResults');
    
    if (resultConsEl) resultConsEl.textContent = `CHF ${results.conservative.toLocaleString('de-CH')}`;
    if (resultModEl) resultModEl.textContent = `CHF ${results.moderate.toLocaleString('de-CH')}`;
    if (resultAggEl) resultAggEl.textContent = `CHF ${results.aggressive.toLocaleString('de-CH')}`;
    if (calcResultsEl) calcResultsEl.classList.remove('hidden');
}

// ============== ACCOUNT & USER PROFILE ==============
function loadUserProfile() {
    const firstNameEl = document.getElementById('firstName');
    const lastNameEl = document.getElementById('lastName');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    
    if (firstNameEl) firstNameEl.value = userProfile.firstName || '';
    if (lastNameEl) lastNameEl.value = userProfile.lastName || '';
    if (emailEl) emailEl.value = userProfile.email || '';
    if (phoneEl) phoneEl.value = userProfile.phone || '';
    
    updateBalanceDisplay();
}

function saveUserProfile() {
    userProfile.firstName = document.getElementById('firstName').value;
    userProfile.lastName = document.getElementById('lastName').value;
    userProfile.email = document.getElementById('email').value;
    userProfile.phone = document.getElementById('phone').value;
    
    localStorage.setItem('investwiseProfile', JSON.stringify(userProfile));
    alert('Profil gespeichert!');
}

function processDeposit() {
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (!amount || amount < 50) {
        alert('Mindesteinzahlung: CHF 50');
        return;
    }
    
    userProfile.balance += amount;
    userProfile.totalDeposits += amount;
    
    localStorage.setItem('investwiseProfile', JSON.stringify(userProfile));
    updateBalanceDisplay();
    
    document.getElementById('depositAmount').value = '';
    alert(`CHF ${amount.toFixed(2)} erfolgreich eingezahlt!`);
}

function updateBalanceDisplay() {
    const balanceEl = document.getElementById('balance');
    const depositsEl = document.getElementById('totalDeposits');
    
    if (balanceEl) balanceEl.textContent = `CHF ${userProfile.balance.toLocaleString('de-CH', {maximumFractionDigits: 2})}`;
    if (depositsEl) depositsEl.textContent = `CHF ${userProfile.totalDeposits.toLocaleString('de-CH', {maximumFractionDigits: 2})}`;
}

// ============== PORTFOLIO ==============
function loadPortfolio() {
    setupPortfolioForm();
    displayPortfolio();
}

function setupPortfolioForm() {
    const addBtn = document.getElementById('addPositionBtn');
    if (addBtn) {
        addBtn.addEventListener('click', addPosition);
    }
}

function addPosition() {
    const nameEl = document.getElementById('positionName');
    const sharesEl = document.getElementById('positionShares');
    const priceEl = document.getElementById('positionPrice');
    
    const name = nameEl.value;
    const shares = parseFloat(sharesEl.value);
    const price = parseFloat(priceEl.value);
    
    if (!name || !shares || !price) {
        alert('Bitte fülle alle Felder aus');
        return;
    }
    
    const position = {
        id: Date.now(),
        name: name,
        shares: shares,
        buyPrice: price,
        currentPrice: price,
        value: shares * price
    };
    
    portfolio.push(position);
    savePortfolio();
    displayPortfolio();
    
    nameEl.value = '';
    sharesEl.value = '';
    priceEl.value = '';
}

function removePosition(id) {
    portfolio = portfolio.filter(p => p.id !== id);
    savePortfolio();
    displayPortfolio();
}

function savePortfolio() {
    localStorage.setItem('investwisePortfolio', JSON.stringify(portfolio));
}

function displayPortfolio() {
    const portfolioList = document.getElementById('portfolioList');
    if (!portfolioList) return;
    
    if (portfolio.length === 0) {
        portfolioList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Noch keine Positionen.</p>';
        updatePortfolioStats();
        return;
    }
    
    portfolioList.innerHTML = portfolio.map(position => `
        <div class="portfolio-item">
            <div class="portfolio-item-info">
                <h4>${position.name}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${position.shares} Anteile @ CHF ${position.buyPrice.toFixed(2)}</p>
            </div>
            <div class="portfolio-item-value">
                <span class="label">Aktueller Wert</span>
                <span class="value">CHF ${position.value.toLocaleString('de-CH', {maximumFractionDigits: 2})}</span>
            </div>
            <button class="btn-secondary" onclick="removePosition(${position.id})">Löschen</button>
        </div>
    `).join('');
    
    updatePortfolioStats();
}

function updatePortfolioStats() {
    const totalValue = portfolio.reduce((sum, p) => sum + p.value, 0);
    const totalInvested = portfolio.reduce((sum, p) => sum + (p.shares * p.buyPrice), 0);
    const gainLoss = totalValue - totalInvested;
    
    const totalValueEl = document.getElementById('totalValue');
    const gainLossEl = document.getElementById('totalGainLoss');
    
    if (totalValueEl) totalValueEl.textContent = `CHF ${totalValue.toLocaleString('de-CH', {maximumFractionDigits: 2})}`;
    
    if (gainLossEl) {
        gainLossEl.textContent = `CHF ${gainLoss.toLocaleString('de-CH', {maximumFractionDigits: 2})}`;
        gainLossEl.style.color = gainLoss >= 0 ? 'var(--profit-green)' : 'var(--loss-red)';
    }
}

// ============== HOME PAGE - INVESTMENT ANALYZER ==============
function setupEventListeners() {
    // Risk button selection
    const riskButtons = document.querySelectorAll('.risk-btn');
    riskButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            riskButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedRisk = btn.dataset.risk;
        });
    });

    // Analyze button
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', handleAnalyze);
    }

    // Enter key on amount input
    const amountInput = document.getElementById('investmentAmount');
    if (amountInput) {
        amountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAnalyze();
            }
        });
    }
    
    // Calculator setup
    const calcButton = document.getElementById('calcButton');
    if (calcButton) {
        calcButton.addEventListener('click', calculateStrategies);
    }
}

async function handleAnalyze() {
    const amount = document.getElementById('investmentAmount').value;
    const timeHorizon = document.getElementById('timeHorizon').value;
    const analyzeBtn = document.getElementById('analyzeBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const resultsCard = document.getElementById('resultsCard');

    // Validation
    if (!amount || amount < 100) {
        alert('Bitte gib einen Betrag von mindestens CHF 100 ein.');
        return;
    }

    // Show loading state
    analyzeBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    resultsCard.classList.add('hidden');

    try {
        const recommendation = await getInvestmentRecommendation(amount, selectedRisk, timeHorizon);
        displayRecommendation(recommendation);
        
        // Scroll to results
        setTimeout(() => {
            resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } catch (error) {
        console.error('Error:', error);
        alert('Es gab einen Fehler bei der Analyse. Bitte versuche es erneut.');
    } finally {
        // Reset button state
        analyzeBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

async function getInvestmentRecommendation(amount, risk, timeHorizon) {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                risk: risk,
                timeHorizon: timeHorizon
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function displayRecommendation(recommendation) {
    const resultsCard = document.getElementById('resultsCard');
    const contentDiv = document.getElementById('recommendationContent');
    
    const formattedRecommendation = formatRecommendation(recommendation);
    contentDiv.innerHTML = formattedRecommendation;
    
    resultsCard.classList.remove('hidden');
}

function formatRecommendation(text) {
    let formatted = text;
    
    // Headers
    formatted = formatted.replace(/###\s+(.+)/g, '<h3>$1</h3>');
    formatted = formatted.replace(/##\s+(.+)/g, '<h3>$1</h3>');
    
    // Bold text
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Lists
    formatted = formatted.replace(/^\- (.+)/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Paragraphs
    formatted = formatted.split('\n\n').map(para => {
        if (para.includes('<h3>') || para.includes('<ul>')) {
            return para;
        }
        return `<p>${para}</p>`;
    }).join('\n');
    
    return formatted;
}

// ============== DASHBOARD ==============
async function loadDashboardData() {
    loadMarketData();
    loadCryptoData();
    loadForexData();
}

async function loadMarketData() {
    const mockData = {
        sp500: 6200,
        dax: 18200,
        smi: 12000
    };
    
    const sp500El = document.getElementById('sp500');
    const daxEl = document.getElementById('dax');
    const smiEl = document.getElementById('smi');
    
    if (sp500El) sp500El.textContent = `${mockData.sp500.toLocaleString('de-CH')} $`;
    if (daxEl) daxEl.textContent = `${mockData.dax.toLocaleString('de-CH')} €`;
    if (smiEl) smiEl.textContent = `${mockData.smi.toLocaleString('de-CH')} CHF`;
}

async function loadCryptoData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=chf');
        const data = await response.json();
        
        if (data.bitcoin && document.getElementById('bitcoin')) {
            document.getElementById('bitcoin').textContent = `CHF ${data.bitcoin.chf.toLocaleString('de-CH')}`;
        }
        if (data.ethereum && document.getElementById('ethereum')) {
            document.getElementById('ethereum').textContent = `CHF ${data.ethereum.chf.toLocaleString('de-CH')}`;
        }
    } catch (error) {
        console.log('Crypto data unavailable');
        if (document.getElementById('bitcoin')) document.getElementById('bitcoin').textContent = '—';
        if (document.getElementById('ethereum')) document.getElementById('ethereum').textContent = '—';
    }
}

async function loadForexData() {
    const forexData = {
        'eur-chf': 0.945,
        'usd-chf': 0.885
    };
    
    const eurChfEl = document.getElementById('eur-chf');
    const usdChfEl = document.getElementById('usd-chf');
    const fgiValueEl = document.getElementById('fearGreedValue');
    const fgiLabelEl = document.getElementById('fearGreedLabel');
    
    if (eurChfEl) eurChfEl.textContent = forexData['eur-chf'].toFixed(3);
    if (usdChfEl) usdChfEl.textContent = forexData['usd-chf'].toFixed(3);
    if (fgiValueEl) fgiValueEl.textContent = '65';
    if (fgiLabelEl) fgiLabelEl.textContent = 'Greed';
}

// ============== CALCULATOR ==============
function calculateStrategies() {
    const amount = parseFloat(document.getElementById('calcAmount').value) || 0;
    const years = parseFloat(document.getElementById('calcYears').value) || 1;
    const monthly = parseFloat(document.getElementById('calcMonthly').value) || 0;
    
    if (amount <= 0) {
        alert('Bitte gib einen Betrag ein');
        return;
    }
    
    const rates = {
        conservative: 0.04,
        moderate: 0.065,
        aggressive: 0.085
    };
    
    function calculateFinal(principal, rate, years, monthly) {
        let result = principal;
        for (let year = 0; year < years; year++) {
            result = result * (1 + rate);
            for (let month = 0; month < 12; month++) {
                result += monthly;
            }
        }
        return Math.round(result);
    }
    
    const results = {
        conservative: calculateFinal(amount, rates.conservative, years, monthly),
        moderate: calculateFinal(amount, rates.moderate, years, monthly),
        aggressive: calculateFinal(amount, rates.aggressive, years, monthly)
    };
    
    const resultConsEl = document.getElementById('result-conservative');
    const resultModEl = document.getElementById('result-moderate');
    const resultAggEl = document.getElementById('result-aggressive');
    const calcResultsEl = document.getElementById('calcResults');
    
    if (resultConsEl) resultConsEl.textContent = `CHF ${results.conservative.toLocaleString('de-CH')}`;
    if (resultModEl) resultModEl.textContent = `CHF ${results.moderate.toLocaleString('de-CH')}`;
    if (resultAggEl) resultAggEl.textContent = `CHF ${results.aggressive.toLocaleString('de-CH')}`;
    if (calcResultsEl) calcResultsEl.classList.remove('hidden');
}

// ============== PORTFOLIO ==============
function loadPortfolio() {
    setupPortfolioForm();
    displayPortfolio();
}

function setupPortfolioForm() {
    const addBtn = document.getElementById('addPositionBtn');
    if (addBtn) {
        addBtn.addEventListener('click', addPosition);
    }
}

function addPosition() {
    const nameEl = document.getElementById('positionName');
    const sharesEl = document.getElementById('positionShares');
    const priceEl = document.getElementById('positionPrice');
    
    const name = nameEl.value;
    const shares = parseFloat(sharesEl.value);
    const price = parseFloat(priceEl.value);
    
    if (!name || !shares || !price) {
        alert('Bitte fülle alle Felder aus');
        return;
    }
    
    const position = {
        id: Date.now(),
        name: name,
        shares: shares,
        buyPrice: price,
        currentPrice: price,
        value: shares * price
    };
    
    portfolio.push(position);
    savePortfolio();
    displayPortfolio();
    
    nameEl.value = '';
    sharesEl.value = '';
    priceEl.value = '';
}

function removePosition(id) {
    portfolio = portfolio.filter(p => p.id !== id);
    savePortfolio();
    displayPortfolio();
}

function savePortfolio() {
    localStorage.setItem('investwisePortfolio', JSON.stringify(portfolio));
}

function displayPortfolio() {
    const portfolioList = document.getElementById('portfolioList');
    if (!portfolioList) return;
    
    if (portfolio.length === 0) {
        portfolioList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Noch keine Positionen. Füge deine erste Position hinzu!</p>';
        updatePortfolioStats();
        return;
    }
    
    portfolioList.innerHTML = portfolio.map(position => `
        <div class="portfolio-item">
            <div class="portfolio-item-info">
                <h4>${position.name}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${position.shares} Anteile @ CHF ${position.buyPrice.toFixed(2)}</p>
            </div>
            <div class="portfolio-item-value">
                <span class="label">Aktueller Wert</span>
                <span class="value">CHF ${position.value.toLocaleString('de-CH', {maximumFractionDigits: 2})}</span>
            </div>
            <button class="btn-secondary" onclick="removePosition(${position.id})">Löschen</button>
        </div>
    `).join('');
    
    updatePortfolioStats();
}

function updatePortfolioStats() {
    const totalValue = portfolio.reduce((sum, p) => sum + p.value, 0);
    const totalInvested = portfolio.reduce((sum, p) => sum + (p.shares * p.buyPrice), 0);
    const gainLoss = totalValue - totalInvested;
    
    const totalValueEl = document.getElementById('totalValue');
    const totalInvestedEl = document.getElementById('totalInvested');
    const gainLossEl = document.getElementById('totalGainLoss');
    
    if (totalValueEl) totalValueEl.textContent = `CHF ${totalValue.toLocaleString('de-CH', {maximumFractionDigits: 2})}`;
    if (totalInvestedEl) totalInvestedEl.textContent = `CHF ${totalInvested.toLocaleString('de-CH', {maximumFractionDigits: 2})}`;
    
    if (gainLossEl) {
        gainLossEl.textContent = `CHF ${gainLoss.toLocaleString('de-CH', {maximumFractionDigits: 2})}`;
        gainLossEl.style.color = gainLoss >= 0 ? 'var(--profit-green)' : 'var(--loss-red)';
    }
}

