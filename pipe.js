function Pipe(name){
    this.name = name;

    this.data = null;
    this.dataStates = [];

    this.steps = [];

    this.ready = false;

    this.currentHandler = [];
}

Pipe.prototype.process = function (fn) {
    var result;

    this.steps.push({handler : null, fn : fn});

    return this;
};

Pipe.prototype.finish = function () {

    var step,
        nextStep,
        callbacks;

    this.steps.push({handler : null, fn : function(){

    }});

    function wrap(step, nextStep){
        return {
            success : function(data){
                nextStep.fn(data, nextStep.handler)
            },
            error : function(){
                console.log(arguments);
            }
        }
    }


    for (var i = 0; i < this.steps.length - 1; i++) {
        step = this.steps[i];
        nextStep = this.steps[i + 1];
        callbacks = wrap(step, nextStep);
        step.handler = new Flowhandler(callbacks.success, callbacks.error);
    }

    this.ready = true;

    return this;
};

Pipe.prototype.run = function () {

    if (this.ready) {
        this.steps[0].fn(null, this.steps[0].handler);
    }

};




var t = new Pipe('test');

function cb1(data, chain) {
    console.log(arguments);
    var newData = 'test1';
    chain.next(newData);
}

function cb2(data, chain) {
    console.log(arguments);
    var newData = data + 'test2';
    chain.next(newData);
}


t.process(cb1).process(cb2).process(cb2).finish();