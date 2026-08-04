// ===================================
// RESET TOTALE SISTEMA
// ===================================

function resetAllData() {
    const confirmMessage = `⚠️ ATTENZIONE: RESET TOTALE SISTEMA ⚠️

Questa azione cancellerà DEFINITIVAMENTE tutti i dati:

• 📊 Desiderata 2026-27 caricati
• 📋 Storico anni precedenti  
• 🎯 Assegnazioni MSL calcolate
• 💾 Tutti i dati salvati nel browser

Il sistema tornerà allo stato iniziale vuoto.

Sei SICURO di voler procedere?`;

    const confirmed = confirm(confirmMessage);
    
    if (!confirmed) {
        console.log('🔄 Reset annullato dall\'utente');
        return;
    }
    
    // Seconda conferma per sicurezza
    const doubleConfirm = confirm('ULTIMA CONFERMA:\n\nStai per cancellare TUTTI i dati.\nQuesta azione NON può essere annullata.\n\nProcedere con il reset totale?');
    
    if (!doubleConfirm) {
        console.log('🔄 Reset annullato alla seconda conferma');
        return;
    }
    
    console.log('🗑️ Avvio reset totale sistema...');
    
    try {
        // 1. Cancella localStorage
        localStorage.removeItem('blasePascalDesiderata');
        localStorage.removeItem('blasePascalHistory');
        console.log('💾 LocalStorage pulito');
        
        // 2. Reset variabili globali
        desiderataData = [];
        historyData = [];
        integratedData = [];
        filteredData = [];
        currentAssignments = [];
        console.log('🔧 Variabili globali resettate');
        
        // 3. Reset interfaccia
        resetAllUI();
        
        // 4. Aggiorna tutto
        updateStats();
        updateMSLDistribution();
        updateDataStatus();
        
        console.log('✅ Reset totale completato');
        alert('✅ Reset totale completato!\n\nIl sistema è ora pulito e pronto per nuovi dati.');
        
    } catch (error) {
        console.error('❌ Errore durante il reset:', error);
        alert('❌ Errore durante il reset. Ricarica la pagina per sicurezza.');
    }
}

function resetAllUI() {
    // Reset selettore docenti
    const teacherSelector = document.getElementById('teacher-selector');
    if (teacherSelector) {
        teacherSelector.innerHTML = '<option value="">-- Seleziona un docente --</option>';
    }
    
    // Reset dettaglio docente
    const detailContent = document.getElementById('teacher-detail-content');
    if (detailContent) {
        detailContent.innerHTML = '<p class="text-center">Seleziona un docente dal menu per visualizzare i dettagli completi</p>';
    }
    
    // Reset lista docenti
    const teachersList = document.getElementById('teachers-list');
    if (teachersList) {
        teachersList.innerHTML = '<p>Carica i dati per visualizzare l\'elenco docenti</p>';
    }
    
    // Reset analisi
    const analysisContent = document.getElementById('analysis-content');
    if (analysisContent) {
        analysisContent.innerHTML = '<p>Carica i dati per visualizzare le analisi</p>';
    }
    
    // Reset assegnazione MSL
    const assignmentResults = document.getElementById('assignment-results');
    if (assignmentResults) assignmentResults.style.display = 'none';

    const assignmentSummary = document.getElementById('assignment-summary-section');
    if (assignmentSummary) assignmentSummary.style.display = 'none';
    
    const assignmentProgress = document.getElementById('assignment-progress');
    if (assignmentProgress) assignmentProgress.style.display = 'none';
    
    const manualEditSection = document.getElementById('manual-edit-section');
    if (manualEditSection) manualEditSection.style.display = 'none';
    
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.disabled = true;
    
    // Reset filtri
    const teacherSearch = document.getElementById('teacher-search');
    if (teacherSearch) teacherSearch.value = '';
    
    const rotationFilter = document.getElementById('rotation-filter');
    if (rotationFilter) rotationFilter.value = '';
    
    console.log('🎨 Interfaccia utente resettata');
}


// ===================================
// AGGIUNTA PER EXPORT TABELLA ASSEGNAZIONI
// ===================================

// Aggiungi questa funzione al file script.js

function exportAssignmentTable() {
    if (currentAssignments.length === 0) {
        alert('❌ Nessuna assegnazione da esportare. Esegui prima l\'assegnazione automatica.');
        return;
    }
    
    console.log('📊 Esportazione tabella assegnazioni...');
    
    // Intestazioni CSV semplici
    const headers = [
        'Cognome',
        'Nome', 
        'Email',
        'Ore_Settimanali',
        'MSL_Assegnato',
        'Prima_Richiesta',
        'Seconda_Richiesta',
        'Terza_Richiesta',
        'Preferenza_Soddisfatta',
        'Fallback_MSL3',
        'Anni_Stesso_MSL',
        'Ultimo_MSL',
        'Forzato_Rotazione',
        'Motivo_Assegnazione',
        'Note_Docente'
    ];
    
    // Righe dati
    const rows = currentAssignments.map(assignment => {
        const teacher = assignment.teacher;
        return [
            teacher.surname || '',
            teacher.name || '',
            teacher.email || '',
            teacher.hours || '',
            assignment.assignedMSL || '',
            assignment.requestedMSL1 || '',
            assignment.requestedMSL2 || '',
            assignment.requestedMSL3 || '',
            assignment.satisfied ? 'SÌ' : 'NO',
            assignment.fallback3 ? 'SÌ' : 'NO',
            teacher.rotationYears || '0',
            teacher.lastMSL || '',
            assignment.rotationForced ? 'SÌ' : 'NO',
            assignment.reason || '',
            teacher.notes || ''
        ];
    });
    
    // Crea CSV
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    // Aggiungi BOM per Excel italiano
    const csvWithBOM = '\uFEFF' + csvContent;
    
    // Nome file con timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const filename = `assegnazioni_MSL_${timestamp}.csv`;
    
    // Download
    downloadFile(csvWithBOM, filename, 'text/csv;charset=utf-8');
    
    // Messaggio di conferma
    alert(`✅ Tabella assegnazioni esportata!\n\nFile: ${filename}\nRighe: ${currentAssignments.length} docenti`);
    
    console.log(`✅ Export completato: ${filename} (${currentAssignments.length} righe)`);
}

// ===================================
// VISUALIZZAZIONE RISULTATI
// ===================================

function displayAssignmentResults() {
    document.getElementById('assignment-results').style.display = 'block';
    document.getElementById('reset-btn').disabled = false;

    const stats = calculateAssignmentStats();
    displayResultsSummary(stats);
    displayAssignmentTable();
    updateAssignmentSummary();

    console.log('📊 Risultati assegnazione visualizzati');
}

function updateAssignmentSummary() {
    const section = document.getElementById('assignment-summary-section');
    if (!section) return;

    if (currentAssignments.length === 0) {
        section.style.display = 'none';
        return;
    }

    const total = currentAssignments.length;
    const satisfied = currentAssignments.filter(a => a.satisfied).length;
    const satisfiedPct = Math.round((satisfied / total) * 100);
    const fallback3 = currentAssignments.filter(a => a.fallback3).length;
    const mustRotateTotal = integratedData.filter(t => t.mustRotate).length;
    const rotationsApplied = currentAssignments.filter(a => a.rotationForced).length;

    const satisfiedColor = satisfiedPct >= 85 ? 'green' : satisfiedPct >= 70 ? 'orange' : 'red';
    const fallback3Color  = fallback3 === 0 ? 'green' : 'orange';
    const rotColor        = rotationsApplied >= mustRotateTotal ? 'green' : 'red';

    document.getElementById('assignment-stats-grid').innerHTML = `
        <div class="stat-card stat-card-green">
            <div class="stat-number">${total}</div>
            <div class="stat-label">Assegnazioni Completate</div>
        </div>
        <div class="stat-card stat-card-${satisfiedColor}">
            <div class="stat-number">${satisfiedPct}%</div>
            <div class="stat-label">Preferenze Soddisfatte</div>
        </div>
        <div class="stat-card stat-card-${fallback3Color}">
            <div class="stat-number">${fallback3}</div>
            <div class="stat-label">Fallback MSL3</div>
        </div>
        <div class="stat-card stat-card-${rotColor}">
            <div class="stat-number">${rotationsApplied}/${mustRotateTotal}</div>
            <div class="stat-label">Rotazioni Applicate</div>
        </div>
    `;

    const dist = {};
    days.forEach(d => dist[d] = 0);
    currentAssignments.forEach(a => { if (a.assignedMSL) dist[a.assignedMSL]++; });

    const mean = total / days.length;
    const container = document.getElementById('assignment-distribution');
    container.innerHTML = '';

    days.forEach(day => {
        const count = dist[day];
        const bar = document.createElement('div');
        bar.className = 'day-bar';
        if (count <= mean)         bar.classList.add('dev-low');
        else if (count <= mean + 1) bar.classList.add('dev-mid');
        else                        bar.classList.add('dev-high');
        bar.innerHTML = `<strong>${day}</strong><br><span style="font-size:1.5em;">${count}</span>`;
        container.appendChild(bar);
    });

    section.style.display = 'block';
}

function calculateAssignmentStats() {
    const totalAssignments = currentAssignments.length;
    const satisfied = currentAssignments.filter(a => a.satisfied).length;
    const fallback3 = currentAssignments.filter(a => a.fallback3).length;
    const rotationForced = currentAssignments.filter(a => a.rotationForced).length;
    const conflicts = currentAssignments.filter(a => !a.satisfied && !a.fallback3 && !a.rotationForced).length;
    
    // Distribuzione per giorni
    const dayDistribution = {};
    days.forEach(day => dayDistribution[day] = 0);
    currentAssignments.forEach(a => dayDistribution[a.assignedMSL]++);
    
    const values = Object.values(dayDistribution);
    const maxLoad = Math.max(...values);
    const minLoad = Math.min(...values);
    const balance = maxLoad - minLoad;

    const capacity = Math.ceil(totalAssignments / days.length);
    const overloadedDays = days
        .filter(day => dayDistribution[day] > capacity + 2)
        .map(day => ({ day, load: dayDistribution[day], capacity }));

    return {
        total: totalAssignments,
        satisfied,
        satisfactionRate: Math.round((satisfied / totalAssignments) * 100),
        fallback3,
        rotationForced,
        conflicts,
        balance,
        dayDistribution,
        overloadedDays
    };
}

function displayResultsSummary(stats) {
    const container = document.getElementById('results-summary');
    
    container.innerHTML = `
        <div class="result-stat success">
            <div class="result-number">${stats.satisfactionRate}%</div>
            <div class="result-label">Preferenze Soddisfatte</div>
        </div>
        <div class="result-stat ${stats.fallback3 > 0 ? 'warning' : 'success'}">
            <div class="result-number">${stats.fallback3}</div>
            <div class="result-label">Assegnati su MSL3</div>
        </div>
        <div class="result-stat ${stats.rotationForced > 0 ? 'warning' : 'success'}">
            <div class="result-number">${stats.rotationForced}</div>
            <div class="result-label">Rotazioni Forzate</div>
        </div>
        <div class="result-stat ${stats.conflicts > 0 ? 'error' : 'success'}">
            <div class="result-number">${stats.conflicts}</div>
            <div class="result-label">Conflitti Rimanenti</div>
        </div>
        <div class="result-stat ${stats.balance <= 2 ? 'success' : stats.balance <= 4 ? 'warning' : 'error'}">
            <div class="result-number">${stats.balance}</div>
            <div class="result-label">Sbilanciamento Max</div>
        </div>
        ${stats.overloadedDays.length > 0 ? `
        <div class="result-stat error" style="grid-column: 1/-1; font-size:0.9em;">
            <div class="result-number">⚠️</div>
            <div class="result-label">
                Giorni sovraccarichi (cap+2 superato):<br>
                ${stats.overloadedDays.map(d => `<strong>${d.day}</strong>: ${d.load} docenti (soglia ${d.capacity + 2})`).join(' &nbsp;|&nbsp; ')}
            </div>
        </div>` : ''}
    `;
}

function displayAssignmentTable() {
    const table = document.getElementById('assignment-table');
    
    const tableHTML = `
        <thead>
            <tr>
                <th>👤 Docente</th>
                <th>🗓️ MSL Assegnato</th>
                <th>📋 Richieste</th>
                <th>🔄 Storico</th>
                <th>✅ Stato</th>
                <th>💭 Motivo</th>
            </tr>
        </thead>
        <tbody>
            ${currentAssignments.map(assignment => createAssignmentRow(assignment)).join('')}
        </tbody>
    `;
    
    table.innerHTML = tableHTML;
}

function createAssignmentRow(assignment) {
    const teacher = assignment.teacher;
    const rowClass = assignment.rotationForced ? 'rotation-forced' :
                     assignment.satisfied      ? 'satisfied'       :
                     assignment.fallback3      ? 'rotation-priority' : 'rotation-priority';

    const statusIcon = assignment.satisfied      ? '✅' :
                       assignment.fallback3       ? '⬇️' :
                       assignment.rotationForced  ? '🔄' : '⚠️';

    const mslParts = [assignment.requestedMSL1, assignment.requestedMSL2]
        .filter((d, i, arr) => d && arr.indexOf(d) === i);
    const requestedMSL = mslParts.join(' / ');
    const msl3Label = assignment.requestedMSL3
        ? `<br><small style="color:#e67e22;">MSL3 fallback: ${assignment.requestedMSL3}</small>`
        : '';

    return `
        <tr class="${rowClass}">
            <td>
                <strong>${teacher.surname} ${teacher.name || ''}</strong><br>
                <small>${teacher.hours || 0}h</small>
            </td>
            <td>
                <span class="msl-badge msl-assigned">${assignment.assignedMSL}</span>
            </td>
            <td>
                ${requestedMSL ? `<span class="msl-badge msl-requested">${requestedMSL}</span>` : 'Non specificato'}
                ${msl3Label}
            </td>
            <td>
                <small>
                    ${teacher.rotationYears || 0} anni<br>
                    Ultimo: ${teacher.lastMSL}
                </small>
            </td>
            <td>
                <span class="status-icon">${statusIcon}</span>
                ${assignment.satisfied     ? 'Soddisfatto'   :
                  assignment.fallback3      ? 'Fallback MSL3' :
                  assignment.rotationForced ? 'Ruotato'       : 'Alternativo'}
            </td>
            <td>
                <small>${assignment.reason}</small>
            </td>
        </tr>
    `;
}

// ===================================
// GESTIONE RISULTATI
// ===================================

function confirmAssignments() {
    if (currentAssignments.length === 0) {
        alert('Nessuna assegnazione da confermare');
        return;
    }
    
    const confirmed = confirm(`Confermi le ${currentAssignments.length} assegnazioni MSL?\n\nQueste diventeranno le assegnazioni ufficiali per l'anno 2026-27.`);
    
    if (confirmed) {
        // Applica le assegnazioni ai dati integrati
        currentAssignments.forEach(assignment => {
            const teacher = integratedData.find(t => getTeacherId(t) === assignment.teacherId);
            if (teacher) {
                teacher.assignedMSL2026 = assignment.assignedMSL;
                teacher.assignmentReason = assignment.reason;
                teacher.assignmentSatisfied = assignment.satisfied;
            }
        });
        
        // Salva i dati
        saveData();
        
        alert('✅ Assegnazioni confermate e salvate!');
        
        // Aggiorna tutte le visualizzazioni
        updateStats();
        updateMSLDistribution();
        if (document.getElementById('teachers').classList.contains('active')) {
            displayTeachers();
        }
        
        console.log('✅ Assegnazioni MSL confermate');
    }
}

function resetAssignments() {
    const confirmed = confirm('Vuoi cancellare i risultati dell\'assegnazione automatica?');
    
    if (confirmed) {
        currentAssignments = [];
        document.getElementById('assignment-results').style.display = 'none';
        document.getElementById('manual-edit-section').style.display = 'none';
        document.getElementById('assignment-summary-section').style.display = 'none';
        document.getElementById('reset-btn').disabled = true;
        
        console.log('🔄 Assegnazioni reset');
    }
}

function showManualEdit() {
    const manualSection = document.getElementById('manual-edit-section');
    const content = document.getElementById('manual-edit-content');

    const total = currentAssignments.length;
    const conflictCount = currentAssignments.filter(a => !a.satisfied && !a.fallback3).length;

    const sorted = [...currentAssignments].sort((a, b) =>
        (a.teacher.surname || '').localeCompare(b.teacher.surname || '', 'it')
    );

    content.innerHTML = `
        <div style="margin-bottom: 16px;">
            <h4>Tutte le assegnazioni (${total} totali, ${conflictCount} da rivedere)</h4>
            <p style="margin-top:4px;color:#666;">Modifica qualsiasi riga. Le righe ⚠️ richiedono attenzione.</p>
        </div>
        <div class="manual-edit-controls">
            <input type="text" id="manual-search" placeholder="🔍 Cerca cognome / nome..."
                   oninput="filterManualEdit()">
            <select id="manual-filter-status" onchange="filterManualEdit()">
                <option value="">Tutti (${total})</option>
                <option value="conflict">⚠️ Solo da rivedere (${conflictCount})</option>
                <option value="ok">✅ Solo già ok (${total - conflictCount})</option>
            </select>
        </div>
        <div id="manual-edit-list">
            ${sorted.map(a => createManualEditItem(a)).join('')}
        </div>
        <div style="text-align:center; margin-top:20px;">
            <button class="btn btn-success" onclick="applyManualChanges()">💾 Applica Modifiche</button>
            <button class="btn btn-secondary" onclick="cancelManualEdit()">❌ Annulla</button>
        </div>
    `;

    manualSection.style.display = 'block';
    manualSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterManualEdit() {
    const search = (document.getElementById('manual-search')?.value || '').toLowerCase();
    const status = document.getElementById('manual-filter-status')?.value || '';
    document.querySelectorAll('.manual-edit-item').forEach(item => {
        const nameMatch = !search || item.dataset.name.includes(search);
        const statusMatch = !status || item.dataset.status === status;
        item.style.display = nameMatch && statusMatch ? '' : 'none';
    });
}

function createManualEditItem(assignment) {
    const teacher = assignment.teacher;
    const itemId = `manual-${assignment.teacherId}`;
    const isConflict = !assignment.satisfied && !assignment.fallback3;
    const statusLabel = isConflict
        ? '<span class="manual-badge manual-badge-conflict">⚠️ Da rivedere</span>'
        : '<span class="manual-badge manual-badge-ok">✅ Ok</span>';
    const msl2part = assignment.requestedMSL2 && assignment.requestedMSL2 !== assignment.requestedMSL1
        ? ` / ${assignment.requestedMSL2}` : '';
    const msl3part = assignment.requestedMSL3 ? ` / ${assignment.requestedMSL3}` : '';

    return `
        <div class="manual-edit-item ${isConflict ? 'manual-edit-item--conflict' : ''}"
             data-name="${(teacher.surname + ' ' + (teacher.name || '')).toLowerCase()}"
             data-status="${isConflict ? 'conflict' : 'ok'}">
            <div class="manual-edit-info">
                <div class="manual-edit-teacher">${teacher.surname} ${teacher.name || ''} ${statusLabel}</div>
                <div class="manual-edit-current">
                    Assegnato: <strong>${assignment.assignedMSL}</strong> &nbsp;|&nbsp;
                    Richieste: ${assignment.requestedMSL1 || 'N/A'}${msl2part}${msl3part}
                </div>
            </div>
            <select class="manual-edit-select" id="${itemId}" data-teacher-id="${assignment.teacherId}">
                ${days.map(day => `
                    <option value="${day}" ${day === assignment.assignedMSL ? 'selected' : ''}>${day}</option>
                `).join('')}
            </select>
        </div>
    `;
}

function applyManualChanges() {
    const selects = document.querySelectorAll('.manual-edit-select');
    let changesCount = 0;
    
    selects.forEach(select => {
        const teacherId = select.dataset.teacherId;
        const newMSL = select.value;
        
        const assignment = currentAssignments.find(a => a.teacherId === teacherId);
        if (assignment && assignment.assignedMSL !== newMSL) {
            assignment.assignedMSL = newMSL;
            assignment.reason = 'Modifica manuale';
            assignment.satisfied = newMSL === assignment.requestedMSL1 || newMSL === assignment.requestedMSL2;
            assignment.fallback3 = !assignment.satisfied &&
                !!(assignment.requestedMSL3 && newMSL === assignment.requestedMSL3);
            changesCount++;
        }
    });
    
    if (changesCount > 0) {
        // Aggiorna visualizzazione
        displayAssignmentResults();
        document.getElementById('manual-edit-section').style.display = 'none';
        alert(`✅ Applicate ${changesCount} modifiche manuali`);
    } else {
        alert('Nessuna modifica da applicare');
    }
}

function cancelManualEdit() {
    document.getElementById('manual-edit-section').style.display = 'none';
}

// ===================================
// EXPORT ASSEGNAZIONI
// ===================================

function exportAssignments() {
    if (currentAssignments.length === 0) {
        alert('Nessuna assegnazione da esportare');
        return;
    }
    
    const stats = calculateAssignmentStats();
    
    // CSV delle assegnazioni
    const headers = [
        'Cognome', 'Nome', 'Email', 'Ore', 'MSL_Assegnato_2026-27',
        'MSL_Richiesto_1', 'MSL_Richiesto_2', 'Preferenza_Soddisfatta', 
        'Anni_Consecutivi_Precedenti', 'Ultimo_MSL', 'Motivo_Assegnazione'
    ];
    
    const rows = currentAssignments.map(assignment => [
        assignment.teacher.surname,
        assignment.teacher.name || '',
        assignment.teacher.email || '',
        assignment.teacher.hours || '',
        assignment.assignedMSL,
        assignment.requestedMSL1 || '',
        assignment.requestedMSL2 || '',
        assignment.satisfied ? 'SI' : 'NO',
        assignment.teacher.rotationYears || 0,
        assignment.teacher.lastMSL || '',
        assignment.reason
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    // Report di accompagnamento
    const report = `REPORT ASSEGNAZIONE MSL 2026-27 - ${new Date().toLocaleDateString('it-IT')}
Blaise Pascal - Reggio Emilia

STATISTICHE GENERALI:
- Totale docenti assegnati: ${stats.total}
- Percentuale preferenze soddisfatte: ${stats.satisfactionRate}%
- Rotazioni forzate (3+ anni stesso MSL): ${stats.rotationForced}
- Conflitti rimanenti: ${stats.conflicts}

DISTRIBUZIONE PER GIORNI:
${Object.entries(stats.dayDistribution).map(([day, count]) => 
    `- ${day}: ${count} docenti`
).join('\n')}

SBILANCIAMENTO: ${stats.balance} (differenza tra giorno più carico e meno carico)

ROTAZIONI EFFETTUATE:
${currentAssignments.filter(a => a.rotationForced).map(a => 
    `- ${a.teacher.surname} ${a.teacher.name || ''}: da ${a.teacher.lastMSL} a ${a.assignedMSL}`
).join('\n') || 'Nessuna rotazione obbligatoria'}

CONFLITTI NON RISOLTI:
${currentAssignments.filter(a => !a.satisfied && !a.rotationForced).map(a => 
    `- ${a.teacher.surname} ${a.teacher.name || ''}: richiesto ${a.requestedMSL1}, assegnato ${a.assignedMSL}`
).join('\n') || 'Tutti i conflitti risolti'}

Report generato automaticamente dal Sistema Gestione Orari
`;
    
    // Download entrambi i file
    downloadFile(csvContent, 'assegnazioni_msl_2026-27.csv', 'text/csv');
    downloadFile(report, 'report_assegnazioni_msl_2026-27.txt', 'text/plain');
    
    console.log('📄 Export assegnazioni completato');
}

// ===================================
// ASSEGNAZIONE AUTOMATICA MSL
// ===================================

function checkAssignmentReadiness() {
    const assignmentSection = document.getElementById('assignment-results');
    const progressSection = document.getElementById('assignment-progress');
    const manualSection = document.getElementById('manual-edit-section');
    
    if (assignmentSection) assignmentSection.style.display = 'none';
    if (progressSection) progressSection.style.display = 'none';
    if (manualSection) manualSection.style.display = 'none';
    
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.disabled = currentAssignments.length === 0;
}

async function runAssignmentAlgorithm() {
    if (integratedData.length === 0) {
        alert('Carica prima i dati per procedere con l\'assegnazione automatica');
        return;
    }
    
    const algorithm = document.querySelector('input[name="algorithm"]:checked').value;
    console.log(`🎯 Avvio algoritmo: ${algorithm}`);
    
    // Mostra progress
    showProgress();
    
    try {
        if (algorithm === 'greedy') {
            currentAssignments = await runGreedyAlgorithm();
        } else {
            currentAssignments = await runSimulatedAnnealingAlgorithm();
        }
        
        hideProgress();
        displayAssignmentResults();
        
    } catch (error) {
        console.error('❌ Errore nell\'algoritmo:', error);
        hideProgress();
        alert('Errore durante l\'elaborazione. Riprova.');
    }
}

function showProgress() {
    document.getElementById('assignment-progress').style.display = 'block';
    document.getElementById('assignment-results').style.display = 'none';
    updateProgress(0, 'Inizializzazione algoritmo...');
}

function hideProgress() {
    document.getElementById('assignment-progress').style.display = 'none';
}

function updateProgress(percentage, text) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = text;
}

// ===================================
// ALGORITMO GREEDY
// ===================================

async function runGreedyAlgorithm() {
    console.log('⚡ Avvio Algoritmo Greedy');
    updateProgress(10, 'Preparazione dati...');
    
    // Preparazione
    const teachers = integratedData.filter(t => t.hasDesiderata);
    const assignments = [];
    const dayCapacity = calculateDayCapacity();
    
    updateProgress(20, 'Analisi rotazioni obbligatorie...');
    
    // FASE 1: Rotazioni obbligatorie
    const mustRotateTeachers = teachers.filter(t => t.mustRotate);
    for (const teacher of mustRotateTeachers) {
        const assignment = handleForcedRotation(teacher, assignments, dayCapacity);
        assignments.push(assignment);
    }
    
    updateProgress(40, 'Assegnazione preferenze...');
    
    // FASE 2: Docenti con una sola preferenza (meno flessibili)
    const singlePreferenceTeachers = teachers.filter(t => 
        !t.mustRotate && t.msl1 === t.msl2 && t.msl1
    ).sort((a, b) => (b.rotationYears || 0) - (a.rotationYears || 0)); // Priorità più anni
    
    for (const teacher of singlePreferenceTeachers) {
        const assignment = assignPreferredMSL(teacher, assignments, dayCapacity);
        assignments.push(assignment);
    }
    
    updateProgress(60, 'Bilanciamento docenti flessibili...');
    
    // FASE 3: Docenti flessibili (MSL1 ≠ MSL2)
    const flexibleTeachers = teachers.filter(t => 
        !t.mustRotate && t.msl1 !== t.msl2 && t.msl1 && t.msl2
    ).sort((a, b) => (b.rotationYears || 0) - (a.rotationYears || 0));
    
    for (const teacher of flexibleTeachers) {
        const assignment = assignFlexibleMSL(teacher, assignments, dayCapacity);
        assignments.push(assignment);
    }
    
    updateProgress(80, 'Assegnazione rimanenti...');
    
    // FASE 4: Docenti rimanenti (solo MSL1 o nessuna preferenza)
    const remainingTeachers = teachers.filter(t => 
        !assignments.find(a => a.teacherId === getTeacherId(t))
    );
    
    for (const teacher of remainingTeachers) {
        const assignment = assignRemainingMSL(teacher, assignments, dayCapacity);
        assignments.push(assignment);
    }
    
    updateProgress(100, 'Completato!');
    
    // Simula delay per UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ Algoritmo Greedy completato: ${assignments.length} assegnazioni`);
    return assignments;
}

// ===================================
// ALGORITMO SIMULATED ANNEALING (CORRETTO)
// ===================================

async function runSimulatedAnnealingAlgorithm() {
    console.log('🧠 Avvio Simulated Annealing (Versione Corretta)');
    
    // Preparazione dati
    const teachers = integratedData.filter(t => t.hasDesiderata);
    if (teachers.length === 0) {
        throw new Error('Nessun docente con desiderata trovato');
    }
    
    updateProgress(10, 'Generazione soluzione iniziale...');
    
    // STEP 1: Genera soluzione iniziale SEMPLICE (non Greedy per evitare confusione)
    let currentSolution = generateInitialSolution(teachers);
    let bestSolution = deepCopySolution(currentSolution);
    
    updateProgress(20, 'Calcolo parametri ottimizzazione...');
    
    // STEP 2: Parametri ottimizzati
    const maxIterations = Math.min(2000, teachers.length * 50); // Proporzionale al numero docenti
    const initialTemp = calculateInitialTemperature(currentSolution, teachers);
    const finalTemp = 0.01;
    const coolingRate = Math.pow(finalTemp / initialTemp, 1 / maxIterations);
    
    let temperature = initialTemp;
    let currentCost = calculateSolutionCost(currentSolution);
    let bestCost = currentCost;
    
    // Per early stopping
    let iterationsWithoutImprovement = 0;
    const maxIterationsWithoutImprovement = Math.floor(maxIterations * 0.2);
    
    console.log(`🔧 Parametri SA: temp=${initialTemp.toFixed(2)}, cooling=${coolingRate.toFixed(6)}, max_iter=${maxIterations}`);
    
    updateProgress(25, 'Ottimizzazione in corso...');
    
    // STEP 3: Loop principale Simulated Annealing
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        // Aggiorna progress ogni 50 iterazioni
        if (iteration % 50 === 0) {
            const progress = 25 + (iteration / maxIterations) * 70;
            updateProgress(progress, `Ottimizzazione: ${iteration}/${maxIterations} (T=${temperature.toFixed(2)})`);
            await new Promise(resolve => setTimeout(resolve, 5)); // Non bloccare UI
        }
        
        // Genera soluzione vicina
        const newSolution = generateNeighborSolutionImproved(currentSolution, teachers);
        const newCost = calculateSolutionCost(newSolution);
        
        // Calcola probabilità di accettazione
        const acceptanceProbability = newCost < currentCost ? 1.0 : 
            Math.exp(-(newCost - currentCost) / temperature);
        
        // Accetta la nuova soluzione?
        if (Math.random() < acceptanceProbability) {
            currentSolution = newSolution;
            currentCost = newCost;
            
            // Aggiorna migliore soluzione
            if (newCost < bestCost) {
                bestSolution = deepCopySolution(newSolution);
                bestCost = newCost;
                iterationsWithoutImprovement = 0;
                console.log(`🔥 Nuova migliore soluzione: costo ${bestCost.toFixed(2)} (iter ${iteration})`);
            } else {
                iterationsWithoutImprovement++;
            }
        } else {
            iterationsWithoutImprovement++;
        }
        
        // Early stopping se non migliora da troppo
        if (iterationsWithoutImprovement > maxIterationsWithoutImprovement) {
            console.log(`⏹️ Early stopping: ${iterationsWithoutImprovement} iterazioni senza miglioramento`);
            break;
        }
        
        // Raffredda temperatura
        temperature *= coolingRate;
        
        // Controllo temperatura minima
        if (temperature < finalTemp) {
            console.log(`❄️ Temperatura minima raggiunta: ${temperature.toFixed(4)}`);
            break;
        }
    }
    
    updateProgress(95, 'Finalizzazione ottimizzazione...');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    updateProgress(100, 'Ottimizzazione completata!');
    
    console.log(`✅ Simulated Annealing completato: costo finale ${bestCost.toFixed(2)}`);
    return bestSolution;
}

// ===================================
// FUNZIONI DI SUPPORTO SA (CORRETTE)
// ===================================

function generateInitialSolution(teachers) {
    console.log('🎲 Generazione soluzione iniziale casuale bilanciata');
    
    const assignments = [];
    const dayLoads = {};
    days.forEach(day => dayLoads[day] = 0);
    
    // Prima passa: rotazioni obbligatorie
    const mustRotateTeachers = teachers.filter(t => t.mustRotate);
    for (const teacher of mustRotateTeachers) {
        const assignment = handleForcedRotation(teacher, assignments, {});
        assignments.push(assignment);
        dayLoads[assignment.assignedMSL]++;
    }
    
    // Seconda passa: altri docenti con distribuzione casuale bilanciata
    const remainingTeachers = teachers.filter(t => !t.mustRotate);
    
    for (const teacher of remainingTeachers) {
        let assignedMSL;
        
        // 70% probabilità di assegnare una preferenza se disponibile
        if (Math.random() < 0.7 && teacher.msl1) {
            const options = [teacher.msl1];
            if (teacher.msl2 && teacher.msl2 !== teacher.msl1) {
                options.push(teacher.msl2);
            }
            assignedMSL = options[Math.floor(Math.random() * options.length)];
        } else {
            // 30% assegnazione completamente casuale per diversificare
            assignedMSL = days[Math.floor(Math.random() * days.length)];
        }
        
        const assignment = {
            teacherId: getTeacherId(teacher),
            teacher,
            assignedMSL,
            requestedMSL1: teacher.msl1,
            requestedMSL2: teacher.msl2,
            requestedMSL3: teacher.msl3 || '',
            reason: 'Soluzione iniziale SA',
            satisfied: assignedMSL === teacher.msl1 || assignedMSL === teacher.msl2,
            fallback3: false,
            rotationForced: false
        };
        
        assignments.push(assignment);
        dayLoads[assignedMSL]++;
    }
    
    console.log(`🎲 Soluzione iniziale: ${assignments.length} assegnazioni, distribuzione:`, dayLoads);
    return assignments;
}

function calculateInitialTemperature(initialSolution, teachers) {
    // Calcola temperatura iniziale basata sui costi tipici del problema
    const sampleCosts = [];
    
    // Genera 20 soluzioni casuali per stimare la varianza dei costi
    for (let i = 0; i < 20; i++) {
        const randomSolution = generateInitialSolution(teachers);
        sampleCosts.push(calculateSolutionCost(randomSolution));
    }
    
    const avgCost = sampleCosts.reduce((a, b) => a + b, 0) / sampleCosts.length;
    const variance = sampleCosts.reduce((acc, cost) => acc + Math.pow(cost - avgCost, 2), 0) / sampleCosts.length;
    const stdDev = Math.sqrt(variance);
    
    // Temperatura iniziale = deviazione standard * fattore
    // Questo permette di accettare soluzioni peggiori di ~1 deviazione standard all'inizio
    const initialTemp = stdDev * 2;
    
    console.log(`🌡️ Temperatura calcolata: ${initialTemp.toFixed(2)} (avg=${avgCost.toFixed(2)}, std=${stdDev.toFixed(2)})`);
    return Math.max(initialTemp, 1.0); // Minimo 1.0 per evitare temperature troppo basse
}

function generateNeighborSolutionImproved(solution, teachers) {
    const newSolution = deepCopySolution(solution);
    
    // Strategia casuale tra diverse mosse
    const strategy = Math.random();
    
    if (strategy < 0.4) {
        // STRATEGIA 1: Scambia due docenti NON in rotazione forzata (40%)
        return swapTwoAssignments(newSolution);
    } else if (strategy < 0.7) {
        // STRATEGIA 2: Sposta un docente flessibile su una delle sue preferenze (30%)
        return moveFlexibleTeacher(newSolution);
    } else if (strategy < 0.9) {
        // STRATEGIA 3: Bilancia giorni sovraccarichi (20%)
        return balanceOverloadedDays(newSolution);
    } else {
        // STRATEGIA 4: Mossa casuale per esplorazione (10%)
        return randomMoveTeacher(newSolution);
    }
}

function swapTwoAssignments(solution) {
    const flexibleAssignments = solution.filter(a => !a.rotationForced);
    if (flexibleAssignments.length < 2) return solution;
    
    // Scegli due assegnazioni casuali
    const idx1 = Math.floor(Math.random() * flexibleAssignments.length);
    let idx2 = Math.floor(Math.random() * flexibleAssignments.length);
    while (idx2 === idx1 && flexibleAssignments.length > 1) {
        idx2 = Math.floor(Math.random() * flexibleAssignments.length);
    }
    
    if (idx1 === idx2) return solution;
    
    // Trova gli indici nella soluzione originale
    const originalIdx1 = solution.findIndex(a => a.teacherId === flexibleAssignments[idx1].teacherId);
    const originalIdx2 = solution.findIndex(a => a.teacherId === flexibleAssignments[idx2].teacherId);
    
    // Scambia le assegnazioni
    const temp = solution[originalIdx1].assignedMSL;
    solution[originalIdx1].assignedMSL = solution[originalIdx2].assignedMSL;
    solution[originalIdx2].assignedMSL = temp;
    
    // Aggiorna satisfaction
    updateAssignmentSatisfaction(solution[originalIdx1]);
    updateAssignmentSatisfaction(solution[originalIdx2]);
    
    return solution;
}

function moveFlexibleTeacher(solution) {
    // Trova docenti flessibili (con MSL1 ≠ MSL2)
    const flexibleTeachers = solution.filter(a => 
        !a.rotationForced && 
        a.requestedMSL1 && a.requestedMSL2 && 
        a.requestedMSL1 !== a.requestedMSL2
    );
    
    if (flexibleTeachers.length === 0) return solution;
    
    const randomTeacher = flexibleTeachers[Math.floor(Math.random() * flexibleTeachers.length)];
    const teacherIdx = solution.findIndex(a => a.teacherId === randomTeacher.teacherId);
    
    // Sposta sulla sua preferenza alternativa
    const currentMSL = solution[teacherIdx].assignedMSL;
    const cap = calculateDayCapacity();
    const load1 = solution.filter(a => a.assignedMSL === randomTeacher.requestedMSL1).length;
    const load2 = solution.filter(a => a.assignedMSL === randomTeacher.requestedMSL2).length;
    const bothSaturated = load1 >= (cap[randomTeacher.requestedMSL1] || 999) &&
                          load2 >= (cap[randomTeacher.requestedMSL2] || 999);

    let newMSL;
    if (currentMSL === randomTeacher.requestedMSL1) {
        newMSL = randomTeacher.requestedMSL2;
    } else if (currentMSL === randomTeacher.requestedMSL2) {
        newMSL = randomTeacher.requestedMSL1;
    } else if (bothSaturated && randomTeacher.requestedMSL3) {
        // msl1/msl2 entrambi saturi: prova msl3
        newMSL = randomTeacher.requestedMSL3;
    } else {
        newMSL = Math.random() < 0.5 ? randomTeacher.requestedMSL1 : randomTeacher.requestedMSL2;
    }
    
    solution[teacherIdx].assignedMSL = newMSL;
    updateAssignmentSatisfaction(solution[teacherIdx]);
    
    return solution;
}

function balanceOverloadedDays(solution) {
    // Calcola distribuzione attuale
    const dayLoads = {};
    days.forEach(day => dayLoads[day] = 0);
    solution.forEach(a => dayLoads[a.assignedMSL]++);
    
    // Trova giorno più carico e meno carico
    const maxDay = Object.keys(dayLoads).reduce((a, b) => dayLoads[a] > dayLoads[b] ? a : b);
    const minDay = Object.keys(dayLoads).reduce((a, b) => dayLoads[a] < dayLoads[b] ? a : b);
    
    if (dayLoads[maxDay] - dayLoads[minDay] <= 1) return solution; // Già bilanciato
    
    // Trova un docente flessibile da spostare dal giorno più carico al meno carico
    const candidatesFromMax = solution.filter(a => 
        !a.rotationForced && 
        a.assignedMSL === maxDay &&
        (a.requestedMSL1 === minDay || a.requestedMSL2 === minDay || a.requestedMSL3 === minDay || (!a.requestedMSL1 && !a.requestedMSL2))
    );
    
    if (candidatesFromMax.length > 0) {
        const candidate = candidatesFromMax[Math.floor(Math.random() * candidatesFromMax.length)];
        const candidateIdx = solution.findIndex(a => a.teacherId === candidate.teacherId);
        solution[candidateIdx].assignedMSL = minDay;
        updateAssignmentSatisfaction(solution[candidateIdx]);
    }
    
    return solution;
}

function randomMoveTeacher(solution) {
    const flexibleAssignments = solution.filter(a => !a.rotationForced);
    if (flexibleAssignments.length === 0) return solution;
    
    const randomAssignment = flexibleAssignments[Math.floor(Math.random() * flexibleAssignments.length)];
    const assignmentIdx = solution.findIndex(a => a.teacherId === randomAssignment.teacherId);
    
    // Assegna un giorno completamente casuale
    const newMSL = days[Math.floor(Math.random() * days.length)];
    solution[assignmentIdx].assignedMSL = newMSL;
    updateAssignmentSatisfaction(solution[assignmentIdx]);
    
    return solution;
}

function updateAssignmentSatisfaction(assignment) {
    assignment.satisfied = assignment.assignedMSL === assignment.requestedMSL1 ||
                           assignment.assignedMSL === assignment.requestedMSL2;
    assignment.fallback3 = !assignment.satisfied &&
                           !!(assignment.requestedMSL3 && assignment.assignedMSL === assignment.requestedMSL3);
    assignment.reason = assignment.satisfied ? 'Preferenza soddisfatta SA'
                      : assignment.fallback3  ? 'Fallback MSL3 SA'
                      : 'Assegnazione SA';
}

function deepCopySolution(solution) {
    // Deep copy usando JSON (funziona per questo caso d'uso)
    return JSON.parse(JSON.stringify(solution));
}

function calculateSolutionCost(solution) {
    let cost = 0;
    
    // COSTO 1: Preferenze non soddisfatte
    // hard = né msl1 né msl2 né msl3; soft = fallback msl3 accettato ma non preferito
    const unsatisfiedHard = solution.filter(a => !a.satisfied && !a.fallback3).length;
    const fallback3Count  = solution.filter(a => a.fallback3).length;
    cost += unsatisfiedHard * 100;
    cost += fallback3Count  * 30;
    
    // COSTO 2: Sbilanciamento giorni (peso medio)
    const dayDistribution = {};
    days.forEach(day => dayDistribution[day] = 0);
    solution.forEach(a => dayDistribution[a.assignedMSL]++);
    
    const values = Object.values(dayDistribution);
    const maxLoad = Math.max(...values);
    const minLoad = Math.min(...values);
    const imbalancePenalty = Math.pow(maxLoad - minLoad, 2) * 50;
    cost += imbalancePenalty;
    
    // COSTO 3: Rotazioni mancate (peso altissimo)
    let missedRotations = 0;
    solution.forEach(assignment => {
        if (!assignment.rotationForced && assignment.teacher.rotationYears >= 3) {
            if (assignment.assignedMSL === assignment.teacher.lastMSL) {
                missedRotations++;
            }
        }
    });
    const rotationPenalty = missedRotations * 500; // Penalità molto alta
    cost += rotationPenalty;
    
    // COSTO 4: Variance giorni (per distribuzione uniforme)
    if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
        cost += variance * 25;
    }
    
    return cost;
}

// ===================================
// FUNZIONI DI SUPPORTO ALGORITMI
// ===================================

function calculateDayCapacity() {
    const teachersWithDesiderata = integratedData.filter(t => t.hasDesiderata).length;
    const capacity = Math.ceil(teachersWithDesiderata / days.length);
    
    // Calcola capacità ideale per ogni giorno
    const dayCapacity = {};
    days.forEach(day => {
        dayCapacity[day] = capacity;
    });
    
    return dayCapacity;
}

function getTeacherId(teacher) {
    return `${teacher.surname}_${teacher.name || ''}`.toLowerCase().replace(/\s+/g, '');
}

function handleForcedRotation(teacher, currentAssignments, dayCapacity) {
    const teacherId = getTeacherId(teacher);
    const lastMSL = teacher.lastMSL;

    const availableDays = days.filter(day => day !== lastMSL);

    const msl2Ok = teacher.msl2 && teacher.msl2 !== lastMSL;
    const msl1Ok = teacher.msl1 && teacher.msl1 !== lastMSL;

    let assignedMSL, fallback3 = false;
    if (msl2Ok) {
        assignedMSL = teacher.msl2;
    } else if (msl1Ok) {
        assignedMSL = teacher.msl1;
    } else if (teacher.msl3 && teacher.msl3 !== lastMSL) {
        assignedMSL = teacher.msl3;
        fallback3 = true;
    } else {
        assignedMSL = findLeastLoadedDay(availableDays, currentAssignments);
    }

    return {
        teacherId,
        teacher,
        assignedMSL,
        requestedMSL1: teacher.msl1,
        requestedMSL2: teacher.msl2,
        requestedMSL3: teacher.msl3 || '',
        reason: fallback3 ? 'Rotazione obbligatoria (fallback MSL3)' : 'Rotazione obbligatoria',
        satisfied: assignedMSL === teacher.msl1 || assignedMSL === teacher.msl2,
        fallback3,
        rotationForced: true
    };
}

function assignPreferredMSL(teacher, currentAssignments, dayCapacity) {
    const teacherId = getTeacherId(teacher);
    const preferredMSL = teacher.msl1; // msl1 === msl2 in questa fase

    const load1 = currentAssignments.filter(a => a.assignedMSL === preferredMSL).length;
    const cap1 = dayCapacity[preferredMSL] || 999;

    let assignedMSL, fallback3 = false, reason;
    if (load1 < cap1) {
        assignedMSL = preferredMSL;
        reason = 'Preferenza soddisfatta';
    } else if (teacher.msl3) {
        const load3 = currentAssignments.filter(a => a.assignedMSL === teacher.msl3).length;
        const cap3 = dayCapacity[teacher.msl3] || 999;
        if (load3 < cap3) {
            assignedMSL = teacher.msl3;
            fallback3 = true;
            reason = 'Giorno pieno — fallback MSL3';
        } else {
            assignedMSL = findLeastLoadedDay(days, currentAssignments);
            reason = 'Tutte le preferenze piene';
        }
    } else {
        assignedMSL = findLeastLoadedDay(days, currentAssignments);
        reason = 'Giorno pieno, assegnato alternativo';
    }

    return {
        teacherId,
        teacher,
        assignedMSL,
        requestedMSL1: teacher.msl1,
        requestedMSL2: teacher.msl2,
        requestedMSL3: teacher.msl3 || '',
        reason,
        satisfied: assignedMSL === teacher.msl1,
        fallback3,
        rotationForced: false
    };
}

function assignFlexibleMSL(teacher, currentAssignments, dayCapacity) {
    const teacherId = getTeacherId(teacher);

    const load1 = currentAssignments.filter(a => a.assignedMSL === teacher.msl1).length;
    const load2 = currentAssignments.filter(a => a.assignedMSL === teacher.msl2).length;
    const cap1 = dayCapacity[teacher.msl1] || 999;
    const cap2 = dayCapacity[teacher.msl2] || 999;

    let assignedMSL, fallback3 = false, reason;

    if (load1 < cap1 && load2 < cap2) {
        // Entrambe disponibili: bilancia come prima (MSL1 se non più carico di MSL2)
        if (load1 <= load2) {
            assignedMSL = teacher.msl1;
            reason = 'Prima preferenza disponibile';
        } else {
            assignedMSL = teacher.msl2;
            reason = 'Seconda preferenza per bilanciamento';
        }
    } else if (load1 < cap1) {
        assignedMSL = teacher.msl1;
        reason = 'Prima preferenza disponibile';
    } else if (load2 < cap2) {
        assignedMSL = teacher.msl2;
        reason = 'Seconda preferenza per bilanciamento';
    } else if (teacher.msl3) {
        const load3 = currentAssignments.filter(a => a.assignedMSL === teacher.msl3).length;
        const cap3 = dayCapacity[teacher.msl3] || 999;
        if (load3 < cap3) {
            assignedMSL = teacher.msl3;
            fallback3 = true;
            reason = 'MSL1/MSL2 saturi — fallback MSL3';
        } else {
            assignedMSL = findLeastLoadedDay(days, currentAssignments);
            reason = 'Tutte le preferenze sature';
        }
    } else {
        assignedMSL = findLeastLoadedDay(days, currentAssignments);
        reason = 'Entrambe le preferenze piene';
    }

    return {
        teacherId,
        teacher,
        assignedMSL,
        requestedMSL1: teacher.msl1,
        requestedMSL2: teacher.msl2,
        requestedMSL3: teacher.msl3 || '',
        reason,
        satisfied: assignedMSL === teacher.msl1 || assignedMSL === teacher.msl2,
        fallback3,
        rotationForced: false
    };
}

function assignRemainingMSL(teacher, currentAssignments, dayCapacity) {
    const teacherId = getTeacherId(teacher);

    let assignedMSL, fallback3 = false, reason;

    if (teacher.msl1) {
        const load1 = currentAssignments.filter(a => a.assignedMSL === teacher.msl1).length;
        const cap1 = dayCapacity[teacher.msl1] || 999;

        if (load1 < cap1) {
            assignedMSL = teacher.msl1;
            reason = 'Assegnazione preferenza';
        } else if (teacher.msl3) {
            const load3 = currentAssignments.filter(a => a.assignedMSL === teacher.msl3).length;
            const cap3 = dayCapacity[teacher.msl3] || 999;
            if (load3 < cap3) {
                assignedMSL = teacher.msl3;
                fallback3 = true;
                reason = 'MSL1 saturo — fallback MSL3';
            } else {
                assignedMSL = findLeastLoadedDay(days, currentAssignments);
                reason = 'Tutte le preferenze sature';
            }
        } else {
            assignedMSL = findLeastLoadedDay(days, currentAssignments);
            reason = 'Giorno pieno, assegnazione automatica';
        }
    } else {
        assignedMSL = findLeastLoadedDay(days, currentAssignments);
        reason = 'Assegnazione automatica';
    }

    return {
        teacherId,
        teacher,
        assignedMSL,
        requestedMSL1: teacher.msl1,
        requestedMSL2: teacher.msl2,
        requestedMSL3: teacher.msl3 || '',
        reason,
        satisfied: assignedMSL === teacher.msl1,
        fallback3,
        rotationForced: false
    };
}

function findLeastLoadedDay(availableDays, currentAssignments) {
    const dayLoads = {};
    availableDays.forEach(day => {
        dayLoads[day] = currentAssignments.filter(a => a.assignedMSL === day).length;
    });
    
    return Object.keys(dayLoads).reduce((a, b) => dayLoads[a] < dayLoads[b] ? a : b);
}

// ===================================
// SIMULATED ANNEALING - FUNZIONI SUPPORTO (RIMOSSE VECCHIE)
// ===================================

// Le vecchie funzioni generateNeighborSolution e calculateSolutionCost 
// sono state sostituite dalle versioni migliorate sopra

// ===================================
// DETTAGLIO DOCENTE
// ===================================

function populateTeacherSelector() {
    const selector = document.getElementById('teacher-selector');
    if (!selector) return;
    
    // Pulisci opzioni esistenti (tranne la prima)
    selector.innerHTML = '<option value="">-- Seleziona un docente --</option>';
    
    if (integratedData.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Carica i dati per vedere i docenti';
        option.disabled = true;
        selector.appendChild(option);
        return;
    }
    
    // Ordina docenti per cognome
    const sortedTeachers = [...integratedData].sort((a, b) => 
        a.surname.localeCompare(b.surname)
    );
    
    sortedTeachers.forEach((teacher, index) => {
        const option = document.createElement('option');
        option.value = index;
        const fullName = `${teacher.surname} ${teacher.name || ''}`.trim();
        const status = teacher.mustRotate ? ' 🔄' : teacher.rotationYears >= 2 ? ' ⚠️' : '';
        option.textContent = `${fullName}${status}`;
        selector.appendChild(option);
    });
    
    console.log(`🔍 Popolato selettore con ${sortedTeachers.length} docenti`);
}

function showTeacherDetail() {
    const selector = document.getElementById('teacher-selector');
    const selectedIndex = selector.value;
    
    if (!selectedIndex) {
        document.getElementById('teacher-detail-content').innerHTML = 
            '<p class="text-center">Seleziona un docente dal menu per visualizzare i dettagli completi</p>';
        return;
    }
    
    const sortedTeachers = [...integratedData].sort((a, b) => 
        a.surname.localeCompare(b.surname)
    );
    
    const teacher = sortedTeachers[selectedIndex];
    if (!teacher) return;
    
    displayTeacherDetailCard(teacher);
    console.log(`🔍 Visualizzato dettaglio per: ${teacher.surname}`);
}

function displayTeacherDetailCard(teacher) {
    const container = document.getElementById('teacher-detail-content');
    
    const fullName = `${teacher.surname} ${teacher.name || ''}`.trim();
    const badges = generateTeacherBadges(teacher);
    const suggestions = generateTeacherSuggestions(teacher);
    
    container.innerHTML = `
        <div class="teacher-detail-card">
            <div class="teacher-detail-header">
                <div class="teacher-detail-name">${fullName}</div>
                <div class="teacher-detail-subtitle">
                    ${teacher.email || 'Email non disponibile'}
                </div>
                <div>
                    ${badges.map(badge => 
                        `<span class="badge-large ${badge.class}">${badge.text}</span>`
                    ).join('')}
                </div>
            </div>
            
            <div class="detail-grid">
                <!-- Informazioni Base -->
                <div class="detail-section">
                    <h4>📋 Informazioni Base</h4>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Ore settimanali:</span>
                        <span class="detail-info-value">${teacher.hours || 'N/A'}</span>
                    </div>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Ha compilato desiderata:</span>
                        <span class="detail-info-value">${teacher.hasDesiderata ? '✅ Sì' : '❌ No'}</span>
                    </div>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Presente nello storico:</span>
                        <span class="detail-info-value">${teacher.hasHistory ? '✅ Sì' : '❌ No'}</span>
                    </div>
                </div>
                
                <!-- MSL Desiderati -->
                ${teacher.hasDesiderata ? `
                <div class="detail-section">
                    <h4>🗓️ MSL Desiderati 2026-27</h4>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Prima scelta:</span>
                        <span class="detail-info-value">${teacher.msl1 || 'Non specificato'}</span>
                    </div>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Seconda scelta:</span>
                        <span class="detail-info-value">${teacher.msl2 || 'Non specificato'}</span>
                    </div>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Terza scelta (fallback):</span>
                        <span class="detail-info-value">${teacher.msl3 || 'Non specificato'}</span>
                    </div>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Flessibilità:</span>
                        <span class="detail-info-value">
                            ${teacher.msl1 !== teacher.msl2 && teacher.msl1 && teacher.msl2 ? 
                                '✅ Flessibile (due opzioni diverse)' : 
                                '⚠️ Una sola preferenza'
                            }
                        </span>
                    </div>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Preferenza orario:</span>
                        <span class="detail-info-value">${teacher.schedulePreference || 'Non specificato'}</span>
                    </div>
                </div>
                ` : ''}
                
                <!-- Storico MSL -->
                ${teacher.hasHistory ? `
                <div class="detail-section ${teacher.mustRotate ? 'danger' : teacher.rotationYears >= 2 ? 'warning' : 'success'}">
                    <h4>📅 Storico MSL Assegnati</h4>
                    <div class="history-timeline">
                        ${generateHistoryTimeline(teacher)}
                    </div>
                    <div class="detail-info-item" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                        <span class="detail-info-label">Anni consecutivi stesso MSL:</span>
                        <span class="detail-info-value">
                            <strong>${teacher.rotationYears || 0}</strong>
                            ${teacher.mustRotate ? ' 🚨 DEVE RUOTARE' : 
                              teacher.rotationYears >= 2 ? ' ⚠️ PRIORITÀ ROTAZIONE' : 
                              ' ✅ OK'}
                        </span>
                    </div>
                </div>
                ` : ''}
                
                <!-- Ore Non Desiderate -->
                ${teacher.unwantedHours && Object.keys(teacher.unwantedHours).length > 0 ? `
                <div class="detail-section">
                    <h4>⛔ Ore NON Desiderate</h4>
                    <div class="unwanted-hours-grid">
                        ${Object.entries(teacher.unwantedHours).map(([day, hours]) => `
                            <div class="unwanted-day">
                                <div class="unwanted-day-name">${day}</div>
                                <div class="unwanted-hours-list">${hours.join(', ')}ª ora</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Note -->
                ${teacher.notes ? `
                <div class="detail-section">
                    <h4>📝 Note</h4>
                    <p style="margin: 0; color: #495057; line-height: 1.6;">${teacher.notes}</p>
                </div>
                ` : ''}

                ${(teacher.matchWarning || (teacher.warnings && teacher.warnings.length > 0)) ? `
                <div class="detail-section" style="border-left: 4px solid #e67e22;">
                    <h4>⚠️ Avvisi</h4>
                    ${teacher.matchWarning ? `<p style="color:#e67e22;margin:0 0 8px 0;">🔗 ${teacher.matchWarning}</p>` : ''}
                    ${(teacher.warnings || []).map(w => `<p style="color:#856404;margin:0 0 4px 0;">• ${w}</p>`).join('')}
                </div>
                ` : ''}

                <!-- Suggerimenti -->
                ${suggestions.length > 0 ? `
                <div class="detail-section">
                    <h4>💡 Suggerimenti</h4>
                    <ul class="suggestions-list">
                        ${suggestions.map(suggestion => `
                            <li class="${suggestion.priority}">
                                ${suggestion.text}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateTeacherBadges(teacher) {
    const badges = [];
    
    if (!teacher.hasDesiderata) {
        badges.push({
            text: '❌ Senza Desiderata',
            class: 'badge-missing-data'
        });
    }
    
    if (teacher.mustRotate) {
        badges.push({
            text: '🔄 Deve Ruotare',
            class: 'badge-rotation-needed'
        });
    } else if (teacher.rotationYears >= 2) {
        badges.push({
            text: '⚠️ Priorità Rotazione',
            class: 'badge-rotation-priority'
        });
    } else {
        badges.push({
            text: '✅ Rotazione OK',
            class: 'badge-rotation-ok'
        });
    }
    
    if (teacher.msl1 !== teacher.msl2 && teacher.msl1 && teacher.msl2) {
        badges.push({
            text: '🔀 Flessibile',
            class: 'badge-flexible'
        });
    }
    
    return badges;
}

function generateHistoryTimeline(teacher) {
    const historyItems = [];
    
    if (teacher.history) {
        if (teacher.history.year2025) {
            historyItems.push({
                year: '2025-26',
                msl: teacher.history.year2025,
                current: true,
                problematic: teacher.mustRotate
            });
        }

        if (teacher.history.year2024) {
            historyItems.push({
                year: '2024-25',
                msl: teacher.history.year2024,
                current: false,
                problematic: false
            });
        }

        if (teacher.history.year2023) {
            historyItems.push({
                year: '2023-24',
                msl: teacher.history.year2023,
                current: false,
                problematic: false
            });
        }

        if (teacher.history.year2022) {
            historyItems.push({
                year: '2022-23',
                msl: teacher.history.year2022,
                current: false,
                problematic: false
            });
        }

        if (teacher.history.year2021) {
            historyItems.push({
                year: '2021-22',
                msl: teacher.history.year2021,
                current: false,
                problematic: false
            });
        }
    }
    
    return historyItems.map(item => `
        <div class="history-item ${item.current ? 'current' : ''} ${item.problematic ? 'problematic' : ''}">
            <span class="history-year">${item.year}:</span>
            <span class="history-msl">${item.msl}</span>
        </div>
    `).join('');
}

function generateTeacherSuggestions(teacher) {
    const suggestions = [];
    
    // Suggerimenti rotazione
    if (teacher.mustRotate) {
        suggestions.push({
            text: '🚨 ROTAZIONE OBBLIGATORIA: Questo docente ha lo stesso MSL da 3+ anni. È necessario assegnare un giorno diverso.',
            priority: 'urgent'
        });
        
        if (teacher.msl1 === teacher.lastMSL) {
            suggestions.push({
                text: `⚠️ CONFLITTO: Il docente richiede ${teacher.msl1} ma è lo stesso MSL degli ultimi anni. Utilizzare la seconda scelta (${teacher.msl2 || 'da definire'}) o un giorno alternativo.`,
                priority: 'urgent'
            });
        }
    } else if (teacher.rotationYears >= 2) {
        suggestions.push({
            text: '⚠️ ROTAZIONE CONSIGLIATA: Considerare una rotazione per migliorare l\'equità nella distribuzione.',
            priority: 'priority'
        });
    }
    
    // Suggerimenti flessibilità
    if (teacher.msl1 !== teacher.msl2 && teacher.msl1 && teacher.msl2) {
        suggestions.push({
            text: `💪 FLESSIBILITÀ: Il docente ha due opzioni MSL (${teacher.msl1}, ${teacher.msl2}). Può essere utilizzato per bilanciare giorni sovraccarichi.`,
            priority: ''
        });
    }
    
    // Suggerimenti dati mancanti
    if (!teacher.hasDesiderata) {
        suggestions.push({
            text: '📋 DATI MANCANTI: Contattare il docente per compilare i desiderata 2026-27.',
            priority: 'priority'
        });
    }
    
    // Suggerimenti note speciali
    if (teacher.notes && teacher.notes.toLowerCase().includes('vicepresidenza')) {
        suggestions.push({
            text: '👔 RUOLO SPECIALE: Considerare le esigenze di vicepresidenza nell\'assegnazione dell\'orario.',
            priority: ''
        });
    }
    
    return suggestions;
}

// ===================================
// VARIABILI GLOBALI
// ===================================

let desiderataData = [];
let historyData = [];
let integratedData = [];
let filteredData = [];
let currentAssignments = []; // Risultati dell'assegnazione automatica

const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

// ===================================
// INIZIALIZZAZIONE
// ===================================

function init() {
    console.log('🚀 Inizializzazione app Sistema Gestione Orari...');
    loadStoredData();
    updateStats();
    updateMSLDistribution();
    
    // Popola il selettore se ci sono già dati
    if (integratedData.length > 0) {
        populateTeacherSelector();
    }
    
    console.log('✅ App inizializzata correttamente');
}

// ===================================
// GESTIONE DATI E STORAGE
// ===================================

function loadStoredData() {
    try {
        const savedDesiderata = localStorage.getItem('blasePascalDesiderata');
        const savedHistory = localStorage.getItem('blasePascalHistory');
        
        if (savedDesiderata) {
            desiderataData = JSON.parse(savedDesiderata);
            console.log(`📊 Caricati ${desiderataData.length} desiderata salvati`);
        }
        
        if (savedHistory) {
            historyData = JSON.parse(savedHistory);
            console.log(`📋 Caricati ${historyData.length} storico salvati`);
        }
        
        if (desiderataData.length === 0 && historyData.length === 0) {
            console.log('ℹ️ Nessun dato salvato trovato');
        }
        
        integrateData();
        updateStats();
        updateDataStatus();
    } catch (error) {
        console.error('❌ Errore caricamento dati salvati:', error);
    }
}

function saveData() {
    try {
        localStorage.setItem('blasePascalDesiderata', JSON.stringify(desiderataData));
        localStorage.setItem('blasePascalHistory', JSON.stringify(historyData));
        console.log('💾 Dati salvati correttamente');
    } catch (error) {
        console.error('❌ Errore salvataggio:', error);
        alert('Errore nel salvataggio dei dati');
    }
}

// ===================================
// GESTIONE TAB
// ===================================

function showTab(tabName) {
    // Rimuovi active da tutti
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Attiva quello cliccato
    event.target.classList.add('active');
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Aggiorna contenuto se necessario
    switch(tabName) {
        case 'teachers':
            displayTeachers();
            break;
        case 'detail':
            populateTeacherSelector();
            break;
        case 'assignment':
            checkAssignmentReadiness();
            break;
        case 'analysis':
            displayAnalysis();
            break;
        case 'overview':
            updateStats();
            updateMSLDistribution();
            break;
    }
    
    console.log(`🔄 Cambiato tab: ${tabName}`);
}

// ===================================
// CARICAMENTO FILE
// ===================================

async function loadDesiderata() {
    const fileInput = document.getElementById('desiderata-file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Seleziona prima un file CSV');
        return;
    }
    
    try {
        console.log('📊 Caricamento desiderata in corso...');
        const text = await file.text();
        desiderataData = parseDesiderataCSV(text);
        saveData();
        integrateData();
        updateStats();
        updateDataStatus();
        populateTeacherSelector(); // Aggiorna selettore
        alert(`✅ Caricati ${desiderataData.length} desiderata!`);
        console.log(`✅ Desiderata caricati: ${desiderataData.length} docenti`);
    } catch (error) {
        console.error('❌ Errore caricamento desiderata:', error);
        alert('Errore nel caricamento del file. Verifica che sia un CSV valido.');
    }
}

async function loadHistory() {
    const fileInput = document.getElementById('history-file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Seleziona prima un file CSV');
        return;
    }
    
    try {
        console.log('📋 Caricamento storico in corso...');
        const text = await file.text();
        historyData = parseHistoryCSV(text);
        saveData();
        integrateData();
        updateStats();
        updateDataStatus();
        populateTeacherSelector(); // Aggiorna selettore
        alert(`✅ Caricato storico di ${historyData.length} docenti!`);
        console.log(`✅ Storico caricato: ${historyData.length} docenti`);
    } catch (error) {
        console.error('❌ Errore caricamento storico:', error);
        alert('Errore nel caricamento del file. Verifica che sia un CSV valido.');
    }
}

// ===================================
// PARSING CSV
// ===================================

function parseDesiderataCSV(csvText) {
    const lines = csvText.split('\n');
    const data = [];
    
    console.log(`🔍 Parsing ${lines.length} righe desiderata...`);
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = parseCSVLine(line);
        if (columns.length < 10) continue;
        
        const teacher = {
            timestamp: columns[0] || '',
            email: columns[1] || '',
            surname: columns[2] || '',
            name: columns[3] || '',
            hours: parseInt(columns[4]) || 0,
            msl1: columns[5] || '',
            msl2: columns[6] || '',
            msl3: columns[7] || '',
            unwantedHours: parseUnwantedHours(columns.slice(8, 14)), // [8]=Lun [9]=Mar [10]=Mer [11]=Gio [12]=Ven [13]=Sab
            schedulePreference: columns[14] || '',
            partTimeNotes: columns[15] || '',
            notes: columns[16] || ''
        };
        
        if (teacher.surname && teacher.surname !== 'Cognome') {
            data.push(teacher);
        }
    }
    
    console.log(`✅ Parsati ${data.length} desiderata`);
    return data;
}

function parseHistoryCSV(csvText) {
    const lines = csvText.split('\n');
    const data = [];
    
    console.log(`🔍 Parsing ${lines.length} righe storico...`);
    
    for (let i = 1; i < lines.length; i++) { // Skip prima riga (header)
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = parseCSVLine(line);
        if (columns.length < 5) continue; // Minimo Cognome, Nome, Ore, 2024-25, 2023-24
        
        const teacher = {
            surname: columns[0] || '',
            name: columns[1] || '',
            hours: parseFloat(columns[2]) || 0,
            year2026: columns[3] || '',   // 2026-2027 (da assegnare)
            year2025: columns[4] || '',   // 2025-2026
            year2024: columns[5] || '',   // 2024-2025
            year2023: columns[6] || '',   // 2023-2024
            year2022: columns[7] || '',   // 2022-23
            year2021: columns[8] || ''    // 2021-22
        };
        
        if (teacher.surname && teacher.surname !== 'Cognome') {
            data.push(teacher);
        }
    }
    
    console.log(`✅ Parsato storico di ${data.length} docenti`);
    return data;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

function parseUnwantedHours(hourColumns) {
    const unwanted = {};
    const dayNames = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    
    hourColumns.forEach((hoursStr, index) => {
        if (hoursStr && hoursStr.trim()) {
            const hours = hoursStr.split(',').map(h => h.trim()).filter(h => h);
            if (hours.length > 0) {
                unwanted[dayNames[index]] = hours;
            }
        }
    });
    
    return unwanted;
}

// ===================================
// INTEGRAZIONE DATI
// ===================================

function integrateData() {
    integratedData = [];
    
    console.log('🔗 Integrazione dati in corso...');
    
    // Prima passa: docenti con desiderata
    desiderataData.forEach(teacher => {
        const matchResult = findHistoryMatchDetail(teacher);
        const historyMatch = matchResult ? matchResult.data : null;

        const integrated = {
            ...teacher,
            hasDesiderata: true,
            hasHistory: !!historyMatch,
            history: historyMatch || {},
            rotationYears: calculateRotationYears(historyMatch),
            mustRotate: shouldRotate(historyMatch),
            lastMSL: getLastMSL(historyMatch),
            matchWarning: matchResult?.needsReview
                ? `Match approssimativo con "${historyMatch.surname} ${historyMatch.name}" — verifica`
                : null
        };

        integratedData.push(integrated);
    });
    
    // Seconda passa: docenti solo nello storico
    historyData.forEach(historyTeacher => {
        const hasDesiderata = desiderataData.find(t => matchTeacher(t, historyTeacher));
        if (!hasDesiderata) {
            const integrated = {
                surname: historyTeacher.surname,
                name: historyTeacher.name,
                hours: historyTeacher.hours,
                msl1: '',
                msl2: '',
                msl3: '',
                hasDesiderata: false,
                hasHistory: true,
                history: historyTeacher,
                rotationYears: calculateRotationYears(historyTeacher),
                mustRotate: shouldRotate(historyTeacher),
                lastMSL: getLastMSL(historyTeacher),
                notes: 'Docente non ha compilato desiderata 2026-27'
            };
            
            integratedData.push(integrated);
        }
    });
    
    filteredData = [...integratedData];
    console.log(`✅ Integrati ${integratedData.length} docenti totali`);
    
    // Aggiorna il selettore se la tab dettaglio è attiva
    if (document.getElementById('detail').classList.contains('active')) {
        populateTeacherSelector();
    }
}

function normalizeString(s) {
    return (s || '').toLowerCase().trim()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({length: m + 1}, (_, i) =>
        Array.from({length: n + 1}, (_, j) => i === 0 ? j : j === 0 ? i : 0)
    );
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i-1] === b[j-1]
                ? dp[i-1][j-1]
                : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
    return dp[m][n];
}


function findHistoryMatchDetail(teacher) {
    for (const h of historyData) {
        if (matchTeacher(teacher, h)) return { data: h, confidence: 'exact', needsReview: false };
    }
    const s1 = normalizeString(teacher.surname);
    for (const h of historyData) {
        if (normalizeString(h.surname) !== s1) continue;
        const n1 = normalizeString(teacher.name);
        const n2 = normalizeString(h.name);
        if (!n1 || !n2) continue;
        if (levenshtein(n1, n2) <= 2) return { data: h, confidence: 'fuzzy', needsReview: true };
    }
    return null;
}

function findHistoryMatch(teacher) {
    const result = findHistoryMatchDetail(teacher);
    return result ? result.data : null;
}

function matchTeacher(teacher1, teacher2) {
    const s1 = normalizeString(teacher1.surname);
    const s2 = normalizeString(teacher2.surname);
    if (s1 !== s2) return false;
    const n1 = normalizeString(teacher1.name);
    const n2 = normalizeString(teacher2.name);
    if (n1 === n2) return true;
    if (!n1 || !n2) return true;
    return false;
}

function calculateRotationYears(history) {
    if (!history) return 0;
    
    const mslHistory = [
        history.year2025,
        history.year2024,
        history.year2023,
        history.year2022,
        history.year2021
    ].filter(msl => msl && msl.trim())
     .map(msl => msl.trim().toLowerCase());

    if (mslHistory.length === 0) return 0;

    const currentMSL = mslHistory[0];
    let consecutive = 1;

    for (let i = 1; i < mslHistory.length; i++) {
        if (mslHistory[i] === currentMSL) {
            consecutive++;
        } else {
            break;
        }
    }
    
    return consecutive;
}

function shouldRotate(history) {
    return calculateRotationYears(history) >= 3;
}

function getLastMSL(history) {
    if (!history) return 'Sconosciuto';
    
    if (history.year2025) return history.year2025;
    if (history.year2024) return history.year2024;
    if (history.year2023) return history.year2023;
    if (history.year2022) return history.year2022;
    if (history.year2021) return history.year2021;
    
    return 'Sconosciuto';
}

// ===================================
// AGGIORNAMENTO INTERFACCIA
// ===================================

function updateStats() {
    const totalTeachers = integratedData.length;
    const withDesiderata = integratedData.filter(t => t.hasDesiderata).length;
    const withHistory = integratedData.filter(t => t.hasHistory).length;
    const mustRotate = integratedData.filter(t => t.mustRotate).length;
    
    // Aggiorna contatori
    safeUpdateElement('total-teachers', totalTeachers);
    safeUpdateElement('desiderata-count', withDesiderata);
    safeUpdateElement('history-count', withHistory);
    safeUpdateElement('rotation-needed', mustRotate);
    
    updateDataStatus();
    console.log(`📊 Stats aggiornate: ${totalTeachers} totali, ${mustRotate} da ruotare`);
}

function updateDataStatus() {
    safeUpdateElement('desiderata-status', 
        desiderataData.length > 0 ? `✅ ${desiderataData.length} docenti` : '❌ Non caricati'
    );
    
    safeUpdateElement('history-status', 
        historyData.length > 0 ? `✅ ${historyData.length} docenti` : '❌ Non caricato'
    );
    
    safeUpdateElement('integration-status', 
        integratedData.length > 0 ? `✅ ${integratedData.length} docenti integrati` : '❌ In attesa dati'
    );
}

function updateMSLDistribution() {
    const distribution = {};
    days.forEach(day => distribution[day] = 0);
    
    integratedData.forEach(teacher => {
        if (teacher.msl1) distribution[teacher.msl1]++;
        if (teacher.msl2 && teacher.msl2 !== teacher.msl1) distribution[teacher.msl2]++;
        if (teacher.msl3 && teacher.msl3 !== teacher.msl1 && teacher.msl3 !== teacher.msl2) distribution[teacher.msl3]++;
    });
    
    const container = document.getElementById('msl-distribution');
    if (!container) return;
    
    container.innerHTML = '';
    
    const maxCount = Math.max(...Object.values(distribution), 1);
    
    days.forEach(day => {
        const count = distribution[day];
        const dayBar = document.createElement('div');
        dayBar.className = 'day-bar';
        
        // Classificazione basata sulla distribuzione
        if (count > maxCount * 0.7) dayBar.classList.add('high');
        else if (count > maxCount * 0.3) dayBar.classList.add('medium');
        else dayBar.classList.add('low');
        
        dayBar.innerHTML = `<strong>${day}</strong><br><span style="font-size: 1.5em;">${count}</span>`;
        container.appendChild(dayBar);
    });
    
    console.log('📊 Distribuzione MSL aggiornata');
}

// ===================================
// VISUALIZZAZIONE DOCENTI
// ===================================

function displayTeachers() {
    const container = document.getElementById('teachers-list');
    if (!container) return;
    
    if (filteredData.length === 0) {
        container.innerHTML = '<p class="text-center">Carica i dati per visualizzare l\'elenco docenti</p>';
        return;
    }
    
    container.innerHTML = '<div class="teacher-grid"></div>';
    const grid = container.querySelector('.teacher-grid');
    
    filteredData.forEach(teacher => {
        const card = createTeacherCard(teacher);
        grid.appendChild(card);
    });
    
    console.log(`👥 Visualizzati ${filteredData.length} docenti`);
}

function createTeacherCard(teacher) {
    const card = document.createElement('div');
    card.className = 'teacher-card';
    
    // Classificazione card
    if (teacher.mustRotate) {
        card.classList.add('must-rotate');
    } else if (teacher.rotationYears >= 2) {
        card.classList.add('should-rotate');
    }
    
    // MSL info
    const mslParts = [teacher.msl1, teacher.msl2, teacher.msl3]
        .filter((d, i, arr) => d && arr.indexOf(d) === i);
    const mslInfo = !teacher.hasDesiderata ? 'NON COMPILATO' : mslParts.join(' / ') || 'Non specificato';
    
    // Badge rotazione
    let rotationBadge = '';
    if (teacher.mustRotate) {
        rotationBadge = '<span class="rotation-badge must">🔄 DEVE RUOTARE</span>';
    } else if (teacher.rotationYears >= 2) {
        rotationBadge = '<span class="rotation-badge should">⚠️ PRIORITÀ</span>';
    }
    
    // Ore non desiderate (solo prime 3 per spazio)
    const unwantedSummary = teacher.unwantedHours ? 
        Object.entries(teacher.unwantedHours)
            .slice(0, 3)
            .map(([day, hours]) => `${day}: ${hours.join(',')}`)
            .join(' • ') : '';
    
    card.innerHTML = `
        <div class="teacher-name">
            ${teacher.surname} ${teacher.name || ''}
            ${rotationBadge}
        </div>
        <div class="teacher-info">
            <strong>Ore settimanali:</strong> ${teacher.hours || 'N/A'}<br>
            <strong>MSL desiderato:</strong> ${mslInfo}<br>
            <strong>Ultimo MSL assegnato:</strong> ${teacher.lastMSL}<br>
            <strong>Anni consecutivi:</strong> ${teacher.rotationYears || 0}
            ${unwantedSummary ? `<br><strong>Ore non desiderate:</strong> ${unwantedSummary}` : ''}
        </div>
        ${teacher.notes ? `
            <div style="margin-top: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px; font-size: 0.85em; border-left: 3px solid #3498db;">
                <strong>Note:</strong> ${teacher.notes}
            </div>
        ` : ''}
    `;
    
    return card;
}

// ===================================
// FILTRI
// ===================================

function filterTeachers() {
    const searchTerm = document.getElementById('teacher-search').value.toLowerCase();
    const rotationFilter = document.getElementById('rotation-filter').value;
    
    filteredData = integratedData.filter(teacher => {
        // Filtro testo
        const nameMatch = `${teacher.surname} ${teacher.name || ''}`.toLowerCase().includes(searchTerm);
        
        // Filtro rotazione
        let rotationMatch = true;
        switch(rotationFilter) {
            case 'must-rotate':
                rotationMatch = teacher.mustRotate;
                break;
            case 'no-rotation':
                rotationMatch = !teacher.mustRotate;
                break;
            case 'missing-data':
                rotationMatch = !teacher.hasDesiderata;
                break;
        }
        
        return nameMatch && rotationMatch;
    });
    
    displayTeachers();
    console.log(`🔍 Filtrati ${filteredData.length} docenti`);
}

// ===================================
// ANALISI
// ===================================

function displayAnalysis() {
    const container = document.getElementById('analysis-content');
    if (!container) return;
    
    if (integratedData.length === 0) {
        container.innerHTML = '<p class="text-center">Carica i dati per visualizzare le analisi</p>';
        return;
    }
    
    const mustRotate = integratedData.filter(t => t.mustRotate);
    const shouldRotate = integratedData.filter(t => t.rotationYears >= 2 && !t.mustRotate);
    const missingDesiderata = integratedData.filter(t => !t.hasDesiderata);
    const mslConflicts = analyzeMSLConflicts();
    
    container.innerHTML = `
        <div class="analysis-section">
            <h3>🔄 Rotazioni Obbligatorie (${mustRotate.length})</h3>
            ${mustRotate.length > 0 ? 
                mustRotate.map(t => `
                    <div class="analysis-item error">
                        <strong>${t.surname} ${t.name || ''}</strong><br>
                        <small>${t.rotationYears} anni consecutivi MSL: ${t.lastMSL}</small>
                        ${t.msl1 ? `<br><small>Richiede: ${t.msl1}${t.msl2 && t.msl2 !== t.msl1 ? ` / ${t.msl2}` : ''}</small>` : ''}
                    </div>
                `).join('') :
                '<div class="analysis-item success">✅ Nessuna rotazione obbligatoria!</div>'
            }
        </div>
        
        <div class="analysis-section">
            <h3>⚠️ Rotazioni Consigliate (${shouldRotate.length})</h3>
            ${shouldRotate.length > 0 ? 
                shouldRotate.map(t => `
                    <div class="analysis-item warning">
                        <strong>${t.surname} ${t.name || ''}</strong><br>
                        <small>${t.rotationYears} anni MSL: ${t.lastMSL}</small>
                    </div>
                `).join('') :
                '<div class="analysis-item success">✅ Nessuna rotazione prioritaria!</div>'
            }
        </div>
        
        <div class="analysis-section">
            <h3>📋 Docenti Senza Desiderata 2026-27 (${missingDesiderata.length})</h3>
            ${missingDesiderata.length > 0 ? 
                missingDesiderata.map(t => `
                    <div class="analysis-item warning">
                        <strong>${t.surname} ${t.name || ''}</strong><br>
                        <small>Ultimo MSL: ${t.lastMSL} • Ore: ${t.hours || 'N/A'}</small><br>
                        <small>Da contattare per compilazione desiderata</small>
                    </div>
                `).join('') :
                '<div class="analysis-item success">✅ Tutti hanno compilato i desiderata!</div>'
            }
        </div>
        
        <div class="analysis-section">
            <h3>📊 Conflitti MSL</h3>
            ${mslConflicts.map(conflict => `
                <div class="analysis-item ${conflict.level}">
                    <strong>${conflict.day}: ${conflict.count} richieste</strong><br>
                    <small>${conflict.message}</small>
                </div>
            `).join('') || '<div class="analysis-item success">✅ Nessun conflitto significativo!</div>'}
        </div>
    `;
    
    console.log('📈 Analisi visualizzata');
}

function analyzeMSLConflicts() {
    const distribution = {};
    days.forEach(day => distribution[day] = []);
    
    integratedData.filter(t => t.hasDesiderata).forEach(teacher => {
        if (teacher.msl1) distribution[teacher.msl1].push(teacher);
        if (teacher.msl2 && teacher.msl2 !== teacher.msl1) distribution[teacher.msl2].push(teacher);
        if (teacher.msl3 && teacher.msl3 !== teacher.msl1 && teacher.msl3 !== teacher.msl2) distribution[teacher.msl3].push(teacher);
    });
    
    const conflicts = [];
    const totalRequests = Object.values(distribution).reduce((sum, teachers) => sum + teachers.length, 0);
    const avgPerDay = totalRequests / days.length;
    
    Object.entries(distribution).forEach(([day, teachers]) => {
        if (teachers.length > avgPerDay * 1.5) {
            const mustRotateCount = teachers.filter(t => t.mustRotate).length;
            conflicts.push({
                day,
                count: teachers.length,
                level: teachers.length > avgPerDay * 2 ? 'error' : 'warning',
                message: `Sovraccarico. ${mustRotateCount > 0 ? `${mustRotateCount} devono ruotare.` : 'Considerare redistribuzione.'}`
            });
        }
    });
    
    return conflicts;
}

// ===================================
// DATI DI TEST
// ===================================

function loadSampleData() {
    console.log('🧪 Caricamento dati di test...');
    
    desiderataData = [
        {
            timestamp: '14/06/2026 11:47:27',
            email: 'annalisa.angeli@iispascal.it',
            surname: 'Angeli',
            name: 'Annalisa',
            hours: 18,
            msl1: 'Venerdì',
            msl2: 'Venerdì',
            unwantedHours: {
                'Lunedì': ['1', '2'],
                'Sabato': ['1', '5', '6']
            },
            schedulePreference: 'indifferente',
            notes: 'Vicepresidenza - gestione amministrativa'
        },
        {
            timestamp: '14/06/2026 08:08:46',
            email: 'mario.rossi@iispascal.it',
            surname: 'Rossi',
            name: 'Mario',
            hours: 18,
            msl1: 'Lunedì',
            msl2: 'Martedì',
            unwantedHours: {
                'Martedì': ['1'],
                'Venerdì': ['1'],
                'Sabato': ['1']
            },
            schedulePreference: 'orario con meno buchi possibili',
            notes: 'Preferenza entrate terza ora'
        },
        {
            timestamp: '14/06/2026 09:20:11',
            email: 'giulia.bianchi@iispascal.it',
            surname: 'Bianchi',
            name: 'Giulia',
            hours: 12,
            msl1: 'Mercoledì',
            msl2: 'Giovedì',
            unwantedHours: {
                'Lunedì': ['6'],
                'Venerdì': ['6']
            },
            schedulePreference: 'orario con meno buchi possibili',
            notes: ''
        }
    ];
    
    historyData = [
        {
            surname: 'Angeli',
            name: 'Annalisa',
            hours: 18,
            year2026: '',
            year2025: 'Venerdì',
            year2024: 'Venerdì',
            year2023: 'Venerdì',
            year2022: 'Venerdì',
            year2021: 'Venerdì'
        },
        {
            surname: 'Rossi',
            name: 'Mario',
            hours: 18,
            year2026: '',
            year2025: 'Lunedì',
            year2024: 'Martedì',
            year2023: 'Mercoledì',
            year2022: 'Lunedì',
            year2021: 'Martedì'
        },
        {
            surname: 'Bianchi',
            name: 'Giulia',
            hours: 12,
            year2026: '',
            year2025: 'Mercoledì',
            year2024: 'Mercoledì',
            year2023: 'Giovedì',
            year2022: 'Mercoledì',
            year2021: 'Mercoledì'
        },
        {
            surname: 'Verdi',
            name: 'Francesco',
            hours: 18,
            year2026: '',
            year2025: 'Sabato',
            year2024: 'Sabato',
            year2023: 'Sabato',
            year2022: 'Sabato',
            year2021: 'Sabato'
        }
    ];
    
    saveData();
    integrateData();
    updateStats();
    updateMSLDistribution();
    populateTeacherSelector(); // Aggiorna selettore
    
    alert('✅ Dati di test caricati! Vai nella tab "🎯 Assegnazione MSL" per testare gli algoritmi!');
    console.log('✅ Dati di test caricati correttamente');
}

// ===================================
// EXPORT
// ===================================

function exportData() {
    if (integratedData.length === 0) {
        alert('Nessun dato da esportare');
        return;
    }
    
    const headers = [
        'Cognome', 'Nome', 'Ore', 'Email', 'MSL1', 'MSL2', 'MSL3',
        'Anni Stesso MSL', 'Deve Ruotare', 'Ultimo MSL',
        'Preferenza Orario', 'Note'
    ];

    const rows = integratedData.map(teacher => [
        teacher.surname,
        teacher.name || '',
        teacher.hours || '',
        teacher.email || '',
        teacher.msl1 || '',
        teacher.msl2 || '',
        teacher.msl3 || '',
        teacher.rotationYears || 0,
        teacher.mustRotate ? 'SI' : 'NO',
        teacher.lastMSL,
        teacher.schedulePreference || '',
        (teacher.notes || '').replace(/,/g, ';')
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    downloadFile(csvContent, 'orari_blaise_pascal_export.csv', 'text/csv');
    console.log('📄 Esportazione dati completata');
}

function exportAnalysis() {
    if (integratedData.length === 0) {
        alert('Nessun dato da analizzare');
        return;
    }
    
    const mustRotate = integratedData.filter(t => t.mustRotate);
    const shouldRotate = integratedData.filter(t => t.rotationYears >= 2 && !t.mustRotate);
    const missingDesiderata = integratedData.filter(t => !t.hasDesiderata);
    
    const analysis = `REPORT ANALISI ROTAZIONI MSL - ${new Date().toLocaleDateString('it-IT')}
Sistema Gestione Orari - Blaise Pascal, Reggio Emilia

STATISTICHE GENERALI:
- Totale docenti: ${integratedData.length}
- Con desiderata 2026-27: ${integratedData.filter(t => t.hasDesiderata).length}
- Con storico: ${integratedData.filter(t => t.hasHistory).length}

ROTAZIONI OBBLIGATORIE (${mustRotate.length}):
${mustRotate.map(t => `- ${t.surname} ${t.name || ''}: ${t.rotationYears} anni MSL ${t.lastMSL}`).join('\n')}

ROTAZIONI CONSIGLIATE (${shouldRotate.length}):
${shouldRotate.map(t => `- ${t.surname} ${t.name || ''}: ${t.rotationYears} anni MSL ${t.lastMSL}`).join('\n')}

DOCENTI SENZA DESIDERATA 2026-27 (${missingDesiderata.length}):
${missingDesiderata.map(t => `- ${t.surname} ${t.name || ''}`).join('\n')}

DISTRIBUZIONE MSL RICHIESTI:
${days.map(day => {
    const count = integratedData.filter(t => t.msl1 === day || t.msl2 === day || t.msl3 === day).length;
    return `- ${day}: ${count} richieste`;
}).join('\n')}

RACCOMANDAZIONI:
${mustRotate.length > 0 ? '- PRIORITÀ ASSOLUTA: Ruotare i docenti con 3+ anni stesso MSL' : '- Situazione rotazioni sotto controllo'}
${shouldRotate.length > 0 ? '- Considerare rotazione docenti con 2+ anni stesso MSL' : ''}
${missingDesiderata.length > 0 ? '- Contattare docenti senza desiderata per compilazione' : ''}

Report generato automaticamente dal Sistema Gestione Orari
`;
    
    downloadFile(analysis, 'analisi_rotazioni_msl.txt', 'text/plain');
    console.log('📊 Esportazione analisi completata');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===================================
// UTILITÀ
// ===================================

function safeUpdateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
    }
}

// ===================================
// INIZIALIZZAZIONE AL CARICAMENTO
// ===================================

window.addEventListener('load', init);

// Debug
window.addEventListener('error', function(e) {
    console.error('❌ Errore JavaScript:', e.error);
});

console.log('📋 Script Sistema Gestione Orari caricato');