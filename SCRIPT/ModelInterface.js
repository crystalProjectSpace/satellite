class ModelInterface {
	constructor() {
		this.model = new KeplerSystem() // модель для расчета
		this.analyzer = new TrajectoryAnalyze() // блок аналитики
		this.grapher = new grapher() // блок вывода графики
		this.observers = [] // данные о наблюдателях
		this.tempResults = null // хранение последних расчетных результатов
		this.breakPoints = [] // контрольные точки, которые могут быть использованы как исходные данные
		
		this.root = null // корневой элемент для монтирования вывода графики и ввода ИД
		this.loadBtn = null // кнопка загрузки ИД
 		this.startBtn = null // кнопка запуска модели
		this.drawBtn = null // кнопка отрисовки
		this.logBox = null // контейнер для вывода логов
		this.selectors = null // блок селекторов 

		this.referenceFrame = '' // ID элемента, служащего точкой отсчета
		
		this.log = '' // лог действий модели
	}
	// смонтировали управление моделью
	init(root) {
		this.root = root
		this.grapher.init(root.querySelector('.output-canvas'))
		this.loadBtn = this.root.querySelector('.loader')
		this.startBtn = this.root.querySelector('.starter')
		this.drawBtn = this.root.querySelector('.grapher')
		this.logBox = this.root.querySelector('.output-log')
		this.selectorBox = this.root.querySelector('.selects')
		// кнопка загрузки исходных данных
		this.loadBtn.addEventListener('click', e => {
			e.preventDefault()
			e.stopPropagation()
			this.loadModelData(window.INITIAL_DATA)
			this.logBox.innerText = this.log
		})
		// кнопка запуска модели
		this.startBtn.addEventListener('click', e => {
			e.preventDefault()
			e.stopPropagation()
			
			this.startBtn.classList.add('disabled')
			this.drawBtn.classList.add('disabled')
			
			this.calculate(
				3600 * 24 * 4,
				2.5,
				10
			)
			
			this.startBtn.classList.remove('disabled')
			this.drawBtn.classList.remove('disabled')
			
			this.logBox.innerText = this.log
		})
		// кнопка отрисовки
		this.drawBtn.addEventListener('click', e => {
			e.preventDefault()
			e.stopPropagation()
			this.drawBtn.classList.add('disabled')			
			
			this
				.boundDrawRegion(
					-6.5 * 1E+7,
					6.5 * 1E+7,
					-3.5 * 1E+7,
					9.5 * 1E+7
				)
				.adjustCamera(0.01, 0.01, 90.01)
				.drawAxis(0.75*1E+8, 0.75*1E+8, 0.75*1E+8)
				.drawRelTrajectory('SAT2', '#b0997a')
				.drawRelTrajectory('SAT3', '#309f66')
				
			this.drawBtn.classList.remove('disabled')
			this.logBox.innerText = this.log
		})
		
		return this
	}
	// cформировать блок для выбора небесных тел в качестве опорной точки
	renderReferSelector() {
		const {element, optionItems} = renderMultiselect(
			this.model.bodies.map(body => body.ID),
			'Выбор опорной точки'
		)
		
		this.selectorBox.appendChild(element)
		
		optionItems.forEach(optionItem => {
			optionItem.addEventListener('click', e => {
				e.preventDefault()
				e.stopPropagation()				
				this
					.chooseReferenceFrame(optionItem.dataset['ID'])
					.logBox.innerText = this.log
				element.classList.remove('active')
			})
		})
		return this
	}
	// сформировать блок выбора относительных траекторий небесных тел
	renderRelativeSelector() {
		const {element, optionItems} = renderMultiselect(
			this.model.bodies.map(body => body.ID),
			'Сформировать относительную траекторию'
		)
		
		this.selectorBox.appendChild(element)
		
		optionItems.forEach(optionItem => {
			optionItem.addEventListener('click', e => {
				e.preventDefault()
				e.stopPropagation()				
				this
					.addRelativeTrajectory(optionItem.dataset['ID'])
					.logBox.innerText = this.log
				element.classList.remove('active')
			})
		})
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
		this
			.renderReferSelector()
			.renderRelativeSelector()
			.writeLog(`initial data acquired (nBodies = ${this.model.nBody})`)
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
		this.writeLog(`calculation started`)
		const tauStart = performance.now()
		
		this.tempResults = this.model.integrate(
			(kinematcis, Tau) => Tau < tauMax,
			N,
			dT
		)
		this.writeLog(`calculation done. time spent ${(performance.now() - tauStart).toFixed(2)} ms`)

		const iMax = this.tempResults.length - 1
		const orbitPrm = this.tempResults[iMax].orbitPrm
		
		const tauStore = performance.now()
		this
			.writeLog(`results being saved as temporal breakpoint`)
			.breakPoints.push({ // записали промежуточный результат расчета
				tau: this.tempResults[iMax].Tau,
				data: this.breakPoints[0].data.map(objectInfo => ({
					m: objectInfo.m,
					ID: objectInfo.ID,
					lightWeight: objectInfo.lightWeight,
					kinematics: orbitPrm[objectInfo.ID].slice()
				}))
			})
		this.writeLog(`temporal results saved. time spent ${(performance.now() - tauStore).toFixed(2)} ms`)
		
		return this
	}
	// выбрать точку отсчета для построения относительных траекторий
	chooseReferenceFrame(ID) {
		this
			.writeLog(`reference frame set for body __${ID}__`)
			.analyzer.clearRelativeTrajectories()
		this.referenceFrame = ID
		this.analyzer.addTrajectory( this.tempResults, ID) 
		return this
	}
	// Сформировать относительную траекторию
	addRelativeTrajectory(ID) {
		const tauTranslate = performance.now()
		this.analyzer
			.addTrajectory(this.tempResults, ID)
			.addRelativeOrbit(ID, this.referenceFrame) // сформировали траекторию относительно выбранной системы координат
		this.writeLog(`relative trajectory for ${ID} (reference frame: ${this.referenceFrame})saved. time spent ${(performance.now() - tauTranslate).toFixed(2)} ms`)
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
		const {points, timestamps} = this.analyzer.relativeTrajectories.find( trajectory => trajectory.relObjectID === ID && trajectory.refObjectID === this.referenceFrame)
		const {xArr, yArr} = this.grapher.transformPointArray(points)

		this.grapher
			.setLineColor(color)
			.drawTimeline(xArr, yArr, timestamps)
		return this
	}
	writeLog(msg) {
		this.log += `-- ${msg}; \n`
		return this
	}
}