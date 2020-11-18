import axios from 'axios'

let service
service = axios.create({
    baseURL: process.env.BASE_URL,
    timeout: 20000
})

export default service
