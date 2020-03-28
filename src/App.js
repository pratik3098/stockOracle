import React from 'react';
import './App.css';
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Web3 from 'web3';
import {STOCK_ORACLE_ABI, STOCK_ORACLE_ADDRESS, STOCK_ORACLE_OWNER } from './quoteContract.js';
const port= 8545
const web3 = new Web3("http://localhost:"+port);

function App() {
  return (
    <div className="App">
     <div className="AppContent">
       <MyApp></MyApp>
     </div>
    </div>
  );
}

function MyApp(){
   const[symbol,setSymbol]= React.useState("")
   const[quote,setQuote]=React.useState({})
   const[price,setPrice]=React.useState(0)
   const[volume,setVolume]=React.useState(0)
   let accounts=[] 
   const stockOracle= new web3.eth.Contract(
    STOCK_ORACLE_ABI,
    STOCK_ORACLE_ADDRESS
  )
    
  React.useEffect(()=>{
    if(Boolean(quote) && Object.keys(quote).length!=0){
      contractInteraction()
      async function contractInteraction(){
        accounts=await web3.eth.getAccounts()
        STOCK_ORACLE_OWNER=accounts[0]
        console.log("Owner account:" + accounts[0])

       await stockOracle.methods.setStock( 
       web3.utils.fromAscii(symbol),
       Math.round(Number(quote["05. price"]) * 10000),
       Number(quote["06. volume"]) * 10000).send({from: STOCK_ORACLE_OWNER})
       stockOracle.methods.getStockPrice(web3.utils.fromAscii(symbol)).call({from: STOCK_ORACLE_OWNER}).then(price=>{
        setPrice(price)
       })
       stockOracle.methods.getStockVolume(web3.utils.fromAscii(symbol)).call({from: STOCK_ORACLE_OWNER}).then(volume=>{
        setVolume(volume)
       })
       
      }
    }
  },[quote,symbol])

   const onClickGetPrice=()=>{
    fetch('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + symbol +'&apikey=KEY')
    .then(res => res.json())
    .then((data) => {
      setQuote(data["Global Quote"])
    }).catch(err=>{
     console.error(err)
     setPrice(0)
     setVolume(0)
    })
  
  }

  return(
    <div>
    <Typography>Stock Oracle Contract Interaction</Typography>

    <Box m={3} />
    <Grid container direction="row" justify="center" alignItems="center">
      <Typography>Enter the stock symbol</Typography>
      <Box m={1} />
      <TextField  variant="outlined" label="Symbol" onChange={event => setSymbol(event.target.value)} ></TextField>
    </Grid>

    <Box m={3} />
    <Button variant="contained" onClick={onClickGetPrice} color="primary" disabled={!Boolean(symbol)} >
        Get the Stock Quote
    </Button>
    <Box m={3} />
      <div>
        <Typography>{`Price: ${price / 10000}`}</Typography>
        <Typography>{`Volume: ${volume / 10000}`}</Typography>
      </div>
  </div>
  )
}

export default App;
