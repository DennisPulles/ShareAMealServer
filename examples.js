//reset
console.clear();
console.log("Tijd aanroep: " + Date.now());
let newSection = function(section){
    console.log(`\n=======================================================================\n${section}:\n`);
}

//variablen en console.log
newSection("Variablen en Console.log")

var a = 1;
let b = 1;
const c = 3;

console.log(a);
console.log(b);
console.log(c);
{
    console.log(a);
    a = a + 1;
    console.log(`De waarde van a = ${a}`);
}

//functie in variablen
newSection("Functies in variablen")

let print = function(param){
    console.log(param)
}

print("print");

//object
newSection("Object")

let myObject = {
    result: 12,
    other: "test 123",
    a: [
        23,
        "a",
        {
            name: 'Robin',
        },
        {
            test: 23,
        }
    ]
}
console.log(myObject);


//labdafunctie
newSection("Labda Functie");

() => {};

let labdaFunction = (param) => {
  console.log(`param = ${param}`);
};

labdaFunction(5);

//async
newSection("Async");

function doSomething(callback){
    setTimeout(() => {
        let result = 5;
        callback(result);
    }, 3000);
}

doSomething((myValue) => {
    console.log('myValue = ' + myValue);
});

console.log("Na de async in code, voor het result in console");