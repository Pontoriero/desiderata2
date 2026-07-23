# Sistema Gestione Orari - Blaise Pascal

> **Sistema per l'assegnazione automatica degli MSL (Moduli Settimanali Liberi) ai docenti**

Applicazione web per l'Istituto Blaise Pascal di Reggio Emilia. Automatizza l'assegnazione dei giorni MSL considerando desiderata individuali, rotazioni obbligatorie e bilanciamento del carico.

**Sviluppato da**: Prof. Francesco Pontoriero — [francescopontoriero.altervista.org](https://francescopontoriero.altervista.org/)

---

## Struttura del Progetto

```
desiderata2/
├── index.html   — interfaccia utente (6 tab)
├── script.js    — logica, algoritmi, parsing
├── styles.css   — stile responsive
└── README.md
```

**Nessun server richiesto** — funziona completamente client-side.

---

## Requisiti

- Browser moderno (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- JavaScript abilitato
- File CSV con encoding UTF-8

---

## Guida Rapida

1. **Tab "Importa Dati"** → carica i CSV desiderata e storico
2. **Tab "Panoramica"** → verifica statistiche e distribuzione
3. **Tab "Docenti"** → esplora e filtra l'elenco
4. **Tab "Assegnazione MSL"** → scegli algoritmo e calcola
5. **Tab "Analisi"** → rotazioni, conflitti, distribuzione
6. **Export** → CSV tabella o report completo

---

## Formato Dati di Input

### Desiderata 2026-27 (export Google Forms)

Il form produce un CSV con le seguenti colonne (indici 0-based):

| Idx | Colonna | Campo interno |
|-----|---------|---------------|
| 0 | Informazioni cronologiche (timestamp) | `timestamp` |
| 1 | Indirizzo email | `email` |
| 2 | Cognome | `surname` |
| 3 | Nome | `name` |
| 4 | Numero ore settimanali previste | `hours` |
| 5 | Seleziona MSL [Opzione 1] | `msl1` |
| 6 | Seleziona MSL [Opzione 2] | `msl2` |
| 7 | Seleziona MSL [Opzione 3] | `msl3` |
| 8–13 | Indica 3 ore NON desiderate [Lun–Sab] | `unwantedHours` |
| 14 | Orario compatto o con ore buche | `schedulePreference` |
| 15 | Per i part time con massimo nove ore | `partTimeNotes` |
| 16 | Note | `notes` |

**Nota su MSL3**: è un fallback puro della Commissione Orario, non una terza preferenza paritaria. Viene considerato dall'algoritmo **solo se MSL1 e MSL2 risultano entrambi saturi**. Non è legato alle ore settimanali — disponibile per tutti i docenti indipendentemente dal contratto.

```csv
Informazioni cronologiche,Indirizzo email,Cognome,Nome,Numero ore settimanali previste,Seleziona MSL [Opzione 1],Seleziona MSL [Opzione 2],Seleziona MSL [Opzione 3],Indica 3 ore NON desiderate [Lunedì],...
"08/07/2026 13.49.22","giulia.talami@iispascal.it","TALAMI","GIULIA",14,"Sabato","Mercoledì","","1, 6",...
```

Le colonne "ore non desiderate" possono contenere valori multipli separati da virgola (es. `"1, 6"`, `"4, 5, 6"`).

### Storico Anni Precedenti

```csv
Cognome,Nome,Ore,2026-2027,2025-2026,2024-2025,2023-2024,2022-23,2021-22
Angeli,Annalisa,18,,Venerdì,Venerdì,Venerdì,Venerdì,Venerdì
```

| Colonna | Anno | Campo interno |
|---------|------|---------------|
| 3 | 2026-2027 | `year2026` (da assegnare, solitamente vuoto) |
| 4 | 2025-2026 | `year2025` (anno più recente) |
| 5 | 2024-2025 | `year2024` |
| 6 | 2023-2024 | `year2023` |
| 7 | 2022-23 | `year2022` |
| 8 | 2021-22 | `year2021` |

Il calcolo degli anni consecutivi parte da `year2025` (il più recente disponibile). I valori MSL sono confrontati case-insensitive per gestire inconsistenze (es. `"martedì"` vs `"Martedì"`).

---

## Logica MSL e Algoritmi

### Regola di Assegnazione (Greedy e SA)

Per ogni docente l'assegnazione segue questa priorità:

```
1. MSL1         — preferenza principale
2. MSL2         — alternativa (bilanciamento attivo con MSL1 nei docenti flessibili)
3. MSL3         — fallback puro: SOLO se MSL1 e MSL2 sono entrambi saturi
4. Giorno meno carico — fallback automatico finale
```

La distinzione tra "soddisfatto" e "fallback MSL3" è tracciata separatamente:
- `satisfied = true` → assegnato su MSL1 o MSL2
- `fallback3 = true` → assegnato su MSL3 (tollerato, non preferito)
- conflitto → né MSL1, né MSL2, né MSL3

### Algoritmo Greedy

Assegnazione in 4 fasi sequenziali:

| Fase | Docenti | Logica |
|------|---------|--------|
| 1 | Rotazione obbligatoria | MSL2→MSL1→MSL3→giorno libero (escluso `lastMSL`) |
| 2 | Rigidi (MSL1=MSL2) | MSL1→MSL3→giorno meno carico |
| 3 | Flessibili (MSL1≠MSL2) | Bilancia MSL1/MSL2 per carico; se entrambi saturi→MSL3→giorno meno carico |
| 4 | Rimanenti | MSL1→MSL3→giorno meno carico |

**Vantaggi**: veloce (~1 sec), deterministico, regole chiare.  
**Limiti**: ottimo locale.

### Algoritmo Simulated Annealing

Ottimizzazione globale con funzione di costo multi-obiettivo:

```javascript
// COSTO 1: Preferenze non soddisfatte
cost += unsatisfiedHard * 100;  // né msl1 né msl2 né msl3
cost += fallback3Count  * 30;   // assegnati su msl3 (tollerato)

// COSTO 2: Sbilanciamento giorni
cost += Math.pow(maxLoad - minLoad, 2) * 50;

// COSTO 3: Rotazioni mancate (critico)
cost += missedRotations * 500;

// COSTO 4: Varianza distribuzione
cost += variance * 25;
```

Strategie di movimento:

| Strategia | Prob. | Comportamento |
|-----------|-------|---------------|
| Scambio conservativo | 40% | Scambia 2 docenti non in rotazione |
| Movimento flessibile | 30% | Flip MSL1↔MSL2; propone MSL3 solo se entrambi saturi |
| Bilanciamento attivo | 20% | Sposta da giorno carico a giorno scarico |
| Esplorazione pura | 10% | Mossa casuale per uscire da minimi locali |

**Vantaggi**: soluzione ottimale globale, gestisce vincoli complessi.  
**Limiti**: ~5-10 sec, risultati probabilistici.

---

## Matching Desiderata ↔ Storico

Il sistema usa matching a più fasi per collegare i due file:

1. **Esatto**: `cognome.toLowerCase() + nome.toLowerCase()` (normalizzati: accenti rimossi, spazi multipli collassati)
2. **Cognome-only**: se uno dei due nomi è vuoto nello storico
3. **Fuzzy**: stesso cognome normalizzato + distanza di Levenshtein ≤ 2 sul nome → segnalato come "match approssimativo — verifica" nella tab Dettaglio

---

## Rotazioni

Un docente deve ruotare se ha lo stesso MSL per **3+ anni consecutivi** (calcolati su `year2025`, `year2024`, `year2023`, `year2022`, `year2021`).

Obiettivi di qualità:

| Metrica | Target |
|---------|--------|
| Preferenze soddisfatte (MSL1/MSL2) | > 85% |
| Sbilanciamento giorni | ≤ 2 docenti |
| Rotazioni applicate | 100% |
| Fallback MSL3 | minimo possibile |

La summary mostra un avviso rosso se un giorno supera `⌈N/6⌉ + 2` docenti (soglia sovraccarico). Con 93 docenti la soglia è 18 — con distribuzione normale (15-17/giorno) non si attiva.

---

## Export

- **Tabella CSV** (`exportAssignmentTable`): una riga per docente — colonne: `MSL_Assegnato`, `Prima_Richiesta`, `Seconda_Richiesta`, `Terza_Richiesta`, `Preferenza_Soddisfatta`, `Fallback_MSL3` (SÌ/NO), `Motivo_Assegnazione`
- **Report completo** (`exportAssignments`): CSV + testo con statistiche rotazioni e conflitti
- **Analisi** (`exportAnalysis`): report statistico standalone con distribuzione per giorno

---

## Personalizzazione

### Soglia rotazione obbligatoria
```javascript
// script.js — shouldRotate()
return calculateRotationYears(history) >= 3; // cambia 3 con soglia desiderata
```

### Pesi funzione di costo SA
```javascript
// script.js — calculateSolutionCost()
unsatisfiedHard * 100   // preferenza completamente mancata
fallback3Count  * 30    // fallback MSL3 tollerato
missedRotations * 500   // rotazione mancata (critico)
imbalance²      * 50    // sbilanciamento giorni
variance        * 25    // uniformità distribuzione
```

### Aggiunta giorni
```javascript
// script.js — variabile globale days
const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
```

---

## Risoluzione Problemi

| Problema | Causa probabile | Soluzione |
|----------|----------------|-----------|
| Nessun dato visualizzato | Formato CSV errato | Verifica encoding UTF-8 e separatori virgola |
| Rotazioni sempre 0 | Colonne storico sfasate | Controlla che la colonna 4 sia `2025-2026` |
| Match mancanti tra file | Cognome/nome diverso nei due CSV | Verifica tab Dettaglio — segnala match approssimativi |
| MSL3 mai usato nel CSV export | Dati corrotti o msl3 vuoto | Controlla colonna `Terza_Richiesta`: se vuota, il form non aveva MSL3 compilato |
| Algoritmo non termina | Dataset vuoto o corrotto | Usa "Carica Dati di Test" per verificare |
| Export non funziona | Popup blocker | Disabilita blocker per questa pagina |

---

## Tecnologie

- HTML5, CSS3, JavaScript ES6+
- Algoritmi: Greedy, Simulated Annealing
- Storage: localStorage (browser)
- Export: Blob API, CSV generation
- Design: CSS Grid, Flexbox, Responsive

---

*Sistema Gestione Orari v1.1 — Istituto Blaise Pascal, Reggio Emilia*
