import {JSHandle} from 'puppeteer'
type FutureHandle = Promise<JSHandle>
type PuppeteerHandleWrapper = Function

class Privates {
    prop: string
    context: FutureHandle
    next: FutureHandle
}

const privates = new WeakMap<PuppeteerHandleWrapper, Privates>()

function create(prop: string, next : FutureHandle, context: FutureHandle = Promise.resolve(null)) {
    const fakeFunction : PuppeteerHandleWrapper = () => {}
    privates.set(fakeFunction, {prop, context, next})
    return fakeFunction
}

const handler : ProxyHandler<PuppeteerHandleWrapper> = {
    get(target : Function, prop: string) {
        const next = privates.get(target).next
        return new Proxy(create(prop, next.then((handle : JSHandle) => handle.getProperty(prop)), next), handler)
    },

    apply: async (target: PuppeteerHandleWrapper, thisArg : any, args?: any) => {
        const {next, context, prop} = privates.get(target)
        const handle = await next
        const parentHandle = await context

        const firstArg = args[0]
        const isFunction = a => typeof a === 'function'
        const execContext = handle.executionContext()
        const evaluate = execContext.evaluate.bind(execContext)

        const indexOfCallback = Array.prototype.findIndex.call(args, isFunction)
        if (prop === 'then' && indexOfCallback === 0) {
            return args[0](await parentHandle.jsonValue())
        }

        if (indexOfCallback > -1) {
            return evaluate((fn, thisArg, args, indexOfCallback) => {
                return new Promise(resolve => {
                    args.splice(indexOfCallback, indexOfCallback + 1, resolve)
                    fn.apply(thisArg, args)
                })    
            }, handle, parentHandle, args, indexOfCallback).then(args[indexOfCallback])
        }

        return evaluate((fn, thisArg, args) => fn.apply(thisArg, args), handle, parentHandle, args)
    }
}

export function createHandle(handle: JSHandle) : any {
    return new Proxy(create(null, Promise.resolve(handle)), handler)
}