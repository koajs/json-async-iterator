const supertest = require('supertest')
const Koa = require('koa')
const jsonAsyncIterator = require('..')

describe('koa-json-async-iterator', () => {
    it('should stream an async iterator', async () => {
        const app = new Koa()
        app.use(jsonAsyncIterator())
        app.use(async ctx => {
            const iterator = async function* () {
                yield new Promise((resolve) => setTimeout(resolve, 100))
                yield Promise.resolve({ foo: 'bar' })
                yield new Promise((resolve) => setTimeout(resolve, 100))
                yield Promise.resolve({ baz: 'qux' })
            }
            ctx.body = iterator()
        })

        const response = await supertest(app.callback()).get('/')
        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
        expect(response.body).toEqual([
            { foo: 'bar' },
            { baz: 'qux' }
        ])
    })

    it('should thrown errors', async () => {
        const app = new Koa()
        app.use(jsonAsyncIterator())
        app.use(async ctx => {
            const iterator = async function* () {
                yield new Promise((resolve) => setTimeout(resolve, 100))
                yield Promise.resolve({ foo: 'bar' })
                yield new Promise((resolve) => setTimeout(resolve, 100))
                yield Promise.resolve({ baz: 'qux' })
                yield new Promise((resolve) => setTimeout(resolve, 100))
                throw new Error('test')
            }
            ctx.body = iterator()
        })

        const response = await supertest(app.callback()).get('/')
        expect(response.status).toBe(200)
        expect(response.body).toEqual([
            { foo: 'bar' },
            { baz: 'qux' },
            { error: {
                message: 'test',
            } }
        ])
    })
})