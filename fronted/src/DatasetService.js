import axios from 'axios'

const url = 'http://localhost:5000/api/datasets/ranked/'

export default class DatasetService {
    //Get datasets
    static async getRankedDatasets() {
        try {
            const res =  await axios.get(url)
            const data = res.data
            console.log(data)
            return data
        } catch (err) {
            console.error()
        }
    }

    //Create dataset
    // static async createDataset() {
    //     const res = await axios.post(url, {

    //     })
    // }
    //Delete dataset
}