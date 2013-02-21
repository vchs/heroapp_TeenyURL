### DataObject
`DataObject` is the abstract representative of URL data. It is a simple hash, includes

* `key` the key in tiny URL
* `originalUrl` the long URL
* `expireAt` the timestamp that the mapping will expire, or `null` or `undefined` for never expired

### IDataAccessor
The implementation of this interface must provide the following function:

```javascript
create(dataObject, keyGenFn, callback)
```
This creates a new tiny URL with given long URL.

* `dataObject` 

    This is an instance of `DataObject`, within which, only `originalUrl` and `expireAt` are taken for the new mapping.
    `expireAt` can be absent or `null` for being never expired.

* `keyGenFn` 

    This is a function defined as `function (dataObject, callback)` to create the key in tiny URL for the new mapping.
    Here `dataObject` is passed in from `create`, and `callback` is the form as `function (err, key)`,
    where `key` is the generated key and `err` is absent if succeeded, or `key` is `null` and `err` is the detailed `Error` object if anything wrong.

* `callback` 
    This is a function defined as `function (err, dataObject)` to receive the created mapping.
    If succeeded, `dataObject` is the instance of `DataObject` with all fields filled, and `err` is absent, or `dataObject` is `null` and `err` is the detailed `Error` object on failure.

The implementation should complete the flow:

1. Lookup database for `dataObject.originalUrl`, if found, goto _6_
2. Invoke `keyGenFn` to get a new key
3. Store dataObject with new key into database, if succeeded, goto _6_
4. If the error is key duplication of originalUrl duplication, goto _1_
5. For other errors, call `callback` with error, goto _7_
6. Refill `dataObject` with right key and call `callback`
7. Finish

The return value should be the same `IDataAccessor` instance.

```javascript
fetch(key, callback)
```
This queries a mapping between a tiny URL key and the original URL.

* `key`

    This is the key in the tiny URL.

* `callback`

    This is defined as `function (err, dataObject)` to receive the queried result.
    On success, `dataObject` is the instance of `DataObject` with `originalUrl` filled, other fields may be absent.
    If `dataObject` is `null`, it indicates the mapping is not found if `err` is absent, or some error happens if `err` is an `Error` object.

The return value should be the same `IDataAccessor` instance.

### ICacheProvider
`ICacheProvider` is defined for a simple key-value pair cache backend implementation. It requires two methods:

```javascript
getValue(key, callback)
```
This method queries the value by the specified key.

* `key`

   The key to identify the value.

* `callback`

    It is defined as `function (err, value)` for receiving the associated value.
    When the pair is available in cache, `value` is the value of the key in string, and `err` is absent.
    If not found, `value` is `null` and `err` is absent. If `err` is some `Error` object, the operation failed and `value` must be `null`.

The return value should be the same `ICacheProvider` instance.

```javascript
setValue(key, value, expireAt, callback)
```
This method inserts or updates a key-value pair.

* `key`

    The key associated with the value.

* `value`

    The value associated with the key. If `null`, the existing value will not be updated, and this is used for updating `expireAt`.

* `expireAt`

    The `Date` instance representing the expiration time of the key-value pair in cache.
    If `null`, the pair will never be expired.

* `callback`

    It is defined as `function (err)` with the only argument to indicate whether the operation succeeds.
    `err` is an `Error` object to indicate failure.