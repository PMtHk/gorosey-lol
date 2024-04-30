import { deregister } from './deregister'
import { ping } from './ping'
import { register } from './register'
import { search } from './search'
import { watchList } from './watchList'

const commands = [ping, search, watchList, register, deregister]

export default commands
