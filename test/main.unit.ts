const puppeteer = require('puppeteer')
import {expect} from 'chai'
import {createHandle} from '../src/index'

describe('puppeteer-handle', () => {
    before(async () => {
        this.browser = await puppeteer.launch()
        this.page = await this.browser.newPage()
        this.page.on('console', ({type, text}) => console[type](text))
    })

    after(async() => await this.browser.close())

    it('should seamlessly evaluate into browser-side objects', async() => {
        const handle = await this.page.evaluateHandle(() => ({a: {b: () => 1}}))
        const pHandle = createHandle(handle)
        expect(await pHandle.a.b()).to.equal(1)
    })

    it('should enable thisArg', async() => {
        const handle = await this.page.evaluateHandle(() => ({a: {val: 2, b: function() { return this.val; }}}))
        const pHandle = createHandle(handle)
        expect(await pHandle.a.b()).to.equal(2)
    })

    it('should enable arguments', async() => {
        const handle = await this.page.evaluateHandle(() => ({add: (a, b) => a + b}))
        const pHandle = createHandle(handle)
        expect(await pHandle.add(1, 4)).to.equal(5)        
    })


    it('should enable async functions', async() => {
        const handle = await this.page.evaluateHandle(() => ({later: () => Promise.resolve(4)}))
        const pHandle = createHandle(handle)
        expect(await pHandle.later()).to.equal(4)
    })
})