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

                    for (let el of arr) {
                        filteredResult.push({
                            biobankId: el.biobank_id,
                            collectionId: el.collection_id,
                            definitionId: el.definition_id,
                            numberOfRows: el.number_of_rows
                        })
                    }
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