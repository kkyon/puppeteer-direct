import {JSHandle} from 'puppeteer'
type FutureHandle = Promise<JSHandle>
type PuppeteerHandleWrapper = Function

const privates = new WeakMap<PuppeteerHandleWrapper, {context: FutureHandle, next: FutureHandle}>()

function create(next : FutureHandle, context: FutureHandle = Promise.resolve(null)) {
    const fakeFunction : PuppeteerHandleWrapper = () => {}
    privates.set(fakeFunction, {context, next})
    return fakeFunction
}

const handler : ProxyHandler<PuppeteerHandleWrapper> = {
    get: (target : Function, prop: string) =>
        ((next : FutureHandle) => 
            new Proxy(create(next.then((handle : JSHandle) => handle.getProperty(prop)), next), handler))
            (privates.get(target).next),

    apply: async (target: PuppeteerHandleWrapper, thisArg : any, args?: any) => {
        const {next, context} = privates.get(target)
        const handle = await next
        return handle.executionContext().evaluate((fn, thisArg, args) => fn.apply(thisArg, args), handle, await context, args)
    }
}

export function createHandle(handle: JSHandle) : any {
    return new Proxy(create(Promise.resolve(handle)), handler)
}