import { paintGradient, defaultsByType, presetsByType, defaultBlur, defaultGrain, grainTile, } from './gradient-engine.js';
/** Owns the canvas host; FeralUI's painter supplies each type's native rendering. */
export class GradientRenderer {
    canvas;
    context;
    buffer = document.createElement('canvas');
    bufferContext = this.buffer.getContext('2d');
    config = {};
    selected = '';
    constructor(canvas) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context)
            throw new Error('Canvas unavailable');
        this.context = context;
    }
    render(preset, time, width, height) {
        if (this.selected !== preset.id) {
            this.config = {
                ...defaultsByType[preset.type],
                ...presetsByType[preset.type].find((p) => p.id === preset.sourceId),
            };
            this.selected = preset.id;
        }
        const p = this.config;
        const blur = Number(p['soften'] ?? defaultBlur[preset.type] ?? 0);
        const soften = preset.type === 'SHAPES' ? 0 : blur + (preset.type === 'AIR' ? 16 : 0);
        if (this.canvas.width !== width)
            this.canvas.width = width;
        if (this.canvas.height !== height)
            this.canvas.height = height;
        const ctx = this.context;
        const target = soften ? this.bufferContext : ctx;
        if (soften) {
            if (this.buffer.width !== width)
                this.buffer.width = width;
            if (this.buffer.height !== height)
                this.buffer.height = height;
        }
        ctx.clearRect(0, 0, width, height);
        target.clearRect(0, 0, width, height);
        paintGradient(target, width, height, preset.stops, preset.type, p['divs'], p['mesh'], p['flow'] ?? p['stripe'] ?? p['bars'] ?? p['cnoise'] ?? p['ring'] ?? p['smesh'] ?? p['silk'], time, p['scale'], p['hexStyle'], p['ballStyle'], p['glintHorizon'], p['city'], p['pixelStyle'], p['cover'], p['rings'], p['weave'], p['cube'], p['shapeForm'], blur, p['mist'], p['lines'], p['tile'], p['warp'], p['refract']);
        if (soften) {
            const radius = (soften / 900) * Math.max(width, height);
            const scale = 1 + (radius * 2.5) / Math.max(width, height);
            ctx.save();
            ctx.filter = `blur(${radius}px)`;
            ctx.drawImage(this.buffer, (width - width * scale) / 2, (height - height * scale) / 2, width * scale, height * scale);
            ctx.restore();
        }
        const grain = Number(p['grain'] ?? defaultGrain[preset.type] ?? 0);
        if (grain > 0) {
            ctx.save();
            ctx.globalAlpha = grain / 200;
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat');
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
    }
    destroy() {
        this.buffer.width = this.buffer.height = 0;
    }
}
