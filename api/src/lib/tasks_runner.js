class Task {
	constructor(func, executionTime, isPeriodic, period) { 
		this.func = func;
		this.id = executionTime;
		this.executionTime = executionTime
		this.isPeriodic = isPeriodic
		if (isPeriodic) {
			this.period = period
		}
	}
	run() {
		this.func()
	}
	setNextExecutionTime() {
		if(this.isPeriodic) {
			this.executionTime += this.period
		}
	}
}

class TaskRunner {
	constructor(frequence) {
		this.frequence = frequence
		this.queue = []
		this.loop()
	}
	_insert(task) {
		let i = 0;
		while(i < this.queue.length && this.queue[i].executionTime <= task.executionTime) {
			i++;
		}
		this.queue = this.queue.slice(0,i).concat([task], this.queue.slice(i))
	}
	addSingleTask(func, runTime) {
		const task = new Task(func, runTime, false, -1)
		this._insert(task)
	}
	addPeriodicTask(func, firstRunTime, period) { 
		const task = new Task(func, firstRunTime, true, period)
		this._insert(task)
	}
	loop() {
		const currentTime = Date.now()
		while(this.queue[0] && this.queue[0].executionTime <= currentTime) {
			const task = this.queue.shift()
			if (task.isPeriodic) {
				task.setNextExecutionTime()
				this._insert(task)
			}
			task.run()
		}
		setTimeout(this.loop.bind(this), this.frequence)
	}
}
module.exports = TaskRunner
