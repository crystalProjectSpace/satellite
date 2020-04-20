class Vect3D extends Array {
	// создать точку в декартовых координатах из полярных
	static fromPolar(R, W, L) {
		const result = new Vect3D()
		const CW = Math.cos(W)
		result.getVect(
			R * CW * Math.cos(L),
			R * CW * Math.sin(L),
			R * Math.sin(W)
		)
		return result		
	}
	// создать точку из набора трех чисел
	static fromNumbers(X, Y, Z) {
		return (new Vect3D()).getVect(X, Y, Z)
	}
// собрать вектор из трех значений	
	getVect(X, Y, Z)
	{
		this[0] = X
		this[1] = Y
		this[2] = Z
		return this
	}
// сумма векторов	
	sumVect(U) {
		const result = new Vect3D()
		result[0] = this[0] + U[0]
		result[1] = this[1] + U[1]
		result[2] = this[2] + U[2]
		return result
	}
// вычитание векторов 	
	subVect(U) {
		const result = new Vect3D()
		result[0] = this[0] - U[0]
		result[1] = this[1] - U[1]
		result[2] = this[2] - U[2]
		return result
	}
// умножение на скаляр	
	multScalar(k) {
		const result = new Vect3D()
		result[0] = this[0] * k
		result[1] = this[1] * k
		result[2] = this[2] * k
		return result
	}
// деление на скаляр	
	divScalar(k) {
		const _k = 1/k
		const result = new Vect3D()
		result[0] = this[0] * _k
		result[1] = this[1] * _k
		result[2] = this[2] * _k
		return result
	}
// модуль	
	absVect() {
		return Math.sqrt(
			this[0] * this[0] + 
			this[1] * this[1] + 
			this[2] * this[2]
		)
	}
// приведение к единичному вектору	
	normalize() {
		const _R = 1/this.absVect()
		return this.multScalar(_R)
	}
// скалярное произведение	
	dotProduct(U) {
		return this[0] * U[0] + 
			this[1] * U[1] + 
			this[2] * U[2]
	}
// 	векторное произведение
	crossProduct(U) {
		const result = new Vect3D()
		result[0] = this[1] * U[2] - this[2] * U[1]
		result[1] = this[2] * U[0] - this[0] * U[2]
		result[2] = this[0] * U[1] - this[1] * U[0]
		return result		
	}
// привести к полярным координатам	
	toPolar() {
		const [X, Y, Z] = this.normalize()
		const W = Math.asin(Z)
		const L = X > 0 ?
			(Y < 0 ? 2 * Math.PI + Math.asin(Y / Math.cos(W)) : Math.asin(Y / Math.cos(W)) ) :
			Math.PI - Math.asin(Y / Math.cos(W))
		return {W, L}
	}
// Получить угол
	getAngle(U) {
		return Math.acos(this.dotProduct(U) / (this.absVect() * U.absVect()))
	}
// Умножить на матрицу
	matrixMult(M) {
		const result = new Vect3D()
		
		result[0] = M[0][0] * this[0] + M[0][1] * this[1] + M[0][2] * this[2]
		result[1] = M[1][0] * this[0] + M[1][1] * this[1] + M[1][2] * this[2]
		result[2] = M[2][0] * this[0] + M[2][1] * this[1] + M[2][2] * this[2]
		
		return result
	}
// Расстояние между двумя точками
	range(U) {
		const dX = this[0] - U[0]
		const dY = this[1] - U[1]
		const dZ = this[2] - U[2]
		
		return Math.sqrt(dX * dX + dY * dY + dZ * dZ)
	}
// площадь треугольника между текущей точкой и еще двумя другими
	triangleHeron(B, C) {
		const AB = this.subVect(B).absVect()
		const AC = this.subVect(C).absVect()
		const BC = B.subVect(C).absVect()
		const P = 0.5 * (AB + AC + BC)
		return Math.sqrt(P * (P - AB) * (P - AC) * (P - BC))
	}
}
// Класс плоскости в трехмерном пространстве
class Plane {
	constructor () {
		this.point = new Vect3D()
		this.norm = new Vect3D()
		this.normSign = 0
	}
	// задать плоскость по 3 точкам
	setFromPoints(A, B, C) {
		this.point.getVect(...B)
		this.norm.getVect(
			...B
				.subVect(A)
				.crossProduct(B.subVect(C))
				.normalize()
		)
	
		return this.getSign()
	}
	// получить знак нормали
	getSign() {
		this.normSign = this.norm[0]
		
		this.normSign = Math.abs(this.norm[1]) > Math.abs(this.normSign) ? this.norm[1] : this.normSign
		this.normSign = Math.abs(this.norm[2]) > Math.abs(this.normSign) ? this.norm[2] : this.normSign
		this.normSign = Math.sign(this.normSign)
		
		return this
	}
	// спроецировать точку на плоскость
	projectPoint(A) {
		const t = this.point.subVect(A).dotProduct(this.norm) / this.norm.dotProduct(this.norm)
		return A.sumVect(this.norm.multScalar(t))
	}
	// найти точки пересечения прямой и плоскости
	intersectLine(line) {
		const t = this.point.subVect(line.point).dotProduct(this.norm) / this.norm.dotProduct(line.direct)
	}
	// азимут, с которого наблюдается точка
	azimuth(north, point) {
		const directNorth = this.point.subVect(this.projectPoint(north))
		const directPoint = this.point.subVect(this.projectPoint(point))
		const signVect = directNorth.crossProduct(directPoint)
		
		let angleSign = signVect[0]
		angleSign = Math.abs(signVect[1]) > Math.abs(angleSign) ? signVect[1] : angleSign
		angleSign = Math.abs(signVect[2]) > Math.abs(angleSign) ? signVect[2] : angleSign

		return Math.sign(angleSign) === this.normSign ?
			(angleSign > 0 ? 2 * Math.PI - directNorth.getAngle(directPoint) : directNorth.getAngle(directPoint)) :
			(angleSign < 0 ?  directNorth.getAngle(directPoint) : 2 * Math.PI - directNorth.getAngle(directPoint))			
	}
	// возвышение точки над горизонтом
	ascend(point) {
		return 0.5 * Math.PI - this.norm.getAngle(point.subVect(this.point))
	}
	// создать плоскость, касательную к заданной точке (W, L) на сфере радиусом R
	static observePlane(R, W, L) {
		const result = new Plane()
		result.point = Vect3D.fromPolar(R, W, L)
		result.norm = result.point.normalize()
		return result.getSign()		
	}
}
// класс прямой
class Line {
	
	constructor() {
		this.point = new Vect3D()
		this.direct = new Vect3D()
	}
	// построить прямую по двум точкам
	setFromPoints(A, B) {
		this.point.getVect(...A)
		this.direct = B.subVect(A).normalize()
		return this
	}
	// Спроецировать точку на прямую
	projectPoint(A) {
		const t = this.direct.dotProduct(A.subVect(this.point)) / this.direct.dotProduct(this.direct)
		return this.point.sumVect(this.direct.multScalar(t))		
	}
}