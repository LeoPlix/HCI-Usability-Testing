const GROUP_NUMBER        = 70;      
const RECORD_TO_FIREBASE  = true;    
const VERSION             = "v_entrega_final_DARK_GREEN_SA";              

// Pixel density and setup variables (DO NOT CHANGE!)
let PPI, PPCM;
const NUM_OF_TRIALS       = 12;     
let continue_button;
let legendas;                       

// Metrics (DO NOT CHANGE!)
let testStartTime, testEndTime;     
let hits                  = 0;      
let misses                = 0;      
let database;                       

// Study control parameters (DO NOT CHANGE!)
let draw_targets          = false;  
let trials;                       
let current_trial         = 0;      
let attempt               = 0;      

let targets               = [];

function preload() {
  const preamble = GROUP_NUMBER < 10 ? 'legendas/G_0' : 'legendas/G_';
  legendas = loadTable(preamble+GROUP_NUMBER+'.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight); 
  frameRate(60);
  randomizeTrials();         
  drawUserIDScreen();        
}

function draw() {
  if (draw_targets && attempt < 2) {     
    background(0); 
    textFont("Arial", 16); fill(255); textAlign(LEFT);
    text("Trial " + (current_trial + 1) + " of " + trials.length, 50, 25);
    for (var i = 0; i < targets.length; i++) targets[i].draw();
    fill(0); noStroke(); rect(0, height - 50, width, 50);
    textFont("Arial", 20); fill(255); textAlign(CENTER); 
    text(legendas.getString(trials[current_trial], 1), width/2, height - 15);
  }
}

function printAndSavePerformance() {
  let accuracy			= parseFloat(hits * 100) / parseFloat(hits + misses);
  let test_time         = (testEndTime - testStartTime) / 1000;
  let time_per_target   = nf((test_time) / parseFloat(hits + misses), 0, 3);
  let penalty            = constrain((((parseFloat(95) - (parseFloat(hits * 100) / parseFloat(hits + misses))) * 0.2)), 0, 100);
  let target_w_penalty	= nf(((test_time) / parseFloat(hits + misses) + penalty), 0, 3);
  let timestamp         = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();
  
  background(0); fill(255); 
  textFont("Arial", 18); textAlign(LEFT); text(timestamp, 10, 20);
  textAlign(CENTER);
  text("Attempt " + (attempt + 1) + " out of 2 completed!", width/2, 60); 
  text("Hits: " + hits, width/2, 100);
  text("Misses: " + misses, width/2, 120);
  text("Accuracy: " + accuracy + "%", width/2, 140);
  text("Total time taken: " + test_time + "s", width/2, 160);
  text("Average time per target: " + time_per_target + "s", width/2, 180);
  text("Average time for each target (+ penalty): " + target_w_penalty + "s", width/2, 220);

  let attempt_data = {
    project_from: GROUP_NUMBER, assessed_by: student_ID,
    test_completed_by: timestamp, attempt: attempt,
    hits: hits, misses: misses, accuracy: accuracy,
    attempt_duration: test_time, time_per_target: time_per_target, target_w_penalty: target_w_penalty,
  };
  
  if (RECORD_TO_FIREBASE) {
    if (attempt === 0) { firebase.initializeApp(firebaseConfig); database = firebase.database(); }
    database.ref('G' + GROUP_NUMBER).push(attempt_data);
  }
}

function createTargets(target_w, target_h) {
  targets = [];
  let sortedIndices = [];
  for (let i = 0; i < legendas.getRowCount(); i++) sortedIndices.push(i);
  sortedIndices.sort((a, b) => legendas.getString(a, 1).localeCompare(legendas.getString(b, 1)));
  
  let groups = {};
  for (let idx of sortedIndices) {
    let label = legendas.getString(idx, 1);
    let key = label.charAt(0).toUpperCase(); // O grupo é apenas a primeira letra
    if (!groups[key]) groups[key] = [];
    groups[key].push({id: legendas.getNum(idx, 0), label: label});
  }
  
  let groupKeys = Object.keys(groups).sort();
  let startX = width * 0.02, currentX = startX, startY = height * 0.10, currentY = startY;
  let gapX = width * 0.006, gapY = height * 0.045, maxHInRow = 0;
  
  for (let key of groupKeys) {
    let groupTargets = groups[key];
    let cols = Math.ceil(groupTargets.length / 2);
    let rows = Math.ceil(groupTargets.length / cols);
    let gW = cols * target_w, gH = rows * target_h;
    
    if (key === "G" || key === "P" || key === "S") {
      if (currentX !== startX) { currentX = startX; currentY += maxHInRow + gapY; maxHInRow = 0; }
    }
    
    if (gH > maxHInRow) maxHInRow = gH;
    for (let i = 0; i < groupTargets.length; i++) {
      let r = Math.floor(i / cols), c = i % cols;
      targets.push(new Target(currentX + c * target_w + target_w/2, currentY + r * target_h + target_h/2, target_w, target_h, groupTargets[i].label, groupTargets[i].id, i === 0, gW, gH, currentX, currentY, key));
    }
    currentX += gW + gapX;
  }
}

function windowResized() {
  if (fullscreen()) {
    resizeCanvas(windowWidth, windowHeight);
    let display = new Display({ diagonal: display_size }, window.screen);
    PPI = display.ppi; PPCM = PPI / 2.54;
    let target_h = (height * 0.68) / 10, target_w = target_h * 1.55; 
    createTargets(target_w, target_h);
    draw_targets = true;
  }
}

function mousePressed() {
  if (draw_targets) {
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].clicked(mouseX, mouseY)) {                
        if (targets[i].id === trials[current_trial] + 1) hits++; else misses++;
        current_trial++; break;
      }
    }
    if (current_trial === NUM_OF_TRIALS) {
      testEndTime = millis(); draw_targets = false; printAndSavePerformance(); attempt++;
      if (attempt < 2) {
        continue_button = createButton('START 2ND ATTEMPT');
        continue_button.mouseReleased(continueTest);
        continue_button.position(width/2 - 70, height/2 + 100);
      }
    } else if (current_trial === 1) testStartTime = millis(); 
  }
}

function continueTest() { randomizeTrials(); hits = 0; misses = 0; current_trial = 0; continue_button.remove(); draw_targets = true; }
function randomizeTrials() { trials = []; for (let i = 0; i < NUM_OF_TRIALS; i++) trials.push(floor(random(legendas.getRowCount()))); }