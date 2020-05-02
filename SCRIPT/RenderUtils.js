'use strict'
// сформировать таблицу с перечнем параметров
const outputTable = (colFormat, data, header, id) => {
	const resultWrap = document.createElement('div') 
	const resultTab = document.createElement('table')
	const resultHeader = document.createElement('thead')
	const resultBody = document.createElement('tbody')
	const headerRow = document.createElement('tr')
					
	colFormat.forEach(key => {
		const headCell = document.createElement('th')
		headCell.innerText = `${key.name}, ${key.unit}`
		headerRow.appendChild(headCell)
	})
	
	resultHeader.appendChild(headerRow)
					
	data.forEach(dataStr => {
		const dataRow = document.createElement('tr')
		colFormat.forEach(key => {
			const cell = document.createElement('td')
			cell.innerText = (key.koef ? dataStr[key.ID] * key.koef : dataStr[key.ID]).toFixed(key.format)
			dataRow.appendChild(cell)
		})
		resultBody.appendChild(dataRow)
	})
					
	if( header) {
		const headerH = document.createElement('h3')
		headerH.innerText = header
		resultWrap.appendChild(headerH)
	}
					
	if( id ) {
		resultWrap.id = id
	}
					
	resultTab.appendChild(resultHeader)
	resultTab.appendChild(resultBody)
	resultWrap.appendChild(resultTab)
					
	resultWrap.classList.add('output-telemetry__container')
					
	return resultWrap
}
// сформировать краткую сводку
const writeStatistics = ({meanValue, dispersion}, precision) => {
	const result = document.createElement('div')
	result.classList.add('output-telemetry__statistics')
					
	const relDeviation = 100 * Math.sqrt(dispersion) / meanValue
					
	result.innerHTML = `<p>Оценка ошибки, вызванной приближенным методом расчета заметаемой площади.</p><p>Отношение среднеквад.отклонения к мат.ожиданию: ${relDeviation.toFixed(precision)}%; </p>` 
	return result
}
// сформировать таблицу-список
const prmListTable = (rowFormat, data, header, id) => {
	const result = document.createElement('div')
					
	result.classList.add('output-telemetry__orbit_prm')
					
	if (id) {
		result.id = id
	}
					
	if (header) {
		const tabHeader = document.createElement('h3')
		tabHeader.innerText = header
		result.appendChild(tabHeader)
	}
					
	const resultTab = document.createElement('table')
					
	for(let id in data) {
		const {name, unit, format, koef} = rowFormat.find(row => row.ID === id)
		const dataRow = document.createElement('tr')
						
		const dataName = document.createElement('td')
		dataName.innerText = `${name}, ${unit}: `
						
		const dataVal = document.createElement('td')
		dataVal.innerText = (koef ? data[id] * koef : data[id]).toFixed(format)
						
		dataRow.appendChild(dataName)
		dataRow.appendChild(dataVal)
						
		resultTab.appendChild(dataRow)
	}
					
	result.appendChild(resultTab)
	return result
}
// таблица с параметрами орбиты
const orbPrmFormat = [
	{ ID: 'periapsis', name: 'Периапсис', unit: 'км', format: 0, koef: 1E-3 },
	{ ID: 'apoapsis', name: 'Апоапсис', unit: 'км', format: 0, koef: 1E-3 },
	{ ID: 'axisMajor', name: 'Большая полуось', unit: 'км', format: 0, koef: 1E-3 },
	{ ID: 'axisMinor', name: 'Меньшая полуось', unit: 'км', format: 0, koef: 1E-3 },
	{ ID: 'excen', name: 'Эксцентриситет', unit: '-', format: 4 },
	{ ID: 'pFocus', name: 'Фокальный параметр', unit: 'км', format: 0, koef: 1E-3 },
	{ ID: 'tauOrbit', name: 'Период обращения', unit: 'с', format: 0 },
	{ ID: 'inclination', name: 'Наклонение', unit: 'град', format: 2, koef: 57.295 }
]
// отрисовать блок мультивыбора
const renderMultiselect = (options, name) => {
	const element = document.createElement('div')
	element.classList.add('output-controls__selector')
	
	const revealBtn = document.createElement('button')
	revealBtn.classList.add('selector-btn')
	revealBtn.innerText = name
	revealBtn.addEventListener('click', e => {
		e.preventDefault()
		e.stopPropagation()		
		element.classList.add('active')
	})
	
	const optionList = document.createElement('div')
	optionList.classList.add('selector-options')
	
	const optionItems = options.map( option => {
		const optionBtn = document.createElement('button')
		optionBtn.classList.add('selector-option__btn')
		optionBtn.innerText = option
		optionBtn.dataset['ID'] = option
		return optionBtn
	})
	
	optionItems.forEach(optionItem => { optionList.appendChild(optionItem)})
	
	element.appendChild(revealBtn)
	element.appendChild(optionList)
	
	return { element, optionItems }
}