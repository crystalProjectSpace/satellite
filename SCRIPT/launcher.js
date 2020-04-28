window.addEventListener('DOMContentLoaded', () => {
	const modelManager = new ModelInterface()
	
	modelManager
		.init(document.querySelector('.output'))
		.loadModelData([
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
		.calculate(3600 * 24 * 4, 2.5, 10)
		.chooseReferenceFrame('MOON')
		.addRelativeTrajectory('SAT2')
		.addRelativeTrajectory('SAT3')
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
		.printLog()
})