const axios = require('axios');

// https://thegraph.com/explorer/subgraphs/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV?view=Query&chain=arbitrum-one

const URL = " https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
let query = `
    {
        pools(
            orderBy: volumeUSD
            orderDirection: desc
            first:10
        ){
            id
            volumeUSD
            sqrtPrice
            feeTier
            liquidity
            totalValueLockedUSD
            token0Price
            token1Price
        
            txCount
            totalValueLockedToken0
            totalValueLockedToken1
        
            token0 {
                id
                symbol
                name
                decimals
            }
            token1 {
                id
                symbol
                name
                decimals
            }
        }
    }
`

axios.post(URL, {query: query})
    .then(
        (result)=>{
            console.log(result.data.data)
        }
    )