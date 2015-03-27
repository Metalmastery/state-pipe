var sequencer = new Sequencer();

// middleware which creates initial data
function initData(data, chain) {
    var newData = {
                firstName : 'John',
                secondName : 'Doe',
                id : '1'
            };
    chain.next(newData);
}

// middleware which changes data for further purposes
function changeData(data, chain) {
    var newData = {
            user : data,
            posts : [
                'post1',
                'post2'
            ]
        };
    // async data flow
    setTimeout(function(){
        chain.next(newData);
    }, 1000);
}

// middleware which fails the chain
function changeDataAgain(data, chain) {
    try {
    // something goes wrong here
        var newData = data.wrongField.completelyWrongWayToDoStuff * 2;
        chain.next(newData);
    } catch (e) {
        chain.error(e);
    }
}

// middleware which has side effect like XHR or DOM rendering
function sideEffect(data, chain){
    var text = JSON.stringify(data, null, 4),
        div = document.createElement('div');
    div.innerText = text;
    document.body.appendChild(div);
    chain.next();
}

// middleware which handles possible error in any previous step
function errorHandler(data, chain){
    console.log('error', data);
}

sequencer.pipe('a')
    .process(initData)
    .process(changeData)
    .process(sideEffect)
    .finish();

sequencer.pipe('b')
    .process(initData)
    .process(changeData)
    .process(changeDataAgain)
    .error(errorHandler)
    .process(sideEffect)
    .finish();

sequencer.pipe('c')
    .finish();

// call one of that functions below to run sequence

// sequencer.state('a');

// sequencer.state('b');

// sequencer.state('c');