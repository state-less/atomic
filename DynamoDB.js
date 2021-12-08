const UpdateExpression = (key, operator, delta, index = null) => {
    let UpdateExpression;
    let attributeNameKey = '#key'
    let attributeNameIndex = '#index'
    let attributeValueDelta = ':delta';
    let indexName = index == null ? '' : index; //String.fromCharCode(65 + (index % 25))

    if (delta == 0) return null;

    if (index !== null) {
        console.log("Updating array value")
        UpdateExpression = `${attributeNameKey}.${attributeNameIndex}${indexName} = ${attributeNameKey}.${attributeNameIndex}${indexName} ${operator} ${attributeValueDelta}${indexName}`;
    } else {
        UpdateExpression = `${attributeNameKey} = ${attributeNameKey} ${operator} ${attributeValueDelta}`;
    }

    const expr = ({
        UpdateExpression,
        ExpressionAttributeValues: {
            [`${attributeValueDelta}${indexName}`]: delta,
        },
        ExpressionAttributeNames: {
            [`${attributeNameKey}`]: key,
            [`${attributeNameIndex}${indexName}`]: index
        },
        ReturnValues: "UPDATED_NEW"
    })

    if (!index)
        delete expr.ExpressionAttributeNames[`${attributeNameIndex}${indexName}`];

    return expr;
}

const getArgsFromTree = (tree) => {
    const { value: operator, left: { value: lval }, right: { value: rval } } = tree;

    /**
     * If the LHS in the AST contains a '-' operator we'll treat it as negative number and take it's lhs value
     */
    if (tree.left.value === '-')
        lval = - tree.left.left.value;

    const key = [lval, rval].find((v) => v != +v);
    const delta = [lval, rval].find((v) => v == +v);

    return [key, operator, delta];
}
const compile = (trees) => {
    if (!Array.isArray(trees)) {
        const [key, operator, delta] = getArgsFromTree(trees);
        const expr = UpdateExpression(key, operator, +delta);
        expr.UpdateExpression = 'SET ' + expr.UpdateExpression.slice(0);
        return expr;
    }

    const expression = trees.reduce((acc, tree, i) => {
        const [key, operator, delta] = getArgsFromTree(tree);

        const cur = UpdateExpression(key, operator, +delta, i.toString());

        if (cur === null) return acc;

        acc.UpdateExpression = acc.UpdateExpression + cur.UpdateExpression + ', ';
        acc.ExpressionAttributeValues = {
            ...acc.ExpressionAttributeValues,
            ...cur.ExpressionAttributeValues
        }
        acc.ExpressionAttributeNames = {
            ...acc.ExpressionAttributeNames,
            ...cur.ExpressionAttributeNames
        }
        return acc;
    }, { UpdateExpression: '' })
    expression.UpdateExpression = 'SET ' + expression.UpdateExpression.slice(0, -2)
    return expression
}

module.exports = {
    compile
}