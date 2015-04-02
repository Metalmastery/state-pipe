var flow = new Flow();

// middleware which creates initial data
function initData(data, chain) {
    console.log('initData', chain.getCurrentState());
    var newData = {
                firstName : 'John',
                secondName : 'Doe',
                id : '1',
                data : data
            };
    chain.next(newData);
}

// middleware which changes data for further purposes
function changeData(data, chain) {
    console.log('changeData');
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
    console.log('changeDataAgain');
    try {
    // something goes wrong here
        var newData = data.wrongField.completelyWrongWayToDoStuff * 2;
        //chain.next(newData);
    } catch (e) {
        console.log(chain._locked);
        //chain.next(e);
        chain.error(e);
        window.chain = chain;
    }
}

// middleware which has side effect like XHR or DOM rendering
function sideEffect(data, chain){
    console.log('side effect');
    var text = JSON.stringify(data, null, 4),
        div = document.createElement('div');
    div.innerText = text;
    document.body.appendChild(div);
    chain.next(data);
}

// middleware which handles possible error in any previous step
function errorHandlerToContinue(data, chain){
    console.log('error', data);
    chain.next();
}

function errorHandlerToChangeState(data, chain){
    console.log('error', data);
    chain.switchTo('a', 'testestestetss');
}

function after (data, chain) {
    console.log('AFTER', data);
    chain.next();
}

flow.to('a')
    .after(after)
    .process(initData)
    .process(changeData)
    .process(sideEffect)
    .described();

flow.to('b')
    //.error(errorHandlerToContinue)
    .process(initData)
    .process(changeData)
    .process(changeDataAgain)
    //.error(errorHandlerToContinue)
    .error(errorHandlerToChangeState)
    //.process(sideEffect)
    .after(after)
    .described();

flow.to('c')
    .described();

// call one of that functions below switchTo run sequence

// flow.switchTo('a');

// flow.switchTo('b');

// flow.switchTo('c');