# @koa/json-async-iterator

Koa JSON response body streaming for async iterators

## Usage

```js
const jsonAsyncIterator = require('@koa/json-async-iterator')
const app = new Koa()

app.use(jsonAsyncIterator())

app.use(async ctx => {
  const iterator = async function* () {
    yield Promise.resolve({ foo: 'bar' })
    yield Promise.resolve({ baz: 'qux' })
  }
  ctx.body = iterator()
})
```

Output:

```json
[
{"foo":"bar"}
,
{"baz":"qux"}
]
```

Example with PostgreSQL:

```js
import QueryStream from 'pg-query-stream'
import pg from 'pg'

const client = new pg.Client()
await client.connect()

// later in your middleware
app.use(async (ctx) => {
    // stream all the rows from the database to the client
    ctx.body = client.query(new QueryStream(`
        SELECT * 
        FROM posts
        ORDER BY id ASC
    `))
})
```

## Options

### `before`

The string to write before the first value in the iterator.

Default: `'[\n'`

### `separator`

The string to write between each value in the iterator.

Default: `'\n,\n'`

### `after`

The string to write after the last value in the iterator.

Default: `'\n]'`

### `formatError`

A function that takes an error and returns a value to be stringified.

Default: `(err) => ({ error: { message: err.message } })`

### `pretty`

Whether to pretty-print the JSON.

Default: `false`

### `spaces`

The number of spaces to use for pretty-printing.

Default: `2`

## License

MIT