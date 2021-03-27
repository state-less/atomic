const nerdamer = require('nerdamer');
require('nerdamer/Solve');

// console.log (nerdamer, "x is ")

const atomic = (expr) => { 
    //'votes=ans+x'
    var eq = nerdamer(expr);
    const tree = nerdamer.tree(eq);
    
    if (tree.value !== '=') {
        throw new Error(`Please pass an equation in the form '{variable}=ans+x'`);
    }

    console.log(`Generating atomic expression ${expr}`)
    const key = tree.left.value;

    if (key === 'votes') {
        throw new Error('?')
        process.exit(0);
    }
    console.log(`Lefthandside is ${key}`)
    
    const forX = eq.solveFor('x').toString()
    console.log(`Solved for X is ${forX}`)

    const forKey = eq.solveFor(key).toString()
    console.log(`Solved for KEY is ${forKey}`)

    return (last, value, sub) => {
        console.log(`Solving EQ for values ${JSON.stringify({ans: last, value, forX})}`)



        if (sub) {
            for (const key in sub) {
                console.log (`SUbstituting key ${key} ${sub[key]}`)
                forX.sub(key, sub[key]);
            }
        }

        if ('number' != typeof value) {
            throw new Error(`Unsupported type '${typeof value}' for  value ${value}. Only primitive values are supported.`)
        }

        var x = nerdamer(forX, {ans: last, value}).evaluate();
        console.log(`Solving EQ for x ${last} ${value} ${forX} is ${x}`)

        var updateEq;
        if (x == 0) 
            updateEq = nerdamer(forKey).evaluate().toString().replace('x', '0').replace('ans', key);
        else
            updateEq = nerdamer(forKey, {x}).evaluate().toString().replace('ans', key);

        console.log(`Solving EQ for values ${last} ${value} ${forKey} is ${updateEq}`)

        return nerdamer.tree(updateEq)
    }
}

const compile = (tree, fn) => {
    return fn(tree);
}

module.exports = ({
    compile,
    atomic
});


// var votes1 = nerdamer(r, {ans: 19, votes: 23}).evaluate();


// console.log(r.toString(), n.toString());
