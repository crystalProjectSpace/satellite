window.addEventListener('DOMContentLoaded', () => {
/* непосредственный расчет */			
// тестовый наблюдатель на 1 градусе северной широты , 1 градусе восточной долготы
	const testObserver = Plane.observePlane(6.3711*1E6, 1.5/57.3, 1/57.3)
// тестовый спутник на НОО (100 км)
	const testKeplerSystem = (new KeplerSystem()).init([
		{
			m: 5.972 * 1E+24,
			kinematics : [0, 0, 0, 0, 0, 0], 
			lightWeight: false,
			ID: 'EARTH'
		},
		{
			m: 7.3477*1E+22,
			kinematics : [990, 0, 1, 0, -4.05696 * 1E+8, 0], 
			lightWeight: false,
			ID: 'MOON'
		},
		{
			m: 100,
			kinematics : [800.26, -175, 0, -0.75*1E+8, -4.01965 * 1E+8, 0], 
			lightWeight: true,
			ID: 'SAT2'
		},
		{
			m: 100,
			kinematics : [800.26, -175, 0, -0.41*1E+8, -4.01966 * 1E+8, 0], 
			lightWeight: true,
			ID: 'SAT3'
		}
	])
				
	const testInterpreter = new TrajectoryAnalyze() // блок анализа результатов траекторного расчета
	// Ч.И траектории за 20000 секунд с шагом 0.5с и запоминанием каждого 4-го шага
	const integrateResult = testKeplerSystem.integrate(
		(kinematcis, Tau) => Tau < 3600*24*4,
		10,
		2.5) 	

	testInterpreter
		.addTrajectory(integrateResult, 'MOON') // добавили траекторию Луны
		.addTrajectory(integrateResult, 'EARTH') // 				   Земли
		.addTrajectory(integrateResult, 'SAT2') //					   спутник-2
		.addTrajectory(integrateResult, 'SAT3') //                     спутник-3
		.addObserver(testObserver, 'OBS') // добавили наблюдателя. на всякий случай
		.setNorth(Vect3D.fromNumbers(0, 0, 1E15)) // задали глобальный север (по OZ)
		.addRelativeOrbit('SAT2', 'MOON') // сформировали траекторию спутника-2 отн. Луны
		.addRelativeOrbit('SAT3', 'MOON') // сформировали траекторию спутника-3 отн. Луны
								
	const testGrapher = new grapher() // запустили графопостроитель
							
	testGrapher
		.init(document.querySelector('.output-canvas')) // связали графопостроитель с канвой
		.setRotations(0.01/57.3, 0.01/57.3, 90.01/57.3) // повернули область отрисовки на 90 по OZ
	// преобразовали точки траектории к экранной системе координат							
	const TR1 = testGrapher.transformPointArray(testInterpreter.relativeTrajectories[0].points) // для спутника-2
	const TR2 = testGrapher.transformPointArray(testInterpreter.relativeTrajectories[1].points) // для спутника-3
	// определили размеры области отрисовки			
	const dX = 10.5
	const magnitude = 1E+7
				
	testGrapher
		.setBounds(
			-0.625 * dX * magnitude,
			0.625 * dX * magnitude,
			-0.25 * dX * magnitude,
			dX * magnitude)
		.adjust() // сформировали коэффициенты масштабирования
		.draw3DAxis (0.75*1E8, 0.75*1E8, 0.75*1E8) // нарисовали оси
		.setLineColor('#b0997a') // задали цвет для отрисовки траектории-1
		.drawGraphic(TR1.xArr, TR1.yArr) // нарисовали траекторию-1
		.setLineColor('#309f66') // задали цвет для отрисовки траектории-2
		.drawGraphic(TR2.xArr, TR2.yArr) // нарисовали траекторию-2
		.drawGlobe(1.737*1E+6) // нарисовали Луну
})