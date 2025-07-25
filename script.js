let hoeList = [];
let hunting = false;
let interval;
let hoesFound = 0;
let personalBest = localStorage.getItem("hoeHighScore") || 0;

async function loadGang() {
  const response = await fetch("gang.json");
  const data = await response.json();
  hoeList = data.hoes;
}

function updateStatus(text) {
  document.getElementById("status").innerText = text + ` | Found Today: ${hoesFound} | High Score: ${personalBest}`;
}

function startHunt() {
  if (!window.alt1 || !alt1.permissionOverlay || !alt1.permissionCapture) {
    alert("Alt1 permissions not granted.");
    return;
  }
  hunting = true;
  updateStatus("Status: Hunting...");
  interval = setInterval(findHoes, 3000);
}

function stopHunt() {
  hunting = false;
  clearInterval(interval);
  updateStatus("Status: Idle");
}

function findHoes() {
  const overlay = alt1.overlays.getOverlay("hoefinder-compass");
  overlay.clear();

  const screen = a1lib.captureHoldFullRs();
  const ocr = new a1lib.OcrBox(screen.capture(0, 0, screen.width, screen.height));
  const results = ocr.read().map(x => x.text);
  const match = hoeList.find(name => results.some(txt => txt.toLowerCase().includes(name.toLowerCase())));

  if (match) {
    hoesFound++;
    if (hoesFound > personalBest) {
      personalBest = hoesFound;
      localStorage.setItem("hoeHighScore", personalBest);
    }

    const angle = Math.random() * Math.PI * 2;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    overlay.drawBox({ x: centerX - 100, y: centerY - 80, width: 200, height: 160, thickness: 2, color: [0, 0, 0, 180] });
    overlay.drawLine({
      x1: centerX,
      y1: centerY,
      x2: centerX + Math.cos(angle) * 50,
      y2: centerY + Math.sin(angle) * 50,
      thickness: 5,
      color: [255, 0, 0, 255]
    });

    updateStatus(`Found ${match}`);
  } else {
    updateStatus("No hoes nearby...");
  }
}

window.onload = loadGang;