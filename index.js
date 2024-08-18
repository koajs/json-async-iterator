const { PassThrough } = require('stream')

module.exports = (options = {}) => {
    const before = options.before || '[\n'
    const after = options.after || '\n]'
    const separator = options.separator || '\n,\n'
    const pretty = options.pretty || false
    const spaces = pretty ? options.spaces || 2 : 0
    const formatError = options.formatError || ((err) => ({
        error: {
            message: err.message,
        }
    }))
    return async (ctx, next) => {
        await next()

        if (ctx.body !== ctx.body?.[Symbol.asyncIterator]?.()) return

        const iterator = ctx.body

        ctx.response.type = 'json'
        const stream = 
        ctx.response.body = new PassThrough()

        stream.write(before)

        ;(async () => {
            let first = true
            try {
                for await (const value of iterator) {
                    if (!value) continue
                    if (first) {
                        first = false
                    } else {
                        stream.write(separator)
                    }
                    stream.write(JSON.stringify(value, null, spaces))
                }
            } catch (err) {
                if (!first) {
                    stream.write(separator)
                }
                stream.write(JSON.stringify(formatError(err), null, spaces))
                ctx.app.emit('error', err, ctx)
            } finally {
                stream.write(after)
                stream.end()
            }
        })()
    }
}
