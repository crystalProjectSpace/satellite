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
		const timestamps = []
			
		for(let i = 0; i < lx; i++) {
			if( data[i].orbitPrm[ID]) {
				const orbData = data[i].orbitPrm[ID]
				points.push(Vect3D.fromNumbers(
					orbData[3],
					orbData[4],
					orbData[5]
				))
						
				timestamps.push(data[i].Tau)
			}
		}
					
		this.trajectories[ID] = { points, timestamps }
		return this
	}
	// Для наблюдателя с заданным положением оценить видимость другого объекта по точкам траектории и временным меткам
	checkVisibility (observerID, objectID) {
		const observer = this.observers[observerID]
		const {points, timestamps} = this.trajectories[objectID]

		const lx = points.length
		const result = []
							
		for(let i = 0; i < lx; i++) {
			const ascend = observer.ascend(points[i])
			if( ascend > 0 ) {
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
}