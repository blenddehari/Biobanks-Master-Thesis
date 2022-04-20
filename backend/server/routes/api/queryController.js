const express = require('express')
const queryService = require('../../services/queryService')

const router = express.Router()

//Get data (collections and definitions)
router.post('/data', async (req, res) => {
    try{
        const data = req.body
        console.log(data)
        const datasets = await queryService.getData(data)
        if (datasets.length > 0) {
            res.send(datasets)
        }
        else throw new Error('No data was found for your search!')
    }
    catch(e) {
        console.error('Data could not be retrieved!')
        res.status(404).json({error: e.message})
        // throw 'Data could not be retrieved!'
    }
})

//Save data (collections and definitions)
router.post('/saveData', async (req, res) => {
    try {
        const res = queryService.saveData()
        // const data = req.anonymizations
        console.log(res)
        // const datasets = await queryService.saveData(data)
    }
    catch(e) {
        console.error(e)
    }
})

router.get('/loincs', async (req, res) => {
    try {
        const loincs = await queryService.getLoincs()
        if (loincs) {
            res.send(loincs)
        }
    }
    catch (e) {
        console.error('LOINC codes could not be retrieved!')
        throw 'LOINC codes could not be retrieved!'
    }
})

router.get('/loinc', async (req, res) => {
    try {
        const loincCode = await queryService.getLoinc(req.query.code)
        if (loincCode.length > 0) {
            // console.log(loincCode)
            res.send(loincCode)
        }
        else throw new Error('LOINC code does not exist!')
    }
    catch (e) {
       console.error('Controller: LOINC code does not exist!')
        res.status(404).json({error: e.message})
        throw 'Controller: LOINC code does not exist!'
    }
})

// async function getData() {
//     let data = [
//         {
//             indexId: 'index_1',
//             indexName: 'Cancer Index',
//             collectionId: 'collection_1',
//             collectionName: 'Biobank Collection 1',
//             possibleHits: '17'
//         },
//         {
//             indexId: 'index_2',
//             indexName: 'Cancer Index',
//             collectionId: 'collection_2',
//             collectionName: 'Biobank Collection 2',
//             possibleHits: '15'
//         },
//         {
//             indexId: 'index_3',
//             indexName: 'Cancer Index',
//             collectionId: 'collection_3',
//             collectionName: 'Biobank Collection 3',
//             possibleHits: '9'
//         }
//     ]
//     return data
// }

module.exports = router  