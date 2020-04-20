// класс для хранения и промежуточного анализа данных
class TrajectoryAnalyze {
	constructor() {
		this.trajectories = {} // траекторные данные подвижных объектов
		this.observers = {} // неподвижные наблюдатели
		this.NORTH = null
	}
	setNorth(north) {
		this.NORTH = north
		return this
	}
	// Добавить данные о наблюдателе
	addObserver( observer, ID) {
		this.observers[ID] = observer
		return this
	}
	// Добавить из массива сырых траекторны
	addTrajectory( data, ID ) {
		const lx  = data.length
		const points = []
		const speed = []
		const timestamps = []
			
		for(let i = 0; i < lx; i++) {
			if( data[i].orbitPrm[ID]) {
				const orbData = data[i].orbitPrm[ID]
				points.push(Vect3D.fromNumbers(
					orbData[3],
					orbData[4],
					orbData[5]
				))
				
				speed.push(Vect3D.fromNumbers(
					orbData[0],
					orbData[1],
					orbData[2]
				))
						
				timestamps.push(data[i].Tau)
			}
		}
					
		this.trajectories[ID] = { points, speed, timestamps }
		return this
	}
	// Для наблюдателя с заданным положением оценить видимость другого объекта по точкам траектории и временным меткам
	checkVisibility (observerID, objectID, localZero, localR) {
		const observer = this.observers[observerID]
		const {points, timestamps} = this.trajectories[objectID]

		const lx = points.length
		const result = []
		const alphaMin = -0.5 * Math.PI + Math.asin(localR / observer.point.subVect(localZero).absVect()) // минимальный угол обзора с учетом подъема над горизонтом

		for(let i = 0; i < lx; i++) {
			const ascend = observer.ascend(points[i])
			if( ascend > alphaMin ) {
				const azimuth = observer.azimuth(this.NORTH, points[i])
				const range = observer.point.range(points[i])
				result.push({
					ascend,
					azimuth,
					range,
					t: timestamps[i]
				})
			}
		}
					
		return result
	}
	// оценить заметаемые площади
	checkSweep(objectID, localZERO, frequency) {
		const {points, timestamps} = this.trajectories[objectID]
		const kMax = Math.floor(points.length / frequency) - 1
		
		const result = []
		let delta = 0
		
		for(let k = 0; k < kMax; k++) {
			const delta05 = delta + Math.floor(frequency * 0.5)
			const area1 = points[delta].triangleHeron(localZERO, points[delta + frequency])
			const area2 = points[delta].triangleHeron(points[delta05], points[delta + frequency])
			result.push({
				dt: timestamps[delta + frequency] - timestamps[delta],
				areaSwipe: area1 + area2
			})
			delta += frequency
		}
		return result
	}
	// получить основные траекторные параметры (полуоси, эскцентриситет)
	getOrbitPrm(objectID, localZERO) {
		const {points, timestamps} = this.trajectories[objectID]
		const iMax = points.length
		const cr0 = points[0]
		
		let tauOrbit = 0
		let deltaStart = 0
		
		const r0 = points[0].subVect(localZERO).absVect()
		const dR1 = points[0].subVect(points[1]).absVect()

		let rMax = r0
		let rMin = r0
		
		let iRmax = 0
		let iRmin = 0
		// проходимся по массиву точек, пока не будет точка с координатами, максимально близкими к начальной
		for(let i = 1; i < iMax; i++) {
			const dR = points[i].subVect(localZERO).absVect()
			
			if(dR > rMax ) {
				rMax = dR
				iRmax = i
			} else if (dR < rMin) {
				rMin = dR
				iRmin = i
			}
			
			if(points[i].subVect(cr0).absVect() < dR1 && !tauOrbit) {
				tauOrbit = timestamps[i] - timestamps[0]
			}
		}
		
		const axisMajor = (rMax + rMin) * 0.5
		
		let i0 = Math.min(iRmax, iRmin)
		let i1 = Math.max(iRmax, iRmin)
		let axisMinor = 0
		
		const axisMajorLine = (new Line()).setFromPoints(points[i0], points[i1])
		// методом дихотомии проходимся по массиву точек, чтобы найти малую полуось
		// точка на траектории, максимально удаленная от большей полуоси эллписа
		while(Math.abs(i0 - i1) > 1) {
			const i_05 = Math.floor((i0 + i1)/2)

			const delta1 = axisMajorLine
				.projectPoint(points[i_05 - 1])
				.subVect(points[i_05 - 1])
				.absVect()

			const delta2 = axisMajorLine
				.projectPoint(points[i_05 + 1])
				.subVect(points[i_05 + 1])
				.absVect()
			
			axisMinor = 0.5 * (delta1 + delta2)
			
			delta2 > delta1 ? i0 = i_05 : i1 = i_05
		}
		
		const axisRel = axisMinor / axisMajor
		const excen = Math.sqrt(1 - axisRel * axisRel)
		
		return {
			axisMajor,
			axisMinor,
			excen,
			pFocus: axisMinor*axisRel,
			tauOrbit
		}

	}
}