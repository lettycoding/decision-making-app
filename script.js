let criteriaList = [];
let alternativesList = [];
const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41]; // Indices de cohérence aléatoire

function setupComparison() {
    criteriaList = document.getElementById('criteria').value.split(',').map(s => s.trim());
    alternativesList = document.getElementById('alternatives').value.split(',').map(s => s.trim());
    
    if(criteriaList.length < 2) return alert("Veuillez entrer au moins 2 critères.");
    
    let html = `<table><tr><th>Critère A \\ B</th>`;
    criteriaList.forEach(c => html += `<th>${c}</th>`);
    html += `</tr>`;

    criteriaList.forEach((c1, i) => {
        html += `<tr><td><b>${c1}</b></td>`;
        criteriaList.forEach((c2, j) => {
            if(i === j) html += `<td>1</td>`;
            else if(i < j) html += `<td><input type="number" id="m_${i}_${j}" value="1" min="0.1" step="0.1"></td>`;
            else html += `<td id="m_${i}_${j}_inv">1</td>`;
        });
        html += `</tr>`;
    });
    html += `</table>`;
    
    document.getElementById('matrix-container').innerHTML = html;
    document.getElementById('step2').classList.remove('hidden');
}

function processAHP() {
    const n = criteriaList.length;
    let matrix = Array.from({ length: n }, () => new Array(n).fill(1));

    // Remplissage de la matrice
    for(let i=0; i<n; i++) {
        for(let j=0; j<n; j++) {
            if(i < j) {
                let val = parseFloat(document.getElementById(`m_${i}_${j}`).value);
                matrix[i][j] = val;
                matrix[j][i] = 1 / val;
            }
        }
    }

    // Calcul de la priorité 
    let colSums = new Array(n).fill(0);
    for(let j=0; j<n; j++) {
        for(let i=0; i<n; i++) colSums[j] += matrix[i][j];
    }

    let priorities = [];
    for(let i=0; i<n; i++) {
        let rowSum = 0;
        for(let j=0; j<n; j++) rowSum += (matrix[i][j] / colSums[j]);
        priorities.push(rowSum / n);
    }

    // Cohérence 
    let lambdaMax = 0;
    for(let i=0; i<n; i++) lambdaMax += colSums[i] * priorities[i];
    let CI = (lambdaMax - n) / (n - 1);
    let CR = CI / RI[n-1];

    displayResult(CR, priorities);
}

function displayResult(cr, priorities) {
    const resDiv = document.getElementById('result');
    resDiv.classList.remove('hidden');
    
    if(cr <= 0.1) {
        resDiv.innerHTML = `<div class="success">La matrice est cohérente (CR = ${(cr*100).toFixed(2)}%). <br> 
        La meilleure alternative recommandée est : <b>${alternativesList[0]}</b> (simulé).</div>`;
    } else {
        resDiv.innerHTML = `<div class="error">La matrice est incohérente (CR = ${(cr*100).toFixed(2)}%). <br> 
        Raison : Vos préférences sont contradictoires. Veuillez réviser vos scores. </div>`;
    }
}