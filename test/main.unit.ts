const puppeteer = require('puppeteer')
import {expect} from 'chai'
import {createDirectJSHandle} from '../src/index'


describe('puppeteer-handle', () => {
    before(async () => {
        this.browser = await puppeteer.launch()
        this.page = await this.browser.newPage()
        this.page.on('console', ({type, text}) => console[type](text))
    })

    after(async() => await this.browser.close())

    it('should seamlessly evaluate into browser-side objects', async() => {
        const handle = await this.page.evaluateHandle(() => ({a: {b: () => 1}}))
        const pHandle = createDirectJSHandle(handle)
        expect(await pHandle.a.b()).to.equal(1)
    })

    it('should enable thisArg', async() => {
        const handle = await this.page.evaluateHandle(() => ({a: {val: 2, b: function() { return this.val; }}}))
        const pHandle = createDirectJSHandle(handle)
        expect(await pHandle.a.b()).to.equal(2)
    })

    it('should enable arguments', async() => {
        const handle = await this.page.evaluateHandle(() => ({add: (a, b) => a + b}))
        const pHandle = createDirectJSHandle(handle)
        expect(await pHandle.add(1, 4)).to.equal(5)        
    })


    it('should enable async functions', async() => {
        const handle = await this.page.evaluateHandle(() => ({later: () => Promise.resolve(4)}))
        const pHandle = createDirectJSHandle(handle)
        expect(await pHandle.later()).to.equal(4)
    })

    it('shoult evaluate strings', async() => {
        const handle = await this.page.evaluateHandle(() => ({str: '123'}))
        const pHandle = createDirectJSHandle(handle)
        expect(await pHandle.str).to.equal('123')  
    })

    it('shoult evaluate numbers', async() => {
        const handle = await this.page.evaluateHandle(() => ({num: 789}))
        const pHandle = createDirectJSHandle(handle)
        expect(await pHandle.num).to.equal(789)  
    })

    it('shoult evaluate objects', async() => {
        const handle = await this.page.evaluateHandle(() => ({a: {b: 'something'}}))
        const pHandle = createDirectJSHandle(handle)
        expect(await pHandle.a).to.deep.equal({b: 'something'})  
    })

    it('should allow for a "then" property', async() => {
        const handle = await this.page.evaluateHandle(() => ({then: 9}))
        const pHandle = createDirectJSHandle(handle)
        expect(await pHandle.then).to.equal(9)      
    })


    it('should allow functions in main object', async() => {
        const handle = await this.page.evaluateHandle(() => ({a: () => 12}))
        const pHandle = createDirectJSHandle(handle)
        expect(await pHandle.a()).to.equal(12)
    })

    it('should work with a promise', async() => {
        const pHandle = createDirectJSHandle(this.page.evaluateHandle(() => ({a: () => 32})))
        expect(await pHandle.a()).to.equal(32)
    })

    it('should work with window', async() => {
        const window = createDirectJSHandle(this.page.evaluateHandle(() => window))
        expect(await window.document.body.tagName).to.equal('BODY')
    })

    it('should allow a callback', async() => {
        const handle = this.page.evaluateHandle(() => ({callback: cb => cb('yes')}))
        const pHandle = createDirectJSHandle(handle)
        const value = await new Promise(resolve => pHandle.callback(resolve))
        expect(value).to.equal('yes')
    })

    it('should allow a callback in any arg', async() => {
        const handle = await this.page.evaluateHandle(() => ({add: (num, cb) => cb(num + 1)}))
        const pHandle = createDirectJSHandle(handle)
        const value = await new Promise(resolve => pHandle.add(1, resolve))
        expect(value).to.equal(2)
    })

    it('should work on the main handle', async() => {
        const handle = await this.page.evaluateHandle(() => 'root')
        const pHandle = createDirectJSHandle(handle)
        const value = await pHandle
        expect(value).to.equal('root')
    })
})