#StateFlow

> try to discribe your buisness logic flow of application

It is just a small tool for logical chains based on middleware idea.

##Идея
Если рассмотреть структуру вашего вашего приложения то она скорее всего будет представлять собой:

![Directed acyclic graph](assets/dag.png)
 
То есть структуру [directed acyclic graph](http://en.wikipedia.org/wiki/Directed_acyclic_graph) в узлах которого будут расположены состояния вашего приложения. А стрелочками будут обозначены транзакции переходов между состояними приложения, под [транзакцией](http://en.wikipedia.org/wiki/Transaction_processing) подразумеваются последовательности операций для перехода в следующее состояние приложения.

> Следует заметить, что на данный момент для обеспечения [Atomicity](http://en.wikipedia.org/wiki/Transaction_processing#Atomicity) в последовательности операций отсутствует механизм rollback'a. Откат обеспечивается отсутствием сохранения состояния в течении выполнения логической цепочки. Но в дальнейшем мы планируем обеспечить дополнительное API для rollback'a для каждой операции в транзакции.

То есть каждое состояние программы как правило описыватся следующими тремя составляющими: именем состояния (для удобства), последовательностью операций для перехода в данное состояние (транзакцией) и параметрами запуска транзакции.

К примеру описание `flow` для перехода в состояние отображения экрана с деталями, может быть следующим:

```javascript
// один из возможных способов описания middleware
function showUserScreen(data, chain) {
	chain.switchTo('permission_screen', param);
}

// описываем простейшую транзакцию перехода свозможностью остановки и перехода в другой стейт
flow.to('details_screen')
    .process(checkUserRole)
    .error(showUserScreen)
    .process(showDetails)
    .described();
    
// когда необходимо перейти в состояние 'details_screen', выполняем:
flow.switchTo('details_screen', params);

// или вслучае если необходимо внутри middleware остановить текущую транзакцию и стартовать новую, то:
chain.switchTo('permission_screen', param);
```
> `checkAuthorization`, `showLogin`, `showDetails` и `showDetails` являются по сути вызовом **middleware**. И могут быть реализованы любым образом (см. [midleware API](##midleware API)).

##Advantages
- структура приложения описывается с помощью транзакций переходов между состояниями приложения. Каждая транзакция состоит из операций. Каждая операция реализуются вызовом **middleware**
- транзакция может быть прервана и перенправлена. То есть в отличии от стандартных подходов для описания последовательностей операций существует три возможности окончания каждой операции `next`, `error` и `switchTo`. Это позволяет легко описывать структуру приложения с возможностью маршрутизации. 
- возможность назначения контекста выполнения для **middleware**.

##API



##Example
Приведем пример описания транзитного флоу:

```javascript
var checkAuthorization = function (params, chain) {
    // ...
    if (isNotAuthorized) {
        chain.switchTo('login', {
            state: chain.getСurrentState(),
            param: params
        })
    } else {
        chain.next(params);
    }
};

var showRequredScreen = function (params, chain) {
    if (params) {
        chain.switchTo(params.state, params.param)
    } else {
        chain.next();
    }
};

// flow.to('login')
    .process(showLoginScreen)
    .process(tryAuthorizate)
    .error(authorizationError)
    .process(showRequredScreen)
    .described('home');
    
// describe flow for 'user' state
flow.to('user')
    .process(checkAuthorization)
    .process(showLoader)
    .process(getUserDataFromServer)
    .error(errorHandler)
    .process(showUserScreen)
    .after(hideLoader)
    .described();

// swith to 'user' state with id=123    
flow.switchTo('user', {id: 123})
```
Когда мы пытаемся перейти в состояние `user` первой операцией у нас зарегистрирована `checkAuthorization` и в случае если пользователь не зарегистрирован, мы сохраняем наш стейт и параметры входа на него в качестве параметров для перехода на состояние `login`, выполняем все операции для логина и востанавливаем переход на состояние `user` со старыми параметрами.
> Стоит обратить внимание на то что во время описания **middleware** для login `flow` транзитные параметры вам прийдтся пробрасывать через все операции вручную.

##Roadmap
- rollback API for **middleware**
- возможность для `process` и `do` задание нескольких паралельных операций
- возможность использовать routing url в качестве имени стейта (для фронтенда и node.js), автоматическая передача параметров url в качестве параметров транзакции. Например `sequencer.pipe('/users/:id/)` запустит транзакцию перехода в это состояние с `id` в качестве параметра транзакции
- вложеные стейты, состояния описываемые через `state.substate`.

```javascript
// root state
var userFlow = flow.to('/users/:id/)
    .process(checkAuthorization)
    .error(showLogin)
    .process(showUserScreen)
    .described();

// substate 
userFlow.to('/purchase/:id')
    //...
    .described();

// other substate 
userFlow.to('/history')
    //...
    .described();
```