'use strict'

class grapher {
	constructor() {
		
		this.handler = null // ассоциированный элемент канвас
		this.context = null // графический контекст
		// стиль линии
		this.lineStyle = {
			width: 1,
			color: '#e21a1a'
		}
		// стиль маркера
		this.markerStyle = {
			radius: 3,
			color: '#e21a1a',
			frequency: 2,
		}
		// стиль координатных осей
		this.axisStyle = {
			width: 1,
			color: '#4e4e4'
		}
		// стиль подписей к значениям координат
		this.numberStyle = {
			N: 10,			// количество меток на оси
			fontSize: 14,
			fontFamily: 'Courier',
			color: '4e4e4e',
			dX: 10, // сдвиг подписи вправо от оси для OY
			dY: 15 // свдиг подписи вверх от оси для OX
		}
		// стиль риски на оси координат
		this.tickStyle = {
			width: 1,
			size: 10,
			color: '#4e4e4e'
		}
		// количество элементарных линий между двумя точками графика
		this.scaleX = 1
		this.scaleY = 1
		this.dX = 0
		this.dY = 0
		this.graphMargin = 1
		
		this.rotations = null // матрица вращений

		// границы области отрисовки
		this.bounds = {
			xMin: 0,
			xMax: 0,
			yMin: 0,
			yMax: 0,
			zMin: 0,
			zMax: 0
		}
	}
// связать отрисовку графики с канвой	
	init( canvas ) {
		this.handler = canvas
		this.context = canvas.getContext('2d')
		
		return this
	}
// зачистить канву
	clear() {
		this.canvas.width = this.canvas.width
		return this
	}
// изменить цвет линии графика
	setLineColor(color)
	{
		this.lineStyle.color = color
		return this
	}
// изменить цвет осей
	setAxisColor(color)
	{
		this.axisStyle.color = color
		return this
	}
// настроить масштаб отрисовки к границам области
	adjust () {
		this.scaleX = this.handler.width / (this.bounds.xMax - this.bounds.xMin)
		this.scaleY = -this.handler.height / (this.bounds.yMax - this.bounds.yMin)
		this.dX = -this.bounds.xMin * this.scaleX
		this.dY = this.handler.height - this.bounds.yMin * this.scaleY
		
		return this
	}
// масштабирование по продольной оси
	transformX(x) {
		return x * this.scaleX + this.dX
	}	
// масштабирование по поперечной оси 
	transformY(y) {
		return y * this.scaleY + this.dY
	}	
// изобразить координатные оси
	draw2DAxis() {
		const X0 = this.transformX(0)
		const Y0 = this.transformY(0)
		
		const X_MIN = this.transformX(this.bounds.xMin)
		const Y_MIN = this.transformY(this.bounds.yMin)
				
		const X_MAX = this.transformX(this.bounds.xMax)
		const Y_MAX = this.transformY(this.bounds.yMax)
		
		const dX = (X_MAX - X_MIN) / this.numberStyle.N
		const dY = (Y_MAX - Y_MIN) / this.numberStyle.N
		
		const _dX = (this.bounds.xMax - this.bounds.xMin) / this.numberStyle.N
		const _dY = (this.bounds.yMax - this.bounds.yMin) / this.numberStyle.N
		
		this.context.font = `${this.numberStyle.fontSize}px ${this.numberStyle.fontFamily}`
		this.context.fillStyle = this.numberStyle.color
		
		// координаты, приведенные к экранным
		let X = X_MIN 
		let Y = Y_MIN
		// реальные значения координат
		let _x = this.bounds.xMin
		let _y = this.bounds.yMin
		
		const tickOffset = this.tickStyle.size / 2
		
		for(let i = 0; i < this.numberStyle.N; i++) {
			this.context.fillText(_y, X0 + this.numberStyle.dX, Y )
			this.context.fillText(_x, X, Y0 + this.numberStyle.dY )
			
			this.context.strokeStyle = this.tickStyle.color
			this.context.lineWidth = this.tickStyle.width
			this.context.moveTo(X0 - tickOffset, Y)
			this.context.lineTo(X0 + tickOffset, Y)
			this.context.stroke()
			this.context.moveTo(X, Y0 - tickOffset)
			this.context.lineTo(X, Y0 + tickOffset)
			this.context.stroke()
			
			X += dX
			Y += dY	
			_x += _dX
			_y += _dY			
		}
		
		this.context.strokeStyle = this.axisStyle.color
		this.context.lineWidth = this.axisStyle.width
		this.context.beginPath()
		
		this.context.lineTo(X_MIN, Y0)
		this.context.lineTo(X_MAX, Y0)
		this.context.stroke()
		
		this.context.beginPath()
		this.context.lineTo(X0, Y_MAX)
		this.context.lineTo(X0, Y_MIN)
		this.context.stroke()
		
		return this
	}
// сформировать границы области отрисовки
	setBounds(xMin, xMax, yMin, yMax) {

		this.bounds.xMin = xMin
		this.bounds.xMax = xMax
		this.bounds.yMin = yMin
		this.bounds.yMax = yMax
		
		return this
	}
// отрисовать график по набору точек
	drawGraphic(xArr, yArr) {
		const iMax = xArr.length
		
		this.context.strokeStyle = this.lineStyle.color
		this.context.lineWidth = this.lineStyle.width
				
		this.context.beginPath()
		
		let x0 = this.transformX(xArr[0])
		let y0 = this.transformY(yArr[0]) 
		let x1, y1
		
		for(let i = 1; i < iMax; i++) {
			x1 = this.transformX(xArr[i])
			y1 = this.transformY(yArr[i])
			this.context.moveTo(x0, y0)
			this.context.lineTo(x1, y1)
			x0 = x1
			y0 = y1
		}

		this.context.stroke()
		return this
	}
// создать матрицу вращений
	setRotations(alpha, betha, gamma) {
		const CA = Math.cos(alpha)
		const CB = Math.cos(betha)
		const CG = Math.cos(gamma)
		const SA = Math.sin(alpha)
		const SB = Math.sin(betha)
		const SG = Math.sin(gamma)
		
		this.rotations = [
			[ CB * CG, CB * SG, SB],
			[-SA * SB * CG - CA * SG, -SA * SB * SG + CA * CG, SA * CB],
			[-CA * SB * CG + SA * SG, -CA * SB * SG - SA * CG, CA * CB]
		]
		return this
	}
// преобразовать массив трехмерных точек 
	transformPointArray(pointArray) {
		const lx = pointArray.length
		
		const result = {
			xArr: (new ArrayExtended()),
			yArr: (new ArrayExtended())
		}
		
		for(let i = 0; i < lx; i++) {
			
			const [X, Y] = pointArray[i].matrixMult(this.rotations)

			result.xArr.push(X)
			result.yArr.push(Y)
		}
		return result
	}
	// отрисовать глобус
	drawGlobe(R) {
		this.context.beginPath()
		this.context.fillStyle = 'rgba(100, 175, 255, 0.15)'
		this.context.strokeStyle = 'rgb(100, 175, 255)'
		this.context.lineWidth = this.lineStyle.width
		
		this.context.arc(
			this.transformX(0),
			this.transformY(0),
			R * this.scaleX,
			0,
			2 * Math.PI
		)
		this.context.stroke()
		this.context.fill()
		
		return this
	}
	// отрисовать точку 
	drawPoint(X, Y, Z) {
		const [X_screen, Y_screen] = this.set3DtoScreen(X, Y, Z)

		this.context.strokeStyle = this.tickStyle.color
		this.context.lineWidth = this.tickStyle.width
		
		const tickOffset = this.tickStyle.size / 2
		this.context.beginPath()
		this.context.moveTo(X_screen - tickOffset, Y_screen)
		this.context.lineTo(X_screen + tickOffset, Y_screen)
		this.context.stroke()
		this.context.beginPath()
		this.context.moveTo(X_screen, Y_screen - tickOffset)
		this.context.lineTo(X_screen, Y_screen + tickOffset)
		this.context.stroke()
		
		return this
	}
	//преобразовать произвольный набор трех координат к экранным
	set3DtoScreen(X, Y, Z) {
		const [X_r, Y_r] = (Vect3D.fromNumbers(X, Y, Z)).matrixMult(this.rotations)

		return [
			this.transformX(X_r),
			this.transformY(Y_r)
		]
	}
	// отрисовать оси координат для 3D изометрии
	draw3DAxis (xMax, yMax, zMax) {
		const X0 = this.transformX(0)
		const Y0 = this.transformY(0)
		
		const [X_X, X_Y] = this.set3DtoScreen(xMax, 0, 0)
		const [Y_X, Y_Y] = this.set3DtoScreen(0, yMax,  0)
		const [Z_X, Z_Y] = this.set3DtoScreen(0, 0, zMax)
		
		this.context.strokeStyle = this.axisStyle.color
		this.context.lineWidth = this.axisStyle.width
		
		this.context.beginPath()
		this.context.moveTo(X0, Y0)
		this.context.lineTo(X_X, X_Y)
		this.context.stroke()
		
		this.context.beginPath()
		this.context.moveTo(X0, Y0)
		this.context.lineTo(Y_X, Y_Y)
		this.context.stroke()
		
		this.context.beginPath()
		this.context.moveTo(X0, Y0)
		this.context.lineTo(Z_X, Z_Y)
		this.context.stroke()
		
		return this
	}
	// отрисовать анимацию движения объекта
	drawAnimated(xArr, yArr, tFrame) {
		
	}
}