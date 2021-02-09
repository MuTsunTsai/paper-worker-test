
interface ContextData {
	prop: Record<string, any>;
	method: Record<string, Function>;
}

class CanvasProxy {

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		let data = CanvasProxy.CreateContextData(this);
		this.context = new Proxy<any>(data, CanvasProxy.CreateContextHandler(this));
	}

	public height: number;

	public width: number;

	private context: OffscreenCanvasRenderingContext2D;

	private instructions: any[][] = [];

	private static CreateContextData(self: CanvasProxy): ContextData {
		return {
			prop: {
				// 底下這些是參考 Chrome 的 Canvas 的初始值
				canvas: self,
				direction: "ltr",
				fillStyle: "#000000",
				filter: "none",
				font: "10px sans-serif",
				globalAlpha: 1,
				globalCompositeOperation: "source-over",
				imageSmoothingEnabled: true,
				imageSmoothingQuality: "low",
				lineCap: "butt",
				lineDashOffset: 0,
				lineJoin: "miter",
				lineWidth: 1,
				miterLimit: 10,
				shadowBlur: 0,
				shadowColor: "rgba(0, 0, 0, 0)",
				shadowOffsetX: 0,
				shadowOffsetY: 0,
				strokeStyle: "#000000",
				textAlign: "start",
				textBaseline: "alphabetic",
			},
			method: {
				getImageData() { return { data: [0, 0, 0, 0] }; }
			}
		};
	}

	private static CreateContextHandler(self: CanvasProxy): ProxyHandler<ContextData> {
		return {
			get: function(obj, prop: string) {
				if(prop in obj.prop) return obj.prop[prop];
				return obj.method[prop] = obj.method[prop] || function(...args: any[]) {
					self.instructions.push([prop, ...args]);
				};
			},
			set: function(obj, prop: string, value): boolean {
				if(prop in obj.prop) {
					obj.prop[prop] = value;
					self.instructions.push(["set", prop, value]);
					return true;
				}
				return false;
			}
		};
	}

	public getContext(): OffscreenCanvasRenderingContext2D { return this.context; }

	public flush() {
		let result = this.instructions;
		this.instructions = [];
		return result;
	}
}

function wrap(canvas: any): any {
	if(!canvas) return undefined;
	canvas.getAttribute = () => undefined;
	canvas.setAttribute = canvas.addEventListener = () => undefined;
	canvas.hasAttribute = () => false;
	canvas.style = {};
	canvas.ownerDocument = doc;
	return canvas;
}