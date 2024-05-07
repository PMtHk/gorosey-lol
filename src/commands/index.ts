import { deregister } from './deregister'
import { guide } from './guide'
import { ping } from './ping'
import { register } from './register'
import { search } from './search'
import { watchList } from './watchList'

const commands = [ping, search, register, guide, deregister, watchList]

export default commands
