var Sequencer = require('./sequencer');

var sequencer = new Sequencer();

function cb1(data, chain) {
    console.log('cb1', arguments);
    var newData = 'test1';
    chain.next(newData);
}

function cb2(data, chain) {
    console.log('cb2', arguments);
    var newData = data + 'test2';
    window.step = function(){
        chain.next(newData);

    };
    //chain.next(newData);
}

function cb3(data, chain) {
    console.log(arguments);
    var newData = data + 'test2';
    //chain.next(newData);
    chain.error(newData);
}

function cb4(data, chain) {
    console.log('cb4', arguments);
    var newData = data + 'test2';
    window.state = function(state){
        console.log('cb4', chain);
        chain.state(state);

    };
}

function handler(e){
    console.log('error', e);
}

//t.process(cb1).process(cb2).process(cb2).finish();
sequencer.pipe('a')
    .process(cb1)
    .process(cb2)
    .process(cb2)
    .error(handler)
    .process(cb3)
    .error(handler)
    .finish();

sequencer.pipe('b')
    .process(cb2)
    .process(cb2)
    .error(handler)
    .process(cb4)
    .error(handler)
    .finish();

sequencer.pipe('c').finish();

window.sequencer = sequencer;