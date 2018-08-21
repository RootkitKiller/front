let Eos = require('eosjs');
const EosApi = require('eosjs-api');

let addr = 'api-kylin.eosasia.one';
let port = 443;
let proto = 'https'
let fulladdr = 'https://api-kylin.eosasia.one:443';
let chainid = '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191';

//测试网网络
const network = {
  blockchain:'eos',
  host:addr,
  port: port,
  protocol:proto,
  chainId:chainid
};
// eos
const options = {
    httpEndpoint: fulladdr, // default, null for cold-storage
    verbose: false, // API logging
    logger: { // Default logging functions
      log: console.log ,
      error:  console.error 
    },
    fetchConfiguration: {}
}
const eosApi = EosApi(options)


export function auth(){
    const scatter = window.scatter;
    const requiredFields = {
        accounts:[ { blockchain:'eos', chainId:chainid,
        host:addr,port:port } ]
    };
    return scatter.getIdentity(requiredFields);
}
export function getBanlance(){
    const scatter = window.scatter;
    const accountname = scatter.identity.accounts[0].name;
    return eosApi.getTableRows(true, "wafyarttoken", accountname, "accounts");
}
export function send(name, number){
    //认证身份
    const scatter = window.scatter;
    scatter.authenticate().then(signedOrigin => {
        console.log("身份认证通过");
        console.log(signedOrigin);
        //签署交易
    }).catch(failedAuthentication => {
        console.log("身份认证失败");
    })

  const account=scatter.identity.accounts[0];
  const eosOptions={
    logger: { // Default logging functions
      //log: console.log ,
      error:  console.error 
    },
    fetchConfiguration: {}
  };
  const eos = scatter.eos( network, Eos, eosOptions);

  return eos.contract('wafyarttoken').then(contract => {
      contract.transfer(account.name,name,number,"api test",{
        authorization:[{
          actor:account.name,
          permission:account.authority
        }],
        //broadcast:true,
        sign:true
      }).then(trx=>{
        console.log(trx);
      }).catch(e => {
          console.log("error", e);
      });
  }).catch(e => {console.log("error", e);});
}
// const scatter = window.scatter;