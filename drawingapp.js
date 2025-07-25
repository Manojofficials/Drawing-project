const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let currentTool = 'pencil';
let brushColor = '#000000';
let brushSize = 5;
let startX, startY;

let undoStack = [];
let redoStack = [];

function saveState() {
  undoStack.push(canvas.toDataURL());
  redoStack = [];
}

function loadImage(dataUrl) {
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = dataUrl;
}

// Tool Buttons
document.getElementById('pencil').onclick = () => currentTool = 'pencil';
document.getElementById('eraser').onclick = () => currentTool = 'eraser';
document.getElementById('line').onclick = () => currentTool = 'line';
document.getElementById('rect').onclick = () => currentTool = 'rect';
document.getElementById('circle').onclick = () => currentTool = 'circle';

document.getElementById('colorPicker').oninput = (e) => {
  brushColor = e.target.value;
  currentTool = 'pencil';
};

document.getElementById('brushSize').oninput = (e) => {
  brushSize = e.target.value;
};

document.getElementById('undo').onclick = () => {
  if (undoStack.length === 0) return;
  redoStack.push(canvas.toDataURL());
  loadImage(undoStack.pop());
};

document.getElementById('redo').onclick = () => {
  if (redoStack.length === 0) return;
  undoStack.push(canvas.toDataURL());
  loadImage(redoStack.pop());
};

document.getElementById('save').onclick = () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL();
  link.click();
};

document.getElementById('loadFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => loadImage(evt.target.result);
  reader.readAsDataURL(file);
});

// Drawing Logic
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;
  saveState();

  if (currentTool === 'pencil' || currentTool === 'eraser') {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;

  if (currentTool === 'pencil' || currentTool === 'eraser') {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (!isDrawing) return;
  isDrawing = false;

  const endX = e.offsetX;
  const endY = e.offsetY;

  ctx.strokeStyle = brushColor;
  ctx.lineWidth = brushSize;

  if (currentTool === 'line') {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  } else if (currentTool === 'rect') {
    const width = endX - startX;
    const height = endY - startY;
    ctx.strokeRect(startX, startY, width, height);
  } else if (currentTool === 'circle') {
    const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});
