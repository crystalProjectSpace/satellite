'use strict'

class ArrayExtended extends Array {
	// получить граничные величины в массиве
	getExtrems() {
		const lMax = this.length
		const result = {min: this[0], max: this[0]}
		
		for(let i = 1; i < lMax; i++) {
			if(this[i] < result.min) {
				result.min = this[i]
			} else if (this[i] > result.max) {
				result.max = this[i]
			}
		}
		
		return result
	}
	// заполнить данными из обычного массива
	takeValues(arr) {
		const iMax = arr.length
		for(let i = 0; i < iMax; i++) {
			this[i] = arr[i]
		}
		return this
	}
	// сформировать расширенный массив из диапазона чисел внутри отрезка
	static getInterval(x0, x1, N) {
		const result = new ArrayExtended()
		
		const delta = (x1 - x0) / N
		let x = x0
		for(let i = 0; i < N; i++) {
			result.push(x)
			x += delta
		}
		return result
	}
	// сформировать расширенный массив из обычного
	static extendArray(arr) {
		const result = new ArrayExtended()
		return result.takeValues(arr)
	}
}