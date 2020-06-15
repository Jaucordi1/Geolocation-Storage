# Geolocation Storage
This library exists because I needed a portable tool to manage geolocations in browser.

## How to use it
I develop this library in `TypeScript`, it auto-build when you install it in others projects.

It adds a UMD global var named `WatchPosition` that is a function who take 1 optional parameter, which is `PositionOptions` object type from `DOM` library.

```javascript
window.WatchPosition({/* ... */})
```

This function return a new instance of my `PositionSubscriber` class.

This class have some public properties and methods:

### Getters
|               name | type                             |
| -----------------: | :------------------------------- |
|         *watching* | **`boolean`**                    |
|    *savedLocation* | **`Position`** &#124; **`null`** |
| *previousLocation* | **`Position`** &#124; **`null`** |

### Methods
|        method | prototype                                                    |
| ------------: | :----------------------------------------------------------- |
|   *subscribe* | (*callback*: **`PositionSubscriberCallback`**) => **`void`** |
| *unsubscribe* | (*callback*: **`PositionSubscriberCallback`**) => **`void`** |
|       *watch* | () => **`void`**                                             |
|   *stopWatch* | () => **`void`**                                             |

The `PositionSubscriberCallback` type is the following :
 
```typescript
type PositionSubscriberCallback = (position: Position, prevPosition?: Position) => void
```
