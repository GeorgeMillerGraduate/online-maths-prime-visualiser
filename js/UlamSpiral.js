/* A cached, mathematically exact square spiral. Zoom changes the view only. */
class UlamSpiral {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.zoom = 1;
        this.cache = document.createElement('canvas');
    }
    render(isPrime, limit, requestedCellSize = 4, highlightTwinPrimes = false) {
        this.cellScale = requestedCellSize / 4;
        this.cache.width = this.cache.height = 1800;
        const ctx = this.cache.getContext('2d');
        const side = Math.ceil(Math.sqrt(limit)) | 1;
        const cell = 1800 / (side + 2);
        const centre = 900;
        ctx.fillStyle = '#fbf7ec'; ctx.fillRect(0, 0, 1800, 1800);
        ctx.strokeStyle = '#e8dfcd'; ctx.lineWidth = .6;
        for (let i = -side / 2; i <= side / 2; i++) {
            const pos = centre + i * cell;
            ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, 1800); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(1800, pos); ctx.stroke();
        }
        let x = 0, y = 0, n = 1, length = 1, direction = 0;
        const dirs = [[1,0],[0,-1],[-1,0],[0,1]];
        const dot = () => {
            if (!isPrime[n]) return;
            const twin = highlightTwinPrimes && (isPrime[n-2] || isPrime[n+2]);
            ctx.fillStyle = twin ? '#934d27' : '#244d61';
            if(cell<2){ctx.fillRect(centre+x*cell-cell*.32,centre+y*cell-cell*.32,cell*.64,cell*.64);}else{ctx.beginPath();ctx.arc(centre + x*cell, centre + y*cell, cell*.32,0,Math.PI*2);ctx.fill();}
        };
        while (n < limit) {
            for (let repeat=0; repeat<2 && n<limit; repeat++) {
                for (let step=0; step<length && n<limit; step++) {
                    x+=dirs[direction][0];y+=dirs[direction][1];n++;dot();
                }
                direction=(direction+1)%4;
            }
            length++;
        }
        // One is not prime: an outlined copper square marks the origin.
        ctx.strokeStyle='#934d27';ctx.lineWidth=1.5;
        ctx.strokeRect(centre-cell*.3,centre-cell*.3,cell*.6,cell*.6);
        this.drawZoom();
    }
    drawZoom() {
        const rect=this.canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
        const w=Math.max(1,Math.round(rect.width*dpr)), h=Math.max(1,Math.round(rect.height*dpr));
        if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
        const ctx=this.ctx;
        ctx.setTransform(dpr,0,0,dpr,0,0);
        ctx.fillStyle='#fbf7ec';ctx.fillRect(0,0,rect.width,rect.height);
        const size=Math.min(rect.width,rect.height)*this.zoom*this.cellScale;
        ctx.imageSmoothingEnabled=true;
        ctx.drawImage(this.cache,(rect.width-size)/2,(rect.height-size)/2,size,size);
    }
}
