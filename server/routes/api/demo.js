const express = require('express')
const mongodb = require('mongodb')

const router = express.Router()

//Get datasets
router.get('/datasets', async (req, res) => {
    const datasets = await loadDatasetCollection()
    res.send(await datasets.find({}).toArray())
})

//Post dataset
router.post('/datasets', async (req,res) => {
    const datasets = await loadDatasetCollection()
    await datasets.insertOne(req.body)
    console.log(req.body)
    res.status(201).send()
})

//Delete dataset
router.delete('/datasets/:id', async (req,res) => {
    const datasets = await loadDatasetCollection()
    await datasets.deleteOne({_id: new mongodb.ObjectID(req.params.id)})
    res.status(200).send()
})

//Rank datasets
router.get('/datasets/ranked', async (req, res) => {
    res.send(await rankDatasets('dataAccuracy'))
})

async function rankDatasets(method) {
    const datasets = await loadDatasetCollection()
    const data = await datasets.find({}).toArray()
    // for (var dataset of data) {
        const dataset1 = data[0].dataset1
        const dataset2 = data[1].dataset2
        // console.log(dataset1)

        //IF YOU WANT TO CALCULATE THE AVG RANGE
        // let ageFromvalues = dataset1.map(val => val.ageFrom)
        // const sumFromValues = ageFromvalues.reduce((a,b) => a + b, 0) 
        // const avgFromValues = (sumFromValues / ageFromvalues.length) || 0

        // let ageToValues = dataset1.map(val => val.ageTo)
        // const sumToValues = ageToValues.reduce((a,b) => a + b, 0) 
        // const avgToValues = (sumToValues / ageToValues.length) || 0
        // console.log(avgFromValues)
        // console.log(avgToValues)
        // avgRange = avgToValues - avgFromValues

        //simple way (only check the first value for range) - assumes all values have the same range
        let fromValues1 = dataset1.map(val => val.ageFrom)
        let toValues1 = dataset1.map(val => val.ageTo)
        const dataset1Range = toValues1[0] - fromValues1[0]
        
        let fromValues2 = dataset2.map(val => val.ageFrom)
        let toValues2 = dataset2.map(val => val.ageTo)
        const dataset2Range = toValues2[0] - fromValues2[0]
        
        //check null values
        let nullRecords1 = dataset1.filter(val => val.ageFrom === null || val.ageTo === null) 
        let nullRecords2 = dataset2.filter(val => val.ageFrom === null || val.ageTo === null) 

        let nullValues1 = 0
        let nullValues2 = 0
        for(var el of nullRecords1) {
            if (el.ageFrom === null) nullValues1 += 1
            if (el.ageTo === null) nullValues1 +=1
        }
        for(var el of nullRecords2) {
            if (el.ageFrom === null) nullValues2 += 1
            if (el.ageTo === null) nullValues2 +=1
        }

        //this should come from the request(frontend)
        method='dataCompleteness'
        let reasonForRanking

        let returnRankedObject = {}
        if (method == 'dataCompleteness') {
            //if 2nd dataset has more null values - rank 2nd
            if (nullValues2 > nullValues1) {
                returnRankedObject = {
                    //set the name of the dataset
                    1: Object.keys(data[0])[1],
                    2: Object.keys(data[1])[1]
                }
                reasonForRanking = `${Object.keys(data[0])[1]} has ${nullValues1} null values, whereas ${Object.keys(data[1])[1]} has ${nullValues2} null values.`
            }
            //if the 2nd dataset has less null values - rank 1st
            else if (nullValues2 < nullValues1) {
                returnRankedObject = {
                    //set the name of the dataset
                    1: Object.keys(data[1])[1],
                    2: Object.keys(data[0])[1]
                }
                reasonForRanking = `${Object.keys(data[1])[1]} has ${nullValues2} null values, whereas ${Object.keys(data[0])[1]} has ${nullValues1} null values.`
            }
        }

        else if (method == 'dataAccuracy') {
            //if the 2nd dataset has a smaller range - rank 1st
            if (dataset2Range < dataset1Range) {
                returnRankedObject = {
                    //set the name of the dataset
                    1: Object.keys(data[1])[1],
                    2: Object.keys(data[0])[1]
                }
                reasonForRanking = `${Object.keys(data[1])[1]} has range of ${dataset2Range}, whereas ${Object.keys(data[0])[1]} has range of ${dataset1Range}.`
            }
            //if the 2nd dataset has a bigger range - rank 2nd
            else if (dataset2Range > dataset1Range) {
                returnRankedObject = {
                    //set the name of the dataset
                    1: Object.keys(data[0])[1],
                    2: Object.keys(data[1])[1]
                }
                reasonForRanking = `${Object.keys(data[0])[1]} has range of ${dataset1Range}, whereas ${Object.keys(data[1])[1]} has range of ${dataset2Range}.`
            }
        }

        return {
            ranking: returnRankedObject,
            reason: reasonForRanking
        }

        

        // nullToValues1 = dataset1.filter(val => val.ageTo === null) 
        // nullToValues2 = dataset2.filter(val => val.ageTo === null) 

        // sumNullValues1 = nullFromValues1 + nullToValues1 * 1
        // sumNullValues2 = nullFromValues2 + nullToValues2 * 1


        // if(dataset1) {
        //     for (var rec of [dataset1]) {  
        //         if(rec.rec1) {
        //             let ageRange = rec.rec1.ageTo - rec.rec1.ageFrom
        //             console.log(ageRange)
        //         }
        //         console.log(rec)
        //     }
        //     // console.log(dataset1[0])
        // }
        // for (var rec of dataset1) {
        //     console.log(rec)
        // }
    // }
}

async function loadDatasetCollection() {
    const client = await mongodb.MongoClient.connect('mongodb+srv://blend:skull111@cluster0.jch98.mongodb.net/Cluster0?retryWrites=true&w=majority',
    {useNewUrlParser: true })

    return client.db('Cluster0').collection('datasets')
}

module.exports = router  