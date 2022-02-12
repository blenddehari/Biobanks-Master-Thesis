var _ = require('lodash');
const dataSample = require('../helper/dataStructureSample.json')


class HelperFunctions {

    addToObject (obj, key, value, index) {

        // Create a temp object and index variable
        var temp = {};
        var i = 0;
    
        // Loop through the original object
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
    
                // If the indexes match, add the new item
                if (i === index && key && value) {
                    temp[key] = value;
                }
    
                // Add the current item in the loop to the temp obj
                temp[prop] = obj[prop];
    
                // Increase the count
                i++;
    
            }
        }
    
        // If no index, add to the end
        if (!index && key && value) {
            temp[key] = value;
        }
    
        return temp;
    
    };

    isNumeric(num) {
        return !isNaN(num)
    };

    simulatePatrickSendingData() {
        let fullCollection = dataSample.anonymizations[0]
        let definitionExample1 = dataSample.anonymizations[1]
        let definitionExample2 = dataSample.anonymizations[2]
        console.log(fullCollection)

        let res = this.parseData(definitionExample1)

        return res
    };

    parseData(data) {
        console.log('parseData', data)

        for (let el of data.columns) {
            //we add these as that's how the column names in the DB tables will be
            let codeFrom = el.code + "_from"
            let codeTo = el.code + "_to"
            el['codeFrom'] = codeFrom
            el['codeTo'] = codeTo
        }
        
        console.log(data.columns)

        let finalCleanedValues = []
        for (let row of data.data) {
            let cleanedRow = row.row.replace(/(\r\n|\n|\r)/gm, "")
            let loincValuesForColumn = cleanedRow.split(";")
            console.log(loincValuesForColumn)

            var cleanedValues = loincValuesForColumn.map((str) => {
                let val = str.split(':')
                return {fromValue: val[0], toValue: val[1]}
              })
              //from-to values for all loin values for every loinc code by order
              console.log(cleanedValues)

            //   cleanedValues = this.addToObject(cleanedValues, 'position', cleanedValues.indexOf(""))

              let position = 1
              for (let val of cleanedValues) {
            //       console.log(data.columns)
            //       for (let column of data.columns) {
            //         el['codeFrom'] = column.codeFrom
            //       }

                //   el['loincFrom'] = data.columns.map(column => column.codeFrom)
                //   el['loincTo'] = data.columns.map(column => column.codeTo)

                let codesFrom = data.columns.map(column => column.codeFrom)
                let codesTo = data.columns.map(column => column.codeTo)
                
                val['numberOfRows'] = row.rowAmount
                val['position'] = position
                position += 1
                  console.log(cleanedValues)
                }
                finalCleanedValues.push(cleanedValues)
            }
            // for (let el of loincValuesForColumn) {
            //     let cleanedRow = el.split(":")
            //     console.log(cleanedRow)
            // }
            // loincValuesForColumn.map(el => {fromValue: el.split(":")[0]})
        
            // merge the data and columns arrays based on the position
            let mergedColumnsAndData = []
            for (let arr of finalCleanedValues) {
                var mergedList = _.map(arr, function(item){
                    return _.extend(item, _.find(data.columns, { position: item.position }))
                })
                mergedColumnsAndData.push(mergedList)
            }

            console.log(mergedColumnsAndData)
            
            // replace fromValue and toValue keys with the actual loincFrom and loincTo keys that come from the columns

            // for (let arr of mergedColumnsAndData) {
            //     for (let obj of arr) {
            //         let final = Object.entries(obj).reduce((op, [key,value]) => {
            //             let newKey = obj[key]
            //             op[newKey || key ] = value
            //             return op
            //         },{})

            //     }
            // }

            // for (let arr of mergedColumnsAndData) {
            // let newArrayOfObj = arr.map(item => {
            //     let test = item['codeFrom']
            //     return {
            //       test: item.fromValue,
            //       key2: item.key2
            //     };
            //   });
            // }
              
            //   console.log(newArrayOfObj);

        let filteredObject = {
            anonymizationType: data.anonymizationTyp,
            biobank_id: data.biobankUid,
            collection_id: data.collectionUid,
            definition_id: data.definitionUid,
            name: data.name,
            columns: data.columns,
            codesFrom: data.columns.map(el => el.codeFrom),
            codesTo: data.columns.map(el => el.codeTo),
            mergedColumnsAndData: mergedColumnsAndData
        }

        console.log(filteredObject)

        return filteredObject
    };

}

let helperFunctions = new HelperFunctions()

module.exports = helperFunctions
