class ModelInterface {
	constructor() {
		this.model = new KeplerSystem() // модель для расчета
		this.analyzer = new TrajectoryAnalyze() // блок аналитики
		this.grapher = new grapher() // блок вывода графики
		this.observers = [] // данные о наблюдателях
		this.tempResults = null // хранение последних расчетных результатов
		this.breakPoints = [] // контрольные точки, которые могут быть использованы как исходные данные
		
		this.root = null // корневой элемент для монтирования вывода графики и ввода ИД
		this.referenceFrame = '' // ID элемента, служащего точкой отсчета
		this.log = '' // лог действий модели
		
	}
	// смонтировали управление моделью
	init(root) {
		this.root = root
		this.grapher.init(root.querySelector('.output-canvas'))
		return this
	}
	// задать глобальный Север
	setGlobalNorth(xNorth, yNorth, zNorth) {
		this.analyzer.setNorth(Vect3D.fromNumbers(
			xNorth,
			yNorth,
			zNorth
		))
		return this	
	}
	// повернули камеру наблюдателя
	adjustCamera(Alpha, Betha, Gamma) {
		this.grapher.setRotations(
			Alpha/57.3,
			Betha/57.3,
			Gamma/57.3)
		return this
	}
	// заполнили модель исходными данными
	loadModelData(data) {
		this.model.init(data)
		this.breakPoints.push({ // сохранили исходные данные как первую контрольную точку
			data,
			tau: 0
		})
		this.log += `initial data acquired (nBodies = ${this.model.nBody}); \n`
		return this
	}
	// Добавить наблюдателя
	addObserver() {
		return this
	}
	// Удалить наблюдателя
	delObserver() {
		return this
	}
	// провести вычисления продолжительностью tau секунд с шагом dT и скважностью записи результатов N
	calculate(tauMax, dT, N) {
		this.log += `calculation started;\n`
		const tauStart = performance.now()
		
		this.tempResults = this.model.integrate(
			(kinematcis, Tau) => Tau < tauMax,
			N,
			dT
		)
		this.log += `calculation done. time spent ${performance.now() - tauStart} ms;`

		const iMax = this.tempResults.length - 1
		const orbitPrm = this.tempResults[iMax].orbitPrm
		
		const tauStore = performance.now()
		this.log += `results being saved as temporal breakpoint; \n`
		// записали промежуточный результат расчета
		this.breakPoints.push({
			tau: this.tempResults[iMax].Tau,
			data: this.breakPoints[0].data.map(objectInfo => ({
				m: objectInfo.m,
				ID: objectInfo.ID,
				lightWeight: objectInfo.lightWeight,
				kinematics: orbitPrm[objectInfo.ID].slice()
			}))
		})
		this.log += `temporal results saved. time spent ${performance.now() - tauStore} ms; \n`
		
		return this
	}
	// выбрать точку отсчета для построения относительных траекторий
	chooseReferenceFrame(ID) {
		this.log += `reference frame set for body __${ID}__; \n`
		this.referenceFrame = ID
		this.analyzer.addTrajectory( this.tempResults,ID) 
		return this
	}
	// Сформировать относительную траекторию
	addRelativeTrajectory(ID) {
		const tauTranslate = performance.now()
		this.analyzer
			.addTrajectory(this.tempResults, ID)
			.addRelativeOrbit(ID, this.referenceFrame) // сформировали траекторию относительно выбранной системы координат
		this.log += `relative trajectory for ${ID} (reference frame: ${this.referenceFrame})saved. time spent ${performance.now() - tauTranslate} ms; \n`
		return this
	}
	// Сформировать область построения
	boundDrawRegion(xMin, xMax, yMin, yMax) {
		this.grapher
			.setBounds(
				xMin,
				xMax,
				yMin,
				yMax)
			.adjust()
		return this
	}
	// отрисовать оси координат
	drawAxis(xAxis, yAxis, zAxis) {
		this.grapher.draw3DAxis(xAxis, yAxis, zAxis)
		return this
	}
	// отрисовать относительную траекторию
	drawRelTrajectory(ID, color) {
		const {xArr, yArr} = this.grapher.transformPointArray(
			this.analyzer.relativeTrajectories.find( trajectory => trajectory.relObjectID === ID && trajectory.refObjectID === this.referenceFrame).points
		)

		this.grapher
			.setLineColor(color)
			.drawGraphic(xArr, yArr)
		return this
	}
	// вывести лог запуска модели в консоль 
	printLog(){
		console.log(this.log)
		return this
	}
}