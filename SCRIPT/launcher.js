window.addEventListener('DOMContentLoaded', () => {
	const modelManager = new ModelInterface()
	
	window.INITIAL_DATA = [
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
	]
	
	modelManager.init(document.querySelector('.output'))
})