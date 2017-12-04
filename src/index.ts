import {JSHandle} from 'puppeteer'

const privates : WeakMap<Function, {
    context: Promise<JSHandle>
    next: Promise<JSHandle>
}> = new WeakMap()

function create(next : Promise<JSHandle>, context: Promise<JSHandle> = Promise.resolve(null)) {
    const fakeFunction = new Function
    privates.set(fakeFunction, {context, next})
    return fakeFunction
}

const handler : ProxyHandler<Function> = {
    get: (target : Function, prop: string) =>
        ((next : Promise<JSHandle>) => 
            new Proxy(create(next.then((handle : JSHandle) => handle.getProperty(prop)), next), handler))
            (privates.get(target).next),

    apply: async (target : Function, thisArg : any, args?: any) => {
        const {next, context} = privates.get(target)
        const handle = await next
        return handle.executionContext().evaluate((fn, thisArg, args) => fn.apply(thisArg, args), handle, await context, args)
    }
}

export function createHandle(handle: JSHandle) : any {
    return new Proxy(create(Promise.resolve(handle)), handler)
}