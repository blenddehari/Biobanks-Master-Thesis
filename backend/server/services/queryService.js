const contentDao = require('../dao/content-dao')
const helperFunctions = require('../helper/helper-functions')
const chalk = require('chalk');


class QueryService {
    async getData(data) {
        // TODO: uncomment this when the DB is ready
        try {
            const res = await contentDao.getData(data)
            let filteredResult = []
            if (res) {
                for (let arr of res) {
                    console.log(arr)
                    // TODO: group by collection ID if u dont group by in the db query already
                    let percentages = []
                    // on this array we will push he matching percentages for multiple matching LOINC codes
                    let goodHits = []
                    for (let el of arr) {
                        for (let frontendRow of el.frontendQuery) {
                            // find biggest and smallest number from front end query loinc values and db row values for that loinc code
                            const maxNumber = Math.max(frontendRow.fromValue, frontendRow.toValue, el[`${frontendRow.loincCode}_from`], el[`${frontendRow.loincCode}_to`])
                            const minNumber = Math.min(frontendRow.fromValue, frontendRow.toValue, el[`${frontendRow.loincCode}_from`], el[`${frontendRow.loincCode}_to`])
                            console.log(maxNumber)
                            console.log(minNumber)

                            // find the other two numbers that are in between the range of min and max numbers
                            let arrayOfFour = [frontendRow.fromValue, frontendRow.toValue, el[`${frontendRow.loincCode}_from`], el[`${frontendRow.loincCode}_to`]]
                            console.log(arrayOfFour)
                            let otherTwoNumbers = arrayOfFour.filter(nr => nr != maxNumber && nr != minNumber)
                            console.log(otherTwoNumbers)

                            const minNumberInsideRange = Math.min(...otherTwoNumbers)
                            const maxNumberInsideRange = Math.max(...otherTwoNumbers)

                            // find good values (matching values) - insideDistance
                            let goodValues = maxNumberInsideRange - minNumberInsideRange
                            // if we have only one matching number inside the range then when we substract that number by itself the distance will be 0, but this needs to map to 1 because there is only that number that matches in the range
                            goodValues = goodValues > 0 ? goodValues : 1
                            // find all values (min to max) - outsideDistance
                            const allValues = maxNumber - minNumber
                            console.log(goodValues, allValues)
                            // find ratio between good values vs all values
                            const distanceRatio = goodValues / allValues
                            console.log(distanceRatio)
                            const revisedNumberOfRows = distanceRatio * el.number_of_rows
                            console.log(revisedNumberOfRows)

                            // find the percentage of matching values (good values) -> this means that the percentage of good values in the number of rows returned is that much
                            let goodValuesInPercentage = revisedNumberOfRows / el.number_of_rows * 100
                            // take only the first two values after the decimal point
                            goodValuesInPercentage = parseFloat(goodValuesInPercentage).toFixed(2)

                            console.log(goodValuesInPercentage)
                            percentages.push(goodValuesInPercentage)
                            // THIS WORKS FOR WHEN WE ONLY SEARCH WITH ONE LOINC CODE AND HAVE MATCHING RESULTS, BUT NOT IF WE SEARCH WITH MULTIPLE LOINCS AND GET MULTIPLE MATCHING RESULTS FOR THOSE LOINCS -> HOW TO HANDLE THIS??
                            el['revisedNumberOfRows'] = revisedNumberOfRows
                            el['goodValuesInPercentage'] = goodValuesInPercentage

                            // for multiple LOINC codes we need to send the goodValuesInPercentage as an array of objects with the LOINC code as a key and the matching percentage for that LOINC code, for all matching LOINC codes
                            // goodHits.push({el[`${frontendRow.loincCode}`]: goodValuesInPercentage})
                            // maybe try smth like this: options.unshift({"new": { }})

                            // el['goodValuesInPercentage'] = {
                            //     "el[`${frontendRow.loincCode}`]": goodValuesInPercentage
                            // }
                            // console.log(arr)
                        }
                        filteredResult.push({
                            biobankId: el.biobank_id,
                            collectionId: el.collection_id,
                            definitionId: el.definition_id,
                            numberOfRows: el.number_of_rows,
                            revisedNumberOfRows: el.revisedNumberOfRows,
                            goodValuesInPercentage: el.goodValuesInPercentage
                            // goodValuesInPercentage: goodHits
                        })
                    }
                    // matching percentages for every loinc code from the frontend (exL two loincs from frontend both match rows in db with two loincs -> one good percentage for each loinc matched = two percentages for element. HOW TO HANDLE THIS?)
                    console.log(percentages)
                    

                }
                //sort by number of rows desc
                filteredResult.sort((a, b) => parseFloat(b.numberOfRows) - parseFloat(a.numberOfRows));

                return filteredResult
            } 
            else throw 'There is no data containing that LOINC code!'
        }
        catch (e) {
            console.error("Data could not be retrieved!")
            throw new Error("There is no data containing that LOINC code!") 
        }
        // let dumbData = [
        //     {
        //         indexId: 'index_1',
        //         indexName: 'Cancer Index',
        //         collectionId: 'collection_1',
        //         collectionName: 'Biobank Collection 1',
        //         possibleHits: '17'
        //     },
        //     {
        //         indexId: 'index_2',
        //         indexName: 'Cancer Index',
        //         collectionId: 'collection_2',
        //         collectionName: 'Biobank Collection 2',
        //         possibleHits: '15'
        //     },
        //     {
        //         indexId: 'index_3',
        //         indexName: 'Cancer Index',
        //         collectionId: 'collection_3',
        //         collectionName: 'Biobank Collection 3',
        //         possibleHits: '9'
        //     }
        // ]
        // return dumbData
    }

    async saveData() {
        try {
            const data = await helperFunctions.simulatePatrickSendingData()
            const res = await contentDao.saveData(data)
            if (res?.status === 'Collection_OK') {
                console.log(chalk.green("Collection was created and populated successfully!"))
            }
            else if (res?.status === 'Definition_new_OK') {
                console.log(chalk.green("Definition was created and populated successfully!"))
            }
            else if (res?.status === 'Definition_existing_OK') {
                console.log(chalk.green("Definition was updated successfully!"))
            }
            else if (res?.status === 'Collection_BAD') {
                console.log(chalk.red(" Something went wrong! Collection could NOT be created!"))
            }
            else if (res?.status === 'Definition_new_BAD') {
                console.log(chalk.red("Something went wrong! Definition could NOT be created!"))
            }
            else {
                console.log(chalk.red("Something went wrong! Definition could NOT be updated!"))
            }
        }
        catch (e) {
            console.error(e)
        }
    }

    async getLoincs() {
        const res = await contentDao.getLoincs()
        console.log(res)
        return res
    }

    async getLoinc(loincCode) {
        try {
            const res = await contentDao.getLoinc(loincCode)
            console.log(res)
            return res
        }
        catch (error) {
            console.error('Service: LOINC code does not exist!')
            throw new Error('Service: LOINC code does not exist!')
        }
    }
}
let queryService = new QueryService()

module.exports = queryService