///////////////////////////////////////////
// Listing 1 Beschreibung von Endpunkten //
///////////////////////////////////////////

const endpoints = {
  getPost: {
    url: "https://myapp.de/api/posts",
    method: "GET",
  },

  updateUser: {
    url: "https://myapp.de/api/users",
    method: "POST",
  },
}


///////////////////////////////////////
//Listing 2: Manuell erstellte Typen //
///////////////////////////////////////

type Endpoint = { url: string, method: "GET" | "POST" }

type MyEndPoints = {
  getPost: Endpoint,
  updateUser: Endpoint
};

// Fuer jeden Eintrag in MyEndPoints ist im Api-Objekt eine 
// Funktion definiert, die mit "use" anfaengt
type MyApi = {
  useGetPost: Function, 
  useUpdateUser: Function
}


/////////////////////////////////////////////
// Listing 3: Typerkennung fuer den Api-Typ //
/////////////////////////////////////////////

const endpoints = {
  getPost: {
    // wie gesehen
  },

  updateUser: {
    // wie gesehen
  }
}

type MyApi = Api<typeof endpoints>;
// MyApi entspricht diesem Typ:
// type MyApi = { getPost: Function; updateUser: Function }


//////////////////////////////////////////////////////
// Listing 4: Syntax fuer die bereinigten Zieltypen //
//////////////////////////////////////////////////////

type QueryFn<T> = T extends string ? `use${Capitalize<T>}Query` : never;

type Api<E extends object> = {
  [K in Extract<keyof E, string> as QueryFn<K>]: Function;
}


////////////////////////////////////////////////
// Listing 5: Funktionssignatur von createAPI //
////////////////////////////////////////////////

type Endpoint = {
  url: string;
  method: "GET" | "POST";
};
type EndpointConfig = Record<string, Endpoint>;

function createApi<E extends object>(endpoints: E): Api<E> {
// Implementierung ausgelassen
}


//////////////////////////////////////////////////////////
// Listing 6: Anwendungscode, der die Library verwendet //
//////////////////////////////////////////////////////////

// Anwendungscode
const api = createApi({
  getPost: {
    url: "https://myapp.de/api/posts",
    method: "GET",
  },

  updateUser: {
    url: "https://myapp.de/api/users",
    method: "POST",
  }
})
api.useGetPostQuery(); // OK
api.useUpdateUserQuery(); // OK
api.useRemoveUserQuery(); // ERR: Property 'useRemoveUserQuery' does not exist on type 'Api<...>'


////////////////////////////////
// Listing 7 Conditional Type //
////////////////////////////////

function getLength<S extends string | null>(s: S):S 
  extends string ? number : null {
  // Implementierung ausgelassen
}

const l = getLength("abc"); // l ist number
l.toFixed(); // OK, toFixed() ist Methode auf number
const n = getLength(null); // n ist null
n.toFixed(); // ERROR: Object is possibly 'null'


//////////////////////////////
// Listing 8 Action-Objekte //
//////////////////////////////

// Bibliothekscode:
// "Basis-Aktion" ohne Payload
type Action<AN = string> = { actionName: AN }

// Action mit Payload
type PayloadAction<PL, AN = string> = Action<AN> & {
  payload: PL;
};

// Anwendungscode:

// Payload einer fachlichen Action
type IncrementActionPayload = {
  value: number;
};

// Definition der Reducer-Funktionen
const reducers = {
  increment(action: PayloadAction<IncrementActionPayload>) {
    // fachliche Verarbeitung der "increment"-Action
  },
  reset() {
    // fachliche Verarbeitung der "reset"-Action 
    // (Action hat keinen Payload)
  },
};


// ActionCreator-Funktionen fuer die beiden Actions
const actionCreators = {
  createIncrementAction(payload: IncrementActionPayload) {
    return {
      actionName: "increment", payload
    } as const,
  reset() {
    return { actionName: "reset" } as const;
  }
}


///////////////////////////////////////////
// Listing 9 Umsetzung von createActions //
///////////////////////////////////////////

// Bibliothekscode
function createActions(reducers: Reducers) {
  // Implementierung ausgelassen
}

// Anwendungscode
const reducers = ...;// wie oben gesehen
const actionCreators = createActions(reducers)
// Verwendung der generierten ActoinCreator-Funktion
const incrementAction = actionCreators.increment(/* ... */);
const resetAction = actionCreators.reset(); 
const clearAction = actionCreators.clear();
// Fehler: clear gibt es nicht (keine Action im reducers-Objekt)


/////////////////////////////////////////////////////////////////
// Listing 10: Conditional Type zum Pruefen der ReducerFunction//
/////////////////////////////////////////////////////////////////

type GetActionFromReducerFunction<RF> = RF extends (
  arg: infer A
) => any
  ? A
  : unknown;

type IncrementAction = 
  GetActionFromReducerFunction<typeof reducers.increment>; 
  // PayloadAction<IncrementPayloadAction>

type ResetAction = 
  GetActionFromReducerFunction<typeof reducers.reset>;  
  // unknown


//////////////////////////////////////////////////////////////////////  
// Listing 11: Pruefen des Payloads fuer die ActionCreator-Funktion //
//////////////////////////////////////////////////////////////////////  

type GetPayloadFromAction<A> = 
  A extends { payload: infer PayloadType }
  ? PayloadType
  : never;

type IncrementAction = GetPayloadFromAction
    <GetActionFromReducerFunction<typeof reducers.increment>> // IncrementActionPayload
type ResetAction = GetPayloadFromAction
    <GetActionFromReducerFunction<typeof reducers.reset>> // never

///////////////////////////////////////////////////////
//Listing 12: Erzeugen einer ActionCreator-Funktion //
//////////////////////////////////////////////////////

// ActionCreator-Funktion fuer Actions mit Payload 

type ActionCreatorWithPayload <AN extends string, PL>
  = (pl: PL) => 
{ 
  actionName: AN; 
  payload: PL; 
};

// ActionCreator-Funktion fuer Actions ohne Payload

type ActionCreatorWithoutPayload<AN extends string> 
  = () => 
{ 
  actionName: AN 
};


function makeActionCreator<AN extends string, 
                          RF extends Function>(
  actionName: AN,
  reducerFunction: RF
): ActionCreatorWithPayload | 
  ActionCreatorWithoutPayload 
{
  // Implementierung ausgelassen
}

///////////////////////////////////////////////////////
// Listing 13: Vollstaendige ActionCreator-Umsetzung //
///////////////////////////////////////////////////////

type ActionCreator<AN extends string, PL> 
  =  [PL] extends [never] 
  ? ActionCreatorWithoutPayload<AN>
  : ActionCreatorWithPayload<AN, PL>;


function makeActionCreator
  <AN extends string, RF extends Function>(
  actionName: AN, reducerFunction: RF
): ActionCreator<
  AN,
  GetPayloadFromAction<GetActionFromReducerFunction<RF>>
> {
  // Implementierung ausgelassen
}

const incrementActionCreator = makeActionCreator(
  "increment", reducers.increment
);

const incrementAction = incrementActionCreator({
  value: 7,
});
incrementAction.actionName === "increment"; // OK
incrementAction.payload.value = 99; // OK
incrementAction.payload.value = ""; // ERROR Keine Zahl
incrementActionCreator({
  increaseBy: 7
}); // ERROR: Falscher Payload-Typ

const resetActionCreator = 
  makeActionCreator("reset", reducers.reset);
const resetAction = resetActionCreator();
resetAction.actionName === "reset"; // OK
resetAction.payload; // ERROR: kein Payload in reset-Action

/////////////////////////////////////
// Listing 14: Mapped Type Actions //
/////////////////////////////////////

type Reducers = Record<string, Function>;

type Actions<RS extends Reducers> = {
  [AN in keyof RS]: ActionCreatorFunction<
    AN extends string ? AN : never,
    GetPayloadFromHandlerFunction<RS[AN]>
  >;
};

function createActions<RS extends Reducers>(
  reducers: RS
): Actions<RS> {
  // verwendet makeActionCreator fuer jeden Reducer in RS
}

const actions = createActions(reducers);

const incrementAction = actions.increment({
  value: 7,
});
incrementAction.actionName === "increment"; // OK
