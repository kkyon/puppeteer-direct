const puppeteer = require('puppeteer')
import {expect} from 'chai'
import {directJSHandle, getWindowHandle} from '../src/index'


describe('puppeteer-handle', () => {
    before(async () => {
        this.browser = await puppeteer.launch()
        this.page = await this.browser.newPage()
        this.page.on('console', ({type, text}) => console[type](text))
    })

    after(async() => await this.browser.close())

    const ev = func => directJSHandle(this.page.evaluateHandle(func))

    it('should seamlessly evaluate into browser-side objects', async() => {
        const handle = await this.page.evaluateHandle(() => ({a: {b: () => 1}}))
        const pHandle = directJSHandle(handle)
        expect(await pHandle.a.b()).to.equal(1)
    })

    it('should enable thisArg', async() => {
        const handle = ev(() => ({a: {val: 2, b: function() { return this.val; }}}))
        expect(await handle.a.b()).to.equal(2)
    })

    it('should enable arguments', async() => {
        const handle = ev(() => ({add: (a, b) => a + b}))
        expect(await handle.add(1, 4)).to.equal(5)
    })


    it('should enable async functions', async() => {
        const handle = ev(() => ({later: () => Promise.resolve(4)}))
        expect(await handle.later()).to.equal(4)
    })

    it('shoult evaluate strings', async() => {
        const handle = ev(() => ({str: '123'}))

        expect(await handle.str).to.equal('123')
    })

    it('shoult evaluate numbers', async() => {
        const handle = ev(() => ({num: 789}))
        expect(await handle.num).to.equal(789)
    })

    it('shoult evaluate objects', async() => {
        const handle = ev(() => ({a: {b: 'something'}}))
        expect(await handle.a).to.deep.equal({b: 'something'})
    })

    it('should allow for a "then" property', async() => {
        const handle = ev(() => ({then: 9}))
        expect(await handle.then).to.equal(9)
    })


    it('should allow functions in main object', async() => {
        const handle = ev(() => ({a: () => 12}))
        expect(await handle.a()).to.equal(12)
    })

    it('should work with a promise', async() => {
        const handle = ev(() => ({a: () => 32}))
        expect(await handle.a()).to.equal(32)
    })

    it('should work with window', async() => {
        const window =ev(() => window)
        expect(await window.document.body.tagName).to.equal('BODY')
    })

    it('should evaluate on window', async() => {
        expect(await getWindowHandle(this.page).document.body.tagName).to.equal('BODY')
    })

    it('should allow a callback', async() => {
        const handle = ev(() => ({callback: cb => cb('yes')}))
        const value = await new Promise(resolve => handle.callback(resolve))
        expect(value).to.equal('yes')
    })

    it('should allow a callback in any arg', async() => {
        const handle = ev(() => ({add: (num, cb) => cb(num + 1)}))
        const value = await new Promise(resolve => handle.add(1, resolve))
        expect(value).to.equal(2)
    })

    it('should work on the main handle', async() => {
        const value = await ev(() => 'root')
        expect(value).to.equal('root')
    })
})