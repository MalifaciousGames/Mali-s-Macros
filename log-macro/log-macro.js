/* Mali's <<log>> macro for SugarCube */

;(function(){
const timers = {},
	getTime = (id) => {
    	const time = String(Date.now()-timers[id].time);
    	return time.length > 3 ? time.splice(-3,0,'.')+' s' : time+' ms';
    };

Macro.add(['log','logtime','logstop'], {
	handler() {
      
      if (['logtime','logstop'].includes(this.name)) {
      	const id = this.args[0] ?? 'log-time';
        
        if (this.name === 'logstop') {//Delete timer
          	if (timers[id] === undefined) return this.error(`'${id}' timer does not exist.`);
        	console.log(`%c${id === 'log-time' ? 'Default' : "'"+id+"'"} timer ended after ${getTime(id)}`, timers[id].style);
          	delete timers[id];
        } else if (timers[id]) {//ID exists, log it
        	console.log(`%c${id === 'log-time' ? '' : "'"+id+"' :"} ${getTime(id)}`, timers[id].style);
        } else {//Set new timer
          	const style = this.args[1] ?? '';
          	console.log(`%cStarted timer ${id === 'log-time' ? '' : ": '"+id+"'"}`, style);
          	timers[id] = {time : Date.now(), style : style};
        }
        
      } else  if (!this.args.length) {//Source syntax
        
      	if (this.parent) {//Not from passage load
		let source = this.parent.source, index = source.indexOf('<<log>>');
          	source = source.includes('<<log>>') ? source.splice(index ,0,'%c').splice(index+9 ,0,'%c') : `%c<<log>> %cran from %c${source}.`;
        	console.log(source, 'font-weight:bold;color:red','');
        } else {
        	console.log('%c<<log>> %cran from the current passage.', 'font-weight:bold;color:red','');
        }
        
      } else {//variable logging
      	const label = this.args.find(arg => typeof arg === 'string' && arg[0] === '(' && arg[arg.length-1] === ')');
        label ? this.args.delete(label) : null;
        
        if (this.args.length === 1 && !label) {
        	console.log(this.args[0]);
        } else {
        	console.group(label ? label.replace(/[()]/g,'') : 'Log');
      		this.args.forEach(arg => {
      			console.log(arg);
      		});
       		console.groupEnd();
       }
    }
}})
})();
