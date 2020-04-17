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
}