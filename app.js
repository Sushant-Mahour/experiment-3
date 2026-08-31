/* ==========================================================================
   Toe Impact Test Virtual Lab - JavaScript Code
   ========================================================================== */

// --- STATE MANAGEMENT ---
const state = {
  currentStep: 1,
  
  // Step 1: Specimen Selection
  selectedMaterial: 'steel', // 'steel', 'aluminium', 'composite', 'carbon', 'soft'
  
  // Step 2: Clay Prep
  clayHeight: 22.0, // standard initial clay height in mm
  isClayPlaced: false,
  
  // Step 3: Clamping
  isClamped: false,
  clampRotation: 0,
  
  // Step 4: Configuration
  testStandard: 'en', // 'en', 'astm', 'custom'
  strikerMass: 20.0, // kg
  dropHeight: 1019, // mm
  targetEnergy: 200.0, // Joules
  targetVelocity: 4.47, // m/s
  
  // Step 5: Test Execution
  playbackSpeed: 1.0, // 1.0, 0.25, 0.05
  isArmed: false,
  isImpactRunning: false,
  isImpactCompleted: false,
  
  // Step 6: Evaluation
  isClayExtracted: false,
  isClayMeasured: false,
  isCapInspected: false,
  measuredClearance: null,
  capCracked: false,
  verdict: 'PENDING', // 'PASS', 'FAIL', 'PENDING'
  verdictReason: '',
  
  // Session Logs
  testLogs: [],
  
  // Physics Telemetry Data Arrays
  telemetryTime: [],
  telemetryForce: [],
  telemetryDisp: [],
  telemetryEnergy: [],
  maxForce: 0,
  maxDeformation: 0,
  actualEnergy: 0,
  actualVelocity: 0,
  
  // Animation state
  animFrameId: null,
  animIndex: 0,
  animTotalFrames: 0
};

// --- PHYSICS CONSTANTS & MATERIAL CONFIGURATIONS ---
const G = 9.81; // m/s^2

const MATERIALS = {
  steel: {
    name: "Steel Alloy",
    category: "Safety Shoe (Class I)",
    stiffness: 3800, // kN/m
    damping: 12,    // kN·s/m
    yieldForce: 27.5, // kN
    plasticStiffness: 400, // hardening after yield
    brittleLimit: null,   // does not crack easily
    massContribution: 0.18 // kg (relative toe cap weight)
  },
  aluminium: {
    name: "Aluminium Alloy",
    category: "Safety Trainer (Class I)",
    stiffness: 2400,
    damping: 9,
    yieldForce: 21.0,
    plasticStiffness: 250,
    brittleLimit: null,
    massContribution: 0.09
  },
  composite: {
    name: "Fiberglass / Composite",
    category: "Safety Workshoe (Class I)",
    stiffness: 1700,
    damping: 15,
    yieldForce: 99.0, // virtually elastic-perfect up to fracture
    plasticStiffness: 0,
    brittleLimit: 300, // Cracks if impact energy exceeds 300 Joules
    massContribution: 0.08
  },
  carbon: {
    name: "Carbon Fiber Composite",
    category: "Premium Safety Athletic",
    stiffness: 4800,
    damping: 6,
    yieldForce: 99.0, // purely elastic
    plasticStiffness: 0,
    brittleLimit: 240, // Cracks if impact energy exceeds 240 Joules
    massContribution: 0.05
  },
  soft: {
    name: "Soft Toe (No Guard)",
    category: "Occupational Shoe (Class II)",
    stiffness: 85,
    damping: 3,
    yieldForce: 1.2,
    plasticStiffness: 5,
    brittleLimit: 10,
    massContribution: 0.0
  }
};

// --- DOM ELEMENTS REFERENCE ---
const DOM = {
  // Global Headers
  headerStandardBadge: document.getElementById('header-standard-badge'),
  headerStandardSub: document.getElementById('header-standard-sub'),
  statusBeacon: document.getElementById('statusBeacon'),
  statusLabel: document.getElementById('statusLabel'),
  
  // Navigation
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next'),
  stepIndicator: document.getElementById('stepIndicator'),
  progressBar: document.getElementById('progressBar'),
  stepItems: document.querySelectorAll('.step-item'),
  instructionCards: document.querySelectorAll('.instruction-card'),

  // Step 1: Specimen selection
  materialButtons: document.querySelectorAll('.material-btn'),
  
  // Step 2: Clay prep
  clayHeightRange: document.getElementById('clay-height-range'),
  valClayH: document.getElementById('val-clay-h'),
  btnInsertClay: document.getElementById('btn-insert-clay'),
  clayStatusBox: document.getElementById('clay-status-box'),
  
  // Step 3: Clamping
  btnClampFixture: document.getElementById('btn-clamp-fixture'),
  clampStatusText: document.getElementById('clamp-status-text'),
  
  // Step 4: Machine Configuration
  radioStdEn: document.getElementById('radio-std-en'),
  radioStdAstm: document.getElementById('radio-std-astm'),
  radioStdCustom: document.getElementById('radio-std-custom'),
  inputMass: document.getElementById('input-mass'),
  lblInputMass: document.getElementById('lbl-input-mass'),
  inputHeight: document.getElementById('input-height'),
  lblInputHeight: document.getElementById('lbl-input-height'),
  previewTargetEnergy: document.getElementById('preview-target-energy'),
  previewTargetVel: document.getElementById('preview-target-vel'),
  btnConfigConfirm: document.getElementById('btn-config-confirm'),
  customSliderBlock: document.getElementById('custom-slider-block'),
  
  // Step 5: Test Execution
  lightArmed: document.getElementById('light-armed'),
  lightCatcher: document.getElementById('light-catcher'),
  btnReleaseStriker: document.getElementById('btn-release-striker'),
  speed1x: document.getElementById('speed-1x'),
  speed025x: document.getElementById('speed-025x'),
  speed005x: document.getElementById('speed-005x'),
  safetyShield: document.getElementById('safetyShield'),
  testWarningBox: document.getElementById('test-warning-box'),
  
  // Step 6: Evaluation
  btnExtractClay: document.getElementById('btn-extract-clay'),
  btnMeasureClay: document.getElementById('btn-measure-clay'),
  btnInspectCap: document.getElementById('btn-inspect-cap'),
  btnViewDent: document.getElementById('btn-view-dent'),
  dentModal: document.getElementById('dentModal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnCloseModalFooter: document.getElementById('btn-close-modal-footer'),
  modalToeDome: document.getElementById('modal-toe-dome'),
  modalToePattern: document.getElementById('modal-toe-pattern'),
  modalToeStress: document.getElementById('modal-toe-stress'),
  modalDentCrater: document.getElementById('modal-dent-crater'),
  modalDentMarker: document.getElementById('modal-dent-marker'),
  modalCapFractures: document.getElementById('modal-cap-fractures'),
  btnToggleFea: document.getElementById('btn-toggle-fea'),
  btnToggleMarker: document.getElementById('btn-toggle-marker'),
  btnToggleXray: document.getElementById('btn-toggle-xray'),
  modalShoeUpper: document.getElementById('modal-shoe-upper'),
  modalShoeStitching: document.getElementById('modal-shoe-stitching'),
  modalMaterialName: document.getElementById('modal-material-name'),
  modalSpecimenBadge: document.getElementById('modal-specimen-badge'),
  modalImpactEnergy: document.getElementById('modal-impact-energy'),
  modalPeakForce: document.getElementById('modal-peak-force'),
  modalMaxDeflection: document.getElementById('modal-max-deflection'),
  modalDentDepth: document.getElementById('modal-dent-depth'),
  modalCapState: document.getElementById('modal-cap-state'),
  modalDentAnalysis: document.getElementById('modal-dent-analysis'),
  evalInitClay: document.getElementById('eval-init-clay'),
  evalCompClay: document.getElementById('eval-comp-clay'),
  evalCapIntegrity: document.getElementById('eval-cap-integrity'),
  evalPeakDeformation: document.getElementById('eval-peak-deformation'),
  verdictBanner: document.getElementById('verdict-banner'),
  verdictTitle: document.getElementById('verdict-title'),
  verdictReason: document.getElementById('verdict-reason'),
  machineSvg: document.getElementById('machine-svg'),
  
  // SVG Graphic Elements
  strikerAssembly: document.getElementById('striker-assembly'),
  liftCable: document.getElementById('lift-cable'),
  catcherArm: document.getElementById('catcher-arm'),
  clampScrewRot: document.getElementById('clamp-screw-rot'),
  toeCapContour: document.getElementById('toe-cap-contour'),
  toeCapStress: document.getElementById('toe-cap-stress'),
  clayCylinder: document.getElementById('clay-cylinder'),
  clayPath: document.getElementById('clay-path'),
  capFractures: document.getElementById('cap-fractures'),
  sparkEffect: document.getElementById('spark-effect'),
  caliperTool: document.getElementById('caliper-tool'),
  caliperSliderJaw: document.getElementById('caliper-slider-jaw'),
  caliperDisplay: document.getElementById('caliper-display'),
  lensTool: document.getElementById('lens-tool'),
  magnetLed: document.getElementById('magnet-led'),
  clayBenchPlaceholder: document.getElementById('clay-bench-placeholder'),
  sideClayCylinder: document.getElementById('side-clay-cylinder'),
  sideClayPath: document.getElementById('side-clay-path'),
  sideLabelClay: document.getElementById('side-label-clay'),
  sideToeCap: document.getElementById('side-toe-cap'),
  sideToeCapInner: document.getElementById('side-toe-cap-inner'),
  
  // Dashboard Telemetry
  dashEnergy: document.getElementById('dash-energy'),
  dashVelocity: document.getElementById('dash-velocity'),
  dashForce: document.getElementById('dash-force'),
  dashDeformation: document.getElementById('dash-deformation'),
  runsTableBody: document.getElementById('runsTableBody'),
  runsTableEmptyRow: document.getElementById('runsTableEmptyRow'),
  btnClearLog: document.getElementById('btnClearLog')
};

// --- AUDIO GENERATION (SYNTHESIZED METALLIC CLANG) ---
let audioCtx = null;
function playImpactSound(energy) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    // Calculate volume based on impact energy
    const volume = Math.min(1.0, 0.1 + energy / 250);
    
    // Synthesize metallic strike sound
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const noise = audioCtx.createOscillator(); // low frequency rumble
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitch ring
    osc1.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.15);
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(240, audioCtx.currentTime); // Mid metallic thud
    osc2.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.25);
    
    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(60, audioCtx.currentTime); // Heavy structural vibration
    noise.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.4);
    
    // Combined envelope
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    // Filters to make it sound clanging and less electronic
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 350;
    filter.Q.value = 1.2;
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start();
    osc2.start();
    noise.start();
    
    osc1.stop(audioCtx.currentTime + 0.6);
    osc2.stop(audioCtx.currentTime + 0.6);
    noise.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.warn("Web Audio API not supported or blocked by browser:", e);
  }
}

// --- TEST COMPARISON LOG MANAGEMENT ---
function addTestRunToLog() {
  const materialName = MATERIALS[state.selectedMaterial].name;
  
  let standardText = "EN ISO 20345 (200 J)";
  if (state.testStandard === 'astm') {
    standardText = "ASTM F2413 (101.7 J)";
  } else if (state.testStandard === 'custom') {
    standardText = `Custom (${state.targetEnergy.toFixed(1)} J)`;
  }
  
  const actualEnergyVal = state.actualEnergy.toFixed(1) + " J";
  const peakForceVal = state.maxForce.toFixed(2) + " kN";
  const clearanceVal = state.measuredClearance.toFixed(2) + " mm";
  const verdictVal = state.verdict; // 'PASS' or 'FAIL'
  
  const newLog = {
    material: materialName,
    standard: standardText,
    energy: actualEnergyVal,
    force: peakForceVal,
    clearance: clearanceVal,
    verdict: verdictVal
  };
  
  state.testLogs.push(newLog);
  renderRunsLog();
}

function renderRunsLog() {
  const tbody = DOM.runsTableBody;
  const emptyRow = DOM.runsTableEmptyRow;
  
  if (!tbody) return;
  
  // Clear existing non-empty rows
  tbody.innerHTML = '';
  
  if (state.testLogs.length === 0) {
    if (emptyRow) {
      tbody.appendChild(emptyRow);
    } else {
      tbody.innerHTML = `<tr class="empty-row" id="runsTableEmptyRow"><td colspan="6">No tests recorded. Run a simulation to log data.</td></tr>`;
    }
    return;
  }
  
  state.testLogs.forEach(log => {
    const tr = document.createElement('tr');
    
    const tdMat = document.createElement('td');
    tdMat.textContent = log.material;
    tr.appendChild(tdMat);
    
    const tdStd = document.createElement('td');
    tdStd.textContent = log.standard;
    tr.appendChild(tdStd);
    
    const tdEnergy = document.createElement('td');
    tdEnergy.style.fontFamily = 'var(--font-mono)';
    tdEnergy.textContent = log.energy;
    tr.appendChild(tdEnergy);
    
    const tdForce = document.createElement('td');
    tdForce.style.fontFamily = 'var(--font-mono)';
    tdForce.textContent = log.force;
    tr.appendChild(tdForce);
    
    const tdClearance = document.createElement('td');
    tdClearance.style.fontFamily = 'var(--font-mono)';
    tdClearance.textContent = log.clearance;
    tr.appendChild(tdClearance);
    
    const tdVerdict = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge-verdict ${log.verdict.toLowerCase()}`;
    badge.textContent = log.verdict;
    tdVerdict.appendChild(badge);
    tr.appendChild(tdVerdict);
    
    tbody.appendChild(tr);
  });
}

function drawOscilloscopeGrid(currentFrameIndex = -1) {
  // Canvas graph removed in favor of specimen test runs log table
}

// --- NUMERICAL PHYSICS ENGINE ---
// Solves impact deceleration via classical dynamics (spring-damper-yield model)
function precomputeImpactPhysics() {
  const material = MATERIALS[state.selectedMaterial];
  const mass = state.strikerMass;
  const heightM = state.dropHeight / 1000.0; // mm to meters
  
  // Reset outputs
  state.telemetryTime = [];
  state.telemetryForce = [];
  state.telemetryDisp = [];
  state.telemetryEnergy = [];
  
  // 1. Initial conditions at the exact moment of impact contact
  const v0 = Math.sqrt(2 * G * heightM); // m/s
  const e0 = 0.5 * mass * v0 * v0; // Joules
  
  state.actualVelocity = v0;
  state.actualEnergy = e0;
  
  // 2. Integration parameters
  const dt = 0.0001; // solver timestep: 0.1 milliseconds (100 microseconds)
  let t = 0;
  
  let x = 0.0;    // toe cap deflection (meters)
  let v = v0;     // striker velocity (m/s)
  let a = 0.0;    // striker acceleration (m/s^2)
  let energy = e0; // striker kinetic energy (J)
  
  // Plastic set variables
  let plasticOffset = 0.0; // permanent deformation of the cap (m)
  
  let peakForce = 0.0;
  let peakDisp = 0.0;
  let capBrittleCracked = false;
  
  // Run integration loop for the contact duration (up to 30ms)
  // Stop when striker separates on rebound (velocity becomes negative, deflection returns to/below plasticOffset)
  const contactDurationMax = 0.035; // 35 ms max contact
  
  // Pre-impact lead-in points (draw flat line for first 2 ms of contact prep)
  for (let pre = -3; pre < 0; pre++) {
    state.telemetryTime.push((pre * 2.0)); // ms
    state.telemetryForce.push(0);
    state.telemetryDisp.push(0);
    state.telemetryEnergy.push(e0);
  }

  while (t < contactDurationMax) {
    // Current mechanical parameters (composite or carbon can crack)
    let currentStiffness = material.stiffness * 1000; // N/m
    let currentDamping = material.damping * 1000;     // N·s/m
    
    // Check brittle crack threshold
    if (material.brittleLimit && e0 > material.brittleLimit && x > (0.012)) {
      capBrittleCracked = true;
    }
    
    if (capBrittleCracked) {
      // Structure collapsed, minimal resistance remaining
      currentStiffness = 50 * 1000; 
      currentDamping = 1 * 1000;
    }
    
    // Elastic deformation relative to plastic anchor
    const elasticDef = x - plasticOffset;
    
    // Spring Force
    let fSpring = 0.0;
    if (elasticDef > 0) {
      // Material yield behavior (Steel / Aluminium)
      const yieldPointM = (material.yieldForce * 1000) / currentStiffness;
      if (elasticDef > yieldPointM) {
        // Yielded: plastic flow occurs
        const yieldForceN = material.yieldForce * 1000;
        const overElastic = elasticDef - yieldPointM;
        fSpring = yieldForceN + overElastic * (material.plasticStiffness * 1000);
        
        // Update plasticOffset to reflect permanent damage
        plasticOffset = x - (fSpring / currentStiffness);
      } else {
        fSpring = currentStiffness * elasticDef;
      }
    }
    
    // Damping Force (only acts when compressing, resists motion)
    let fDamping = 0.0;
    if (v > 0) {
      fDamping = currentDamping * v;
    }
    
    // Total resisting force
    const forceN = fSpring + fDamping;
    const forceKN = forceN / 1000.0;
    
    // Equations of motion
    // Acceleration: striker is decelerated by the cap resistance (-force) and accelerated by gravity (+m*g)
    a = G - (forceN / mass);
    
    // Update velocity and displacement
    v = v + a * dt;
    x = x + v * dt;
    
    if (x < 0) x = 0; // cannot penetrate upwards before contact
    
    // Current kinetic energy
    energy = 0.5 * mass * v * v;
    
    // Record telemetry (downsample to every 0.2ms to keep arrays manageable)
    const timeMs = t * 1000.0;
    if (Math.round(timeMs * 10) % 2 === 0) {
      state.telemetryTime.push(timeMs);
      state.telemetryForce.push(forceKN);
      state.telemetryDisp.push(x * 1000.0); // m to mm
      state.telemetryEnergy.push(Math.max(0, energy));
    }
    
    // Record peaks
    if (forceKN > peakForce) peakForce = forceKN;
    if (x * 1000.0 > peakDisp) peakDisp = x * 1000.0;
    
    // Break check: striker starts bouncing upwards and leaves the toe cap contact zone
    if (v < 0 && x <= plasticOffset && t > 0.003) {
      break;
    }
    
    t += dt;
  }
  
  // Post-process displacement during rebound for realistic visual retention:
  let targetOffset = plasticOffset * 1000.0; // in mm
  if (state.selectedMaterial === 'steel') {
    targetOffset = Math.max(targetOffset, peakDisp * 0.55);
  } else if (state.selectedMaterial === 'aluminium') {
    targetOffset = Math.max(targetOffset, peakDisp * 0.65);
  }
  
  // Find index of peak displacement
  let peakIdx = 0;
  for (let i = 0; i < state.telemetryDisp.length; i++) {
    if (state.telemetryDisp[i] === peakDisp) {
      peakIdx = i;
      break;
    }
  }
  
  // Adjust plastic offset
  plasticOffset = targetOffset / 1000.0;
  
  // Rescale rebound values smoothly
  const finalCalculated = state.telemetryDisp[state.telemetryDisp.length - 1];
  const denom = peakDisp - finalCalculated;
  if (denom > 0.1) {
    for (let i = peakIdx; i < state.telemetryDisp.length; i++) {
      const orig = state.telemetryDisp[i];
      const t_ratio = Math.max(0, Math.min(1, (orig - finalCalculated) / denom));
      state.telemetryDisp[i] = targetOffset + t_ratio * (peakDisp - targetOffset);
    }
  }
  
  // Post-impact follow-up (3 points flat line to show separation)
  const finalT = state.telemetryTime[state.telemetryTime.length - 1];
  for (let post = 1; post <= 3; post++) {
    state.telemetryTime.push(finalT + post * 2.0);
    state.telemetryForce.push(0);
    state.telemetryDisp.push(plasticOffset * 1000.0);
    state.telemetryEnergy.push(0.5 * mass * v * v);
  }
  
  state.maxForce = peakForce;
  state.maxDeformation = peakDisp;
  state.capCracked = capBrittleCracked;
  
  // Minimum clearance height based on peak deformation
  // Minimum clearance occurs at the peak squash moment of the toe cap
  // The clay is compressed by the peak deflection, then stays compressed.
  // We model clay clearance as: ClayHeight - peakDeflection * scalingFactor
  // Safety toe caps have varying geometries. Composite/Carbon rebound.
  // Soft-toe collapses to nearly 0.
  let clearance = state.clayHeight - peakDisp;
  
  if (state.selectedMaterial === 'soft') {
    clearance = Math.max(0, state.clayHeight - peakDisp - 10); // completely crushed
  } else if (state.capCracked) {
    clearance = Math.max(1.5, state.clayHeight - peakDisp - 5); // heavily crushed due to structure fail
  }
  
  // Standards mandate size 8 requires >= 14.0mm (EN) or >= 12.7mm (ASTM)
  state.measuredClearance = parseFloat(Math.max(0, clearance).toFixed(2));
}

// --- STATE ACTIONS & STEP TRANSITIONS ---
function updateStepUI() {
  // Step indicator and progress bar width
  DOM.progressBar.style.width = `${(state.currentStep / 6) * 100}%`;
  DOM.stepIndicator.textContent = `Step ${state.currentStep} of 6`;
  
  // Update left-hand wizard list styling
  DOM.stepItems.forEach((item, index) => {
    item.classList.remove('active', 'completed');
    const stepNum = index + 1;
    if (stepNum === state.currentStep) {
      item.classList.add('active');
    } else if (stepNum < state.currentStep) {
      item.classList.add('completed');
    }
  });

  // Toggle instruction cards
  DOM.instructionCards.forEach((card, index) => {
    card.classList.toggle('active', (index + 1) === state.currentStep);
  });

  // Enable/Disable step navigation buttons
  DOM.btnPrev.disabled = state.currentStep === 1;
  DOM.btnNext.disabled = !canProceedToNextStep();
  DOM.btnNext.classList.toggle('active-nav', canProceedToNextStep());

  if (state.currentStep === 6) {
    DOM.btnNext.innerHTML = "Finish";
  } else {
    DOM.btnNext.innerHTML = "Next Step &rarr;";
  }

  if (DOM.btnViewDent) {
    DOM.btnViewDent.disabled = state.currentStep !== 6;
  }

  // Step-specific visual initialization in laboratory bench SVG
  handleStepVisuals();
}

function canProceedToNextStep() {
  if (state.currentStep === 1) return true; // Material selected (default steel)
  if (state.currentStep === 2) return state.isClayPlaced; // Clay positioned
  if (state.currentStep === 3) return state.isClamped; // Clamped
  if (state.currentStep === 4) return true; // Machine configured
  if (state.currentStep === 5) return state.isImpactCompleted; // Impact executed
  if (state.currentStep === 6) return state.isClayExtracted && state.isClayMeasured && state.isCapInspected;
  return false;
}

function handleStepVisuals() {
  // Hide tool overlays by default
  DOM.caliperTool.setAttribute('opacity', '0');
  DOM.lensTool.setAttribute('opacity', '0');
  if (DOM.safetyShield) {
    DOM.safetyShield.classList.remove('armed');
    DOM.safetyShield.style.display = 'none';
  }

  if (DOM.clayBenchPlaceholder) {
    DOM.clayBenchPlaceholder.setAttribute('opacity', '0');
  }

  // 1. SPECIMEN / INVENTORY VIEW
  if (state.currentStep === 1) {
    DOM.clayCylinder.setAttribute('opacity', '0');
    if (DOM.sideClayCylinder) DOM.sideClayCylinder.setAttribute('opacity', '0');
    if (DOM.sideLabelClay) DOM.sideLabelClay.setAttribute('opacity', '0');
    // Set striker to ready top position
    resetStrikerVisualHeight();
    resetToeCapVisuals();
  }
  
  // 2. CLAY CYLINDER POSITIONING
  else if (state.currentStep === 2) {
    resetToeCapVisuals();
    if (state.isClayPlaced) {
      DOM.clayCylinder.setAttribute('opacity', '1');
      if (DOM.sideClayCylinder) DOM.sideClayCylinder.setAttribute('opacity', '1');
      if (DOM.sideLabelClay) DOM.sideLabelClay.setAttribute('opacity', '1');
      if (DOM.clayBenchPlaceholder) DOM.clayBenchPlaceholder.setAttribute('opacity', '0');
      DOM.clayStatusBox.className = "alert-box info";
      DOM.clayStatusBox.innerHTML = `<strong>Cylinder Status:</strong> Molded cylinder (Height: <strong>${state.clayHeight.toFixed(1)} mm</strong>) positioned under cap.`;
      // Position clay at base height
      updateClayVisualHeight(state.clayHeight);
    } else {
      DOM.clayCylinder.setAttribute('opacity', '0');
      if (DOM.sideClayCylinder) DOM.sideClayCylinder.setAttribute('opacity', '0');
      if (DOM.sideLabelClay) DOM.sideLabelClay.setAttribute('opacity', '0');
      if (DOM.clayBenchPlaceholder) DOM.clayBenchPlaceholder.setAttribute('opacity', '1');
      DOM.clayStatusBox.className = "alert-box warning";
      DOM.clayStatusBox.innerHTML = `<strong>Cylinder Status:</strong> Clay cylinder not placed. Click directly on the clay cylinder or the button to position it.`;
      updatePlaceholderVisualHeight(state.clayHeight);
    }
  }

  // 3. CLAMPING FIXTURE
  else if (state.currentStep === 3) {
    DOM.clayCylinder.setAttribute('opacity', state.isClayPlaced ? '1' : '0');
    if (DOM.sideClayCylinder) DOM.sideClayCylinder.setAttribute('opacity', state.isClayPlaced ? '1' : '0');
    if (DOM.sideLabelClay) DOM.sideLabelClay.setAttribute('opacity', state.isClayPlaced ? '1' : '0');
    if (state.isClamped) {
      DOM.clampStatusText.textContent = "Clamp Status: SECURED (Clamping torque: 10 N·m)";
      DOM.clampStatusText.className = "clamp-readout secured";
      DOM.btnClampFixture.className = "action-btn active-green";
      DOM.btnClampFixture.textContent = "Release Clamping Fixture";
      DOM.clampScrewRot.setAttribute('transform', 'translate(-10, 0)'); // shift visually to look tightened
    } else {
      DOM.clampStatusText.textContent = "Clamp Status: UNSECURED";
      DOM.clampStatusText.className = "clamp-readout";
      DOM.btnClampFixture.className = "action-btn";
      DOM.btnClampFixture.textContent = "Tighten Clamping Fixture";
      DOM.clampScrewRot.setAttribute('transform', 'translate(0, 0)');
    }
  }

  // 4. MACHINE PARAMETERS CONFIGURATION
  else if (state.currentStep === 4) {
    DOM.clayCylinder.setAttribute('opacity', '1');
    if (DOM.sideClayCylinder) DOM.sideClayCylinder.setAttribute('opacity', '1');
    if (DOM.sideLabelClay) DOM.sideLabelClay.setAttribute('opacity', '1');
    resetStrikerVisualHeight();
  }

  // 5. TEST RUN & DROP EXECUTION
  else if (state.currentStep === 5) {
    precomputeImpactPhysics();
    DOM.clayCylinder.setAttribute('opacity', '1');
    if (DOM.sideClayCylinder) DOM.sideClayCylinder.setAttribute('opacity', '1');
    if (DOM.sideLabelClay) DOM.sideLabelClay.setAttribute('opacity', '1');
    // Lock safety shield
    if (DOM.safetyShield) {
      DOM.safetyShield.style.display = 'flex';
      DOM.safetyShield.className = "safety-shield armed";
    }
    
    // Set magnet LED to armed (amber/red)
    DOM.magnetLed.setAttribute('fill', '#ff1744');
    
    if (state.isImpactCompleted) {
      DOM.lightArmed.className = "safety-light active-green";
      DOM.lightArmed.textContent = "TEST FINISHED";
      DOM.lightCatcher.className = "safety-light active-green";
      DOM.lightCatcher.textContent = "REBOUND CATCHER TRIGGERED";
      DOM.btnReleaseStriker.disabled = true;
      if (DOM.safetyShield) {
        DOM.safetyShield.className = "safety-shield";
        const statusText = DOM.safetyShield.querySelector('.shield-status');
        if (statusText) statusText.textContent = "Test Complete &bull; Catcher Latched";
      }
      DOM.magnetLed.setAttribute('fill', '#2c3240'); // magnet off
    } else {
      DOM.lightArmed.className = "safety-light active-red";
      DOM.lightArmed.textContent = "ARMED & READY";
      DOM.lightCatcher.className = "safety-light";
      DOM.lightCatcher.textContent = "CATCHER DISARMED";
      DOM.btnReleaseStriker.disabled = false;
      DOM.magnetLed.setAttribute('fill', '#ff1744');
    }
  }

  // 6. EVALUATION, CALIPER MEASURING, LENS VIEW
  else if (state.currentStep === 6) {
    const caliperClay = document.getElementById('caliper-clay-path');
    
    // If clay is extracted, hide it inside the shoe and show caliper tool with clay inside
    if (state.isClayExtracted) {
      DOM.clayCylinder.setAttribute('opacity', '0');
      if (DOM.sideClayCylinder) DOM.sideClayCylinder.setAttribute('opacity', '0');
      if (DOM.sideLabelClay) DOM.sideLabelClay.setAttribute('opacity', '0');
      DOM.caliperTool.setAttribute('opacity', '1');
      if (caliperClay) caliperClay.setAttribute('opacity', '1');
      
      const scaledClay = state.measuredClearance * 1.25;
      const topY = 136 - scaledClay;
      if (caliperClay) {
        caliperClay.setAttribute('d', `M 47 136 L 59 136 L 59 ${topY.toFixed(1)} L 47 ${topY.toFixed(1)} Z`);
      }
      
      if (state.isClayMeasured) {
        DOM.caliperSliderJaw.setAttribute('transform', `translate(0, ${-scaledClay})`);
        DOM.caliperDisplay.textContent = state.measuredClearance.toFixed(2);
      } else {
        DOM.caliperSliderJaw.setAttribute('transform', 'translate(0, -35)');
        DOM.caliperDisplay.textContent = "00.00";
      }
    } else {
      DOM.clayCylinder.setAttribute('opacity', '1');
      if (DOM.sideClayCylinder) DOM.sideClayCylinder.setAttribute('opacity', '1');
      if (DOM.sideLabelClay) DOM.sideLabelClay.setAttribute('opacity', '1');
      DOM.caliperTool.setAttribute('opacity', '0');
      if (caliperClay) caliperClay.setAttribute('opacity', '0');
    }
    
    // Show magnifying lens if inspecting
    const backing = document.getElementById('toe-cap-backing');
    const backingShadow = document.getElementById('toe-cap-backing-shadow');
    
    if (state.isCapInspected) {
      DOM.lensTool.setAttribute('opacity', '1');
      DOM.capFractures.setAttribute('opacity', state.capCracked ? '1' : '0');
      
      // Apply FEA stress heat gradient visually to the deformed toe cap and solid backing
      DOM.toeCapContour.setAttribute('fill', 'url(#fea-stress-grad)');
      DOM.toeCapStress.setAttribute('opacity', '0.7');
      DOM.toeCapStress.setAttribute('fill', 'url(#fea-stress-grad)');
      if (backing) backing.setAttribute('fill', 'url(#fea-stress-grad)');
      if (backingShadow) backingShadow.setAttribute('opacity', '0.15');
    } else {
      DOM.lensTool.setAttribute('opacity', '0');
      
      // Re-apply original clean material styling
      updateToeCapFill();
      DOM.toeCapStress.setAttribute('opacity', '0');
      if (backingShadow) backingShadow.setAttribute('opacity', '0.35');
    }
  }
}

function resetStrikerVisualHeight() {
  // Translate height in mm to SVG coordinates
  // Drop Height 1500mm = assembly y coordinate 85px
  // Drop Height 0mm (contact) = assembly y coordinate 351px
  // Formula: y = 351 - (height / 1500) * 266
  const mm = state.dropHeight;
  const y = 351 - (mm / 1500.0) * 266;
  DOM.strikerAssembly.setAttribute('transform', `translate(0, ${y})`);
  // Safety catcher default angled back
  DOM.catcherArm.setAttribute('transform', 'rotate(-15)');
  
  // Update suspension hoist cable height
  if (DOM.liftCable) {
    DOM.liftCable.setAttribute('y2', y);
  }
}

function updateClayVisualHeight(heightMm) {
  // Height scale: 1.25px per mm
  const heightPx = heightMm * 1.25;
  const dPath = `M -8 -${heightPx.toFixed(1)} L 8 -${heightPx.toFixed(1)} L 8 0 L -8 0 Z`;
  DOM.clayPath.setAttribute('d', dPath);
  
  if (DOM.sideClayPath) {
    const heightPxSide = heightMm * 1.875;
    const dPathSide = `M -18.75 -${heightPxSide.toFixed(1)} L 18.75 -${heightPxSide.toFixed(1)} L 18.75 0 L -18.75 0 Z`;
    DOM.sideClayPath.setAttribute('d', dPathSide);
  }
}

function updatePlaceholderVisualHeight(heightMm) {
  // Height scale: 1.25px per mm
  const heightPx = heightMm * 1.25;
  const dPath = `M -8 -${heightPx.toFixed(1)} L 8 -${heightPx.toFixed(1)} L 8 0 L -8 0 Z`;
  const placeholderPath = document.getElementById('clay-placeholder-path');
  const placeholderLabel = document.getElementById('clay-placeholder-label');
  if (placeholderPath) {
    placeholderPath.setAttribute('d', dPath);
  }
  if (placeholderLabel) {
    placeholderLabel.setAttribute('y', `-${(heightPx + 5.5).toFixed(1)}`);
  }
}

function animateClayPlacement() {
  if (state.isClayPlaced) return;
  
  const placeholder = DOM.clayBenchPlaceholder;
  if (!placeholder) return;
  
  let frame = 0;
  const totalFrames = 25;
  
  // Starting point: (340, 580)
  const startX = 340;
  const startY = 580;
  
  // Target point: global (250, 533)
  // Shoe Specimen translate is at (195, 465). Internally clay is at (55, 68). Global = (250, 533)
  const endX = 250;
  const endY = 533;
  
  // Disable clicks during animation
  placeholder.style.pointerEvents = 'none';
  DOM.btnInsertClay.disabled = true;
  
  function glide() {
    if (frame <= totalFrames) {
      const progress = frame / totalFrames;
      // ease-in-out
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const curX = startX + (endX - startX) * ease;
      const curY = startY + (endY - startY) * ease;
      
      placeholder.setAttribute('transform', `translate(${curX}, ${curY})`);
      frame++;
      requestAnimationFrame(glide);
    } else {
      state.isClayPlaced = true;
      
      // Reset placeholder to initial spot but hide it
      placeholder.setAttribute('transform', `translate(${startX}, ${startY})`);
      placeholder.setAttribute('opacity', '0');
      placeholder.style.pointerEvents = 'auto';
      
      // Show actual cylinder inside shoe
      DOM.clayCylinder.setAttribute('opacity', '1');
      if (DOM.frontClay) DOM.frontClay.setAttribute('opacity', '1');
      updateClayVisualHeight(state.clayHeight);
      
      DOM.clayStatusBox.className = "alert-box info";
      DOM.clayStatusBox.innerHTML = `<strong>Cylinder Status:</strong> Molded cylinder (Height: <strong>${state.clayHeight.toFixed(1)} mm</strong>) positioned under cap.`;
      
      DOM.btnInsertClay.disabled = false;
      updateStepUI();
    }
  }
  requestAnimationFrame(glide);
}

function updateSideToeCapVisuals(displacementPx) {
  const sideCap = DOM.sideToeCap;
  const sideCapInner = DOM.sideToeCapInner;
  if (!sideCap) return;
  
  let pathStr = "";
  if (displacementPx > 0) {
    pathStr = `M 46 ${(45 + displacementPx).toFixed(1)} C 60 ${(45 + displacementPx).toFixed(1)}, 85 ${(47 + displacementPx).toFixed(1)}, 105 ${(52 + displacementPx).toFixed(1)} C 120 ${(55 + displacementPx * 0.7).toFixed(1)}, 130 ${(75 + displacementPx * 0.4).toFixed(1)}, 130 96`;
  } else {
    pathStr = `M 46 45 C 60 45, 85 47, 105 52 C 120 55, 130 75, 130 96`;
  }
  
  sideCap.setAttribute('d', pathStr);
  if (sideCapInner) sideCapInner.setAttribute('d', pathStr);
}

function updateSideToeCapFill() {
  const sideCap = DOM.sideToeCap;
  if (!sideCap) return;
  
  if (state.selectedMaterial === 'soft') {
    sideCap.setAttribute('stroke', 'none');
  } else {
    sideCap.setAttribute('stroke', 'url(#side-cap-grad)');
  }
}

function updateToeCapFill() {
  const cap = DOM.toeCapContour;
  const backing = document.getElementById('toe-cap-backing');
  if (!cap) return;
  
  let fillVal = '';
  let strokeVal = '';
  let widthVal = '1.5';
  
  if (state.selectedMaterial === 'steel') {
    fillVal = 'url(#cap-steel-grad)';
    strokeVal = '#4c566a';
  } else if (state.selectedMaterial === 'aluminium') {
    fillVal = 'url(#cap-alum-grad)';
    strokeVal = '#81a1c1';
  } else if (state.selectedMaterial === 'composite') {
    fillVal = 'url(#cap-comp-grad)';
    strokeVal = '#3b4252';
  } else if (state.selectedMaterial === 'carbon') {
    fillVal = 'url(#cap-carbon-grad)';
    strokeVal = '#2e3440';
  } else {
    // soft toe
    fillVal = 'none';
    strokeVal = 'none';
  }
  
  cap.setAttribute('fill', fillVal);
  cap.setAttribute('stroke', strokeVal);
  cap.setAttribute('stroke-width', widthVal);
  
  if (backing) {
    backing.setAttribute('fill', fillVal);
    backing.setAttribute('opacity', fillVal === 'none' ? '0' : '1');
  }

  updateSideToeCapFill();
}

function resetToeCapVisuals() {
  // Restore original path of toe cap dome
  DOM.toeCapContour.setAttribute('d', 'M 27 68 Q 27 34 55 34 Q 83 34 83 68 L 79 68 Q 79 38 55 38 Q 31 38 31 68 Z');
  DOM.toeCapStress.setAttribute('d', 'M 27 68 Q 27 34 55 34 Q 83 34 83 68 L 79 68 Q 79 38 55 38 Q 31 38 31 68 Z');
  DOM.toeCapStress.setAttribute('opacity', '0');
  DOM.capFractures.setAttribute('opacity', '0');
  DOM.sparkEffect.setAttribute('opacity', '0');
  
  const backing = document.getElementById('toe-cap-backing');
  const backingShadow = document.getElementById('toe-cap-backing-shadow');
  if (backing) backing.setAttribute('d', 'M 31 68 Q 31 38 55 38 Q 79 38 79 68 Z');
  if (backingShadow) backingShadow.setAttribute('d', 'M 31 68 Q 31 38 55 38 Q 79 38 79 68 Z');
  if (backingShadow) backingShadow.setAttribute('opacity', '0.3');
  
  const cavity = document.getElementById('shoe-cavity');
  if (cavity) cavity.setAttribute('d', 'M -11 68 C 5 36, 18 34, 27 34 L 27 68 Z');
  
  const capLeather = document.getElementById('shoe-cap-leather');
  const capStitch = document.getElementById('shoe-cap-stitch');
  if (capLeather) capLeather.setAttribute('d', 'M 27 68 Q 27 34 55 34 Q 83 34 83 68');
  if (capStitch) capStitch.setAttribute('d', 'M 27 66 Q 27 32 55 32 Q 83 32 83 66');
  
  updateToeCapFill();
  updateSideToeCapVisuals(0);
}

// --- CONFIGURE SETTINGS BUTTON LISTENERS ---

// Step 1 buttons
DOM.materialButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    DOM.materialButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedMaterial = btn.dataset.material;
    
    // Update Header standard badges depending on material
    const matInfo = MATERIALS[state.selectedMaterial];
    DOM.headerStandardSub.textContent = `Toe Protection Impact Resistance (200 Joules) - ${matInfo.name}`;
    
    updateToeCapFill();
    updateStepUI();
  });
});

// Step 2 controls
DOM.clayHeightRange.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  state.clayHeight = val;
  DOM.valClayH.textContent = val.toFixed(1);
  if (state.isClayPlaced) {
    updateClayVisualHeight(val);
  } else {
    updatePlaceholderVisualHeight(val);
  }
});

DOM.btnInsertClay.addEventListener('click', () => {
  animateClayPlacement();
});

if (DOM.clayBenchPlaceholder) {
  DOM.clayBenchPlaceholder.addEventListener('click', () => {
    animateClayPlacement();
  });
}

// Step 3 controls
DOM.btnClampFixture.addEventListener('click', () => {
  state.isClamped = !state.isClamped;
  
  // Visual sound/feedback of tightening
  if (state.isClamped) {
    DOM.clampStatusText.textContent = "Clamp Status: SECURED (Clamping torque: 10 N·m)";
    DOM.clampStatusText.className = "clamp-readout secured";
    DOM.btnClampFixture.className = "action-btn active-green";
    DOM.btnClampFixture.textContent = "Release Clamping Fixture";
    DOM.clampScrewRot.setAttribute('transform', 'translate(-10, 0)');
  } else {
    DOM.clampStatusText.textContent = "Clamp Status: UNSECURED";
    DOM.clampStatusText.className = "clamp-readout";
    DOM.btnClampFixture.className = "action-btn";
    DOM.btnClampFixture.textContent = "Tighten Clamping Fixture";
    DOM.clampScrewRot.setAttribute('transform', 'translate(0, 0)');
  }
  
  updateStepUI();
});

// Step 4: Radio Presets
function updateStandardConfig() {
  if (DOM.radioStdEn.checked) {
    state.testStandard = 'en';
    state.strikerMass = 20.0;
    state.dropHeight = 1019; // for 200J
    DOM.inputMass.disabled = true;
    DOM.inputHeight.disabled = true;
    DOM.customSliderBlock.classList.remove('active');
  } else if (DOM.radioStdAstm.checked) {
    state.testStandard = 'astm';
    state.strikerMass = 22.7; // 50 lbs
    state.dropHeight = 457; // 18 inches
    DOM.inputMass.disabled = true;
    DOM.inputHeight.disabled = true;
    DOM.customSliderBlock.classList.remove('active');
  } else {
    state.testStandard = 'custom';
    DOM.inputMass.disabled = false;
    DOM.inputHeight.disabled = false;
  }
  
  // Calculate pre-energy
  state.targetEnergy = state.strikerMass * G * (state.dropHeight / 1000.0);
  state.targetVelocity = Math.sqrt(2 * G * (state.dropHeight / 1000.0));
  
  // Update inputs displays
  DOM.inputMass.value = state.strikerMass;
  DOM.lblInputMass.textContent = state.strikerMass.toFixed(1);
  DOM.inputHeight.value = state.dropHeight;
  DOM.lblInputHeight.textContent = state.dropHeight;
  
  DOM.previewTargetEnergy.textContent = `${state.targetEnergy.toFixed(1)} J`;
  DOM.previewTargetVel.textContent = `${state.targetVelocity.toFixed(2)} m/s`;
  
  // Sync banner standard
  if (state.testStandard === 'en') {
    DOM.headerStandardBadge.textContent = "EN ISO 20345";
    DOM.headerStandardBadge.className = "badge";
  } else if (state.testStandard === 'astm') {
    DOM.headerStandardBadge.textContent = "ASTM F2413";
    DOM.headerStandardBadge.className = "badge";
  } else {
    DOM.headerStandardBadge.textContent = "CUSTOM PROFILE";
    DOM.headerStandardBadge.className = "badge";
  }
  
  resetStrikerVisualHeight();
}

DOM.radioStdEn.addEventListener('change', updateStandardConfig);
DOM.radioStdAstm.addEventListener('change', updateStandardConfig);
DOM.radioStdCustom.addEventListener('change', updateStandardConfig);

DOM.inputMass.addEventListener('input', (e) => {
  state.strikerMass = parseFloat(e.target.value);
  DOM.lblInputMass.textContent = state.strikerMass.toFixed(1);
  state.targetEnergy = state.strikerMass * G * (state.dropHeight / 1000.0);
  DOM.previewTargetEnergy.textContent = `${state.targetEnergy.toFixed(1)} J`;
});

DOM.inputHeight.addEventListener('input', (e) => {
  state.dropHeight = parseInt(e.target.value);
  DOM.lblInputHeight.textContent = state.dropHeight;
  state.targetEnergy = state.strikerMass * G * (state.dropHeight / 1000.0);
  state.targetVelocity = Math.sqrt(2 * G * (state.dropHeight / 1000.0));
  DOM.previewTargetEnergy.textContent = `${state.targetEnergy.toFixed(1)} J`;
  DOM.previewTargetVel.textContent = `${state.targetVelocity.toFixed(2)} m/s`;
  resetStrikerVisualHeight();
});

DOM.btnConfigConfirm.addEventListener('click', () => {
  // Precompute physics trajectory data
  precomputeImpactPhysics();
  
  // Transition logic
  state.currentStep = 5;
  updateStepUI();
});

// Step 5: Speed multipliers
const speedButtons = [DOM.speed1x, DOM.speed025x, DOM.speed005x];
speedButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    speedButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.playbackSpeed = parseFloat(btn.dataset.speed);
  });
});

// --- STRIKER DROP ANIMATION AND PHYSICAL FEEDBACK ---
DOM.btnReleaseStriker.addEventListener('click', () => {
  if (state.isImpactRunning || state.isImpactCompleted) return;
  
  state.isImpactRunning = true;
  state.animMaxDisp = 0;
  DOM.btnReleaseStriker.disabled = true;
  DOM.btnPrev.disabled = true;
  
  // Update system status labels
  if (DOM.statusBeacon) DOM.statusBeacon.className = "status-beacon blinking-red";
  if (DOM.statusLabel) DOM.statusLabel.textContent = "RELEASE ENGAGED";
  DOM.magnetLed.setAttribute('fill', '#2c3240'); // magnet released
  
  // Initialize free-fall animation variables
  // Time from release to contact: t = sqrt(2h/g)
  const hM = state.dropHeight / 1000.0;
  const fallDuration = Math.sqrt(2 * hM / G); // seconds
  
  let startTime = null;
  const initialY = 351 - (state.dropHeight / 1500.0) * 266; // SVG coordinate of release height
  const contactY = 351; // SVG coordinate of impact contact
  
  // Pre-calculate frame counts
  // Total telemetry duration is around state.telemetryTime.length
  state.animIndex = 0;
  state.animTotalFrames = state.telemetryTime.length;
  
  function animStep(timestamp) {
    if (!startTime) startTime = timestamp;
    
    // Elapsed visual time in seconds
    const elapsedSeconds = ((timestamp - startTime) / 1000.0) * state.playbackSpeed;
    
    if (elapsedSeconds < fallDuration) {
      // 1. FREE-FALL PHASE
      // Distance fallen: d = 0.5 * g * t^2
      const dM = 0.5 * G * elapsedSeconds * elapsedSeconds;
      const dMm = dM * 1000.0;
      
      // Update visual striker position
      const currentY = initialY + (dMm / 1500.0) * 266;
      const strikerY = Math.min(contactY, currentY);
      DOM.strikerAssembly.setAttribute('transform', `translate(0, ${strikerY})`);
      if (DOM.liftCable) DOM.liftCable.setAttribute('y2', strikerY);
      
      // Keep safety catcher open
      DOM.catcherArm.setAttribute('transform', 'rotate(-15)');
      
      // Draw blank telemetry dashboard (pre-impact)
      if (DOM.dashVelocity) DOM.dashVelocity.textContent = `${Math.sqrt(2 * G * dM).toFixed(2)} m/s`;
      if (DOM.dashEnergy) DOM.dashEnergy.textContent = `${(state.strikerMass * G * dM).toFixed(1)} J`;
      if (DOM.dashForce) DOM.dashForce.textContent = "0.00 kN";
      if (DOM.dashDeformation) DOM.dashDeformation.textContent = "0.0 mm";
      
      // Continue free fall
      state.animFrameId = requestAnimationFrame(animStep);
    } else {
      // 2. MOMENT OF IMPACT CONTACT & DECELERATION
      // Sync frame tracking index of precomputed physics curves
      if (state.animIndex === 0) {
        // First contact frame: Play metallic Clang sound!
        playImpactSound(state.actualEnergy);
      }
      
      if (state.animIndex < state.animTotalFrames) {
        const idx = state.animIndex;
        
        const force = state.telemetryForce[idx];
        const disp = state.telemetryDisp[idx]; // deformation in mm
        const energy = state.telemetryEnergy[idx];
        
        // Visual Striker movement (contacts and pushes cap down)
        // contactY is 351px. Defender pushes cap down by disp (scaled: exaggerated factor of 2.2x to make deformation highly visible on screen)
        const displacementPx = Math.min(30, disp * 2.2);
        const strikerY = contactY + displacementPx;
        DOM.strikerAssembly.setAttribute('transform', `translate(0, ${strikerY})`);
        if (DOM.liftCable) DOM.liftCable.setAttribute('y2', strikerY);
        
        // Side View Cap Deformation
        updateSideToeCapVisuals(displacementPx);
        
        // Visual Cap Deformation
        // Compress toe cap SVG contour paths:
        // Original: M 27 68 Q 27 34 55 34 Q 83 34 83 68 L 79 68 Q 79 38 55 38 Q 31 38 31 68 Z
        // Deformed: lower peak apex (y=34) down by displacementPx
        const apexY = 34 + displacementPx;
        const innerApexY = 38 + displacementPx;
        const capPathStr = `M 27 68 Q 27 34.0 55 ${apexY.toFixed(1)} Q 83 34.0 83 68 L 79 68 Q 79 38.0 55 ${innerApexY.toFixed(1)} Q 31 38.0 31 68 Z`;
        DOM.toeCapContour.setAttribute('d', capPathStr);
        DOM.toeCapStress.setAttribute('d', capPathStr);
        
        // Deform solid backing dome and inner cavity
        const backingPathStr = `M 31 68 Q 31 38.0 55 ${innerApexY.toFixed(1)} Q 79 38.0 79 68 Z`;
        const backing = document.getElementById('toe-cap-backing');
        const backingShadow = document.getElementById('toe-cap-backing-shadow');
        if (backing) backing.setAttribute('d', backingPathStr);
        if (backingShadow) backingShadow.setAttribute('d', backingPathStr);
        
        const cavityPathStr = `M -11 68 C 5 36.0, 18 ${(34 + displacementPx * 0.2).toFixed(1)}, 27 ${(34 + displacementPx * 0.2).toFixed(1)} L 27 68 Z`;
        const cavity = document.getElementById('shoe-cavity');
        if (cavity) cavity.setAttribute('d', cavityPathStr);
        
        // Deform outer leather cover and stitching wrapping the cap
        const leatherPathStr = `M 27 68 Q 27 34.0 55 ${apexY.toFixed(1)} Q 83 34.0 83 68`;
        const stitchPathStr = `M 27 66 Q 27 32.0 55 ${(32 + displacementPx).toFixed(1)} Q 83 32.0 83 66`;
        const capLeather = document.getElementById('shoe-cap-leather');
        const capStitch = document.getElementById('shoe-cap-stitch');
        if (capLeather) capLeather.setAttribute('d', leatherPathStr);
        if (capStitch) capStitch.setAttribute('d', stitchPathStr);
        
        // Red glowing stress map opacity proportional to force
        const stressOpacity = Math.min(0.95, force / 32.0);
        DOM.toeCapStress.setAttribute('opacity', stressOpacity.toString());
        
        // Visual Clay Cylinder compression (retains maximum plastic deformation shape)
        if (state.isClayPlaced) {
          state.animMaxDisp = Math.max(state.animMaxDisp || 0, disp);
          const currentClayH = Math.max(0, state.clayHeight - state.animMaxDisp);
          const maxVisualH = 38 - displacementPx;
          const normalVisualH = currentClayH * 1.25;
          const finalVisualH = Math.min(maxVisualH, normalVisualH);
          updateClayVisualHeight(finalVisualH / 1.25);
        }

        // Crack fracture overlay triggers if material cracks and we exceed crack index
        if (state.capCracked && idx > (state.animTotalFrames * 0.4)) {
          DOM.capFractures.setAttribute('opacity', '0.85');
        }

        // Live Telemetry Dashboard updates
        if (DOM.dashForce) DOM.dashForce.textContent = `${force.toFixed(2)} kN`;
        if (DOM.dashDeformation) DOM.dashDeformation.textContent = `${disp.toFixed(1)} mm`;
        if (DOM.dashEnergy) DOM.dashEnergy.textContent = `${energy.toFixed(1)} J`;
        
        const currentVelocity = Math.sqrt(Math.max(0, 2 * energy / state.strikerMass));
        if (DOM.dashVelocity) DOM.dashVelocity.textContent = `${currentVelocity.toFixed(2)} m/s`;
        
        // Update Canvas Osciloscope line graph pointer
        drawOscilloscopeGrid(idx);
        
        // Increment frames
        state.animIndex++;
        state.animFrameId = requestAnimationFrame(animStep);
      } else {
        // 3. REBOUND AND CATCHER ENGAGEMENT
        // The numeric loop completes. Striker bounces up and catcher hook pivots to lock it.
        // Catcher catches striker pin (locks rotation to 15 deg over pin)
        let catchFrame = 0;
        const totalCatchFrames = 20;
        
        function animateCatcher() {
          if (catchFrame <= totalCatchFrames) {
            const rot = -15 + (catchFrame / totalCatchFrames) * 30; // rotate catch arm from -15 to +15 deg
            DOM.catcherArm.setAttribute('transform', `rotate(${rot})`);
            catchFrame++;
            requestAnimationFrame(animateCatcher);
          } else {
            // Rebound catch finished
            completeImpactRun();
          }
        }
        animateCatcher();
      }
    }
  }
  
  // Start animation loop
  state.animFrameId = requestAnimationFrame(animStep);
});

function completeImpactRun() {
  state.isImpactRunning = false;
  state.isImpactCompleted = true;
  
  // Keep final graph fully drawn
  drawOscilloscopeGrid();
  
  // System status
  if (DOM.statusBeacon) DOM.statusBeacon.className = "status-beacon blinking-green";
  if (DOM.statusLabel) DOM.statusLabel.textContent = "TEST RECORDED";
  
  // Peak diagnostics values lock
  if (DOM.dashForce) DOM.dashForce.textContent = `${state.maxForce.toFixed(2)} kN`;
  if (DOM.dashDeformation) DOM.dashDeformation.textContent = `${state.maxDeformation.toFixed(1)} mm`;
  if (DOM.dashEnergy) DOM.dashEnergy.textContent = `0.0 J`;
  if (DOM.dashVelocity) DOM.dashVelocity.textContent = "0.00 m/s";
  
  // Check standard limits
  evaluateVerdict();
  
  // Refresh step state
  updateStepUI();
}

// --- EVALUATIONS & VERDICT DECISION ---
function evaluateVerdict() {
  let passesClearance = false;
  let limitClearance = 14.0; // EN size 8 standard
  
  if (state.testStandard === 'astm') {
    limitClearance = 12.7; // ASTM size 8 standard (0.5 inch)
  }
  
  passesClearance = state.measuredClearance >= limitClearance;
  
  if (passesClearance && !state.capCracked && state.selectedMaterial !== 'soft') {
    state.verdict = 'PASS';
    state.verdictReason = `Toe cap maintained clearance of ${state.measuredClearance.toFixed(2)} mm (Required: &ge; ${limitClearance.toFixed(1)} mm) and showed no structural cracking.`;
  } else {
    state.verdict = 'FAIL';
    
    if (state.selectedMaterial === 'soft') {
      state.verdictReason = `Specimen has no protective toe cap. Cap area crushed completely under impact.`;
    } else if (state.capCracked) {
      state.verdictReason = `Toe cap material experienced brittle structural fracture/shattering during impact.`;
    } else {
      state.verdictReason = `Clearance inside cap (${state.measuredClearance.toFixed(2)} mm) was below safety limit of ${limitClearance.toFixed(1)} mm.`;
    }
  }
}

// --- STEP 6 EVALUATION ACTIONS ---
DOM.btnExtractClay.addEventListener('click', () => {
  state.isClayExtracted = true;
  DOM.btnExtractClay.disabled = true;
  DOM.btnMeasureClay.disabled = false;
  updateStepUI();
});

DOM.btnMeasureClay.addEventListener('click', () => {
  // Animates micrometer caliper slider jaw
  let frame = 0;
  const totalFrames = 35;
  
  DOM.btnMeasureClay.disabled = true;
  
  const scaledClay = state.measuredClearance * 1.25;
  const startY = -35;
  const finalYOffset = -scaledClay;
  
  // Slide caliper display height counting down
  const startHeight = 28.00;
  
  function caliperMeasureAnim() {
    if (frame <= totalFrames) {
      const progress = frame / totalFrames;
      const curY = startY + progress * (finalYOffset - startY);
      
      DOM.caliperSliderJaw.setAttribute('transform', `translate(0, ${curY.toFixed(2)})`);
      
      const countingHeight = startHeight + progress * (state.measuredClearance - startHeight);
      DOM.caliperDisplay.textContent = countingHeight.toFixed(2);
      
      frame++;
      requestAnimationFrame(caliperMeasureAnim);
    } else {
      state.isClayMeasured = true;
      DOM.evalCompClay.textContent = `${state.measuredClearance.toFixed(2)} mm`;
      DOM.btnInspectCap.disabled = false;
      updateStepUI();
    }
  }
  requestAnimationFrame(caliperMeasureAnim);
});

DOM.btnInspectCap.addEventListener('click', () => {
  // Turn on magnifying glass tool and display cracks overlay
  state.isCapInspected = true;
  DOM.btnInspectCap.disabled = true;
  DOM.lensTool.setAttribute('transform', 'translate(250, 480)');
  
  DOM.evalInitClay.textContent = `${state.clayHeight.toFixed(2)} mm`;
  DOM.evalCapIntegrity.textContent = state.capCracked ? "FRACTURE / CRACK DETECTED" : "NO CRACKS (INTACT)";
  if (state.capCracked) {
    DOM.evalCapIntegrity.className = "eval-val text-red";
  } else {
    DOM.evalCapIntegrity.className = "eval-val text-green";
  }
  
  // Populate peak deformation and verdict
  DOM.evalPeakDeformation.textContent = `${state.maxDeformation.toFixed(1)} mm`;
  
  // Reveal verdict banners
  DOM.verdictBanner.className = `verdict-block ${state.verdict.toLowerCase()}`;
  DOM.verdictTitle.textContent = `${state.verdict} / VERDICT`;
  DOM.verdictReason.textContent = state.verdictReason;
  
  addTestRunToLog();
  
  updateStepUI();
});

// --- STEP 6 CLOSE-UP DENT MODAL ACTIONS ---
state.modalShowFea = false;
state.modalShowMarker = false;
state.modalShowXray = true;

function openDentModal() {
  state.modalShowFea = false;
  state.modalShowMarker = false;
  state.modalShowXray = true;
  
  if (DOM.btnToggleFea) DOM.btnToggleFea.classList.remove('active');
  if (DOM.btnToggleMarker) DOM.btnToggleMarker.classList.remove('active');
  if (DOM.btnToggleXray) DOM.btnToggleXray.classList.add('active');
  if (DOM.modalToeStress) DOM.modalToeStress.setAttribute('opacity', '0');
  if (DOM.modalDentMarker) DOM.modalDentMarker.setAttribute('opacity', '0');
  if (DOM.modalDentCrater) DOM.modalDentCrater.setAttribute('opacity', '0');
  
  if (DOM.modalShoeUpper) DOM.modalShoeUpper.setAttribute('opacity', '0.45');
  if (DOM.modalShoeStitching) DOM.modalShoeStitching.setAttribute('opacity', '0.6');
  
  const material = MATERIALS[state.selectedMaterial];
  DOM.modalMaterialName.textContent = material.name;
  DOM.modalSpecimenBadge.textContent = material.category.toUpperCase();
  
  if (state.selectedMaterial === 'soft') {
    DOM.modalSpecimenBadge.className = 'badge warning';
    state.modalShowXray = false;
    if (DOM.btnToggleXray) {
      DOM.btnToggleXray.classList.remove('active');
      DOM.btnToggleXray.style.display = 'none';
    }
    if (DOM.modalShoeUpper) DOM.modalShoeUpper.setAttribute('opacity', '1.0');
    if (DOM.modalShoeStitching) DOM.modalShoeStitching.setAttribute('opacity', '0.9');
  } else {
    DOM.modalSpecimenBadge.className = 'badge';
    if (DOM.btnToggleXray) {
      DOM.btnToggleXray.style.display = 'block';
    }
  }
  
  DOM.modalImpactEnergy.textContent = `${state.actualEnergy.toFixed(1)} J`;
  DOM.modalPeakForce.textContent = `${state.maxForce.toFixed(2)} kN`;
  DOM.modalMaxDeflection.textContent = `${state.maxDeformation.toFixed(1)} mm`;
  
  let dentDepth = 0;
  let analysisText = "";
  
  if (state.selectedMaterial === 'soft') {
    dentDepth = 22.0;
    DOM.modalDentDepth.textContent = "22.0 mm (Completely Collapsed)";
    DOM.modalDentDepth.className = "eval-val text-red";
    DOM.modalCapState.textContent = "SHATTERED / DESTROYED";
    DOM.modalCapState.className = "eval-val text-red";
    analysisText = "Without any structural toe cap reinforcement, the leather upper has zero resistance. Under a 200J impact, the toe box area is completely crushed and flattened, providing no protection to the wearer's foot.";
  } else if (state.selectedMaterial === 'steel') {
    dentDepth = state.maxDeformation * 0.82;
    DOM.modalDentDepth.textContent = `${dentDepth.toFixed(1)} mm`;
    DOM.modalDentDepth.className = "eval-val text-yellow";
    DOM.modalCapState.textContent = "INTACT (NO CRACKS)";
    DOM.modalCapState.className = "eval-val text-green";
    analysisText = "The steel toe cap undergoes significant plastic deformation under impact. Its high ductility allows it to absorb the 200J of kinetic energy, preventing cracking/brittle failure, but leaving a deep permanent indentation.";
  } else if (state.selectedMaterial === 'aluminium') {
    dentDepth = state.maxDeformation * 0.75;
    DOM.modalDentDepth.textContent = `${dentDepth.toFixed(1)} mm`;
    DOM.modalDentDepth.className = "eval-val text-yellow";
    DOM.modalCapState.textContent = "INTACT (NO CRACKS)";
    DOM.modalCapState.className = "eval-val text-green";
    analysisText = "The aluminium cap deforms plastically to absorb impact energy. While its lower density reduces shoe weight, it experiences moderate permanent denting. No micro-fracturing or cracking was detected.";
  } else if (state.selectedMaterial === 'composite') {
    if (state.capCracked) {
      dentDepth = state.maxDeformation * 0.90;
      DOM.modalDentDepth.textContent = `${dentDepth.toFixed(1)} mm`;
      DOM.modalDentDepth.className = "eval-val text-red";
      DOM.modalCapState.textContent = "FRACTURED / SHATTERED";
      DOM.modalCapState.className = "eval-val text-red";
      analysisText = "Under excessive impact energy exceeding its 300J capacity, the fiberglass composite structure fails. It suffers brittle macro-cracking and fragmentation, losing its protective shape and load-bearing capacity.";
    } else {
      dentDepth = state.maxDeformation * 0.12;
      DOM.modalDentDepth.textContent = `${dentDepth.toFixed(1)} mm (Minor Surface Dent)`;
      DOM.modalDentDepth.className = "eval-val text-green";
      DOM.modalCapState.textContent = "INTACT (NO CRACKS)";
      DOM.modalCapState.className = "eval-val text-green";
      analysisText = "The fiberglass/polymer composite cap behaves elastically. It flexes under load to absorb impact, then rebounds to its original shape. Only a very minor surface indentation remains, with zero cracks.";
    }
  } else if (state.selectedMaterial === 'carbon') {
    if (state.capCracked) {
      dentDepth = state.maxDeformation * 0.95;
      DOM.modalDentDepth.textContent = `${dentDepth.toFixed(1)} mm`;
      DOM.modalDentDepth.className = "eval-val text-red";
      DOM.modalCapState.textContent = "CATASTROPHIC FRACTURE";
      DOM.modalCapState.className = "eval-val text-red";
      analysisText = "The carbon fiber composite is extremely stiff but has low ultimate strain. Exceeding its fracture limit causes a sudden brittle failure, shattering the matrix and leaving a deep deformed collapse.";
    } else {
      dentDepth = 0.0;
      DOM.modalDentDepth.textContent = "0.0 mm (Fully Rebounded)";
      DOM.modalDentDepth.className = "eval-val text-green";
      DOM.modalCapState.textContent = "INTACT (NO CRACKS)";
      DOM.modalCapState.className = "eval-val text-green";
      analysisText = "The carbon fiber composite remains entirely within its elastic limit. Due to its exceptional stiffness and resilience, it absorbs the energy and recovers 100% of its volume, leaving no permanent indentation.";
    }
  }
  
  DOM.modalDentAnalysis.textContent = analysisText;
  
  let fillVal = 'url(#modal-steel-grad)';
  let strokeVal = '#4c566a';
  let patternOpacity = '0';
  
  if (state.selectedMaterial === 'steel') {
    fillVal = 'url(#modal-steel-grad)';
    strokeVal = '#4c566a';
  } else if (state.selectedMaterial === 'aluminium') {
    fillVal = 'url(#modal-alum-grad)';
    strokeVal = '#81a1c1';
  } else if (state.selectedMaterial === 'composite') {
    fillVal = 'url(#modal-comp-grad)';
    strokeVal = '#3b4252';
  } else if (state.selectedMaterial === 'carbon') {
    fillVal = 'url(#modal-carbon-grad)';
    strokeVal = '#2e3440';
    patternOpacity = '0.45';
  } else if (state.selectedMaterial === 'soft') {
    fillVal = 'url(#modal-leather-grad)';
    strokeVal = '#3d2212';
  }
  
  DOM.modalToeDome.setAttribute('fill', fillVal);
  DOM.modalToeDome.setAttribute('stroke', strokeVal);
  DOM.modalToePattern.setAttribute('opacity', patternOpacity);
  
  const svgDent = Math.min(80, dentDepth * 2.5);
  
  // Set up inner cap paths
  const capCrownY = 85 + svgDent;
  const capCp1y = 125 + svgDent * 0.5;
  const capCp2y = capCrownY;
  let pathStr = "";
  if (svgDent > 1 && state.selectedMaterial !== 'soft') {
    pathStr = `M 70 185 C 70 125, 95 87, 120 87 C 132 87, 138 ${capCrownY.toFixed(1)}, 150 ${capCrownY.toFixed(1)} C 162 ${capCrownY.toFixed(1)}, 168 87, 180 87 C 205 87, 230 125, 230 185 C 230 197, 190 201, 150 201 C 110 201, 70 197, 70 185 Z`;
  } else if (state.selectedMaterial !== 'soft') {
    pathStr = `M 70 185 C 70 125, 108 85, 150 85 C 192 85, 230 125, 230 185 C 230 197, 190 201, 150 201 C 110 201, 70 197, 70 185 Z`;
  } else {
    pathStr = "M 0 0";
    fillVal = "none";
    strokeVal = "none";
    patternOpacity = "0";
  }
  
  DOM.modalToeDome.setAttribute('fill', fillVal);
  DOM.modalToeDome.setAttribute('stroke', strokeVal);
  DOM.modalToePattern.setAttribute('opacity', patternOpacity);
  
  DOM.modalToeDome.setAttribute('d', pathStr);
  DOM.modalToePattern.setAttribute('d', pathStr);
  DOM.modalToeStress.setAttribute('d', pathStr);
  
  // Set up outer shoe upper and stitching paths
  const upperCrownY = 70 + svgDent;
  const upperCp1y = 115 + svgDent * 0.5;
  const upperCp2y = upperCrownY;
  let upperPathStr = "";
  let stitchingPathStr = "";
  
  if (svgDent > 1) {
    upperPathStr = `M 60 190 C 60 115, 92 72, 118 72 C 130 72, 137 ${upperCrownY.toFixed(1)}, 150 ${upperCrownY.toFixed(1)} C 163 ${upperCrownY.toFixed(1)}, 170 72, 182 72 C 208 72, 240 115, 240 190 C 240 204, 195 210, 150 210 C 105 210, 60 204, 60 190 Z`;
    stitchingPathStr = `M 62 188 C 62 117, 93 75, 118 75 C 130 75, 137 ${(upperCrownY + 3).toFixed(1)}, 150 ${(upperCrownY + 3).toFixed(1)} C 163 ${(upperCrownY + 3).toFixed(1)}, 170 75, 182 75 C 207 75, 238 117, 238 188`;
  } else {
    upperPathStr = `M 60 190 C 60 115, 105 70, 150 70 C 195 70, 240 115, 240 190 C 240 204, 195 210, 150 210 C 105 210, 60 204, 60 190 Z`;
    stitchingPathStr = `M 62 188 C 62 117, 106 73, 150 73 C 194 73, 238 117, 238 188`;
  }
  
  if (DOM.modalShoeUpper) DOM.modalShoeUpper.setAttribute('d', upperPathStr);
  if (DOM.modalShoeStitching) DOM.modalShoeStitching.setAttribute('d', stitchingPathStr);
  
  if (DOM.modalDentCrater) {
    if (svgDent > 2) {
      const shY = 72 + svgDent * 0.25;
      const dCrater = `M 125 ${shY.toFixed(1)} Q 150 ${(upperCrownY + 8).toFixed(1)}, 175 ${shY.toFixed(1)} Q 150 ${(upperCrownY - 4).toFixed(1)}, 125 ${shY.toFixed(1)}`;
      DOM.modalDentCrater.setAttribute('d', dCrater);
      DOM.modalDentCrater.setAttribute('opacity', '0.35');
    } else {
      DOM.modalDentCrater.setAttribute('opacity', '0');
    }
  }
  
  if (state.capCracked && state.selectedMaterial !== 'soft') {
    DOM.modalCapFractures.setAttribute('opacity', '0.9');
    DOM.modalCapFractures.setAttribute('transform', `translate(0, ${svgDent.toFixed(1)})`);
  } else {
    DOM.modalCapFractures.setAttribute('opacity', '0');
  }
  
  DOM.modalDentMarker.setAttribute('transform', `translate(150, ${upperCrownY.toFixed(1)})`);
  
  DOM.dentModal.classList.add('active');
}

function closeDentModal() {
  DOM.dentModal.classList.remove('active');
}

if (DOM.btnViewDent) {
  DOM.btnViewDent.addEventListener('click', openDentModal);
}
if (DOM.btnCloseModal) {
  DOM.btnCloseModal.addEventListener('click', closeDentModal);
}
if (DOM.btnCloseModalFooter) {
  DOM.btnCloseModalFooter.addEventListener('click', closeDentModal);
}

// Window click to close modal when clicking background
window.addEventListener('click', (e) => {
  if (e.target === DOM.dentModal) {
    closeDentModal();
  }
});

// Toggles inside the close-up visualizer modal
if (DOM.btnToggleXray) {
  DOM.btnToggleXray.addEventListener('click', () => {
    state.modalShowXray = !state.modalShowXray;
    DOM.btnToggleXray.classList.toggle('active', state.modalShowXray);
    if (state.modalShowXray) {
      if (DOM.modalShoeUpper) DOM.modalShoeUpper.setAttribute('opacity', '0.45');
      if (DOM.modalShoeStitching) DOM.modalShoeStitching.setAttribute('opacity', '0.6');
    } else {
      if (DOM.modalShoeUpper) DOM.modalShoeUpper.setAttribute('opacity', '1.0');
      if (DOM.modalShoeStitching) DOM.modalShoeStitching.setAttribute('opacity', '0.9');
    }
  });
}

if (DOM.btnToggleFea) {
  DOM.btnToggleFea.addEventListener('click', () => {
    state.modalShowFea = !state.modalShowFea;
    DOM.btnToggleFea.classList.toggle('active', state.modalShowFea);
    DOM.modalToeStress.setAttribute('opacity', state.modalShowFea ? '0.8' : '0');
  });
}

if (DOM.btnToggleMarker) {
  DOM.btnToggleMarker.addEventListener('click', () => {
    state.modalShowMarker = !state.modalShowMarker;
    DOM.btnToggleMarker.classList.toggle('active', state.modalShowMarker);
    DOM.modalDentMarker.setAttribute('opacity', state.modalShowMarker ? '1' : '0');
  });
}

// --- STEP-BY-STEP FLOW HANDLERS (PREV / NEXT NAVIGATION) ---
DOM.btnPrev.addEventListener('click', () => {
  if (state.currentStep > 1) {
    // If returning from step 5, reset impact state
    if (state.currentStep === 5) {
      state.isArmed = false;
      state.isImpactCompleted = false;
      state.isImpactRunning = false;
      // Reset animations
      cancelAnimationFrame(state.animFrameId);
      resetStrikerVisualHeight();
      resetToeCapVisuals();
      drawOscilloscopeGrid();
    }
    
    // If returning from step 6, reset evaluation steps
    if (state.currentStep === 6) {
      state.isClayExtracted = false;
      state.isClayMeasured = false;
      state.isCapInspected = false;
      DOM.btnExtractClay.disabled = false;
      DOM.btnMeasureClay.disabled = true;
      DOM.btnInspectCap.disabled = true;
      DOM.evalCompClay.textContent = "--";
      DOM.evalCapIntegrity.textContent = "--";
      DOM.evalPeakDeformation.textContent = "--";
      DOM.verdictBanner.className = "verdict-block";
      DOM.verdictTitle.textContent = "PENDING MEASUREMENTS";
      DOM.verdictReason.textContent = "Measure the clay cylinder and inspect the cap.";
    }

    state.currentStep--;
    updateStepUI();
  }
});

function restartExperiment() {
  state.currentStep = 1;
  state.selectedMaterial = 'steel';
  state.clayHeight = 22.0;
  state.isClayPlaced = false;
  state.isClamped = false;
  state.clampRotation = 0;
  state.testStandard = 'en';
  state.strikerMass = 20.0;
  state.dropHeight = 1019;
  state.targetEnergy = 200.0;
  state.targetVelocity = 4.47;
  state.playbackSpeed = 1.0;
  state.isArmed = false;
  state.isImpactRunning = false;
  state.isImpactCompleted = false;
  state.isClayExtracted = false;
  state.isClayMeasured = false;
  state.isCapInspected = false;
  state.measuredClearance = null;
  state.capCracked = false;
  state.verdict = 'PENDING';
  state.verdictReason = '';
  
  cancelAnimationFrame(state.animFrameId);
  state.animFrameId = null;
  state.animIndex = 0;
  state.animTotalFrames = 0;
  
  // UI Element resets
  DOM.materialButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.material === 'steel');
  });
  if (DOM.clayHeightRange) DOM.clayHeightRange.value = 22.0;
  if (DOM.valClayH) DOM.valClayH.textContent = "22.0";
  
  DOM.btnClampFixture.className = "action-btn";
  DOM.btnClampFixture.textContent = "Tighten Clamping Fixture";
  DOM.clampStatusText.textContent = "Clamp Status: UNSECURED";
  DOM.clampStatusText.className = "clamp-readout";
  DOM.clampScrewRot.setAttribute('transform', 'translate(0, 0)');
  
  if (DOM.radioStdEn) DOM.radioStdEn.checked = true;
  updateStandardConfig();
  
  if (DOM.speed1x) {
    DOM.speed1x.classList.add('active');
    DOM.speed025x.classList.remove('active');
    DOM.speed005x.classList.remove('active');
  }
  
  DOM.btnExtractClay.disabled = false;
  DOM.btnMeasureClay.disabled = true;
  DOM.btnInspectCap.disabled = true;
  if (DOM.btnViewDent) DOM.btnViewDent.disabled = true;
  
  DOM.evalInitClay.textContent = "22.00 mm";
  DOM.evalCompClay.textContent = "--";
  DOM.evalCapIntegrity.textContent = "--";
  DOM.evalPeakDeformation.textContent = "--";
  
  DOM.verdictBanner.className = "verdict-block";
  DOM.verdictTitle.textContent = "PENDING MEASUREMENTS";
  DOM.verdictReason.textContent = "Measure the clay cylinder and inspect the cap.";
  
  // Magnet led reset
  if (DOM.magnetLed) DOM.magnetLed.setAttribute('fill', '#00e676');
  
  // Header Standard reset
  const matInfo = MATERIALS[state.selectedMaterial];
  DOM.headerStandardSub.textContent = `Toe Protection Impact Resistance (200 Joules) - ${matInfo.name}`;
  
  resetStrikerVisualHeight();
  resetToeCapVisuals();
  
  updateStepUI();
}

DOM.btnNext.addEventListener('click', () => {
  if (state.currentStep < 6 && canProceedToNextStep()) {
    state.currentStep++;
    updateStepUI();
  } else if (state.currentStep === 6 && canProceedToNextStep()) {
    restartExperiment();
  }
});

// --- INTERACTIVE DRAGGABLE MAGNIFYING LENS ---
let isLensDragging = false;
let lensDragOffset = { x: 0, y: 0 };

if (DOM.lensTool) {
  DOM.lensTool.style.cursor = 'grab';
  
  const startDrag = (clientX, clientY) => {
    if (state.currentStep !== 6 || !state.isCapInspected) return;
    isLensDragging = true;
    DOM.lensTool.style.cursor = 'grabbing';
    
    // Get current translation
    const transform = DOM.lensTool.getAttribute('transform');
    const match = transform ? transform.match(/translate\(([^,]+),\s*([^)]+)\)/) : null;
    const curX = match ? parseFloat(match[1]) : 250;
    const curY = match ? parseFloat(match[2]) : 480;
    
    const rect = DOM.machineSvg.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * 480;
    const mouseY = ((clientY - rect.top) / rect.height) * 650;
    
    lensDragOffset.x = mouseX - curX;
    lensDragOffset.y = mouseY - curY;
  };
  
  const moveDrag = (clientX, clientY) => {
    if (!isLensDragging) return;
    
    const rect = DOM.machineSvg.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * 480;
    const mouseY = ((clientY - rect.top) / rect.height) * 650;
    
    let targetX = mouseX - lensDragOffset.x;
    let targetY = mouseY - lensDragOffset.y;
    
    // Constrain inside workbench/toe box area
    targetX = Math.max(160, Math.min(340, targetX));
    targetY = Math.max(420, Math.min(540, targetY));
    
    DOM.lensTool.setAttribute('transform', `translate(${targetX.toFixed(1)}, ${targetY.toFixed(1)})`);
  };
  
  const endDrag = () => {
    if (isLensDragging) {
      isLensDragging = false;
      DOM.lensTool.style.cursor = 'grab';
    }
  };
  
  // Mouse Events
  DOM.lensTool.addEventListener('mousedown', (e) => {
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
  });
  
  window.addEventListener('mousemove', (e) => {
    moveDrag(e.clientX, e.clientY);
  });
  
  window.addEventListener('mouseup', endDrag);
  
  // Touch Events
  DOM.lensTool.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
    e.preventDefault();
  }, { passive: false });
  
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
  
  window.addEventListener('touchend', endDrag);
}

// --- BIND CLEAR LOG EVENT LISTENER ---
if (DOM.btnClearLog) {
  DOM.btnClearLog.addEventListener('click', () => {
    state.testLogs = [];
    renderRunsLog();
  });
}

// Initialize first step layout
updateStepUI();
updateStandardConfig();
