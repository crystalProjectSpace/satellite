'use strict'

class ArrayExtended extends Array {
	// получить граничные величины в массиве
	getExtrems() {
		const lMax = this.length
		const result = {min: this[0], max: this[0], i0: 0, i1: 0}
		
		for(let i = 1; i < lMax; i++) {
			if(this[i] < result.min) {
				result.min = this[i]
				i0 = i
			} else if (this[i] > result.max) {
				result.max = this[i]
				i1 = i
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
	// проредить массив со скважностью N
	sift(N) {
		const kMax = math.floor(this.length / N)
		const result = new ArrayExtended()
		let delta = 0
		for(let k = 0; k < kMax; k++) {
			result.push(this[delta])
			delta += N
		}
		return result
	}
	// собрать статистику по элемента массива (мат.ожидание и дисперсия)
	getStatistics() {
		const iMax = this.length
		let meanValue = this[0]
		let dispersion = 0
		
		for(let i = 1; i < iMax; i++) {
			meanValue += this[i]
		}
		
		meanValue /= iMax

		for(let i = 0; i < iMax; i++) {
			const delta = this[i] - meanValue
			dispersion += (delta * delta)
		}
		
		dispersion /= iMax
		return {
			meanValue,
			dispersion
		}
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
	// извлечь из таблицы именованную колонку
	static extractColumn(tab, colId) {
		const result = new ArrayExtended()
		const iMax = tab.length
		for(let i = 0; i < iMax; i++) {
			result.push(tab[i][colId])
		}
		return result
	}
}