# 📋 Sistema Gestione Orari - Blaise Pascal

> **Sistema intelligente per l'assegnazione automatica degli MSL (Moduli Settimanali Liberi) ai docenti**

Un'applicazione web avanzata sviluppata per l'Istituto Blaise Pascal di Reggio Emilia che automatizza il processo di assegnazione dei giorni MSL ai docenti, considerando desiderata individuali, rotazioni obbligatorie e bilanciamento del carico.

## 🚀 **Caratteristiche Principali**

- ⚡ **Due Algoritmi di Ottimizzazione**: Greedy (veloce) e Simulated Annealing (qualità superiore)
- 🔄 **Gestione Rotazioni Automatiche**: Rilevamento e applicazione rotazioni obbligatorie (3+ anni stesso MSL)
- 📊 **Integrazione Dati Multipla**: Import da Google Forms (desiderata) e storico anni precedenti
- 🎯 **Bilanciamento Intelligente**: Distribuzione equa dei docenti tra i giorni della settimana
- 📈 **Analisi Avanzate**: Statistiche, conflitti, rotazioni e distribuzione carichi
- 💾 **Export Multipli**: CSV per Excel, report dettagliati, analisi complete
- 🔍 **Interfaccia Intuitiva**: Design responsive con visualizzazioni grafiche

## 📁 **Struttura del Progetto**

```
sistema-gestione-orari/
├── index.html          # Interfaccia utente principale
├── script.js           # Logica applicazione e algoritmi
├── styles.css          # Stili e design responsive  
├── README.md           # Documentazione (questo file)
└── data/               # Cartella per file di esempio
    ├── desiderata_esempio.csv
    └── storico_esempio.csv
```

## 🛠️ **Requisiti Tecnici**

- **Browser Web Moderno** (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- **JavaScript Abilitato**
- **Supporto localStorage** (per salvataggio dati)
- **File CSV** con encoding UTF-8

**Nessun server richiesto** - L'applicazione funziona completamente client-side.

## 🚀 **Guida Rapida**

### 1. **Setup Iniziale**
```bash
# Clona il repository
git clone https://github.com/tuoaccount/sistema-gestione-orari.git

# Apri il file index.html nel browser
open index.html
```

### 2. **Caricamento Dati**
1. 📁 **Tab "Importa Dati"** → Carica i CSV con desiderata e storico
2. 📊 **Tab "Panoramica"** → Verifica le statistiche caricate
3. 👥 **Tab "Docenti"** → Esplora l'elenco integrato

### 3. **Assegnazione MSL**
1. 🎯 **Tab "Assegnazione MSL"** → Scegli algoritmo
2. ⚡ **Greedy**: Risultati in ~1 secondo
3. 🧠 **Simulated Annealing**: Ottimizzazione in ~5-10 secondi
4. ✅ **Conferma** le assegnazioni o **modifica manualmente**

### 4. **Export Risultati**
- 📊 **Tabella CSV**: Export immediato per Excel
- 📄 **Report Completo**: Analisi dettagliata + CSV
- 📈 **Analisi**: Report statistico standalone

## 🧠 **Algoritmi di Assegnazione**

### ⚡ **Algoritmo Greedy**

**Strategia**: Assegnazione sequenziale con priorità deterministiche

#### **🔄 Politiche Decisionali**

| Fase | Priorità | Politica Applicata | Descrizione |
|------|----------|-------------------|-------------|
| **1. Rotazioni Obbligatorie** | 🔴 **MASSIMA** | `Zero Tolleranza` | Chi ha 3+ anni stesso MSL DEVE ruotare |
| **2. Docenti Rigidi** | 🟠 **ALTA** | `Meno Flessibili Prima` | Una sola preferenza → priorità maggiore |
| **3. Docenti Flessibili** | 🟡 **MEDIA** | `Bilanciamento Intelligente` | Due preferenze → usate per bilanciare |
| **4. Completamento** | 🟢 **BASSA** | `Distribuzione Uniforme` | Rimanenti sul giorno meno carico |

#### **⚙️ Regole di Assegnazione Greedy**

```javascript
// FASE 1: Rotazioni Forzate
if (teacher.rotationYears >= 3) {
    assignedMSL = teacher.msl2 || findLeastLoadedDay();
    // Policy: Mai lo stesso MSL dell'anno precedente
}

// FASE 2: Preferenza Singola  
if (teacher.msl1 === teacher.msl2) {
    assignedMSL = teacher.msl1; // se sotto capacità
    // Policy: First-come, first-served con limite capacità
}

// FASE 3: Flessibilità
if (teacher.msl1 !== teacher.msl2) {
    // Policy: MSL1 preferito, MSL2 se MSL1 più carico
    assignedMSL = (load1 <= load2) ? teacher.msl1 : teacher.msl2;
}
```

**✅ Vantaggi**: Velocissimo, deterministico, regole chiare  
**⚠️ Limiti**: Ottimo locale, non considera l'effetto globale

---

### 🧠 **Algoritmo Simulated Annealing**

**Strategia**: Ottimizzazione globale con accettazione probabilistica

#### **💰 Funzione di Costo Multiobiettivo**

```javascript
function calculateSolutionCost(solution) {
    let totalCost = 0;
    
    // 🏆 COSTO 1: Rotazioni Mancate (Peso: 500)
    totalCost += missedRotations * 500;  // CRITICO
    
    // 📊 COSTO 2: Preferenze Non Soddisfatte (Peso: 100)  
    totalCost += unsatisfiedTeachers * 100;  // IMPORTANTE
    
    // ⚖️ COSTO 3: Sbilanciamento Giorni (Peso: 50)
    totalCost += Math.pow(maxLoad - minLoad, 2) * 50;  // MODERATO
    
    // 📈 COSTO 4: Varianza Distribuzione (Peso: 25)
    totalCost += variance * 25;  // RAFFINAMENTO
    
    return totalCost;
}
```

#### **🔄 Strategie di Movimento**

| Strategia | Probabilità | Descrizione | Obiettivo |
|-----------|------------|-------------|-----------|
| **Scambio Conservativo** | 40% | Scambia 2 docenti non in rotazione | Mantenere stabilità |
| **Movimento Flessibile** | 30% | Sposta docente flessibile (MSL1↔MSL2) | Sfruttare flessibilità |
| **Bilanciamento Attivo** | 20% | Sposta da giorno carico a scarico | Ridurre sbilanciamento |
| **Esplorazione Pura** | 10% | Movimento completamente casuale | Evitare minimi locali |

#### **🌡️ Controllo Temperatura**

```javascript
// Temperatura iniziale: basata su varianza dei costi
initialTemp = standardDeviation * 2;

// Raffreddamento esponenziale
temperature *= coolingRate;  // coolingRate ≈ 0.995

// Probabilità accettazione
acceptProb = exp(-(newCost - currentCost) / temperature);
```

**✅ Vantaggi**: Soluzione ottimale globale, bilanciamento superiore  
**⚠️ Limiti**: Più lento, risultati probabilistici

---

## 📊 **Formato Dati di Input**

### **Desiderata 2025-26** (Export Google Forms)
```csv
Timestamp,Email,Cognome,Nome,Ore,MSL1,MSL2,Ore_Non_Lun,Ore_Non_Mar,Ore_Non_Mer,Ore_Non_Gio,Ore_Non_Ven,Ore_Non_Sab,Preferenza_Orario,Note_Part_Time,Note
"14/06/2025 11:47:27","mario.rossi@scuola.it","Rossi","Mario",18,"Lunedì","Martedì","1,2","","","1","","1","orario compatto","",""
```

### **Storico Anni Precedenti**
```csv
Cognome,Nome,Ore,2024-25,2023-24,2022-23,2021-22
"Rossi","Mario",18,"Lunedì","Martedì","Mercoledì","Lunedì"
"Bianchi","Giulia",12,"Mercoledì","Mercoledì","Giovedì","Mercoledì"
```

## 🎯 **Esempi di Utilizzo**

### **Scenario 1: Istituto Piccolo (20-30 docenti)**
- ⚡ **Algoritmo Consigliato**: Greedy
- ⏱️ **Tempo Esecuzione**: < 1 secondo
- 🎯 **Risultato**: Soluzione ottima locale, soddisfacente

### **Scenario 2: Istituto Grande (50+ docenti, molti vincoli)**
- 🧠 **Algoritmo Consigliato**: Simulated Annealing  
- ⏱️ **Tempo Esecuzione**: 5-10 secondi
- 🏆 **Risultato**: Soluzione ottimale globale, bilanciamento superiore

### **Scenario 3: Molte Rotazioni Obbligatorie**
- 🔄 **Strategia**: Simulated Annealing per gestire conflitti complessi
- ⚖️ **Focus**: Bilanciamento post-rotazioni
- 📊 **Monitoraggio**: Analisi conflitti in tempo reale

## 📈 **Metriche di Qualità**

Il sistema valuta automaticamente la qualità delle assegnazioni:

```javascript
// Indicatori di Performance
const qualityMetrics = {
    satisfactionRate: (satisfied / total) * 100,     // % preferenze soddisfatte
    balanceScore: maxLoad - minLoad,                 // Sbilanciamento giorni  
    rotationCompliance: (rotated / mustRotate) * 100, // % rotazioni applicate
    conflictResolution: (resolved / conflicts) * 100  // % conflitti risolti
};
```

**🏆 Obiettivi Ideali:**
- Soddisfazione: > 85%
- Bilanciamento: ≤ 2 docenti di differenza
- Rotazioni: 100% applicate
- Conflitti: > 90% risolti

## 🔧 **Personalizzazione**

### **Modifica Pesi Algoritmo SA**
```javascript
// In script.js, funzione calculateSolutionCost()
const ROTATION_WEIGHT = 500;      // Peso rotazioni (default: 500)
const SATISFACTION_WEIGHT = 100;  // Peso preferenze (default: 100)  
const BALANCE_WEIGHT = 50;        // Peso bilanciamento (default: 50)
const VARIANCE_WEIGHT = 25;       // Peso uniformità (default: 25)
```

### **Aggiunta Nuovi Giorni**
```javascript
// In script.js, variabile days
const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
```

### **Modifica Soglia Rotazione**
```javascript
// In script.js, funzione shouldRotate()
function shouldRotate(history) {
    return calculateRotationYears(history) >= 3; // Cambia 3 con soglia desiderata
}
```

## 🐛 **Risoluzione Problemi**

### **Problema**: "Nessun dato visualizzato"
**Soluzione**: 
1. Verifica formato CSV (separatori virgola, encoding UTF-8)
2. Controlla intestazioni colonne
3. Usa "Carica Dati di Test" per verificare funzionamento

### **Problema**: "Algoritmo non termina"
**Soluzione**:
1. Ricarica la pagina
2. Verifica presenza docenti con desiderata
3. Usa Greedy come fallback

### **Problema**: "Export non funziona"
**Soluzione**:
1. Verifica popup blocker disabilitato
2. Controlla permessi download browser
3. Prova browser diverso

## 🤝 **Contribuire**

1. **Fork** il repository
2. **Crea** feature branch (`git checkout -b feature/NuovaFunzionalita`)
3. **Commit** le modifiche (`git commit -am 'Aggiunge nuova funzionalità'`)
4. **Push** al branch (`git push origin feature/NuovaFunzionalita`)
5. **Apri** Pull Request

### **Aree di Miglioramento**
- 🔄 Algoritmi di ottimizzazione aggiuntivi
- 📱 Versione mobile nativa
- 🔗 Integrazione API Google Workspace
- 📊 Dashboard analytics avanzate
- 🎨 Temi personalizzabili

## 📝 **Licenza**

Questo progetto è rilasciato sotto **Licenza MIT** - vedi il file [LICENSE](LICENSE) per dettagli.

```
MIT License - Sistema Gestione Orari
Copyright (c) 2025 Prof. Francesco Pontoriero
```

## 👨‍💻 **Autore & Crediti**

**Sviluppato da**: Prof. Francesco Pontoriero  
**Istituto**: Blaise Pascal - Reggio Emilia  
**Website**: [francescopontoriero.altervista.org](https://francescopontoriero.altervista.org/)

### **Tecnologie Utilizzate**
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Algoritmi**: Greedy, Simulated Annealing
- **Storage**: localStorage (browser)
- **Export**: Blob API, CSV generation
- **Design**: CSS Grid, Flexbox, Responsive Design

---

## 📚 **Approfondimenti Tecnici**

### **Complessità Computazionale**

| Algoritmo | Complessità Tempo | Complessità Spazio | Qualità Soluzione |
|-----------|------------------|-------------------|------------------|
| **Greedy** | O(n log n) | O(n) | Buona (ottimo locale) |
| **Simulated Annealing** | O(n² × iterazioni) | O(n) | Ottima (ottimo globale) |

### **Parametri Ottimizzazione SA**

```javascript
const SA_PARAMS = {
    maxIterations: Math.min(2000, teachers.length * 50),
    coolingRate: Math.pow(finalTemp / initialTemp, 1 / maxIterations),
    initialTemp: standardDeviation * 2,
    finalTemp: 0.01,
    earlyStoppingThreshold: 0.2 // 20% iterazioni senza miglioramento
};
```

---

*Sistema Gestione Orari v1.0 - Automatizzazione intelligente per l'Istituto Blaise Pascal* 🏫✨