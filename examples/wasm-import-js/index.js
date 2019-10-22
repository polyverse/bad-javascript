import { add, default as add10 } from 'https://rawcdn.githack.com/standard-things/esm/511d672ae13e8bee13ba19bd7fdc2a3206c9d7d7/test/fixture/wasm/add.wasm'
import { log } from 'console'

log(`${add(1,2)} and ${add10(2)}`)