// State management
let selectedRisk = 'moderate';

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

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
    analyzeBtn.addEventListener('click', handleAnalyze);

    // Enter key on amount input
    const amountInput = document.getElementById('investmentAmount');
    amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAnalyze();
        }
    });
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
        // Call Netlify function instead of direct API
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
    
    // Format the recommendation with proper HTML
    const formattedRecommendation = formatRecommendation(recommendation);
    contentDiv.innerHTML = formattedRecommendation;
    
    resultsCard.classList.remove('hidden');
}

function formatRecommendation(text) {
    // Convert markdown-style formatting to HTML
    let formatted = text;
    
    // Headers (### to h3, ## to h3)
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
