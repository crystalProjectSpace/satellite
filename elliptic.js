'use strict'
// универсальная гравитационная постоянная
const G0 = 6.6743 * 1E-11
// класс единичного объекта, движущегося в центральном поле тяготения
class KeplerBody {
	
	constructor() {
		// кинематические параметры, первые три - скорости, последние три - координаты
		this.kinematics = [
			0,
			0,
			0,
			0,
			0,
			0
		]
		
		this.m = 0 // масса
		this.ID = '' // ID тела, произвольная строка
		this.lightweight = false // объект маломассивный, 
	}
	// заполнить исходными данными
	init(m, Vx, Vy, Vz, X, Y, Z, isLightweight, ID){
		this.kinematics[0] = Vx
		this.kinematics[1] = Vy
		this.kinematics[2] = Vz
		this.kinematics[3] = X
		this.kinematics[4] = Y
		this.kinematics[5] = Z
		
		this.m = m
		
		this.lightweight = isLightweight
		
		this.ID = ID
		
		return this
	}
	// извлечь скорость
	getSpeed(){
		return [this.kinematics[0], this.kinematics[1], this.kinematics[2] ]
	}
	// извлечь координаты
	getCoords(){
		return [this.kinematics[3], this.kinematics[4], this.kinematics[5] ]
	}
	// получить ускорения, действующие на тело при взаимодействии с другим объектом
	accelerations(kineticSelf, kineticAnother, mAnother) {
		const [X0, Y0, Z0] = kineticSelf.slice(3, 6)
		const [X1, Y1, Z1] = kineticAnother.slice(3, 6)

		const dX = X1 - X0
		const dY = Y1 - Y0
		const dZ = Z1 - Z0
		const range2 = dX * dX + dY * dY + dZ * dZ
		const range = Math.sqrt(range2)
		const range2_5 = range2 * range
		
		const accelScalar1 = G0 * mAnother / range2_5
		
		if( this.lightweight ) {
			return { accel1: [
				accelScalar1 * dX,
				accelScalar1 * dY,
				accelScalar1 * dZ,
			]}
		} else {
			const accelScalar2 = -G0 * this.m / range2_5
			return {
				accel1: [				// ускорение, получаемое телом от взаимодействия
					accelScalar1 * dX,
					accelScalar1 * dY,
					accelScalar1 * dZ,
				],
				accel2: [				// ускорение, придаваемое второму телу, с которым взаимодействует основное
					accelScalar2 * dX,
					accelScalar2 * dY,
					accelScalar2 * dZ
				]
			}			
		}
	}
}
// система объектов, связанных гравитационными силами
class KeplerSystem {
	constructor () {
		this.nBody = 0
		this.bodies = []
		this.derivTemplate = []
	}
	// получить данные
	init(orbData) {
		this.nBody = orbData.length
		orbData.forEach(orbBody => {
			this.bodies.push(
				(new KeplerBody()).init(orbBody.m, ...orbBody.kinematics, orbBody.lightWeight, orbBody.ID)
			)
		})
		
		return this.getDerivTemplate()
	}
	// получить таблицу-шаблон для расчета производных
	getDerivTemplate() {
		for(let i = 0; i < this.nBody; i++) {
			this.derivTemplate.push([0, 0, 0, 0, 0, 0])
		}
		
		return this
	}
	// получить производные на каждом шагу
	getDerivatives(kinematics) {
		let result = this.derivTemplate.map(item => item.slice())
		const nMax = this.nBody - 1

		for(let i = 0; i < nMax; i++) {
			const j0 = i + 1
			const currentBody = this.bodies[i]
			for(let j = j0; j < this.nBody; j++) {
				const {accel1, accel2} = currentBody.accelerations(
					kinematics[i],
					kinematics[j],
					this.bodies[j].m
				)

				result[i][0] += accel1[0]
				result[i][1] += accel1[1]
				result[i][2] += accel1[2]
				if(accel2) {	// для маломассивных тел игнорируем оказываемые ими воздействия на другие объекты
					result[j][0] += accel2[0]
					result[j][1] += accel2[1]
					result[j][2] += accel2[2]
				}
			}
			result[i][3] = kinematics[i][0]
			result[i][4] = kinematics[i][1]
			result[i][5] = kinematics[i][2]
		}
		
		result[nMax][3] = kinematics[nMax][0]
		result[nMax][4] = kinematics[nMax][1]
		result[nMax][5] = kinematics[nMax][2]

		return result		
	}
	// численное интегрирование уравнений движения группы тело
	integrate(N, frequency, dT) {
		let i = 0
		let Tau = 0
		let k = 1
		const dT05 = dT * 0.5
		const dT06 = dT * 0.1666666667
		
		const result = [{
			Tau,
			orbitPrm: {}
		}]
		
		const kinematics = []
		
		this.bodies.forEach(body => {
			result[0].orbitPrm[body.ID] = body.kinematics.slice()
			kinematics.push(body.kinematics.slice())
		})

		const kinematics0 = kinematics.map(kineItem => kineItem.slice())
		
		while( i < N ) {
			const K0 = this.getDerivatives(kinematics)
			for(let j = 0; j < this.nBody; j++) {
				kinematics[j][0] = kinematics0[j][0] + K0[j][0] * dT05
				kinematics[j][1] = kinematics0[j][1] + K0[j][1] * dT05
				kinematics[j][2] = kinematics0[j][2] + K0[j][2] * dT05
				kinematics[j][3] = kinematics0[j][3] + K0[j][3] * dT05
				kinematics[j][4] = kinematics0[j][4] + K0[j][4] * dT05
				kinematics[j][5] = kinematics0[j][5] + K0[j][5] * dT05
			}
			
			const K1 = this.getDerivatives(kinematics)
			for(let j = 0; j < this.nBody; j++) {
				kinematics[j][0] = kinematics0[j][0] + K1[j][0] * dT05
				kinematics[j][1] = kinematics0[j][1] + K1[j][1] * dT05
				kinematics[j][2] = kinematics0[j][2] + K1[j][2] * dT05
				kinematics[j][3] = kinematics0[j][3] + K1[j][3] * dT05
				kinematics[j][4] = kinematics0[j][4] + K1[j][4] * dT05
				kinematics[j][5] = kinematics0[j][5] + K1[j][5] * dT05
			}
			
			const K2 = this.getDerivatives(kinematics)
			for(let j = 0; j < this.nBody; j++) {
				kinematics[j][0] = kinematics0[j][0] + K2[j][0] * dT
				kinematics[j][1] = kinematics0[j][1] + K2[j][1] * dT
				kinematics[j][2] = kinematics0[j][2] + K2[j][2] * dT
				kinematics[j][3] = kinematics0[j][3] + K2[j][3] * dT
				kinematics[j][4] = kinematics0[j][4] + K2[j][4] * dT
				kinematics[j][5] = kinematics0[j][5] + K2[j][5] * dT
			}
			
			const K3 = this.getDerivatives(kinematics)
			
			for(let j = 0; j < this.nBody; j++) {
				kinematics[j][0] = kinematics0[j][0] + (K0[j][0] + 2 * (K1[j][0] + K2[j][0]) + K3[j][0] ) * dT06
				kinematics[j][1] = kinematics0[j][1] + (K0[j][1] + 2 * (K1[j][1] + K2[j][1]) + K3[j][1] ) * dT06
				kinematics[j][2] = kinematics0[j][2] + (K0[j][2] + 2 * (K1[j][2] + K2[j][2]) + K3[j][2] ) * dT06
				kinematics[j][3] = kinematics0[j][3] + (K0[j][3] + 2 * (K1[j][3] + K2[j][3]) + K3[j][3] ) * dT06
				kinematics[j][4] = kinematics0[j][4] + (K0[j][4] + 2 * (K1[j][4] + K2[j][4]) + K3[j][4] ) * dT06
				kinematics[j][5] = kinematics0[j][5] + (K0[j][5] + 2 * (K1[j][5] + K2[j][5]) + K3[j][5] ) * dT06
				kinematics0[j][0] = kinematics[j][0]
				kinematics0[j][1] = kinematics[j][1] 
				kinematics0[j][2] = kinematics[j][2]
				kinematics0[j][3] = kinematics[j][3] 
				kinematics0[j][4] = kinematics[j][4]
				kinematics0[j][5] = kinematics[j][5] 				
			}
			
			Tau += dT
			i++

			if(k === frequency) {
				const orbitPrm = {}//[]
				for(let j = 0; j < this.nBody; j++) {
					orbitPrm[this.bodies[j].ID] = [
						kinematics[j][0],
						kinematics[j][1],
						kinematics[j][2],
						kinematics[j][3],
						kinematics[j][4],
						kinematics[j][5]
					]				
				}
				result.push({
					Tau,
					orbitPrm
				})
				k = 1
			} else {
				k++
			}
		}

		return result
	}
}