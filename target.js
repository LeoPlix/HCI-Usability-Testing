// Mapeamento de 6 cores base
const colorMap = {
  'A': '#2A6B8C', 'M': '#2A6B8C', 'U': '#2A6B8C', // Azul
  'B': '#B08030', 'N': '#B08030', 'R': '#B08030', // Laranja
  'C': '#2D8259', 'G': '#2D8259', 'O': '#2D8259', 'S': '#439434', 'W': '#439434', // Verde
  'D': '#A64B65', 'L': '#A64B65', 'P': '#A64B65', // Rosa
  'E': '#356E9E', 'F': '#5A636B', // Cinza/Azul
  'H': '#AD6C82', 'K': '#AD6C82', 'T': '#AD6C82'  // Roxo
};

class Target {
  constructor(x, y, w, h, l, id, isFirst, gW, gH, gX, gY, gKey) {
    this.x = x; this.y = y; this.width = w; this.height = h;
    this.label = l; this.id = id;
    this.isFirst = isFirst;
    this.gW = gW; this.gH = gH; this.gX = gX; this.gY = gY;
    this.gKey = gKey;
    this.wasClicked = false; 
  }

  clicked(mouse_x, mouse_y) {
    let isInside = (mouse_x > this.x - this.width/2 && mouse_x < this.x + this.width/2 &&
                    mouse_y > this.y - this.height/2 && mouse_y < this.y + this.height/2);
    if (isInside) this.wasClicked = true; 
    return isInside;
  }

  // Desenha texto com as primeiras 3 letras a negrito
  drawMixedStyleText(txt, x, y, size, isFirstRow) {
    textSize(size);
    let totalW = textWidth(txt);
    let startX = x - totalW / 2;

    if (isFirstRow) {
      let firstThree = txt.substring(0, 3);
      let rest = txt.substring(3);
      
      textStyle(BOLD); textAlign(LEFT, CENTER);
      text(firstThree, startX, y);
      
      let offset = textWidth(firstThree);
      textStyle(NORMAL);
      text(rest, startX + offset, y);
    } else {
      textStyle(NORMAL); textAlign(CENTER, CENTER);
      text(txt, x, y);
    }
  }

  draw() {
    let baseColor = colorMap[this.gKey] || '#5A636B';
    let upperLabel = this.label.toUpperCase();

    // --- NOVA LÓGICA: Verde mais escuro para palavras começadas em "Sa" ---
    if (this.gKey === 'S' && (upperLabel.startsWith("SA") || upperLabel.startsWith("SÃ"))) {
      baseColor = '#285C1F'; // Um tom de verde visivelmente mais escuro
    }

    let isHover = (mouseX > this.x - this.width/2 && mouseX < this.x + this.width/2 &&
                   mouseY > this.y - this.height/2 && mouseY < this.y + this.height/2);
    push();
    
    // Moldura do Agrupamento
    if (this.isFirst) {
      fill(30); stroke(70); strokeWeight(this.height * 0.04); rectMode(CORNER);
      rect(this.gX, this.gY, this.gW, this.gH, this.height * 0.1); 
      fill(45); stroke(70);
      let labelH = this.height * 0.55; 
      rect(this.gX, this.gY - (labelH * 0.85), this.gW, labelH, this.height * 0.1); 
      fill('#F09335'); noStroke(); textAlign(LEFT, CENTER);
      textStyle(BOLD); textSize(this.height * 0.45); 
      let displayKey = this.gKey.charAt(0);
      text(displayKey, this.gX + (this.width * 0.08), this.gY - (labelH * 0.42)); 
    }
    
    rectMode(CENTER);
    let c = color(baseColor);
    
    // Comportamento de Hover e Click
    if (isHover) {
      fill(min(255, red(c)*1.6), min(255, green(c)*1.6), min(255, blue(c)*1.6));
      stroke(255); strokeWeight(this.height * 0.06);
    } else if (this.wasClicked) {
      let faded = lerpColor(c, color(200), 0.6); 
      fill(faded); stroke(255, 180); strokeWeight(this.height * 0.05);
    } else {
      fill(c); stroke(20); strokeWeight(this.height * 0.04);
    }
    rect(this.x, this.y, this.width - 2, this.height - 2, 4);
    
    fill(this.wasClicked ? 50 : 255); noStroke();
    
    // Tratamento de Texto
    if (upperLabel.includes("VICENTE") && upperLabel.includes("CAGU")) {
        let size = this.height * 0.20;
        let lineH = this.height * 0.23;
        textStyle(BOLD); textAlign(CENTER, CENTER); textSize(size);
        text("San", this.x, this.y - lineH);
        textStyle(NORMAL);
        text("Vicente del", this.x, this.y);
        text("Caguán", this.x, this.y + lineH);
    } else {
        let size = this.height * 0.26;
        let words = this.label.trim().split(' ');
        if (words.length > 1 && textWidth(this.label) > this.width * 0.88) {
            this.drawMixedStyleText(words[0], this.x, this.y - size/2, size, true);
            this.drawMixedStyleText(words.slice(1).join(' '), this.x, this.y + size/2, size, false);
        } else {
            this.drawMixedStyleText(this.label, this.x, this.y, size, true);
        }
    }
    pop();
  }
}