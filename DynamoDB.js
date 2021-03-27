const UpdateExpression = (key, operator, delta, index = null) => {
    let UpdateExpression;
    let attributeNameKey = '#key'
    let attributeNameIndex = '#index'
    let attributeValueDelta = ':delta';
    let indexName = index==null?'':index; //String.fromCharCode(65 + (index % 25))

    if (delta == 0) return null;

    if (index !== null) {
        console.log ("Updating array value")
        UpdateExpression = `${attributeNameKey}.${attributeNameIndex}${indexName} = ${attributeNameKey}.${attributeNameIndex}${indexName} ${operator} ${attributeValueDelta}${indexName}`;
    } else {
        UpdateExpression = `${attributeNameKey} = ${attributeNameKey} ${operator} ${attributeValueDelta}`;
    }

    return ({
        UpdateExpression,
        ExpressionAttributeValues:{
            [`${attributeValueDelta}${indexName}`]: delta,
        },
        ExpressionAttributeNames: {
            [`${attributeNameKey}`]:key,
            [`${attributeNameIndex}${indexName}`]:index
        },
        ReturnValues:"UPDATED_NEW"
    })
}

const getArgsFromTree = (tree) => {
    const {value: operator, left: {value: lval}, right: {value: rval}} = tree;
    const key = [lval, rval].find((v) => v != +v);
    const delta = [lval, rval].find((v) => v == +v);
    console.log(`Key: ${key} Val: ${delta} l: ${lval} r: ${rval}`)

    return [key, operator, delta];
}
const compile = (trees) => {
    if (!Array.isArray(trees)) {
        const [key, operator, delta] = getArgsFromTree(trees[0]);
        return 'SET ' + UpdateExpression(key, operator, +delta);
    }

    const expression = trees.reduce((acc, tree, i) => {
        const [key, operator, delta] = getArgsFromTree(tree);

        const cur = UpdateExpression(key, operator, +delta, i.toString());

        if (cur === null) return acc;
        
        acc.UpdateExpression = acc.UpdateExpression + cur.UpdateExpression +  ', ';
        acc.ExpressionAttributeValues = {
            ...acc.ExpressionAttributeValues,
            ...cur.ExpressionAttributeValues
        }
        acc.ExpressionAttributeNames = {
            ...acc.ExpressionAttributeNames,
            ...cur.ExpressionAttributeNames
        }
        return acc;
    }, {UpdateExpression: ''})
    expression.UpdateExpression = 'SET ' + expression.UpdateExpression.slice(0,-2)
    return expression
}

module.exports = {
    compile
}